@echo off
setlocal enabledelayedexpansion

:title
cls
echo ========================================
echo    KrishiDrishti FarmAndCare App
echo ========================================
echo.
echo Select an option:
echo.
echo [1] Run only the frontend
echo [2] Run only the backend
echo [3] Run both frontend and backend
echo [4] Build frontend, typecheck, and lint
echo [5] Check backend for errors and fix
echo [6] Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto frontend
if "%choice%"=="2" goto backend
if "%choice%"=="3" goto both
if "%choice%"=="4" goto build_frontend
if "%choice%"=="5" goto check_backend
if "%choice%"=="6" exit /b

echo Invalid choice. Please try again.
timeout /t 2
goto title

:frontend
echo Starting frontend...
cd /d "%~dp0frontend"
start "KrishiDrishti Frontend" cmd /k "npm run dev"
exit /b

:backend
echo Starting backend...
cd /d "%~dp0backend"
start "KrishiDrishti Backend" cmd /k "uvicorn app.main:app --reload"
exit /b

:both
echo Starting both frontend and backend...
cd /d "%~dp0frontend"
start "KrishiDrishti Frontend" cmd /k "npm run dev"
cd /d "%~dp0backend"
start "KrishiDrishti Backend" cmd /k "uvicorn app.main:app --reload"
exit /b

:build_frontend
echo Building frontend, typechecking and linting...
cd /d "%~dp0frontend"
echo Running build...
npm run build
echo.
echo Running typecheck...
npm run type-check
echo.
echo Running lint...
npm run lint
echo.
echo Frontend build, typecheck and lint completed.
pause
goto title

:check_backend
echo Checking backend for errors...
cd /d "%~dp0backend"
python -c "from app.main import app; print('Backend imports successfully')"
if %errorlevel% equ 0 (
    echo No import errors found in backend.
) else (
    echo Backend import errors detected.
)
echo.
echo Checking for syntax errors in Python files...
for /r %%f in (*.py) do (
    python -m py_compile "%%f" 2>nul
    if !errorlevel! neq 0 (
        echo Error in: %%f
    )
)
echo.
echo Backend check completed.
pause
goto title