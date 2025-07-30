FROM node:24.2.0-alpine3.22

WORKDIR /app
COPY package*.json ./
RUN apk add libsecret-1-dev
RUN npm install
COPY . .

# Lancement du serveur Nuxt
#CMD ["npm", "run", "dev"]