# Use Node.js 18 as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set default environment variables for build
ENV VITE_API_URL=https://api.teblo.app
ENV VITE_FIREBASE_API_KEY=AIzaSyDqvgRYibKWyBJrjXt1wv25qMX8tA85dMk
ENV VITE_FIREBASE_AUTH_DOMAIN=teblo-2.firebaseapp.com
ENV VITE_FIREBASE_PROJECT_ID=teblo-2
ENV VITE_FIREBASE_STORAGE_BUCKET=teblo-2.firebasestorage.app
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=440923986344
ENV VITE_FIREBASE_APP_ID=1:440923986344:web:f5d80f08055e6a4deca59d
ENV VITE_FIREBASE_MEASUREMENT_ID=G-1GD881LN8H
ENV VITE_GOOGLE_CLIENT_ID=440923986344-58v7n3q09l3kk9st5jub5d55ar3h0d7m.apps.googleusercontent.com

# Build the app
RUN npm run build

# Install serve to run the app
RUN npm install -g serve

# Make start script executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port (Railway will override this)
EXPOSE $PORT

# Start the app with Railway-compatible configuration
CMD ["/app/start.sh"] 