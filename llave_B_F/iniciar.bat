@echo off
echo ========================================================
echo   Iniciando Sistema Sanos y Salvos (FusionV2)
echo   (Backend + Frontend via Docker)
echo ========================================================
echo.

echo Levantando todos los servicios...
docker-compose up --build -d

echo.
echo ========================================================
echo ¡Listo! Todos los contenedores se han iniciado.
echo El Frontend esta disponible en http://localhost:8080
echo El Backend Gateway esta disponible en http://localhost:8000
echo ========================================================
pause
