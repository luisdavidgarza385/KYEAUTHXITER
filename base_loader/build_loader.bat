@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo Compilando Nuevo Base Loader
echo ===================================================

set CSC_PATH=C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC_PATH%" (
    set CSC_PATH=C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe
)

if not exist "%CSC_PATH%" (
    echo Error: No se encontro csc.exe en el sistema.
    exit /b 1
)

echo Usando compilador: "%CSC_PATH%"

"%CSC_PATH%" /target:exe /platform:anycpu /optimize+ /win32manifest:"%~dp0loader.manifest" /out:"%~dp0base_loader.exe" "%~dp0BaseLoader.cs"

if %ERRORLEVEL% equ 0 (
    echo Compilacion exitosa.
) else (
    echo Error durante la compilacion.
    exit /b 1
)
