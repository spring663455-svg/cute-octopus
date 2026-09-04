@echo off
chcp 65001 > nul
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
  py launch.py
) else (
  python launch.py
)
if errorlevel 1 (
  echo.
  echo 無法啟動，請先安裝 Python 3。
  pause
)
