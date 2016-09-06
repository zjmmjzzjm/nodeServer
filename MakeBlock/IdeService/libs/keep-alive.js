var EventEmiter = require('events');
//心跳管理器
function KeepAlive(){
  this.intervalTimer = null;
  this.handler =  null;
  this.eventEmiter = new EventEmiter();
  this.lastAckTime = Date.now();
  this.messageToBeAcked = 0;
}

KeepAlive.prototype ={
  PROTO_HEAD: [0xff,0x55,0x00, 0x04, 0x09],//消息头
  PROTO_TAIL: [0x0d, 0x0a],//消息尾部
  dataToWrite: new Uint8Array([0xFF, 0x55, 0x04, 0x00, 0x01, 0x00, 0x00]), //版本号查询指令
  start: function(handler, timeout, interval) {
    this.handler = handler;
    if(!timeout){
      this.timeout = 5000; //默认5s超时
    }
    else{
      this.timeout = timeout;
    }

    if(!interval){
      interval = 4000;
    }
    var _this = this;
    this.lastAckTime = Date.now();
    this.intervalTimer = setInterval(function(){ //周期性查询版本号
      console.log("KeepAlive ==> " , Date.now() , _this.lastAckTime , _this.timeout, handler.path);
      if(Date.now() - _this.lastAckTime > _this.timeout){
        _this.eventEmiter.emit('timeout', {path:handler.path});
      }
      handler.write(new Uint8Array([0xFF, 0x55, 0x04, 0x00, 0x01, 0x00, 0x00]), function (err, bytesWritten) {
        if(err){
          _this.eventEmiter.emit('error', err);  
        }
        else{
          _this.messageToBeAcked ++;
        }
      }
      );
    }, interval);
  },

  //data = array buffer,如果是版本号，则吞包,返回null，否则原样返回
  feed: function(data) {
    this.lastAckTime = Date.now();
    if(this.messageToBeAcked == 0){//表示不是KeepAlive数据,因为没有发过请求
      return data;
    }
    if(data.byteLength != 16){//数据格式不对
      console.log('data length not match',  data);
      return data;
    }
    var bufferView = new Uint8Array(data);
    for (var i = 0, len = this.PROTO_HEAD.length; i < len; i++) {
      if(bufferView[i] != this.PROTO_HEAD[i]) {
        console.log('buffer bytes not match ', i, bufferView[i], this.PROTO_HEAD[i]);
        return data; //数据格式不对
      }
    }
    console.log('message acked is ' + this.messageToBeAcked, this.handler.path );
    this.messageToBeAcked --; 
    return null; //吞包
  },

  //事件监听
  on: function(eventName, callback) {
    this.eventEmiter.on(eventName, callback);
  },

  //停止心跳事件
  stop: function() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  },
}
module.exports = KeepAlive;
