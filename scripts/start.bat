@echo off
REM ===========================================
REM PRODUCTION START SCRIPT FOR WINDOWS
REM ===========================================
REM This script starts the Next.js application in production mode
REM with proper environment variable loading and validation

setlocal enabledelayedexpansion

REM Colors for output (Windows doesn't support ANSI colors in batch by default)
REM We'll use simple text output instead

REM Function to print status messages
:print_status
echo [INFO] %~1
goto :eof

:print_success
echo [SUCCESS] %~1
goto :eof

:print_warning
echo [WARNING] %~1
goto :eof

:print_error
echo [ERROR] %~1
goto :eof

REM Function to validate environment variables
:validate_env
set missing_vars=
set error_found=0

REM Check required variables
if "%PORT%"=="" (
    set missing_vars=%missing_vars% PORT
    set error_found=1
)

if "%NODE_ENV%"=="" (
    set missing_vars=%missing_vars% NODE_ENV
    set error_found=1
)

if "%DATABASE_URL%"=="" (
    set missing_vars=%missing_vars% DATABASE_URL
    set error_found=1
)

if %error_found%==1 (
    call :print_error "Missing required environment variables: %missing_vars%"
    exit /b 1
)
goto :eof

REM Function to load environment variables
:load_env
set env_file=.env.production

if exist "%env_file%" (
    call :print_status "Loading environment from %env_file%"
    
    REM Load environment variables from file
    for /f "usebackq tokens=1,2 delims==" %%a in ("%env_file%") do (
        REM Skip comments and empty lines
        echo %%a | findstr /r "^[^#]" >nul
        if not errorlevel 1 (
            if not "%%a"=="" (
                set "%%a=%%b"
            )
        )
    )
    
    call :print_success "Environment variables loaded successfully"
) else (
    call :print_warning "Environment file %env_file% not found, using system environment variables"
)
goto :eof

REM Function to check if port is available
:check_port
set port=%1
netstat -an | findstr ":%port% " >nul
if not errorlevel 1 (
    call :print_error "Port %port% is already in use"
    exit /b 1
)
goto :eof

REM Function to create logs directory if it doesn't exist
:setup_logs
if not exist "logs" (
    call :print_status "Creating logs directory"
    mkdir logs
)
goto :eof

REM Main execution
:main
call :print_status "Starting RecepcionActiva application..."

REM Load environment variables
call :load_env

REM Validate required environment variables
call :validate_env
if errorlevel 1 exit /b 1

REM Setup logs directory
call :setup_logs

REM Set defaults
if "%PORT%"=="" set PORT=3000
if "%HOSTNAME%"=="" set HOSTNAME=0.0.0.0

REM Check if port is available
call :check_port %PORT%
if errorlevel 1 exit /b 1

call :print_success "Configuration validated successfully"
call :print_status "Starting Next.js on %HOSTNAME%:%PORT%"
call :print_status "Environment: %NODE_ENV%"

REM Start the application
npx next start -H %HOSTNAME% -p %PORT%

REM Run main function
call :main
