var _ = require('lodash');
var EventEmitter = require('events');
var SerialPort = require("serialport");
var WakeEvent = require('../libs/wake-event');
var Container = require('../libs/connectionContainer.js');

//连接池
var ConnectionMap = new Container();

function SerialCommandHandler(){
  this.events = new EventEmitter();
}

SerialCommandHandler.prototype = {
  link : null,
  serialPort: null,
  events: null,
  //获取设备列表
  getDevices: function(err, callback){ //callback=function(error, data)
    SerialPort.list(function(err, ports) {
      for (var i = 0, len = ports.length; i < len; i++) {
        ports[i].path = ports[i].comName;
      } 
      callback(err, {ports:ports});
    });
  },

  //获取所有已经打开的设备列表
  getConnections: function(command, callback){
    var ret = ConnectionMap.getConnections();
    callback(null,{connections:ret});
  },

  //打开设备
  connect: function(command, callback){
    var _this = this;
    var serialName = null;
    var bitrate = 115200; 
    if(command.params && command.params.path) {
      serialName = command.params.path;
    }
    if(command.params && command.params.bitrate){
      bitrate = command.params.bitrate;
    }

    var connection = ConnectionMap.getConnection(serialName);
    var serialPort = null;
    if (connection) {
      serialPort = connection.serialPort;
    }
    if(serialPort && serialPort.isOpen()){
      return callback(null, {connection:connection});
    }

    if(serialName){
      serialPort = new SerialPort.SerialPort(command.params.path, {
        baudRate: bitrate,
      });

      //打开成功
      serialPort.on('open', function() {
        var result = ConnectionMap.addConnection(serialPort);
        _this.events.emit("open", {method:'onOpen', params:{info:{connectionId:serialPort.path, hardware: 'serialPort'}}});
        callback(null, {connection:result});
        console.log("Open serial port ok", result );
      });

      var timer = setInterval(function(){
        if(serialPort.isOpen())
        {
          //console.log("do drain");
          serialPort.drain();
        }
        else{
          console.log("do drain serail not open");

        }
      }, 1000);
      //串口出错
      serialPort.on('error', function(err) {
        callback(err, serialPort);
        _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:serialPort.path,hardware:'serialPort', error:'disconnected'}}});
        console.log('serial error Error: ', err.message);
        ConnectionMap.removeConnection(serialPort.path);
        clearInterval(timer);
        serialPort.close(function() {

        });
      });


      //收到串口数据
      serialPort.on('data', function(data) {
        var arr = [];
        var bufferView = new Uint8Array(data);
        for (var i = 0; i < data.byteLength; i++) {
          arr[i] = bufferView[i];
        }
        var result  = {method:'onReceive', params:{info:{data:arr, connectionId: serialPort.path}}};
        console.log("serial port on data, emit receiveHardwareData , listeners " + _this.events.listenerCount());

        _this.events.emit('receiveHardwareData', result);
      });

      serialPort.on('close', function(message) {
        console.log('serialPort closed. ' + serialPort.path, message);
        clearInterval(timer);
      });

      serialPort.on('disconnect', function(message) {
        console.log('serialPort disconnected' + serialPort.path, message);
        _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:serialPort.path, error:'disconnected', hardware:'serialPort'}}});
        ConnectionMap.removeConnection(serialPort.path);
        clearInterval(timer);
      });

    }
    else{
      callback("Invalid parameters: serial path not set", null);
    }
  },

  //主动关闭设备
  disconnect: function(command, callback){
    var _this = this;
    console.log('close serial port' , command);
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (!serialPort) {
      callback("serialPort not opend!" + command.params.connectionId);
      ConnectionMap.removeConnection(command.params.connectionId);
      return;
    } 
    if(serialPort && serialPort.isOpen()){
      serialPort.close(function(){
        callback(null, serialPort);
      });
    } else{
      callback("Warnning, serial is not opened!",serialPort);
    }
    ConnectionMap.removeConnection(command.params.connectionId);
  },
  //更新参数
  update: function(command, callback){
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if(!serialPort){
      callback("serial is not open " + command.params.connectionId);
      return ;
    }
    serialPort.update(command.params.options, callback);
  },

  //发送数据
  send: function(command, callback){
    var _this = this;
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (!serialPort) {
      console.log('serial is not openedl');
      callback("serialPort is not openedn!" + command.params.connectionId);
      return ;
    }
    if(serialPort.isOpen()){
      serialPort.write(command.params.data, function(err){
        callback(err, {sendInfo:command.params.data.length});
      });
    }else{
      callback("serial not connected " + serialPort.path, 0 );
    }
  },
  //刷新缓冲区
  flush: function(command, callback){
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (!serialPort) {
      callback("serialPort not opend!" + command.params.connectionId);
    } else{
      serialPort.flush(callback);
    }

  },

  //设置控制信号
  setControlSignals: function(command, callback){
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (serialPort) {
      serialPort.set(command.params.signals, callback);
    }else{
      callback("serialPort is not opened!" + command.params.connectionId, null);
    }
  },
  //获取控制信号
  getControlSignals: function(command, callback){
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    callback("Not implemented",serialPort);
  },

  //清理所有串口
  dispose: function() {
    var connections =  ConnectionMap.getConnections();
    for (var c in connections) {
      connections[c].serialPort.close(function() {
      });
    }
    ConnectionMap.clear();
  },
}
var handler = new SerialCommandHandler();
//长时间无响应则清理所有串口
WakeEvent(function(){
    var connections =  ConnectionMap.getConnections();
    for (var c in connections) {
      connections[c].serialPort.emit('error', 'computer woke up');
    }
});
module.exports = handler;
