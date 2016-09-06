echo off
%~d0
cd %~dp0
echo %cd%
node.exe ide_service.js