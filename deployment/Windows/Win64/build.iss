; Script generated by the Inno Setup Script Wizard.
; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppName "makeblockhardware"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "makeblock, Inc."
#define MyAppURL "http://www.makeblock.com/"
#define MyAppExeName "node.exe"
#define Unzip "unzip.exe"
#define NodeModuleZip "node_modules.zip"
#define DriverSetup "setup.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{596DE510-48D4-43D7-9B38-9F581D28EC98}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{#MyAppName}
DisableDirPage=yes
DisableProgramGroupPage=yes
LicenseFile=..\..\License\license.txt
InfoBeforeFile=..\..\License\infoBefore.txt
InfoAfterFile=..\..\License\infoAfter.txt
OutputDir=.\build
OutputBaseFilename=MakeBlockHardwareSupport
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin



;[Registry]
;Root: HKLM; Subkey: "system\currentcontrolset\services\MakeBlockIdeService\parameters"; ValueType: string; ValueName: "Application"; ValueData:"{app}\start.bat"
;Root: HKLM; Subkey: "system\currentcontrolset\services\MakeBlockIdeService\parameters"; ValueType: string; ValueName: "AppDirectory"; ValueData:"{app}"


[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

;[Tasks]
;Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "MakeBlock\IdeService\*"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\..\MakeBlock\IdeService\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\Common\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\Common\drivers\usbserial\x32\mdmcpq.inf"; DestDir: "{win}\inf";    Flags: onlyifdoesntexist uninsneveruninstall; Check:not Is64BitInstallMode
Source: "..\Common\drivers\usbserial\x32\usbser.sys"; DestDir: "{sys}\drivers";Flags: onlyifdoesntexist uninsneveruninstall; Check:not Is64BitInstallMode    
Source: "..\Common\drivers\usbserial\x64\mdmcpq.inf"; DestDir: "{win}\inf";Flags: onlyifdoesntexist uninsneveruninstall;  Check:Is64BitInstallMode   
Source: "..\Common\drivers\usbserial\x64\usbser.sys"; DestDir: "{sys}\drivers";Flags: onlyifdoesntexist uninsneveruninstall;  Check:Is64BitInstallMode  
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
;Name: "{commonprograms}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
;Name: "{commondesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[InstallDelete]
Type: filesandordirs; Name: "{app}"

[Run]
Filename: "{app}\{#Unzip}"; Parameters: "-o {#NodeModuleZip}"; WorkingDir: "{app}"; Flags: skipifsilent
Filename: "{app}\drivers\ch341\SETUP.EXE"; Parameters: "/s"; 
Filename: "{app}\drivers\usbserial\dpinst-x86.exe"; Parameters: "/sw /se";  Check:not Is64BitInstallMode;
Filename: "{app}\drivers\usbserial\dpinst-amd64.exe"; Parameters: "/sw /se";  Check:Is64BitInstallMode;
Filename: "sc"; Parameters:"stop MakeBlockIdeService";
Filename: "sc"; Parameters:"delete MakeBlockIdeService";
Filename: "{app}\nssm.exe"; Parameters:"install MakeBlockIdeService ""{app}\node.exe"" ide_service.js";
Filename: "sc"; Parameters:"start MakeBlockIdeService";

[Code]
function InitializeSetup(): Boolean;
var
RCode: Integer;
FileName: String;
begin
  FileName := ExpandConstant('{sys}') + '\sc.exe';
  Result := True;
  if Result = True then
    Exec(FileName,'stop MakeBlockIdeService','', SW_SHOW, ewNoWait, RCode); 
end;