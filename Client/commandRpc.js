var io = require('socket.io-client');
var LISTENPORT = 34654; //服务监听端口
var eventEmiter = require('events');
var version = require('../../../../install_package/MakeBlock/IdeService/version.js')
var CommandRpc = {
  socket: null,
  cursor: 0,
  rpcMap: new Array(),
  onMessage: null,
  version:version,
  events : new eventEmiter(),

  init: function () {
    var _this = this;
    var socket = io.connect('http://127.0.0.1:' + LISTENPORT);
    socket.on('s2c_data', function (data) {
      _this.response(data);
    });
    socket.on('s2c_push', function(message){
      console.log("^^^^s2c_push: =(" + new Date() + ')',message);
      _this.onServerPush(message);
    });
    socket.on('connectionOK', function (message) {
      if (_this.version != message.version) {
        console.log('ide version dosenot match service version', _this.version, message.version);
        _this.events.emit("needUpdateService", {ideVersion:_this.version, ideServiceVersion:message.version});
        return ;
      }
      _this.events.emit("onConnectedOk", {version: message.version});
    });
    this.initSocket(socket);
    this.socket = socket;
  },
  //socket io 系统api
  initSocket: function (socket) {
    socket.on('connect', function (data) {
      console.log("connect => ", data);
    });
    socket.on('connect_error', function (data) {
      console.log('connect_error=>', data);
    });

    socket.on('connection_timeout', function (data) {
      console.log('connectin_timeout=>', data);
    });

    socket.on('connecting', function (data) {
      console.log('connecting =>', data);
    });

    socket.on('disconnect', function (data) {
      console.log('disconnect => ', data);
    });

    socket.on('error', function (data) {
      console.log('error => ', data);
    });

    socket.on('reconnect', function (data) {
      console.log('reconnect => ', data);
    });

    socket.on('reconnect_attempt', function (data) {
      console.log('reconnect_attempt => ', data);
    });

    socket.on('reconnect_failed', function (data) {
      console.log('reconnect_failed => ', data);
    });

    socket.on('reconnect_error', function (data) {
      console.log('reconnect_errro => ', data);
    });

    socket.on('reconnecting', function (data) {
      console.log('reconnecting => ', data);
    });

    socket.on('ping', function (data) {
      console.log('ping => ', data);
    });

    socket.on('pong', function (data) {
      console.log('pong => ', data);
    });

  },
  send: function (method, params, callback) {
    var _this = this;
    var message = {
      method: method,
      params: _.extend({
        rpcid: _this.getUuid(),
      }, params),
    };
    console.log('-->send (' + new Date() + '): ', message);
    this.rpcMap[message.params.rpcid] = callback;
    this.socket.emit('c2s_command', message);

  },
  response: function(message) {
    console.log('<--recv (' + new Date() + ')', message);
    if(this.rpcMap[message.params.rpcid]) {
      this.rpcMap[message.params.rpcid](message);
      delete this.rpcMap[message.params.rpcid];
    }
  },
  onServerPush: function (message) {
    if (this.onMessage) {
      this.onMessage(message);
    }
  },
  //设置用什么方式连接硬件,串口、蓝牙、或hid
  setLink: function(linkType) {
    this.socket.emit('c2s_linkType', { linkType: linkType});
  },
  getUuid: function () {
    this.cursor++;
    return this.cursor.toString();
  },
  //测试服务是否ok
  testService: function (onResult) {
    var socket = io.connect('http://127.0.0.1:' + LISTENPORT);
    var result = {};
    var _this = this;
    socket.on('connect_error', function (data) {
      console.log('connect_error=>', data);
      socket.close();
      result.error = "connect error";
      if (onResult) {
        onResult(result);
      }
    });
    socket.on('connectionOK', function (message) {
      socket.close();
      console.log("receive connectionOK:", message.version);
      if (_this.version != message.version) {
        result.error = "version error";
      }
      else{
        // _this.events.emit("onConnectedOk", {version: message.version});
        result.message = "connect Ok";
      }
      if (onResult) {
        onResult(result);
      }
    });
  }
}
CommandRpc.init();
module.exports = CommandRpc;
