function ProtoCodec() {
  this.SETTING = {
    READ_CHUNK_SUFFIX : [0x0d, 0x0a],
  }
  this.buffer = [];
}
ProtoCodec.prototype ={
  decode: function(data) {
    var bytes = new Uint8Array(data);
    var result = null;
    for (var i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
      var length = this.buffer.length;
      // 过滤无效数据
      if (length > 1 && this.buffer[length - 2] == this.SETTING.READ_CHUNK_SUFFIX[0] 
          && this.buffer[length - 1] == this.SETTING.READ_CHUNK_SUFFIX[1]) {
        result = this.buffer;
        this.buffer = [];
      }
    }
    return result;
  },
} 
module.exports = ProtoCodec;
