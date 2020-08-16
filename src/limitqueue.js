const assert = require("assert");

class LimitQueue{
	constructor(maxlen){
		assert(typeof(maxlen)=="number" && maxlen > 0 ,"queue length must be a valid value");

		this.maxlen=maxlen;
		this.queue=[];
	}
	push(item){
		if(this.queue.length>=this.maxlen)
			throw new Error("queue reach its full size");
		this.queue.push(item);
	}
	shift(){
		let item=this.queue.shift(item);
		if(typeof(item) == "undefined")
			throw new Error("queue drain");
		return item;
	}
	drain(){
		let buf=this.queue.concat([]);
		this.queue=[];
		return buf;
	}

}

module.exports=LimitQueue;