FROM node:20-bookworm

# Instalar LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio de la app
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código
COPY . .

# Compilar TypeScript (si usas build)
RUN npm run build

# Exponer el puerto
EXPOSE 4000

# Comando de arranque (si compilas a dist)
CMD ["node", "dist/server.js"]
# O, si quieres usar ts-node-dev dentro del contenedor en dev:
# CMD ["npm", "run", "dev"]
