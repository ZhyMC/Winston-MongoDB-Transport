const Transport = require('winston-transport');
const LimitQueue=require("./limitqueue");
const assert = require("assert");
const { MongoClient } = require("mongodb");
const sleep=(time)=>new Promise((resolve,reject)=>setTimeout(resolve,time));

class MTransport extends Transport{
	constructor(options){
		super(options);
		assert(typeof(options)=="object","You should provide options.");
		assert(typeof(options.dburl)=="string","You should provide a correct options.dburl");
		assert(typeof(options.dbname)=="string","You should provide a correct options.dbname");

		if(typeof(options.buffer_len)=="undefined")
			options.buffer_len = 10000;
		if(typeof(options.flush_timeout)=="undefined")
			options.flush_timeout = 1000;
		if(typeof(options.check_timeout)=="undefined")
			options.check_timeout = 100;

		this.queue=new LimitQueue(options.buffer_len);

		this.options = options;
		this.state = "close";
		this.coll_name="winston-logs";

		this.dbclient;

		this._connect();
	}
	static _getDataModel(){
		return {
			level:{ index:true, default:"unknown"},
			log:{index:false, default:""},
			label:{ index:true ,default:"" },
			sublabel:{ index:true ,default:"" },
			timestamp:{ index: false ,default:new Date().getTime() }
		}
	}
	async _workloop(){
		assert(this.state=="connecting","at this state,_workloop can not start");
		this.state="connected";

		let timeout=0;
		while(this.state=="connected"){
			timeout+=this.options.check_timeout;
			if(timeout>=this.options.flush_timeout){
				try{
					await this._handleQueue();
				}catch(err){
					console.error("error happened when handle Buffer Queue",err)
				}

				timeout = 0;
			}
			await sleep(this.options.check_timeout);

		}

		this.dbclient.close();
	}
	async _ensureCollection(){
		let model = MTransport._getDataModel();
		try{
			await this.db.createCollection(this.coll_name);
		}catch(err){
			if(err.codeName != "NamespaceExists")
				throw err;
		}

		for(let s in model)
			if(model[s].index)
				await this.db.createIndex(this.coll_name,s)

	}
	async _handleQueue(){
		let loglist = this.queue.drain();
		if(loglist.length <= 0)
			return;

		let model = MTransport._getDataModel();
		let coll = this.db.collection(this.coll_name);
		let logs_inserted = [];
		for(let {loginfo,timestamp} of loglist){

			let log={
				level:loginfo.level,
				log:loginfo.message,
				label:loginfo.label || this.options.label,
				sublabel:loginfo.sublabel || this.options.sublabel,
				timestamp
			};
			for(let s in model){
				if(typeof(log[s])=="undefined")
					log[s]=model[s].default;
			}

			logs_inserted.push(log);
		}
	
		await coll.insertMany(logs_inserted);

	}
	async _connect(){
		if(this.state=="dead")
			throw new Error("this instance is dead, can not do connecting");
		if(this.state != "close")
			throw new Error("this instance isn't closed, can not do connecting");


		this.state="connecting";
		try{
			let dbclient=await MongoClient.connect(this.options.dburl,{ useUnifiedTopology: true });
			this.dbclient=dbclient;
			this.db=this.dbclient.db(this.options.dbname);

			await this._ensureCollection();
			
			if(this.state!="connecting")
				this.dbclient.close();
			else
				this._workloop();
		}catch(e){
			console.error("connect to mongodb server failed,retrying...",e);
			this.state="close";

			await sleep(2000);
			await this._connect();
		}
		
	}
	close(){
		//assert(this.state=="connected","only at connected state,the instance can be closed.");

		this.state="dead";
	}
	log(loginfo,callback){
		try{
			this.queue.push({loginfo,timestamp:new Date().getTime()});
		}catch(e){
			console.error("buffer queue is full, some logs can not be consumed");
		}
		callback();
	}

}


module.exports=MTransport;
