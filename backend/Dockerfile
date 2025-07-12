FROM node:18

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

EXPOSE 3001
CMD ["npm", "start"] 