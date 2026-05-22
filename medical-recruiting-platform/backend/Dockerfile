FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .
RUN npm run build
RUN mkdir -p uploads/credentials

EXPOSE 3001

CMD ["npm", "start"]
