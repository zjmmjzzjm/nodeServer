var _ = require('lodash');
var commandHandlerManager = require('./commandHandleManager');
var EventEmitter = require('events');

hardwareMetaInfoManager = {
  infoContainer: [], //key value  map
  add: function(id, info) {
    console.log('------>add a hardwireMetaData ' ,id);
    if(this.infoContainer[id]){
      return this.infoContainer[id];
    } 
    value =  {
      id: id,
      info : info,
    },
    this.infoContainer[id] =  value;
    return value;
  },

  remove: function(id) {
    if (this.infoContainer[id]) {
      delete this.infoContainer[id];
    }
  },
  get: function(id) {
    return this.infoContainer[id];
  },
  getAll: function() {
    var _this  = this;
    var ret = [];
    for (var c in _this.infoContainer) {
      ret.push(_this.infoContainer[c]);
    }
    return ret;
  },
  clear: function() {
    this.infoContainer = [];  
  },
}
//硬件打开时，自动添加硬件信息
commandHandlerManager.on("open", function(e){
  var id = e.params.info.connectionId;
 hardwareMetaInfoManager.add(id, e);
});
//硬件出错时，自动删除连接信息
commandHandlerManager.on("receiveHardwareError", function(e){
  var id = e.params.info.connectionId;
  hardwareMetaInfoManager.remove(id);
});
module.exports = hardwareMetaInfoManager;

