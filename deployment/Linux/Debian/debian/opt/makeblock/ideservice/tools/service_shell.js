var io = require('socket.io-client');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

var LISTENPORT = 34655;
var socket = io.connect('http://127.0.0.1:' + LISTENPORT);


socket.on('s2c_data', function(data){
  console.log((data.params.result));
  rl.prompt();
});
socket.on('s2c_push', function(data){
  console.log("receive s2c_push", {method:'push', params:{info:{data:data}}});
});
socket.on('connectionOK', function(data){
  console.log("service connected", data);
  rl.setPrompt('ide_service> ');
  rl.prompt();
})
socket.on('connect', function (data) {
  //console.log("service conected");
});
socket.on('connect_error', function (data) {
  console.log('connect_error=>',data);
});

socket.on('connection_timeout', function (data) {
  console.log('connectin_timeout=>', data);
});

socket.on('connecting', function (data) {
  console.log('connecting =>', data);
});

socket.on('disconnect', function (data) {
  console.log('disconnect => ', data);
});

socket.on('error', function (data) {
  console.log('error => ', data);
});

socket.on('reconnect', function (data) {
  console.log('reconnect => ', data);
});

socket.on('reconnect_attempt', function (data) {
  console.log('reconnect_attempt => ', data);
});

socket.on('reconnect_failed', function (data) {
  console.log('reconnect_failed => ', data);
});

socket.on('reconnect_error', function (data) {
  console.log('reconnect_errro => ', data);
});

socket.on('reconnecting', function (data) {
  console.log('reconnecting => ', data);
});
/*
socket.on('ping', function (data) {
  console.log('ping => ', data);
});

socket.on('pong', function (data) {
  console.log('pong => ', data);
});


*/

console.log('Welcome to ide_service shell');
rl.setPrompt('OHAI> ');
rl.prompt();

rl.on('line', (line) => {
  var strs = line.trim().split(' ')
	socket.emit('c2s_command', {method: strs[0], params:{options:strs.slice(1,strs.length)},});
}).on('close', () => {
  console.log('Bye bye!');
  process.exit(0);
});
