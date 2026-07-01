@echo off
echo ========================================================
echo   Iniciando Sistema Sanos y Salvos (FusionV2)
echo ========================================================
echo.

echo [1/2] Levantando contenedores del Backend (Docker)...
cd ..\BackendV2\Llave-Docker
docker-compose up --build -d

echo.
echo [2/2] Iniciando servidor del Frontend...
cd ..\..\Frontend_V2

if not exist "node_modules\" (
    echo Detectado primer inicio en esta PC. Instalando dependencias de Node.js...
    call npm install
)

start cmd /k "title Frontend Sanos y Salvos && npm run dev"

echo.
echo ========================================================
echo Listo! El backend corre en segundo plano y el frontend 
echo se esta ejecutando en una nueva ventana.
echo ========================================================
pause
