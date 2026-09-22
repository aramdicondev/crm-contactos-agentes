# Imagen simple para levantar el CRM localmente sin instalar Node.
# Solo local/dev — no incluye configuración de producción ni orquestación.
FROM node:20-alpine

WORKDIR /app

# Instala dependencias primero para aprovechar la cache de Docker.
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copia el resto del código (respeta .dockerignore).
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
