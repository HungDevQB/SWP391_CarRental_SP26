@echo off
setlocal enabledelayedexpansion

:MAIN_MENU
cls
echo ========================================
echo Car Rental - Log Search (CMD)
echo ========================================
echo.
echo Chọn loại log để tìm kiếm:
echo 1. SQL Queries
echo 2. Transaction Logs
echo 3. Application Logs
echo 4. Tất cả logs
echo 5. Thoát
echo.
set /p choice="Nhập lựa chọn (1-5): "

if "%choice%"=="1" goto SEARCH_SQL
if "%choice%"=="2" goto SEARCH_TRANSACTION
if "%choice%"=="3" goto SEARCH_APP
if "%choice%"=="4" goto SEARCH_ALL
if "%choice%"=="5" goto EXIT
goto MAIN_MENU

:SEARCH_SQL
cls
echo ========================================
echo Tìm kiếm trong SQL Logs
echo ========================================
echo.
set /p search_term="Nhập từ khóa tìm kiếm: "
echo.
if exist "logs\sql.log" (
    echo Kết quả tìm kiếm "%search_term%" trong SQL logs:
    echo ========================================
    findstr /i "%search_term%" "logs\sql.log"
) else (
    echo File sql.log không tồn tại!
)
goto PAUSE_MENU

:SEARCH_TRANSACTION
cls
echo ========================================
echo Tìm kiếm trong Transaction Logs
echo ========================================
echo.
set /p search_term="Nhập từ khóa tìm kiếm: "
echo.
if exist "logs\transaction.log" (
    echo Kết quả tìm kiếm "%search_term%" trong Transaction logs:
    echo ========================================
    findstr /i "%search_term%" "logs\transaction.log"
) else (
    echo File transaction.log không tồn tại!
)
goto PAUSE_MENU

:SEARCH_APP
cls
echo ========================================
echo Tìm kiếm trong Application Logs
echo ========================================
echo.
set /p search_term="Nhập từ khóa tìm kiếm: "
echo.
if exist "logs\carrental.log" (
    echo Kết quả tìm kiếm "%search_term%" trong Application logs:
    echo ========================================
    findstr /i "%search_term%" "logs\carrental.log"
) else (
    echo File carrental.log không tồn tại!
)
goto PAUSE_MENU

:SEARCH_ALL
cls
echo ========================================
echo Tìm kiếm trong Tất cả Logs
echo ========================================
echo.
set /p search_term="Nhập từ khóa tìm kiếm: "
echo.
echo Kết quả tìm kiếm "%search_term%" trong tất cả logs:
echo ========================================

if exist "logs\sql.log" (
    echo --- SQL Logs ---
    findstr /i "%search_term%" "logs\sql.log"
    echo.
)
if exist "logs\transaction.log" (
    echo --- Transaction Logs ---
    findstr /i "%search_term%" "logs\transaction.log"
    echo.
)
if exist "logs\carrental.log" (
    echo --- Application Logs ---
    findstr /i "%search_term%" "logs\carrental.log"
)
goto PAUSE_MENU

:PAUSE_MENU
echo.
echo ========================================
echo 1. Tìm kiếm khác
echo 2. Quay lại menu chính
echo 3. Thoát
echo.
set /p pause_choice="Nhập lựa chọn (1-3): "
if "%pause_choice%"=="1" goto MAIN_MENU
if "%pause_choice%"=="2" goto MAIN_MENU
if "%pause_choice%"=="3" goto EXIT
goto PAUSE_MENU

:EXIT
echo Cảm ơn bạn đã sử dụng Log Search!
exit /b 0 