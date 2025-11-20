Figma Design --> https://www.figma.com/design/7GtBgiKFH4qe1hxJSpFcDE/Exam-managment?node-id=0-1&t=ZZ91tbIZZVWm5JRt-1

/*---------------------------------------------------------------------------*/

Setup steps:

Set-ExecutionPolicy -Scope CurrentUser Unrestricted

git clone https://github.com/odaydid002/Exam-Managment-Project.git

cd Exam-Managment-Project

cd backend

composer install

cp .env.example .env

php artisan key:generate

php artisan migrate

cd ..

cd frontend

npm i

npm run build

/*--------------------------------------------------------------------------*/

Update code:

git pull

cd frontend

npm install

npm run build

cd ..

cd backend 

composer install

php artisan migrate --force

php artisan optimize:clear

php artisan optimize

/*--------------------------------------------------------------------------*/

Run Frontend server:

cd frontend

npm run dev

Run Backend server

cd backend

php artisan serve

