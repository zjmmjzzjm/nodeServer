var debuger = require('./libs/debuger');
var containers = require('./libs/connectionContainer.js');
var metainfos = require('./hardwareMetaInfoManager.js');
var fs = require('fs');
var util = require('util');
var Path = require('path');
var log_path = Path.normalize(__dirname + Path.sep + 'debug.log'); 
var log_file = fs.createWriteStream(log_path, {flags : 'w'});
var intercept = require("intercept-stdout");
 

debuger.start();

//function getConns(options){
//	var ret = containers.getConnections();
//	return ret;
//}
//debuger.addCommandMap('conns', getConns, 'conns: list hardware connections' );

function getMetaInfo(options){
	return metainfos.getAll();
}
debuger.addCommandMap('metas', getMetaInfo, 'metas: list hardware info posted by browsers' );
var unhook_intercept;
function toggleLog(options){

	console.log("options ", options);
	var ret = 'No change';
	if(options[0] == 'on'){
		console.log('open log', options[0]);
		try{
			if(unhook_intercept){
				unhook_intercept();
				unhook_intercept = null;
			}
			console.log('------------->hook');
			unhook_intercept = intercept(function(txt) {
					log_file.write(txt);
			});
			ret = 'Notice: log is being written to ' + log_path;
		}catch(e){
			console.log('get exception ', e);
		}
	}else if(options[0] == 'off'){
		console.log('close log', options[0]);
		try{
			if(unhook_intercept){
				unhook_intercept();
				unhook_intercept = null;
			}
			ret = 'Notice: log is only being written to console';
		}catch(e){
			console.log("close file failed");
		}
		
	}
	return  ret;
}
debuger.addCommandMap('log', toggleLog, 'log on: enable log, log off: disable log. see :' + log_path );
module.exports =  exports = debuger;
