var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;

var listRes = spawnSync('bt-device', ['-l']);
if(listRes.stdout)
{
  var data = listRes.stdout +""; 
  var str = ''+data;
  var arr = str.split('\n');
  var res = [];
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

function isPaired(dev)
{
  var res = spawnSync('bt-device', ['--info='+dev.path]);  
  var str = res.stdout + "";
  if(str.indexOf('Paired: 1') != -1)
    return true;
  return false;
  
}
