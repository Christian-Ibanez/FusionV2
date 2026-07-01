@echo off
echo ========================================================
echo   Deteniendo Sistema Sanos y Salvos (FusionV2)
echo ========================================================
echo.

echo Apagando contenedores del Backend...
cd ..\FusionV2\BackendV2\Llave-Docker
docker-compose stop

echo.
echo ========================================================
echo Backend detenido correctamente.
echo (Recuerda cerrar la ventana negra del Frontend manualmente)
echo ========================================================
pause
