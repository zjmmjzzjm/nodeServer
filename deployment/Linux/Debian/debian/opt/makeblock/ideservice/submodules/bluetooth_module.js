var _ = require('lodash');
var EventEmitter = require('events');
var BluetoothSerial = require('bluetooth-serial-port').BluetoothSerialPort;
var ProtoCodec = require('../libs/proto-codec'); //粘包工具
var KeepAlive = require('../libs/keep-alive');//轮训版本号，用于监测串口异常
var Container = require('../libs/connectionContainer.js');
var os = require('os');

//连接池
var ConnectionMap = new Container();

function BluetoothSerialCommandHandler(){
  this.events = new EventEmitter();
}

BluetoothSerialCommandHandler.prototype = {
  events: null,
  //获取设备列表
  getDevices: function(err, callback){ //callback=function(error, data)
    var deviceList = []; 
    if(os.platform() != 'linux'){
      var btSerial = new BluetoothSerial(); 

      btSerial.listPairedDevices(function(devs){
        for (var i = 0, len = devs.length; i < len; i++) {    
          if(devs[i].name.toLowerCase().indexOf('makeblock') == -1){ //这里检查makeblock名称，防止连接大量非makeblock设备，导致超时
            console.log('invalid bluetooth device, will be dropped ', device);
            continue;
          }
          var device = {
            path:devs[i].address,
            name:devs[i].name
          };
          console.log('found bluetooth device ', device);
          deviceList.push(device);
        }
        callback(null, {ports:deviceList});
      });
    }else{
      var spawn = require('child_process').spawn;
      var spawnSync = require('child_process').spawnSync;

      var isPaired = function (dev)
      {
        var res = spawnSync('bt-device', ['--info='+dev.path]);  
        var str = res.stdout + "";
        if(str.indexOf('Paired: 1') != -1)
          return true;
        return false;

      }
      var listRes = spawnSync('bt-device', ['-l']);
      var res = [];
      if(listRes.stdout)
      {
        var data = listRes.stdout +""; 
        var str = ''+data;
        var arr = str.split('\n');
        for(var key in arr){
          if(arr[key].indexOf('Makeblock') != -1) {
            var items = arr[key].split(' ');
            var item = { name:items[0],
              path:items[1].replace('(', '').replace(')','')
            };
            if(item.path.length == 17 && isPaired(item)){
              console.log("Add device " , item);
              res.push(item); 
            }
            else{
              console.log("ingore device " , item);
            }

          }
        }
        console.log(res);
      }
      callback(null, {ports:res});
    }
  },
  //获取所有已经打开的设备列表
  getConnections: function(command, callback){
    callback(null,{});
  },
  //打开设备
  connect: function(command, callback){
    var _this = this;
    var serialName = null;
    if(command.params && command.params.path) {
      serialName = command.params.path;
    }
    console.log('bluetooth serialport connecting...' + serialName);

    var connection = ConnectionMap.getConnection(serialName);
    var serialPort = null;
    if (connection) {
      serialPort = connection.serialPort;
    }
    if(serialPort && serialPort.isOpen()){
      return callback(null, {connection:connection});
    }


    if(serialName){
      var btSerial= new BluetoothSerial();
      var address = serialName;
      var connectState = "init";
      console.log('begin find channel');
      //循环查找
      var maxTry = 18;
      var intervalTimer = setInterval(function(){
        maxTry--;
        console.log('try connect maxTry:', maxTry, address);
        if(maxTry <= 0){
          clearInterval(intervalTimer);
          connectState = " max Try exceeded";
          callback('cannot find serial channel', null);
          _this.privateOnConnectFail(address, connectState);
          return;
        }
        if(connectState == "connected" ){
          console.log("connected ...connected ...connected ...connected ...connected ........");
          clearInterval(intervalTimer);
          return;
        }else if ( connectState == "connecting"){
          return;
        }
        else{
          btSerial.close();
          connectState = "connecting";
          //查找通道
          btSerial.findSerialPortChannel(address, function(channel) {
            console.log('find channel ', address, channel);
            //开始连接
            btSerial.connect(address, channel, function() {
              console.log('connect bluetooth  ok') ; 
              connectState = "connected";
              _this.privateOnConnectOK(btSerial, address,  channel);
              //记录连接
              var result = ConnectionMap.addConnection(btSerial);
              _this.events.emit("open", {method:'onOpen', params:{info:{connectionId:address, hardware: 'bluetooth'}}});
              callback(null, {connection:result});
              clearInterval(intervalTimer);
            }, 
            //无法找到串口通道
            function(err){
              console.log("connect failed,error:", err);
              connectState = "failed";
            })
          });
        }
      }, 1000);

    }
  },

  //关闭设备
  disconnect: function(command, callback){
    var _this = this;
    console.log('close bluetooth serial port' , command);
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (!serialPort) {
      callback("bluetooth serialPort not opend!" + command.params.connectionId);
      ConnectionMap.removeConnection(command.params.connectionId);
      return;
    } 
    if(serialPort && serialPort.isOpen()){
      serialPort.close(function(){
        callback(null, serialPort);
      });
    } else{
      callback("Warnning,bluetooth serial is not opened!",serialPort);
    }
    ConnectionMap.removeConnection(command.params.connectionId);
  },
  //更新参数
  update: function(command, callback){
    callback("update bluetooth serial is not supported: " + command.params.connectionId, null);
  },

  //发送数据
  send: function(command, callback){
    var _this = this;
    var serialPort = ConnectionMap.getSerialPort(command.params.connectionId);
    if (!serialPort) {
      console.log('bluetooth serial is not openedl');
      callback("bluetooth serialPort is not openedn!" + command.params.connectionId);
      return ;
    }
    if(serialPort.isOpen()){
      var dataToSend = null;
      console.log('send data is ',command.params.data);
      if(!(command.params.data instanceof Uint8Array)){
        dataToSend = new Uint8Array(command.params.data);
      }else{
        dataToSend = command.params.data;
      }
      serialPort.write(dataToSend, function(err){
        callback(err, {sendInfo:command.params.data.length});
      });
    }else{
      callback("bluetooth serial not connected " + serialPort.path, 0 );
    }
  },
  //刷新缓冲区
  flush: function(command, callback){
    callback("flush bluetooth serialPort not supported !" + command.params.connectionId);
  },

  //设置控制信号
  setControlSignals: function(command, callback){
    callback("setControlSignals bluetooth serialPort not supported !" + command.params.connectionId);
  },
  //获取控制信号
  getControlSignals: function(err, callback){
    callback("getControlSignals bluetooth serialPort not supported !" + command.params.connectionId);
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
  privateOnConnectOK: function(btSerial, address, channel) {
    var _this = this;
    console.log('==============>....bluetooth connected', address,  channel);
    var proto = new ProtoCodec();
    var keepAlive = new KeepAlive();
    var onBluetoothInvalid = function() {
      console.trace('close bluetooth ' + address + " time " + Date.now() );
      btSerial.close(); 
      keepAlive.stop();
    }

    btSerial.path = address;
    //开启保活超时机制
    keepAlive.on('error', function(err){
      console.log('keep alive error ' + address, err);
      _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:address,hardware:'bluetooth', error:'disconnected'}}});
      onBluetoothInvalid();
    });

    keepAlive.on('timeout', function(err){
      console.log('keep alive timeout ' +address, err);
      _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:address,hardware:'bluetooth', error:'device_lost'}}});
      onBluetoothInvalid();
    });

    keepAlive.start(btSerial);
    btSerial.on('data', function(buffer) {
      _this.privateOnReceiveData(buffer, keepAlive, proto, address);
    });

    btSerial.on('closed', function() {
      console.trace('bluetooth on closed' + address + Date.now());
      _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:address,hardware:'bluetooth', error:'disconnected'}}});

    });

    btSerial.on('finished', function() {
      console.log('bluetooth on finished' +address);
    });

    btSerial.on('failure', function() {
      console.log('bluetooth on failure' +address);
      onBluetoothInvalid();
    });

    console.log("Open bluetooth serial port ok");
  },

  privateOnConnectFail: function( address, err) {
    var _this = this;
    _this.events.emit('receiveHardwareError', {method:'onReceiveError', params:{info:{connectionId:address,hardware:'bluetooth', error:err}}});
  },

  privateOnReceiveData: function(buffer,keepAlive, proto, address){
    var _this = this;
    console.log('receive data len: ', buffer.byteLength, address);
    var res = proto.decode(buffer);
    if(!res){
      return;
    }
    //还原成arraybuffer
    var newBuffer = new ArrayBuffer(res.length);
    var bufferView = new Uint8Array(newBuffer);
    for (var i = 0; i <res.length; i++) {
      bufferView[i] = res[i];
    }

    newBuffer = keepAlive.feed(newBuffer);
    if(!newBuffer){ //表明是keepAlive数据，不应该向应用层提交
      console.log('parse version ok');
      return ;
    }
    console.log("commit serial data", newBuffer, " res ", res);
    var result  = {method:'onReceive', params:{info:{data:res, connectionId:address}}};
    _this.events.emit('receiveHardwareData', result);
  }

}
var handler = new BluetoothSerialCommandHandler();
module.exports = handler;
