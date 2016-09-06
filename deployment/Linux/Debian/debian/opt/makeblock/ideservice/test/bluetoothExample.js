var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var ProtoCodec = require('../libs/proto-codec');
var KeepAlive = require('../libs/keep-alive');

var proto = new ProtoCodec();
var keepAlive = new KeepAlive();
btSerial.on('found', function(address, name) {
  console.log('found bluetooth', address, name);
  btSerial.findSerialPortChannel(address, function(channel) {
    console.log('find channel ', address, name);
  }
  );
  if(name.toLowerCase() == 'makeblock')
    console.log('found my address!!',address === '00-1b-10-01-0d-1d');
  else{
   console.log('ignore other address ');
    return;
  }
    console.log('begin find channel');
    btSerial.findSerialPortChannel(address, function(channel) {
      console.log('find channel , connecting ble address ' , (address), name, channel);
      btSerial.connect(address, channel, function() {
        console.log('connected', address, name, channel);
        keepAlive.on('error', function(err){
          console.log('keep alive error', err);
        });
        keepAlive.on('timeout', function(err){
          console.log('keep alive timeout', err);
          btSerial.close();
        });
        keepAlive.start(btSerial);

        /*
        var interval = setInterval(function(){
        //setTimeout(function(){
          console.log('querying version : isOpen :' + btSerial.isOpen());
          btSerial.write(new Uint8Array([0xFF, 0x55, 0x04, 0x00, 0x01, 0x00, 0x00]),
              function (err, bytesWritten) {
                if(err){
                 clearInterval(interval);
                  btSerial.close(function() {
                   console.log('write error, ', err, " close port"); 
                  })
                }
                else{
                  console.log(" bytes written " ,bytesWritten);
                }
              }
              );
        }, 1110);

        */

        btSerial.on('data', function(buffer) {
          var res = proto.decode(buffer);
          if(!res){
            return;
          }
          var newBuffer = new ArrayBuffer(res.length);
          var bufferView = new Uint8Array(newBuffer);
          for (var i = 0; i <res.length; i++) {
            bufferView[i] = res[i];
          }


          newBuffer = keepAlive.feed(newBuffer);
          if(!newBuffer){
            console.log('parse version ok');
            return ;
          }
          console.log('parse version failed');
          /*
          var data = new ArrayBuffer(res.length);
          var bufferView = new Uint8Array(data);
          for (var i = 1; i <buffer.length + 1; i++) {
            bufferView[i] = res[i];
          }
          var ver =String.fromCharCode.apply(null, bufferView);
          console.log('get version', ver, ' length ', res.length );*/

        });
      }, function (err) {
        console.log('cannot connect', address, channel, name, 'err: ', err);

      });

      // close the connection when you're ready
      //         btSerial.close();
      //             
    }, function() {
      console.log('found nothing');

    });

});

btSerial.on('closed', function() {
  console.log('on closed');
});

btSerial.on('finished', function() {
  console.log('on finished');
});

btSerial.on('failure', function() {
  console.log('on failure');
});

/*
setInterval(function() {
 console.log(Date.now()) ;
}, 2000);
*/
btSerial.inquire();

return;
//setTimeout(function(){

//btSerial.test();
btSerial.listPairedDevices(function(dev){
  console.log(dev[0]);
  var name = dev[0].name;
  var address = dev[0].address;
  var connectState = "Init"; setInterval(function(){ if(connectState == "connected" || connectState == "connecting"){
      return;
    }else{
      connectState = "connecting";
      btSerial.findSerialPortChannel(address, function(channel) {
        console.log('find channel ', address, name);
        btSerial.connect(address, channel, function() {console.log('connect ok') ; connectState = "connected"}, function(err){console.log("connect failed,error:", err); connectState = "failed"})
      });
    }
  }, 1000);
})

//}, 2000)

//return;
