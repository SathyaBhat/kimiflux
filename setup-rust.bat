@echo off
echo Installing Rust for KimiFlux...
echo.
echo This will download and install Rust using rustup.
echo.

:: Check if rustup is already installed
where rustup >nul 2>&1
if %errorlevel% == 0 (
    echo Rust is already installed!
    rustup update
    goto :done
)

:: Download and install rustup
echo Downloading rustup...
curl --proto '=https' --tlsv1.2 -sSf https://win.rustup.rs/x86_64 -o rustup-init.exe

if not exist rustup-init.exe (
    echo Failed to download rustup. Please install manually from https://rustup.rs/
    exit /b 1
)

echo Installing Rust stable toolchain...
rustup-init.exe -y --default-toolchain stable

:: Add cargo to PATH for current session
set "PATH=%USERPROFILE%\.cargo\bin;%PATH%"

:done
echo.
echo Rust has been installed. Please restart your terminal and run:
echo   npm run tauri dev
echo.

pause
