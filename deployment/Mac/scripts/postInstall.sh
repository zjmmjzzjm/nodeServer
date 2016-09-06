#!/bin/sh
cp -rf /Applications/MakeBlock/IdeService/usbserial.kext /Library/Extensions/
cp -rf /Applications/MakeBlock/IdeService/com.makeblock.mac.hardwareSupport.plist /Library/LaunchDaemons/
chmod a+x /Applications/MakeBlock/IdeService/start
chmod a+x /Applications/MakeBlock/IdeService/node
chown -R root:wheel /Library/Extensions/usbserial.kext
# load usb serial port kernel extension 
kextload /Library/Extensions/usbserial.kext
# launch the ide service
launchctl unload /Library/LaunchDaemons/com.makeblock.mac.hardwareSupport.plist 
launchctl load /Library/LaunchDaemons/com.makeblock.mac.hardwareSupport.plist 
