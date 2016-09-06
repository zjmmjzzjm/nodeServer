var _ = require('lodash');
var EventEmitter = require('events');
var SerialPort = require("serialport");

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
    callback(null,{});
  },
  //打开设备
  connect: function(command, callback){
    var _this = this;
    if(this.serialPort && this.serialPort.isOpen()){
      var result = {
        connection: {
          connectionId:_this.serialPort.path,
        },
      };
      return callback(null, result);
    }
    var serialName = null;
    var bitrate = 115200; 
    if(command.params && command.params.path) {
      serialName = command.params.path;
    }
    if(command.params && command.params.bitrate){
      bitrate = command.params.bitrate;
    }

    if(serialName){
      this.serialPort = new SerialPort.SerialPort(command.params.path, {
        baudRate: bitrate,
      });

      this.serialPort.on('open', function() {
        var result = {
          connection: {
            connectionId:_this.serialPort.path,
          },
        };
        callback(null, result);
        console.log("Open serial port ok");
      });
      this.serialPort.on('error', function(err) {
        callback(err, _this.serialPort);
        _this.events.emit('onReceiveError', {method:'onReceiveError', params:{info:{}, error:err}});
        console.log('Error: ', err.message)
      });

      this.serialPort.on('data', function(data) {
        var arr = [];
        var bufferView = new Uint8Array(data);
        for (var i = 0; i < data.byteLength; i++) {
          arr[i] = bufferView[i];
        }
        console.log("hid emit data");
        var result  = {method:'onReceive', params:{info:{data:arr, connectionId: _this.serialPort.path}}};
        console.log("emit hard ware data hid");
        _this.events.emit('receiveHardwareData', result);
      });
    }
    else{
      callback("Invalid parameters: serial path not set", null);
    }
  },
  //关闭设备
  disconnect: function(command, callback){
    var _this = this;
    console.log('close serial port');
    if(this.serialPort && this.serialPort.isOpen()){
      this.serialPort.close(function(){
        callback(null, _this.serialPort);
      });
    } else{
      callback("Warnning, serial is not opened!",this.serialPort);
    }
  },
  //更新参数
  update: function(command, callback){
    this.serialPort.update(command.params.options, callback);
  },

  //发送数据
  send: function(command, callback){
    var _this = this;
    if(this.serialPort.isOpen()){
      console.log('send data is ' , command.params.data);
      this.serialPort.write(command.params.data, function(err){
        callback(err, _this.serialPort);
      });
    }else{
      callback("serial not connected ",this.serialPort);
    }
  },
  //刷新缓冲区
  flush: function(command, callback){
    this.serialPort.flush(callback);
  },

  //设置控制信号
  setControlSignals: function(command, callback){
    this.serialPort.set(command.params.signals, callback);
  },
  //获取控制信号
  getControlSignals: function(err, callback){
    callback("Not implemented",this.serialPort);
  },
  onReceive: function(err, callback){

  },

}
var handler = new SerialCommandHandler();
module.exports = handler;
