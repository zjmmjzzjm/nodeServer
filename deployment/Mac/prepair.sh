path=`pwd`

#Patch
#cp Patch/* ../../MakeBlock/IdeService/ -rfv
#cd ../../MakeBlock/IdeService/node_modules/serialport 
#node-gyp rebuild
#cd -
#cd ../../MakeBlock/IdeService/node_modules/bluetooth-serial-port 
#node-gyp rebuild
#cd -

cd ../../MakeBlock/IdeService/
echo 'current path:'`pwd`
#rm node_modules.zip
#$zip -r node_modules.zip node_modules
#rm -rf node_modules
#$unzip node_modules

file_to_rm='node_modules/serialport/node_modules/node-pre-gyp
node_modules/serialport/build/Release/obj.target/
node_modules/utf-8-validate/build/Release/obj.target/
node_modules/bluetooth-serial-port/build/Release/obj.target
'
for f in $file_to_rm
do
	echo $f
	rm -rf $f
done
cd -
