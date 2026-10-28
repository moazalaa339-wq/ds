@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title Hawa - Launch

REM شغّل السيرفر في نافذة منفصلة مصغّرة (تقفلها = السيرفر يقف)
if not exist "%~dp0START_SERVER.bat" (
  echo START_SERVER.bat missing
  pause
  exit /b 1
)

start "HawaEngineServer" /min cmd /c "%~dp0START_SERVER.bat"

REM استنى السيرفر يكتب المنفذ
set "PORT=8765"
set /a N=0
:waitport
set /a N+=1
if exist "%~dp0.hawa_port" (
  set /p PORT=<"%~dp0.hawa_port"
  goto open
)
if %N% GEQ 40 goto open
ping -n 1 127.0.0.1 >nul
goto waitport

:open
if not defined PORT set "PORT=8765"
start "" "http://127.0.0.1:%PORT%/build.html"
REM النافذة دي بتقفل — السيرفر في النافذة المصغّرة
endlocal
exit /b 0
