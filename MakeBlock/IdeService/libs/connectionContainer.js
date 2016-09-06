//一个简单的连接池,要求被容纳的对象必须有path属性
function Container() {
 this.connections = []; //key value  map, seriallPath=>Conneciton
}

Container.prototype = {
  //connection mannage, 新增连接
  addConnection: function(serialPort) {
    if(this.connections[serialPort.path]){
      return this.connections[serialPort.path];
    } 
    console.log('add new connection');
    connection =  {
      connectionId:serialPort.path,
      serialPort : serialPort,
    },
    this.connections[serialPort.path] =  connection;
    return connection;
  },
  removeConnection: function(serialPath) {
    console.log("remove connection "+ serialPath);
    if (this.connections[serialPath]) {
      delete this.connections[serialPath];
    }
  },
  getConnection: function(serialPath) {
    return this.connections[serialPath];
  },
  getConnections: function() {
    var _this  = this;
    var ret = [];
    for (var c in _this.connections) {
      ret.push(_this.connections[c]);
    }
    return ret;
  },
  getSerialPort: function(serialPath) {
    var connection = this.getConnection(serialPath) ;
    if (connection) {
      return connection.serialPort; 
    }
    return null;
  },
  clear: function() {
    this.connections = [];  
  },
}
module.exports = Container;
