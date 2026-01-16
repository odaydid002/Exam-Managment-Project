@echo off

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev -- --host"

echo Starting Backend...
start cmd /k "cd backend && php artisan serve --host=0.0.0.0 --port=8000"
