var http = require('http');
var socketIo = require('socket.io');


function startServer(options){
	var DEBUG_PORT = 34655;
	var debugApp = http.createServer()
		var debugIo = socketIo(debugApp);
	var version = '1.1.1';
	if(options && options.port){
		DEBUG_PORT = options.port;
	}

	//启动监听端口
	debugApp.listen(DEBUG_PORT, '127.0.0.1');
	//Handles
	function debugHandler(req, res){
		res.writeHead(200);
		res.end("hello, ide_client debug channel");
	}

	// events
	debugIo.on('connection', function (socket) {
		socket.emit('connectionOK', {type:'debugChannel', version: version});
		socket.on('disconnect', function () {
			console.log("client Channel disconnected " );
		});

		//执行命令command ={method:"xx", params:{xxx:"",yyy:""}},不同命令格式由具体的handler自己解析
		socket.on('c2s_command',function(command){

			var result = {
				params:{
					result:"",
				},
				method:'Unknown',
			};
			result.method = command.method; //推送给真实客户端的onRecevie函数
			if(command.params && command.params.rpcid){
				result.params.rpcid = command.params.rpcid;
			}
			if(command.method.toLowerCase().trim() == 'help' ){ //帮助命令
				console.log(command);
				if(command.params.options &&  command.params.options.length && command.params.options.length > 0){
					if(commandMap[command.params.options[0]]){
						var ret = commandMap[command.params.options[0]];
						result.params.result = ret; 
					}else{
						result.params.result = 'Not documented'; 
					}
				}
				else{
					var ret = "Commands supported:\r\n";
					for(var key in commandMap){
						ret += key +"\r\n";
					}
					result.params.result = ret.trim();
				}
			}
			else if(commandMap[command.method]){
				var ret = commandMap[command.method].handler(command.params.options);
				result.params.result = ret; 
			}else{
				result.params.result = 'Unknown command!';
			}

			socket.emit('s2c_data', result );
		} );

	});
}
var commandMap = [];
commandMap['test'] =
{
	handler : function(options){
		var ret = 'this is a test:' + options;
		return ret;
	},
	help : "this is  a test function",
}

var debuger = {
	start: function(options){
		startServer(options);
	},
	stop: function(){
	},
	addCommandMap:function(commandName, handler, help){
		commandMap[commandName] = {
			handler:handler,
			help: help,
		};
	}
}
module.exports = exports = debuger;




