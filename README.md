# mackepackage for Mac and Windows 
## Mac 
### project structure
	.
	├── MakeBlock
	│   └── IdeService
	│       ├── Client.js
	│       ├── ide_service.js                                            // 服务主入口文件
	│       ├── package.json
	│       ├── service_shell.js
	│       ├── submodules                                                // 子模块
	│       │   ├── bluetooth_module.js
	│       │   ├── hid_module.js
	│       │   └── serialport_module.js
	│       └── version.js
	└── deployment
		└── Mac
		|   ├── build
		|   ├── hardwareSupport.pkgproj
		|   ├── runtime
		|   │   ├── Applications
		|   │   │   └── MakeBlock
		|   │   │       └── IdeService
		|   │   │           ├── node                                      // Mac下nodejs
		|   │   │           └── start                                     // Mac下的启动脚本
		|   │   └── Library
		|   │       ├── Extensions
		|   │       │   └── usbserial.kext                                // 串口驱动
		|   │       └── LaunchDaemons
		|   │           └── com.makeblock.mac.hardwareSupport.plist       // Mac自启动配置
		|   └── scripts
		|   	└── postInstall.sh                                        // Mac下安装脚本
        |
		├── License                                                       // License            
		│   ├── infoAfter.txt
		│   ├── infoBefore.txt
		│   └── license.txt
		│       └── postInstall.sh
		└── Windows                                                       //Windows specific 
			├── Common
			│   ├── drivers                                              // Arduino Drivers     
			│   │   ├── Driver_for_Windows.exe
			│   │   ├── ch341
			│   │   └── usbserial
			│   └── start.bat
			├── Win64                                                   //window 64bit specific         
			│   ├── MakeBlock
			│   │   └── IdeService
			│   │       ├── node.exe
			│   │       ├── nssm.exe
			│   │       ├── unzip.exe
			│   │       └── zip.exe
			│   └── build.iss                                          // Inno setup  build script        
			└── prepair.sh                                             // Windows 打包前执行此脚本     

34 directories, 63 files



* 通用文件: MakeBlock/IdeService  --> /Applications/MakeBlock/IdeService/
* 平台相关文件: deployment/Mac , deployment/Windows/Win64, deployment/Windows/Win32
* TODO

#### Package Tools for  Mac 
* [Packages](http://s.sudre.free.fr/Software/documentation/Packages/en/index.html)
* 1  npm install to build native modules of serialport, socket.io
* 2 open packages software, and open hardwareSupport.pkgproj
* 3 build project

#### Package Tools for Windows 
* [inno setup](http://www.jrsoftware.org/)
* 1 install visual studio  to build native modules of serialport, socket.io
* 2 use prepare.sh to zip node_modules;
* 3 open  build.iss  with inno setup
* TODO  


