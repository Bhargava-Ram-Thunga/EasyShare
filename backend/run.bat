@echo off
REM Easy Share Backend Startup Script for Windows

echo Starting Easy Share Backend...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/update dependencies
echo Installing dependencies...
pip install -q -r requirements.txt

REM Check if .env exists
if not exist ".env" (
    echo Creating .env file from example...
    copy .env.example .env
    echo Please edit .env file with your configuration!
)

REM Start the server
echo Starting server on http://localhost:8000
echo API docs available at http://localhost:8000/docs
echo.
python -m app.main
