## 1.1 Winston-MongoDB-Transport
    
This is a MongoDB transport for winston.    
    
support Node.js MongoDB Driver version <= 3.6.0    
    
### 1.2 Motivation
   
① To resolve the problems of unmaintained project ```winstonjs/winston-mongodb```.   
    
And source codes written in a new method.   
   
② MongoDB may be the best solution of storing logs in a remote server.    
When stored logs of our services like web-services,we can use a statistics tool    
to organize datas.

### 1.3 Features
   
This project is under construction, so contributions is welcomed, the LICENSE is under MIT.     
   
At present, we can only perform .log() in WinstonJS's Transport API.    
    
### 2.1 Install

To install this library,just execute:
```
npm install winston-mongodb-transport
```

### 2.2 Usage
   
   
Followings are examples of this library.    

```
const MTransport=require("winston-mongodb-transport");
const winston=require("winston");

const logger = winston.createLogger({
	transports:[new MTransport({
		dburl:"mongodb://127.0.0.1:27017/",
		dbname:"dblogger",
		label:"program-submodule"
	})]
});


logger.info("this is a log of info level");
logger.warn("this is a log of warn level");
```

