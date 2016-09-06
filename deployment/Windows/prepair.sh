path=`pwd`
zip=$path/Win64/MakeBlock/IdeService/zip.exe
unzip=$path/Win64/MakeBlock/IdeService/unzip.exe

#Patch
cp Patch/* ../../MakeBlock/IdeService/ -rfv
cd ../../MakeBlock/IdeService/node_modules/serialport 
node-gyp rebuild
cd -
cd ../../MakeBlock/IdeService/node_modules/bluetooth-serial-port 
node-gyp rebuild
cd -

cd ../../MakeBlock/IdeService/
echo 'current path:'`pwd`
#rm node_modules.zip
#$zip -r node_modules.zip node_modules
#rm -rf node_modules
#$unzip node_modules

file_to_rm='node_modules/serialport/node_modules/node-pre-gyp
node_modules/serialport/build/binding.sln
node_modules/serialport/build/config.gypi
node_modules/serialport/build/Release/obj
node_modules/serialport/build/Release/serialport.exp
node_modules/serialport/build/Release/serialport.lib
node_modules/serialport/build/Release/serialport.map
node_modules/serialport/build/Release/serialport.pdb
node_modules/serialport/build/serialport.vcxproj
node_modules/serialport/build/serialport.vcxproj.filters
node_modules/utf-8-validate/build/binding.sln
node_modules/utf-8-validate/build/config.gypi
node_modules/utf-8-validate/build/Release/obj
node_modules/utf-8-validate/build/Release/validation.exp
node_modules/utf-8-validate/build/Release/validation.lib
node_modules/utf-8-validate/build/Release/validation.map
node_modules/utf-8-validate/build/Release/validation.pdb
node_modules/utf-8-validate/build/validation.vcxproj
node_modules/node_modules/utf-8-validate/build/validation.vcxproj.filters
node_modules/bluetooth-serial-port/build/binding.sdf
node_modules/bluetooth-serial-port/build/binding.sln
node_modules/bluetooth-serial-port/build/binding.v12.suo
node_modules/bluetooth-serial-port/build/BluetoothSerialPort.vcxproj
node_modules/bluetooth-serial-port/build/BluetoothSerialPort.vcxproj.filters
node_modules/bluetooth-serial-port/build/config.gypi
node_modules/bluetooth-serial-port/build/Release/BluetoothSerialPort.exp
node_modules/bluetooth-serial-port/build/Release/BluetoothSerialPort.lib
node_modules/bluetooth-serial-port/build/Release/BluetoothSerialPort.map
node_modules/bluetooth-serial-port/build/Release/BluetoothSerialPort.pdb
node_modules/bluetooth-serial-port/build/Release/obj
'
for f in $file_to_rm
do
	echo $f
	rm -rf $f
done
cd -
