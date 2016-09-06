var _                     = require('lodash');
var commandHandlerManager = require('./commandHandleManager');
var hardwareMetaInfoManager = require('./hardwareMetaInfoManager');

//客户端对象
function Client(socket){
  this.socket                  = socket;
  this.id                      = ""; //每个client的唯一标识
  this.linkType                = ""; //serialport, hid, bluetooth
  this.hardwareCommandHandler                 = null;
  this.onHardwareDataCallback  = null;
  this.onHardwareErrorCallback = null;
}

Client.prototype = {

  //设置链路类型
  setLinkType:function(type){
    _this = this;
    this.linkType= type;
    this.hardwareCommandHandler = commandHandlerManager.getCommandHander(type);
    console.log("set link type : " + type);
    this.initEvents();
  },

  initDataEvent: function() {
    //接受一些硬件主动推送的数据
    if(!this.onHardwareDataCallback){
      this.onHardwareDataCallback = this.onHardwareData.bind(this);
    }
    this.hardwareCommandHandler.events.on('receiveHardwareData', this.onHardwareDataCallback);
  },
  initErrorEvent:function(){
    //接受一些硬件错误
    if(!this.onHardwareErrorCallback){
      this.onHardwareErrorCallback = this.onHardwareError.bind(this);
    }
    this.hardwareCommandHandler.events.on('receiveHardwareError',  this.onHardwareErrorCallback);

  },
  cleanDataEvent: function() {
    if(this.onHardwareDataCallback){
      this.hardwareCommandHandler.events.removeListener('receiveHardwareData',this.onHardwareDataCallback);
    }
    else{
       console.log("this.onHardwareDataCallback is null"); 
    }
  },
  cleanErrorEvent: function() {
    if(this.onHardwareErrorCallback){
      this.hardwareCommandHandler.events.removeListener('receiveHardwareError', this.onHardwareErrorCallback);
    }
  },

  initEvents: function() {
    //先清理再添加，避免事件监听器重复添加
    this.cleanupEvents();
    this.initDataEvent();
    this.initErrorEvent();
  },

  //销毁事件监听
  cleanupEvents: function() {
    console.log("cleanup events");
    this.cleanDataEvent();
    this.cleanErrorEvent();
  },

  //硬件数据监听器
  onHardwareData: function(message) {
    this.socket.emit("s2c_push", message);      
    console.log('s2c_push data(' + this.socket.id  + "):", message);
  },
  onHardwareError: function(err) {
    console.log('s2c_push err');
    this.socket.emit("s2c_push", err);      
  },

  //处理客户端发出的命令,如果是串口命令，则直接转发到串口，否则Client自己处理
  handleCommand: function(command, callback){
    if(command && command.method && this.hardwareCommandHandler &&　this.hardwareCommandHandler[command.method]){
      this.hardwareCommandHandler[command.method](command, callback);
    }
    else if (this[command.method]){
      this[command.method](command, callback);
    }
  },

  //获取所有硬件连接信息
  getAllLinkMetaInfo: function(command, callback) {
    var linkInfos =  hardwareMetaInfoManager.getAll();
    callback(null, {links:linkInfos});
  },

  //设置硬件连接的元数据
  setLinkMetaInfo: function(command, callback) {
    console.log('setLinkMetaInfo ', command);
    var value = hardwareMetaInfoManager.get(command.params.connectionId);
    if(!value){
      value  = hardwareMetaInfoManager.add(command.params.connectionId, {});
    }
    value.info.meta = command.params.meta;
    callback(null, "set hardwareMetaInfoManager ok");  
  },

  //当前client激活时
  onClientActive: function() {
    this.cleanDataEvent();
    this.initDataEvent();
  },

  //当前Client进入不活跃状态
  onClientInactive: function() {
   this.cleanDataEvent(); 
  },

  dispose: function() {
    if(this.hardwareCommandHandler){
      this.cleanupEvents();
    }
  },
};


module.exports = Client;
