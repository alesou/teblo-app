#!/bin/sh

# Set default port if not provided by Railway
PORT=${PORT:-3000}

echo "Starting Teblo Frontend on port $PORT"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory not found. Building the application..."
    npm run build
fi

# Start the server
echo "Starting serve on port $PORT"
exec serve -s dist -l $PORT 