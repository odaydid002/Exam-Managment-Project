@echo off

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Starting Backend...
start cmd /k "cd backend && php artisan serve"
