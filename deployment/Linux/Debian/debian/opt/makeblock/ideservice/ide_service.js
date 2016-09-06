var app                     = require('http').createServer(httpHandler)
var io                      = require('socket.io')(app);
var _                       = require('lodash');
var Client                  = require('./Client');
var version                 = require('./version');
var debugCommands           = require('./debug_commands.js');
var LISTENPORT = 34654;

//启动监听端口
app.listen(LISTENPORT, '127.0.0.1');
function httpHandler (req, res) {
  res.writeHead(200);
  res.end("hello, ide_client");
}

io.on('connection', function (socket) {
  socket.emit('connectionOK', {version: version});
  var client = createNewClient(socket);

  //向链路发送命令command ={method:"xx", params:{xxx:"",yyy:""}},不同命令格式由具体的handler自己解析
  socket.on('c2s_command', function (command) {
    console.log('receive c2s_command ', command.method);
    client.handleCommand(command, function(err, info){
      var result = {
        params:{
          error : null,
          info  : null,
          rpcid : null,
        }
      };
      result.method = command.method; //推送给真实客户端的onRecevie函数
      if(command.params && command.params.rpcid){
        result.params.rpcid = command.params.rpcid;
      }
      if(err){
        result.params.error = err;
      }
      else{
        result.params = _.extend(result.params,info);
      } 
      console.log('callback ' + command.method);
      socket.emit('s2c_data', result);
    })
  });

  socket.on('disconnect', function () {
    console.log("client disconnected " + client.id );
    client.dispose();
	client = null;
  });

  //设置联路类型
  socket.on('c2s_linkType', function(data){
    console.log('setlinktype ' , data);
    client.setLinkType(data.linkType);
  });

});

function createNewClient(socket){
  var newClient = new Client(socket);
  console.log("create New client", socket.id);
  newClient.id = socket.id;
  return newClient;
}


