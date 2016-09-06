#define MyAppVersion "2.1.1"
#define MyAppId "makeblockhardware"
#define MyAppPublisher "makeblock, Inc."
#define MyAppURL "http://www.makeblock.com/"
#define MyAppExeName "node.exe"
#define Unzip "unzip.exe"
#define DriverSetup "setup.exe"

[Setup]
AppId={#MyAppId}
AppName={#MyAppId}
AppVersion={#MyAppVersion}
AppVerName={#MyAppId}
AppPublisher={#MyAppPublisher}
DefaultDirName={pf}\{#MyAppId}
DefaultGroupName={#MyAppId}
AllowNoIcons=yes
OutputDir=..\build
OutputBaseFilename={#MyAppId}
SetupIconFile=installer.ico
UninstallIconFile=Uninstall.ico
Compression=lzma
SolidCompression=yes
VersionInfoVersion=1.0.0.0
VersionInfoTextVersion=1.0.0.0
VersionInfoDescription={#MyAppId}
DisableReadyPage=yes
DisableProgramGroupPage=yes
DirExistsWarning=no


[Messages]
ButtonBack=
ButtonNext=
ButtonInstall=
ButtonFinish=
SetupAppTitle={#MyAppId}

[Icons]
;Name: {commondesktop}\{#MyAppId}; Filename: {app}\1.exe; WorkingDir: {app}; Check: Desktop;
;Name: {group}\xxx; Filename: {app}\xxx.exe; WorkingDir: {app};
;Name: {group}\ж�� xxx; Filename: {uninstallexe}; WorkingDir: {app};
;Name: {commondesktop}\xxx; Filename: {app}\xxx.exe; WorkingDir: {app}; Check: Desktop;
;Name: {userappdata}\Microsoft\Internet Explorer\Quick Launch\xxx; Filename: {app}\bin\QQ.exe; WorkingDir: {app};

[Files]
Source: {tmp}\*; DestDir: {tmp}; Flags: dontcopy solidbreak;
;Source: {app}\*; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs;
Source: "..\MakeBlock\IdeService\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\..\..\MakeBlock\IdeService\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\Common\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\..\Common\drivers\usbserial\x32\mdmcpq.inf"; DestDir: "{win}\inf";    Flags: onlyifdoesntexist uninsneveruninstall; Check:not Is64BitInstallMode
Source: "..\..\Common\drivers\usbserial\x32\usbser.sys"; DestDir: "{sys}\drivers";Flags: onlyifdoesntexist uninsneveruninstall; Check:not Is64BitInstallMode
;Source: "..\..\Common\drivers\usbserial\x64\mdmcpq.inf"; DestDir: "{win}\inf";Flags: onlyifdoesntexist uninsneveruninstall;  Check:Is64BitInstallMode
;Source: "..\..\Common\drivers\usbserial\x64\usbser.sys"; DestDir: "{sys}\drivers";Flags: onlyifdoesntexist uninsneveruninstall;  Check:Is64BitInstallMode

[InstallDelete]
Type: filesandordirs; Name: "{app}"

[Run]
Filename: "{app}\drivers\ch341\SETUP.EXE"; Parameters: "/s";
Filename: "{app}\drivers\usbserial\dpinst-x86.exe"; Parameters: "/sw /se";  Check:not Is64BitInstallMode;
;Filename: "{app}\drivers\usbserial\dpinst-amd64.exe"; Parameters: "/sw /se";  Check:Is64BitInstallMode;
;Filename: "sc"; Parameters:"stop MakeBlockIdeService";
;Filename: "sc"; Parameters:"delete MakeBlockIdeService";
;Filename: "{app}\nssm.exe"; Parameters:"install MakeBlockIdeService ""{app}\node.exe"" ide_service.js";
;Filename: "sc"; Parameters:"start MakeBlockIdeService";
[code]

#include "Modules\botva2.iss"
#include "Modules\PB.iss"

type
  TPBProc = function(h:hWnd;Msg,wParam,lParam:Longint):Longint;  //�ٷֱȻص�����

Const
  //ͼƬ�ߴ�
  IMG_BG_WIDTH = 762;
  IMG_BG_HEIGHT = 430;
  IMG_GAP = 10;
  
  WM_SYSCOMMAND = $0112;
  SC_CLOSE      = 61536;

function InitializeSetup(): Boolean;
var
  RCode: Integer;
  FileName : String;
begin
  if not FileExists(ExpandConstant('{tmp}\CallbackCtrl.dll')) then ExtractTemporaryFile('CallbackCtrl.dll');
  if not FileExists(ExpandConstant('{tmp}\botva2.dll')) then ExtractTemporaryFile('botva2.dll');
  
  FileName := ExpandConstant('{sys}') + '\sc.exe';
  Exec(FileName,'stop MakeBlockIdeService','', SW_HIDE, ewWaitUntilTerminated, RCode);
  Result:=True;
end;


function SetWindowLong(Wnd: HWnd; Index: Integer; NewLong: Longint): Longint; external 'SetWindowLongA@user32.dll stdcall';
function PBCallBack(P:TPBProc;ParamCount:integer):LongWord; external 'wrapcallback@files:innocallback.dll stdcall';
function CallWindowProc(lpPrevWndFunc: Longint; hWnd: HWND; Msg: UINT; wParam, lParam: Longint): Longint; external 'CallWindowProcA@user32.dll stdcall';

var
ErrorCode: Integer;
IsOpenLink: boolean; //�Ƿ����ҳ����
WizardFormImage: HWND; //����ͼ
LogoImage : HWND;//��Logo
CloseBtn: HWND; //���Ͻǹرհ�ť
NextBtn: HWND; //��ʼ��װ��ť
StopInstallBtn:HWND;  //ֹͣ��װ��ť
FinishBtn:HWND;//����M���䰴ť


WFButtonFont : TFont;
bigLabel,InstallingLabel, FinishedLabel: Tlabel;
Frame : TForm;  //Ϊʵ��Բ��Ч���ĸ���form
dx,dy,dh1 : integer;  //����϶�
IsFrameDragging : boolean;   //����϶�����
NewPB: TImgPB; //����������
PrLabel: TLabel; //�ٷֱȱ�ǩ
PBOldProc : Longint;//�ɵĽ��Ȼص����

//��װ���Ȱٷֱ�
function PBProc(h:hWnd;Msg,wParam,lParam:Longint):Longint;
var
  pr,i1,i2 : Extended;
begin
  Result:=CallWindowProc(PBOldProc,h,Msg,wParam,lParam);
  if (Msg=$402) and (WizardForm.ProgressGauge.Position>WizardForm.ProgressGauge.Min) then begin
    i1:=WizardForm.ProgressGauge.Position-WizardForm.ProgressGauge.Min;
    i2:=WizardForm.ProgressGauge.Max-WizardForm.ProgressGauge.Min;
    pr:=i1*100/i2;
    PrLabel.Caption:='Loading......('+IntToStr(Round(pr))+'%)';
    ImgPBSetPosition(NewPB,pr*10);
    ImgApplyChanges(WizardForm.Handle);
  end;
end;

//����϶�
procedure WizardFormMouseDown(Sender: TObject; Button: TMouseButton; Shift: TShiftState; X, Y: Integer);
begin
  IsFrameDragging:=True;
  dx:=X;
  dy:=Y;
end;

procedure WizardFormMouseUp(Sender: TObject; Button: TMouseButton; Shift: TShiftState; X, Y: Integer);
begin
  IsFrameDragging:=False;
  WizardForm.Show;
end;

procedure WizardFormMouseMove(Sender: TObject; Shift: TShiftState; X,Y: Integer);
begin
  if IsFrameDragging then begin
    WizardForm.Left:=WizardForm.Left+X-dx;
    WizardForm.Top:=WizardForm.Top+Y-dy;
    Frame.Left:=WizardForm.Left - IMG_GAP;
    Frame.Top:=WizardForm.Top - IMG_GAP;
  end;
end;

procedure frameFormMouseUp(Sender: TObject; Button: TMouseButton; Shift: TShiftState; X, Y: Integer);
begin
  WizardForm.Show;
end;

procedure WizardFormcc;
begin
    WizardForm.OnMouseDown:=@WizardFormMouseDown;
    WizardForm.OnMouseUp:=@WizardFormMouseUp;
    WizardForm.OnMouseMove:=@WizardFormMouseMove;
end;


//����ԭʼ��form������Բ��Ч��,����Ƿ�������form����Ϊ�󱳾�
procedure CreateFrame;
begin
  IsFrameDragging:=False;
  Frame:=TForm.Create(nil);;
  Frame.BorderStyle:=bsNone;
  CreateFormFromImage(Frame.Handle,ExpandConstant('{tmp}\frame.png'));
  with TLabel.Create(Frame) do begin
    Parent:=Frame;
    AutoSize:=false;
    Left:=0;
    Top:=0;
    Width:=Frame.CLientWidth;
    Height:=Frame.ClientHeight;
    OnMouseDown:=@frameFormMouseUp;
  end;
  WizardForm.Left:=Frame.Left + IMG_GAP ;
  WizardForm.Top:=Frame.Top + IMG_GAP ;
  Frame.Show;
end;



//������ϽǵĹرհ�ť�����һ��
procedure CloseBtnOnClickAfter(hBtn:HWND);
begin
//WizardForm.Close;
//MsgBox('closed ' , mbError, MB_OK);
//SendMessage(WizardForm.Handle, WM_SYSCOMMAND, SC_CLOSE, 0)
IsOpenLink := false;
WizardForm.NextButton.Click;
end;


//������ϽǵĹرհ�ť
procedure CloseBtnOnClick(hBtn:HWND);
begin
//WizardForm.Close;

WizardForm.CancelButton.Click;
end;

//��ʼ��װ��ť
procedure NextBtnClick(hBtn:HWND);
begin
WizardForm.NextButton.Click;
end;

//ֹͣ��װ��ť
procedure StopInstallBtnClick(hBtn:HWND);
begin
WizardForm.CancelButton.Click;
end;

//����M���䰴ť
procedure FinishBtnClick(hBtn:HWND);
begin
IsOpenLink := true;
WizardForm.NextButton.Click;
end;

//�������棬��Щ��Ҫ������������resultΪtrue
function ShouldSkipPage(PageID: Integer): Boolean;
begin
if PageID=wpSelectComponents then    //���������װ����
  result := true;
if PageID=wpWelcome then
  result := true;
end;

procedure InitializeWizard(); //1399
begin
ExtractTemporaryFile('frame.png');
ExtractTemporaryFile('CloseBtn.png');
ExtractTemporaryFile('StartInstallBtn.png');
ExtractTemporaryFile('StopInstallBtn.png');
ExtractTemporaryFile('FinishBtn.png');
ExtractTemporaryFile('progressbar.png');
ExtractTemporaryFile('progressbarBg.png');
ExtractTemporaryFile('Logo.png');

WFButtonFont:=TFont.Create;
WizardForm.BorderStyle:=bsNone; //ȥ�߿�
WizardForm.ClientWidth:=IMG_BG_WIDTH - IMG_GAP * 2;
WizardForm.ClientHeight:=IMG_BG_HEIGHT -IMG_GAP * 2;
WizardFormcc;
CreateFrame;

//����ͼ
WizardFormImage:=ImgLoad(WizardForm.Handle,ExpandConstant('{tmp}\frame.png'),(-IMG_GAP), (-IMG_GAP),IMG_BG_WIDTH,IMG_BG_HEIGHT,True,True);
//Logo
LogoImage :=ImgLoad(WizardForm.Handle, ExpandConstant('{tmp}\Logo.png'),313,63,120,119,True,False);

//���ϽǵĹرհ�ť
CloseBtn:=BtnCreate(WizardForm.Handle,703,2, 40,42,ExpandConstant('{tmp}\CloseBtn.png'),0,False);
BtnSetEvent(CloseBtn,BtnClickEventID, WrapBtnCallback(@CloseBtnOnClick,1));

//WizardForm
WizardForm.OuterNotebook.Hide;
WizardForm.Bevel.Hide;
WizardForm.BeveledLabel.Width := 0
WizardForm.BeveledLabel.Height := 0


//����ϵͳ��ť
WizardForm.NextButton.Width:=0;
WizardForm.NextButton.Height:=0;
WizardForm.CancelButton.Height := 0;
WizardForm.CancelButton.Width := 0;

//��ʼ��װ
NextBtn:=BtnCreate(WizardForm.Handle,230,300,280,110,ExpandConstant('{tmp}\StartInstallBtn.png'),0,False);
BtnSetEvent(NextBtn,BtnClickEventID,WrapBtnCallback(@NextBtnClick,1));
BtnSetFont(NextBtn,WFButtonFont.Handle);
BtnSetFontColor(NextBtn,Clblack,Clblack,Clblack,$B6B6B6);
//ֹͣ��ť
StopInstallBtn:=BtnCreate(WizardForm.Handle,230,300,280,110,ExpandConstant('{tmp}\StopInstallBtn.png'),0,False);
BtnSetEvent(StopInstallBtn,BtnClickEventID,WrapBtnCallback(@StopInstallBtnClick,1));
BtnSetFont(StopInstallBtn,WFButtonFont.Handle);
BtnSetFontColor(StopInstallBtn,Clblack,Clblack,Clblack,$B6B6B6);
//����M���䰴ť
FinishBtn:=BtnCreate(WizardForm.Handle,230,300,280,110,ExpandConstant('{tmp}\FinishBtn.png'),0,False);
BtnSetEvent(FinishBtn,BtnClickEventID,WrapBtnCallback(@FinishBtnClick,1));
BtnSetFont(FinishBtn,WFButtonFont.Handle);
BtnSetFontColor(FinishBtn,Clblack,Clblack,Clblack,$B6B6B6);

//���ǩ
bigLabel := TLabel.Create(WizardForm);
bigLabel.Parent := WizardForm;
bigLabel.Font.Name := '΢���ź�';
bigLabel.Font.Size := 19
bigLabel.Font.Style := [];
bigLabel.Font.Color := $E4AF00;
bigLabel.Transparent := True;
bigLabel.AutoSize := True;
bigLabel.SetBounds((188), (224), (380), (40));
bigLabel.Caption := 'MakeBlock��������������V1.0'
bigLabel.OnMouseDown:=@WizardFormMouseDown;
bigLabel.OnMouseUp:=@WizardFormMouseUp;
bigLabel.OnMouseMove:=@WizardFormMouseMove;

//���ڰ�װ����
InstallingLabel := TLabel.Create(WizardForm);
InstallingLabel.Parent := WizardForm;
InstallingLabel.Font.Name := '΢���ź�';
InstallingLabel.Font.Size := 19
InstallingLabel.Font.Style := [];
InstallingLabel.Font.Color := $E4AF00;
InstallingLabel.Transparent := True;
InstallingLabel.AutoSize := True;
InstallingLabel.SetBounds((275), (100), (380), (40));
InstallingLabel.Caption := '�����������ڰ�װ';
InstallingLabel.OnMouseDown:=@WizardFormMouseDown;
InstallingLabel.OnMouseUp:=@WizardFormMouseUp;
InstallingLabel.OnMouseMove:=@WizardFormMouseMove;

//�ٷֱ�
PrLabel:=TLabel.Create(WizardForm);
PrLabel.Parent:=WizardForm;
PrLabel.Left:=309;
PrLabel.Top:=260;;
PrLabel.Caption:='Loading......(0%)';
PrLabel.Font.Style := [fsBold];
PrLabel.Font.Color:=$B1B1B1;
PrLabel.Font.Size:= 10
PrLabel.Transparent:=True;
PBOldProc:=SetWindowLong(WizardForm.ProgressGauge.Handle,-4,PBCallBack(@PBProc,4));



//������ǩ
FinishedLabel := TLabel.Create(WizardForm);
FinishedLabel.Parent := WizardForm;
FinishedLabel.Font.Name := '΢���ź�';
FinishedLabel.Font.Size := 30
FinishedLabel.Font.Style := [];
FinishedLabel.Font.Color := $E4AF00;
FinishedLabel.Transparent := True;
FinishedLabel.AutoSize := True;
FinishedLabel.SetBounds((290), (160), (300), (50));
FinishedLabel.Caption := '��װ�ɹ�';
FinishedLabel.OnMouseDown:=@WizardFormMouseDown;
FinishedLabel.OnMouseUp:=@WizardFormMouseUp;
FinishedLabel.OnMouseMove:=@WizardFormMouseMove;

end;

//ȡ������
procedure CancelButtonClick(CurPageID: Integer; var Cancel, Confirm: Boolean);
begin
Confirm:= False;
Cancel:=True;
//  MsgBox('current page changed! wpFinished', mbError, MB_OK);
end;
                

procedure CurPageChanged(CurPageID: Integer);
begin

    BtnSetText(NextBtn,WizardForm.NextButton.Caption);
    BtnSetVisibility(NextBtn, false);
    BtnSetEnabled(NextBtn,false);
    BtnSetVisibility(StopInstallBtn, false);
    BtnSetEnabled(StopInstallBtn,false);
    BtnSetVisibility(FinishBtn, false);
    BtnSetEnabled(FinishBtn,false);
    
    ImgSetVisibility(LogoImage,false);
    bigLabel.Hide;
    WizardForm.DirEdit.hide
    FinishedLabel.hide
    PrLabel.hide
    InstallingLabel.hide;
     //MsgBox('aaaaaa' +IntToStr(CurPageID) , mbError, MB_OK);
  if CurPageID = wpWelcome then     
    begin
    //WizardFormImage:=ImgLoad(WizardForm.Handle,ExpandConstant('{tmp}\frame.png'),(-IMG_GAP), (-IMG_GAP),IMG_BG_WIDTH,IMG_BG_HEIGHT,True,True);
    ImgSetVisibility(LogoImage,false);
    end;
  if CurPageID = wpSelectDir then
    begin
    //WizardFormImage:=ImgLoad(WizardForm.Handle,ExpandConstant('{tmp}\frame.png'),(-IMG_GAP), (-IMG_GAP),IMG_BG_WIDTH,IMG_BG_HEIGHT,True,True);
    ImgSetVisibility(LogoImage,true);
    BtnSetVisibility(NextBtn, true);
    BtnSetEnabled(NextBtn,true);
    biglabel.show
    end;
    
  if CurPageID = wpPreparing  then
    begin
    //WizardFormImage:=ImgLoad(WizardForm.Handle,ExpandConstant('{tmp}\frame.png'),(-IMG_GAP), (-IMG_GAP),IMG_BG_WIDTH ,IMG_BG_HEIGHT,True,True);
    NewPB:=ImgPBCreate(WizardForm.Handle, ExpandConstant('{tmp}\progressbarBg.png'), ExpandConstant('{tmp}\progressbar.png'),
    0,170,700,100);


    PrLabel.show;
    InstallingLabel.show;
    //��װ���̻ҵ���ť
    BtnSetVisibility(NextBtn,False);
    BtnSetEnabled(NextBtn,False);

    //����ֹͣ��װ��ť
    BtnSetVisibility(StopInstallBtn,true);
    BtnSetEnabled(StopInstallBtn,true);

    //�ҵ�����M���䰴ť
    BtnSetVisibility(FinishBtn,false);
    BtnSetEnabled(FinishBtn,false);
    end
  if CurPageID = wpInstalling  then
    begin
    

    
    PrLabel.show;
    InstallingLabel.show;
    //��װ���̻ҵ���ť
    BtnSetVisibility(NextBtn,False);
    BtnSetEnabled(NextBtn,False);
    
    //����ֹͣ��װ��ť
    BtnSetVisibility(StopInstallBtn,true);
    BtnSetEnabled(StopInstallBtn,true);
    
    //�ҵ�����M���䰴ť
    BtnSetVisibility(FinishBtn,false);
    BtnSetEnabled(FinishBtn,false);
    
    

    end; 
  if CurPageID = wpFinished then
    begin
    //��װ���̻ҵ���ť
    BtnSetVisibility(NextBtn,False);
    BtnSetEnabled(NextBtn,False);

    //�ҵ�ֹͣ��װ��ť
    BtnSetVisibility(StopInstallBtn,false);
    BtnSetEnabled(StopInstallBtn,false);

    //��������M���䰴ť
    BtnSetVisibility(FinishBtn,true);
    BtnSetEnabled(FinishBtn,true);
    //�رհ�ť
    BtnSetEvent(CloseBtn,BtnClickEventID, WrapBtnCallback(@CloseBtnOnClickAfter,1));
    
    ImgPBVisibility(NewPB, false);
    FinishedLabel.show;
    
    end;
  ImgApplyChanges(WizardForm.Handle);
end;

procedure DeinitializeSetup();
begin
gdipShutdown;
if PBOldProc<>0 then SetWindowLong(WizardForm.ProgressGauge.Handle,-4,PBOldProc);
end;

//��װ��������"���"֮�����г���
procedure CurStepChanged(CurStep: TSetupStep);
var
RCode: Integer;
ErrorCode: Integer;
FileName: String;
Nssw: String;
Node: String;
Parameters: String;
begin
//if (CurStep=ssDone) and (BtngetChecked(Run1Check)) then
//Exec(ExpandConstant('{app}\1.exe'), '', '', SW_SHOW, ewNoWait, RCode);
//if (CurStep=ssDone) and (BtngetChecked(web1Check)) then
//ShellExec('open', 'http://www.baidu.com/', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
if (CurStep=ssDone) then
  begin
  if (IsOpenLink) then
  begin
   ShellExec('open', 'http://edu.makeblock.com/', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
  end
    
  ////if (CurStep=ssDone) and (BtngetChecked(Run2Check)) then
  ////Exec(ExpandConstant('{app}\Bin\QQ.exe'), '', '', SW_SHOW, ewNoWait, RCode);


  end
  if(CurStep=ssPostInstall) then
  begin
    FileName := ExpandConstant('{sys}') + '\sc.exe';
    Exec(FileName,'stop MakeBlockIdeService','', SW_HIDE, ewWaitUntilTerminated, RCode);
    Exec(FileName,'delete MakeBlockIdeService','', SW_HIDE, ewWaitUntilTerminated, RCode);

    Nssw := ExpandConstant('{app}') + '\nssm.exe';
    Node := ExpandConstant('{app}') + '\node.exe';
    Parameters := 'install MakeBlockIdeService "' +   Node + '" ide_service.js'
    //MsgBox(Parameters, mbError, MB_OK);
    Exec(Nssw, Parameters,ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, RCode);

    Exec(FileName,'start MakeBlockIdeService','', SW_HIDE, ewWaitUntilTerminated, RCode);
  end

end;
