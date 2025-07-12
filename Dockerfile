# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Install dependencies needed for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install root dependencies
RUN npm install

# Copy backend package files
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install

# Copy frontend package files
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Go back to root
WORKDIR /app

# Copy source code
COPY . .

# Generate Prisma client and build backend
WORKDIR /app/backend
RUN npx prisma generate && npm run build

# Build frontend
WORKDIR /app/frontend
RUN npm run build

# Go back to root for startup
WORKDIR /app

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"] 