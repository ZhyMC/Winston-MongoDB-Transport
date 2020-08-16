const getLogger=require("./logger");
let logger=getLogger("jigsaw.js","test");

logger.info("this is a log of info level");
logger.warn("this is a log of warn level");
logger.error("this is a log of error level");
