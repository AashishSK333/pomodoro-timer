#!/bin/bash

BASE="/Users/333ashish/Desktop/ShreeWork/ai-agent-claude-code/pomodoro-timer"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
NODE_BIN="/Users/333ashish/.nvm/versions/node/v20.16.0/bin"
NPM="$NODE_BIN/npm"
UVICORN="$BASE/backend/.venv/bin/uvicorn"

# Ensure node is on PATH so npm can find it
export PATH="$NODE_BIN:$PATH"

# Cleanup function — called on exit, Ctrl+C, or Chrome close
cleanup() {
    echo "Shutting down servers..."
    kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
    lsof -ti:8000 | xargs kill -9 2>/dev/null
    lsof -ti:5173 | xargs kill -9 2>/dev/null
}
trap cleanup EXIT INT TERM

# Kill any leftover processes from a previous run
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

# Start backend (use venv uvicorn directly — no source activate needed)
cd "$BASE/backend"
nohup "$UVICORN" main:app --reload > /tmp/pomodoro_backend.log 2>&1 &
BACKEND_PID=$!

# Wait until backend is actually responding (up to 30s)
echo "Starting backend..."
for i in $(seq 1 30); do
    curl -s http://localhost:8000/health > /dev/null 2>&1 && { echo "Backend ready."; break; }
    sleep 1
done

# Start frontend (use absolute npm path)
cd "$BASE/frontend"
nohup "$NPM" run dev > /tmp/pomodoro_frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait until frontend is actually responding (up to 30s)
echo "Starting frontend..."
for i in $(seq 1 30); do
    curl -s http://localhost:5173 > /dev/null 2>&1 && { echo "Frontend ready."; break; }
    sleep 1
done

# Launch Chrome with a dedicated profile so we always get a trackable PID
echo "Opening app in Chrome..."
"$CHROME" --app=http://localhost:5173 \
    --user-data-dir=/tmp/chrome-pomodoro-profile \
    --no-first-run --no-default-browser-check \
    > /dev/null 2>&1 &
CHROME_PID=$!

# Wait for Chrome window to close
wait "$CHROME_PID"

# trap EXIT fires cleanup automatically
