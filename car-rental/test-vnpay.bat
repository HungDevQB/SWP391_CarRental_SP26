@echo off
echo Testing VNPay Signature Generation...
echo.

echo Starting application with test profile...
mvn spring-boot:run -Dspring-boot.run.profiles=test-vnpay

echo.
echo Test completed.
pause 