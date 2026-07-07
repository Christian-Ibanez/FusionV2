FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar el código del proyecto
COPY . .

# Exponer el puerto por defecto de Vite
EXPOSE 5173

# Iniciar el servidor de desarrollo de Node.js/Vite, escuchando en todas las interfaces de red
CMD ["npm", "run", "dev", "--", "--host"]
