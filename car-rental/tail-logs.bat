@echo off
setlocal enabledelayedexpansion

:MAIN_MENU
cls
echo ========================================
echo Car Rental - Real-time Log Monitor (CMD)
echo ========================================
echo.
echo Chọn loại log để theo dõi real-time:
echo 1. SQL Queries (sql.log)
echo 2. Transaction Logs (transaction.log)
echo 3. Application Logs (carrental.log)
echo 4. Tất cả logs (lần lượt)
echo 5. Quay lại menu chính
echo.
set /p choice="Nhập lựa chọn (1-5): "

if "%choice%"=="1" goto TAIL_SQL
if "%choice%"=="2" goto TAIL_TRANSACTION
if "%choice%"=="3" goto TAIL_APP
if "%choice%"=="4" goto TAIL_ALL
if "%choice%"=="5" goto EXIT
goto MAIN_MENU

:TAIL_SQL
cls
echo ========================================
echo Real-time SQL Log Monitor
echo ========================================
echo Nhấn Ctrl+C để dừng
echo.
if exist "logs\sql.log" (
    echo Đang theo dõi SQL logs...
    echo.
    :SQL_LOOP
    for /f "delims=" %%i in ('dir /b "logs\sql.log" 2^>nul') do (
        set "last_size=%%~zi"
    )
    if not defined last_size (
        echo File sql.log không tồn tại!
        pause
        goto MAIN_MENU
    )
    
    :SQL_MONITOR
    for /f "delims=" %%i in ('dir /b "logs\sql.log" 2^>nul') do (
        set "current_size=%%~zi"
    )
    if !current_size! gtr !last_size! (
        echo [%time%] SQL log updated:
        type "logs\sql.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_tail.txt
        for /f "tokens=1,* delims=:" %%a in (temp_tail.txt) do (
            if %%a gtr !last_lines! (
                echo %%b
                set /a last_lines+=1
            )
        )
        del temp_tail.txt
        set "last_size=!current_size!"
    )
    timeout /t 1 /nobreak >nul
    goto SQL_MONITOR
) else (
    echo File sql.log không tồn tại!
    pause
)
goto MAIN_MENU

:TAIL_TRANSACTION
cls
echo ========================================
echo Real-time Transaction Log Monitor
echo ========================================
echo Nhấn Ctrl+C để dừng
echo.
if exist "logs\transaction.log" (
    echo Đang theo dõi Transaction logs...
    echo.
    :TRANSACTION_LOOP
    for /f "delims=" %%i in ('dir /b "logs\transaction.log" 2^>nul') do (
        set "last_size=%%~zi"
    )
    if not defined last_size (
        echo File transaction.log không tồn tại!
        pause
        goto MAIN_MENU
    )
    
    :TRANSACTION_MONITOR
    for /f "delims=" %%i in ('dir /b "logs\transaction.log" 2^>nul') do (
        set "current_size=%%~zi"
    )
    if !current_size! gtr !last_size! (
        echo [%time%] Transaction log updated:
        type "logs\transaction.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_tail.txt
        for /f "tokens=1,* delims=:" %%a in (temp_tail.txt) do (
            if %%a gtr !last_lines! (
                echo %%b
                set /a last_lines+=1
            )
        )
        del temp_tail.txt
        set "last_size=!current_size!"
    )
    timeout /t 1 /nobreak >nul
    goto TRANSACTION_MONITOR
) else (
    echo File transaction.log không tồn tại!
    pause
)
goto MAIN_MENU

:TAIL_APP
cls
echo ========================================
echo Real-time Application Log Monitor
echo ========================================
echo Nhấn Ctrl+C để dừng
echo.
if exist "logs\carrental.log" (
    echo Đang theo dõi Application logs...
    echo.
    :APP_LOOP
    for /f "delims=" %%i in ('dir /b "logs\carrental.log" 2^>nul') do (
        set "last_size=%%~zi"
    )
    if not defined last_size (
        echo File carrental.log không tồn tại!
        pause
        goto MAIN_MENU
    )
    
    :APP_MONITOR
    for /f "delims=" %%i in ('dir /b "logs\carrental.log" 2^>nul') do (
        set "current_size=%%~zi"
    )
    if !current_size! gtr !last_size! (
        echo [%time%] Application log updated:
        type "logs\carrental.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_tail.txt
        for /f "tokens=1,* delims=:" %%a in (temp_tail.txt) do (
            if %%a gtr !last_lines! (
                echo %%b
                set /a last_lines+=1
            )
        )
        del temp_tail.txt
        set "last_size=!current_size!"
    )
    timeout /t 1 /nobreak >nul
    goto APP_MONITOR
) else (
    echo File carrental.log không tồn tại!
    pause
)
goto MAIN_MENU

:TAIL_ALL
cls
echo ========================================
echo Real-time All Logs Monitor
echo ========================================
echo Nhấn Ctrl+C để dừng
echo.
echo Đang theo dõi tất cả logs...
echo.

:ALL_MONITOR
set "updated=0"

REM Check SQL log
if exist "logs\sql.log" (
    for /f "delims=" %%i in ('dir /b "logs\sql.log" 2^>nul') do (
        set "sql_size=%%~zi"
    )
    if !sql_size! gtr !sql_last_size! (
        echo [%time%] SQL log updated:
        echo ========================================
        type "logs\sql.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_sql.txt
        for /f "tokens=1,* delims=:" %%a in (temp_sql.txt) do (
            if %%a gtr !sql_last_lines! (
                echo %%b
                set /a sql_last_lines+=1
            )
        )
        del temp_sql.txt
        set "sql_last_size=!sql_size!"
        set "updated=1"
    )
)

REM Check Transaction log
if exist "logs\transaction.log" (
    for /f "delims=" %%i in ('dir /b "logs\transaction.log" 2^>nul') do (
        set "trans_size=%%~zi"
    )
    if !trans_size! gtr !trans_last_size! (
        echo [%time%] Transaction log updated:
        echo ========================================
        type "logs\transaction.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_trans.txt
        for /f "tokens=1,* delims=:" %%a in (temp_trans.txt) do (
            if %%a gtr !trans_last_lines! (
                echo %%b
                set /a trans_last_lines+=1
            )
        )
        del temp_trans.txt
        set "trans_last_size=!trans_size!"
        set "updated=1"
    )
)

REM Check Application log
if exist "logs\carrental.log" (
    for /f "delims=" %%i in ('dir /b "logs\carrental.log" 2^>nul') do (
        set "app_size=%%~zi"
    )
    if !app_size! gtr !app_last_size! (
        echo [%time%] Application log updated:
        echo ========================================
        type "logs\carrental.log" | findstr /n "^" | findstr /b "[0-9]*:" | findstr /b "[0-9][0-9]*:" > temp_app.txt
        for /f "tokens=1,* delims=:" %%a in (temp_app.txt) do (
            if %%a gtr !app_last_lines! (
                echo %%b
                set /a app_last_lines+=1
            )
        )
        del temp_app.txt
        set "app_last_size=!app_size!"
        set "updated=1"
    )
)

if !updated!==1 (
    echo.
    echo ========================================
    echo.
)

timeout /t 2 /nobreak >nul
goto ALL_MONITOR

:EXIT
echo Cảm ơn bạn đã sử dụng Real-time Log Monitor!
exit /b 0 