# Use pre-built image with Chrome included
FROM ghcr.io/puppeteer/puppeteer:21.6.1

# Switch to root for installing dependencies
USER root

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy app source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Expose port
EXPOSE 3001

# Set environment variables for Puppeteer (Chrome already included in base image)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Switch back to pptruser for security
USER pptruser

# Start the app
CMD ["npm", "start"] 