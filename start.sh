#!/bin/bash

echo "Остановка существующего сервера..."
pkill -f "node htdocs/simple-server.js" || true
pkill -f "vite" || true

cd "$(dirname "$0")"

if [ ! -d "htdocs/node_modules" ]; then
  echo "Installing dependencies..."
  cd htdocs && npm install && cd ..
fi

echo "Checking database connection..."
node htdocs/check-db.js

echo "Starting ElectroExpress server..."

node htdocs/simple-server.js &

echo "Starting Vite develop
ment server..."
cd htdocs && npm run dev &

echo "Opening application in browser..."
sleep 3
xdg-open http://localhost:5173

echo "ElectroExpress is running!"
echo "Server API: http://localhost:3002/api/products"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

wait 
