📘 Exam Management System

A full-stack Laravel + React application for managing exams, students, teachers, and scheduling.

🔗 Figma Design:
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

⚙️ Prerequisites: Enable Required PHP Extensions

Before installing dependencies, make sure the required PHP extensions are enabled on your system.

This project requires the following PHP extensions:

zip

sodium

🧩 Step 1: Locate your active php.ini

Open a terminal (CMD / PowerShell) and run:

```sh
php --ini
```

🧩 Step 2: Enable zip and sodium extensions

Open php.ini using the command line:

notepad C:\xampp\php\php.ini


Search for the following lines and remove the leading semicolon (;):

;extension=zip

;extension=sodium


Change them to:

extension=zip

extension=sodium


Save the file and close the editor.

🧩 Step 3: Restart Apache

Restart Apache to apply the changes:

Using XAMPP Control Panel

Stop Apache

Start Apache again


⚙️ Backend Setup (Laravel) 

```sh
cd backend
composer install
composer update
```

```sh
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh
php artisan db:seed --class=InitialSeeder
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
🎨 Frontend Setup (React + Vite)

```sh
cd ../frontend
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
cd backend
php artisan serve
```
🤝 Contributing

Pull requests are welcome.

For major updates, open an issue first to discuss proposed changes.

📄 License

This project is available under the MIT License.
