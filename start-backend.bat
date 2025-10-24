@echo off
echo Checking for processes on port 5000...
netstat -ano | findstr :5000
if %errorlevel% == 0 (
    echo Found processes on port 5000. Killing them...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        taskkill /PID %%a /F
    )
    timeout /t 2 /nobreak >nul
)

echo Starting backend server...
cd backend
node server.js
pause





