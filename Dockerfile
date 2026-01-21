FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

# IMPORTANT : Copier TOUT le code source
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]