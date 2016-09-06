var _                        = require('lodash');
var serialCommandHandler     = require('./submodules/serialport_module');
var bluetoothCommanderHander = require('./submodules/bluetooth_module');
var hidCommandHander         = require('./submodules/hid_module');

commandHandlerManager  = {
  //初始化
  init: function() {
    this.initEvents();
    this.onHardwareDataCallback  = null;
    this.onHardwareErrorCallback = null;
    this.handlers = {
      'serialport': serialCommandHandler,
      'hid' : hidCommandHander,
      'bluetooth': bluetoothCommanderHander,
    }
  },
  //初始化事件
  initEvents: function() {
    this.cleanupEvents();
    //接受一些硬件主动推送的数据
    if(!this.onHardwareDataCallback){
      this.onHardwareDataCallback = this.onHardwareData.bind(this);
    }
    this.on('receiveHardwareData', this.onHardwareDataCallback);
    //接受一些硬件错误
    if(!this.onHardwareErrorCallback){
      this.onHardwareErrorCallback = this.onHardwareError.bind(this);
    }
    this.on('receiveHardwareError',  this.onHardwareErrorCallback);
  },

  //销毁事件监听
  cleanupEvents: function() {
    if(this.onHardwareDataCallback){
      this.removeListener('receiveHardwareData',this.onHardwareDataCallback);
    }
    else{
    }
    if(this.onHardwareErrorCallback){
      this.removeListener('receiveHardwareError', this.onHardwareErrorCallback);
    }
  },

  //硬件数据监听器
  onHardwareData: function(message) {
  },
  onHardwareError: function(err) {
  },

  on: function(eventName, callback) {
    for (var k in this.handlers) {
      this.handlers[k].events.on(eventName, callback);
    }
  },
  removeListener: function(eventName, callback) {
    for (var k in this.handlers) {
      this.handlers[k].events.removeListener(eventName, callback);
    }
  },

  //获取不同的硬件模块
  getCommandHander: function(type) {
    if(this.handlers[type]){
      return this.handlers[type];
    }
    return null;

  },
};

commandHandlerManager.init();
module.exports = commandHandlerManager;
