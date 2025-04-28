GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

cd "$(dirname "$0")/htdocs" || { echo -e "${RED}Failed to change to htdocs directory${NC}"; exit 1; }

echo -e "${YELLOW}Setting up the database...${NC}"
npm run db-setup

if [ $? -ne 0 ]; then
    echo -e "${RED}Database setup failed. Aborting.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting API server in the background...${NC}"
npm run api &
API_PID=$!

sleep 2

if kill -0 $API_PID 2>/dev/null; then
    echo -e "${GREEN}API server started successfully (PID: $API_PID)${NC}"
    echo -e "${GREEN}API available at: http://localhost:3001/api/products${NC}"
else
    echo -e "${RED}API server failed to start. Aborting.${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting frontend development server...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"

npm run dev

echo -e "${YELLOW}Stopping API server (PID: $API_PID)...${NC}"
kill $API_PID

echo -e "${GREEN}All servers stopped.${NC}" 