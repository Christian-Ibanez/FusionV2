@echo off
echo ========================================================
echo   Deteniendo Sistema Sanos y Salvos (FusionV2)
echo ========================================================
echo.

echo Apagando todos los contenedores (Frontend y Backend)...
docker-compose stop

echo.
echo ========================================================
echo Todo el sistema se ha detenido correctamente.
echo ========================================================
pause
