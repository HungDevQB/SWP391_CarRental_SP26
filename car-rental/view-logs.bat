@echo off
setlocal enabledelayedexpansion

:MAIN_MENU
cls
echo ========================================
echo Car Rental - Log Viewer (CMD)
echo ========================================
echo.
echo Chọn loại log để xem:
echo 1. SQL Queries (sql.log)
echo 2. Transaction Logs (transaction.log)
echo 3. Application Logs (carrental.log)
echo 4. Tất cả logs
echo 5. Xem log real-time (tail)
echo 6. Tìm kiếm trong logs
echo 7. Xóa tất cả logs
echo 8. Thoát
echo.
set /p choice="Nhập lựa chọn (1-8): "

if "%choice%"=="1" goto VIEW_SQL
if "%choice%"=="2" goto VIEW_TRANSACTION
if "%choice%"=="3" goto VIEW_APP
if "%choice%"=="4" goto VIEW_ALL
if "%choice%"=="5" goto VIEW_REALTIME
if "%choice%"=="6" goto SEARCH_LOGS
if "%choice%"=="7" goto CLEAR_LOGS
if "%choice%"=="8" goto EXIT
goto MAIN_MENU

:VIEW_SQL
cls
echo ========================================
echo SQL Queries Log
echo ========================================
if exist "logs\sql.log" (
    type "logs\sql.log"
) else (
    echo File sql.log không tồn tại!
)
goto PAUSE_MENU

:VIEW_TRANSACTION
cls
echo ========================================
echo Transaction Logs
echo ========================================
if exist "logs\transaction.log" (
    type "logs\transaction.log"
) else (
    echo File transaction.log không tồn tại!
)
goto PAUSE_MENU

:VIEW_APP
cls
echo ========================================
echo Application Logs
echo ========================================
if exist "logs\carrental.log" (
    type "logs\carrental.log"
) else (
    echo File carrental.log không tồn tại!
)
goto PAUSE_MENU

:VIEW_ALL
cls
echo ========================================
echo Tất cả Logs
echo ========================================
if exist "logs\sql.log" (
    echo --- SQL Queries ---
    type "logs\sql.log"
    echo.
    echo ========================================
    echo.
)
if exist "logs\transaction.log" (
    echo --- Transaction Logs ---
    type "logs\transaction.log"
    echo.
    echo ========================================
    echo.
)
if exist "logs\carrental.log" (
    echo --- Application Logs ---
    type "logs\carrental.log"
)
goto PAUSE_MENU

:VIEW_REALTIME
cls
echo ========================================
echo Real-time Log Monitoring
echo ========================================
echo Chọn loại log để theo dõi:
echo 1. SQL Queries
echo 2. Transaction Logs
echo 3. Application Logs
echo 4. Tất cả
echo 5. Quay lại menu chính
echo.
set /p realtime_choice="Nhập lựa chọn (1-5): "

if "%realtime_choice%"=="1" (
    if exist "logs\sql.log" (
        echo Theo dõi SQL logs real-time... (Nhấn Ctrl+C để dừng)
        echo.
        powershell -Command "Get-Content 'logs\sql.log' -Wait -Tail 10"
    ) else (
        echo File sql.log không tồn tại!
        pause
    )
) else if "%realtime_choice%"=="2" (
    if exist "logs\transaction.log" (
        echo Theo dõi Transaction logs real-time... (Nhấn Ctrl+C để dừng)
        echo.
        powershell -Command "Get-Content 'logs\transaction.log' -Wait -Tail 10"
    ) else (
        echo File transaction.log không tồn tại!
        pause
    )
) else if "%realtime_choice%"=="3" (
    if exist "logs\carrental.log" (
        echo Theo dõi Application logs real-time... (Nhấn Ctrl+C để dừng)
        echo.
        powershell -Command "Get-Content 'logs\carrental.log' -Wait -Tail 10"
    ) else (
        echo File carrental.log không tồn tại!
        pause
    )
) else if "%realtime_choice%"=="4" (
    echo Theo dõi tất cả logs real-time... (Nhấn Ctrl+C để dừng)
    echo.
    powershell -Command "Get-Content 'logs\*.log' -Wait -Tail 5"
) else if "%realtime_choice%"=="5" (
    goto MAIN_MENU
) else (
    echo Lựa chọn không hợp lệ!
    pause
)
goto MAIN_MENU

:SEARCH_LOGS
cls
echo ========================================
echo Tìm kiếm trong Logs
echo ========================================
echo Chọn loại log để tìm kiếm:
echo 1. SQL Queries
echo 2. Transaction Logs
echo 3. Application Logs
echo 4. Tất cả
echo 5. Quay lại menu chính
echo.
set /p search_choice="Nhập lựa chọn (1-5): "

if "%search_choice%"=="5" goto MAIN_MENU

echo.
set /p search_term="Nhập từ khóa tìm kiếm: "

if "%search_choice%"=="1" (
    if exist "logs\sql.log" (
        echo Kết quả tìm kiếm trong SQL logs:
        echo ========================================
        findstr /i "%search_term%" "logs\sql.log"
    ) else (
        echo File sql.log không tồn tại!
    )
) else if "%search_choice%"=="2" (
    if exist "logs\transaction.log" (
        echo Kết quả tìm kiếm trong Transaction logs:
        echo ========================================
        findstr /i "%search_term%" "logs\transaction.log"
    ) else (
        echo File transaction.log không tồn tại!
    )
) else if "%search_choice%"=="3" (
    if exist "logs\carrental.log" (
        echo Kết quả tìm kiếm trong Application logs:
        echo ========================================
        findstr /i "%search_term%" "logs\carrental.log"
    ) else (
        echo File carrental.log không tồn tại!
    )
) else if "%search_choice%"=="4" (
    echo Kết quả tìm kiếm trong tất cả logs:
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
) else (
    echo Lựa chọn không hợp lệ!
)
goto PAUSE_MENU

:CLEAR_LOGS
cls
echo ========================================
echo Xóa Logs
echo ========================================
set /p confirm="Bạn có chắc muốn xóa tất cả logs? (y/n): "
if /i "%confirm%"=="y" (
    if exist "logs\*.log" (
        del "logs\*.log"
        echo Đã xóa tất cả log files!
    ) else (
        echo Không có log files để xóa!
    )
) else (
    echo Đã hủy xóa logs.
)
goto PAUSE_MENU

:PAUSE_MENU
echo.
echo ========================================
echo 1. Quay lại menu chính
echo 2. Thoát
echo.
set /p pause_choice="Nhập lựa chọn (1-2): "
if "%pause_choice%"=="1" goto MAIN_MENU
if "%pause_choice%"=="2" goto EXIT
goto PAUSE_MENU

:EXIT
echo Cảm ơn bạn đã sử dụng Log Viewer!
exit /b 0 