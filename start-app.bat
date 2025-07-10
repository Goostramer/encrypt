@echo off
echo Starting Encryption App...
echo.

echo Starting MongoDB...
echo If MongoDB is not installed, please install it first.
echo You can download it from https://www.mongodb.com/try/download/community
echo.
echo Starting Backend Server...
start cmd /k "cd backend && node src/server.js"
echo.
echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start cmd /k "cd frontend && npx vite"
echo.
echo Once both servers are running, you can access the application at:
echo http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul
