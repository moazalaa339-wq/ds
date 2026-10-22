@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "QUIET=%~1"

REM 1) اقتل حسب PID المسجّل
if exist "%~dp0.hawa_pid" (
  set /p HPID=<"%~dp0.hawa_pid"
  if defined HPID (
    taskkill /PID %HPID% /F >nul 2>&1
  )
)

REM 2) اقتل أي python شغال http_server.py من المجلد ده
for /f "tokens=2 delims=," %%P in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV /NH 2^>nul') do (
  wmic process where "ProcessId=%%~P" get CommandLine 2>nul | findstr /I /C:"http_server.py" >nul 2>&1
  if not errorlevel 1 taskkill /PID %%~P /F >nul 2>&1
)
for /f "tokens=2 delims=," %%P in ('tasklist /FI "IMAGENAME eq python3.exe" /FO CSV /NH 2^>nul') do (
  wmic process where "ProcessId=%%~P" get CommandLine 2>nul | findstr /I /C:"http_server.py" >nul 2>&1
  if not errorlevel 1 taskkill /PID %%~P /F >nul 2>&1
)
for /f "tokens=2 delims=," %%P in ('tasklist /FI "IMAGENAME eq py.exe" /FO CSV /NH 2^>nul') do (
  wmic process where "ProcessId=%%~P" get CommandLine 2>nul | findstr /I /C:"http_server.py" >nul 2>&1
  if not errorlevel 1 taskkill /PID %%~P /F >nul 2>&1
)

REM 3) امسح ملفات القفل
if exist "%~dp0.hawa_port" del /f /q "%~dp0.hawa_port" >nul 2>&1
if exist "%~dp0.hawa_pid" del /f /q "%~dp0.hawa_pid" >nul 2>&1

if not "%QUIET%"=="quiet" (
  echo Hawa server stopped and cleaned from Task Manager.
  echo You can delete the folder now.
  timeout /t 2 >nul
)
endlocal
