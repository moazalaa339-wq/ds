@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title HawaEngineServer
echo.
echo ========================================
echo   Hawa Engine - Local Server
echo ========================================
echo.
echo Starting... Keep this window OPEN.
echo Closing this window stops the server.
echo.

set "ROOT=%~dp0"

set "PY="
where py >nul 2>&1 && set "PY=py -3"
if not defined PY where python >nul 2>&1 && set "PY=python"
if not defined PY where python3 >nul 2>&1 && set "PY=python3"
if not defined PY if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if not defined PY if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
if not defined PY if exist "%ProgramFiles%\Python312\python.exe" set "PY=%ProgramFiles%\Python312\python.exe"

if not defined PY (
  echo ERROR: Python not found.
  echo Install from https://www.python.org/downloads/
  echo Enable: Add python.exe to PATH
  pause
  exit /b 1
)

if not exist "%ROOT%http_server.py" (
  echo ERROR: http_server.py missing
  pause
  exit /b 1
)

REM اقتل أي سيرفر Hawa قديم قبل التشغيل (عشان مفيش قفل على الملفات)
call "%ROOT%STOP_SERVER.bat" quiet

echo Using: %PY%
echo Folder: %ROOT%
echo.
REM /b مش مستخدم — العملية في نفس النافذة، قفل النافذة = قفل السيرفر
%PY% "%ROOT%http_server.py"
set ERR=%ERRORLEVEL%

REM تنظيف بعد الخروج
if exist "%ROOT%.hawa_port" del /f /q "%ROOT%.hawa_port" >nul 2>&1
if exist "%ROOT%.hawa_pid" del /f /q "%ROOT%.hawa_pid" >nul 2>&1

echo.
echo Server stopped (code %ERR%). Cleaned up.
pause
exit /b %ERR%
