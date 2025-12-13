📘 Exam Management System

<<<<<<< HEAD


A full-stack Laravel + React application for managing exams, students, teachers, and scheduling.



🔗 Figma Design:



👉https://www.figma.com/design/7GtBgiKFH4qe1hxJSpFcDE/Exam-managment?node-id=0-1\&t=ZZ91tbIZZVWm5JRt-1





🚀 Features



🎓 Student \& teacher management



📝 Exam creation \& scheduling



📊 Dashboard \& analytics



🧮 Automated demo database seeding



⚡ Laravel REST API



🎨 Modern UI built with React + Vite



🛠️ Tech Stack

Category	Tools

Frontend	React, Vite, TailwindCSS

Backend	Laravel 11+, PHP 8.2

Database	MySQL

Design	Figma

📥 Setup Guide

1️⃣ Clone the Repository

```sh
=======
A full-stack Laravel + React application for managing exams, students, teachers, and scheduling.

🔗 Figma Design:
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083

👉https://www.figma.com/design/7GtBgiKFH4qe1hxJSpFcDE/Exam-managment?node-id=0-1&t=ZZ91tbIZZVWm5JRt-1


🚀 Features

🎓 Student & teacher management

📝 Exam creation & scheduling

📊 Dashboard & analytics

🧮 Automated demo database seeding

⚡ Laravel REST API

🎨 Modern UI built with React + Vite

🛠️ Tech Stack
Category	Tools
Frontend	React, Vite, TailwindCSS
Backend	Laravel 11+, PHP 8.2
Database	MySQL
Design	Figma
📥 Setup Guide
1️⃣ Clone the Repository
```sh
Set-ExecutionPolicy -Scope CurrentUser Unrestricted
git clone https://github.com/odaydid002/Exam-Managment-Project.git
cd Exam-Managment-Project
```
⚙️ Backend Setup (Laravel)

<<<<<<< HEAD
```

⚙️ Backend Setup (Laravel)



```sh

=======
```sh
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
cd backend
composer install
<<<<<<< HEAD

```

```sh

=======
```
```sh
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
cp .env.example .env
php artisan key:generate
<<<<<<< HEAD

```

```sh

=======
```
```sh
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
php artisan migrate:fresh
php artisan db:seed --class=InitialSeeder
<<<<<<< HEAD

```

🎨 Frontend Setup (React + Vite)

```sh

cd ../frontend

npm install

npm run build

```

🔄 Updating the Project

Pull latest changes

```sh

git pull

```

Update Frontend

```sh

cd frontend

=======
```
🎨 Frontend Setup (React + Vite)
```sh
cd ../frontend
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
npm install
npm run build
<<<<<<< HEAD

cd ..

```

Update Backend

```sh

cd backend

composer install

composer update

php artisan migrate:fresh

php artisan db:seed --class=InitialSeeder

php artisan optimize:clear

php artisan optimize

```

▶️ Running the Project

Run Frontend (Vite)

```sh

cd frontend

npm run dev

```

Run Backend (Laravel)

```sh

=======
```
🔄 Updating the Project
Pull latest changes
```sh
git pull
```
Update Frontend
```sh
cd frontend
npm install
npm run build
cd ..
```
Update Backend
```sh
cd backend
composer install
composer update
php artisan migrate:fresh
php artisan db:seed --class=InitialSeeder
php artisan optimize:clear
php artisan optimize
```
▶️ Running the Project
Run Frontend (Vite)
```sh
cd frontend
npm run dev
```
Run Backend (Laravel)
```sh
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
cd backend
php artisan serve
```
🤝 Contributing

<<<<<<< HEAD
```

🤝 Contributing



Pull requests are welcome.

For major updates, open an issue first to discuss proposed changes.



📄 License



This project is available under the MIT License.

=======
Pull requests are welcome.
For major updates, open an issue first to discuss proposed changes.

📄 License

This project is available under the MIT License.
>>>>>>> 041bf6d620b376f0150099dac2a7f51ab9240083
