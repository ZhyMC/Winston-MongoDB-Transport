const MTransport=require("../src/mtransport");
const winston=require("winston");

const logger = winston.createLogger({
	transports:[new MTransport({
		dburl:"mongodb://127.0.0.1:27017/",
		dbname:"test",
		label:"jigsaw.js"
	})]
})


logger.info("test1");
logger.warn("test2");

logger.close();
