@echo off
chcp 65001 >nul
echo ========================================
echo    连连看游戏 - Windows EXE 构建脚本
echo ========================================
echo.

echo [1/3] 检查 Python 环境...
where python >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.x
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo.
echo [2/3] 安装 PyInstaller...
python -m pip install --upgrade pip
python -m pip install pyinstaller
if errorlevel 1 (
    echo [错误] PyInstaller 安装失败
    pause
    exit /b 1
)

echo.
echo [3/3] 正在构建 EXE 文件 (可能需要几分钟)...
echo.

python -m PyInstaller --onefile --windowed --name "连连看" --noconfirm lianliankan.py
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)

echo.
echo ========================================
echo              构建完成!
echo ========================================
echo.
echo EXE 文件位置: dist\连连看.exe
echo.
pause