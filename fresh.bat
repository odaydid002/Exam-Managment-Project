@echo off

echo refreshing database...
start cmd /k "cd backend && php artisan migrate:fresh && php artisan db:seed --class=InitialSeeder"