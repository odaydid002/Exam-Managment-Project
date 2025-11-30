 CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	fname VARCHAR(20),
	lname VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(10),
	email VARCHAR(255) NOT NULL,
    UNIQUE(email),
	password VARCHAR(255) NOT NULL,
	phone VARCHAR(20),
    image VARCHAR(255) DEFAULT 'default.jpg',
    UNIQUE(phone),
	role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'teacher', 'admin', 'employee')),
	created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE settings(
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    language VARCHAR(20) DEFAULT 'en' CHECK (language IN ('en', 'fr', 'ar')),
    notifications BOOLEAN DEFAULT TRUE,
    main_color VARCHAR(20) DEFAULT '#F1504A',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    CHECK (start_year < end_year),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    capacity INT NOT NULL,
    disabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE specialities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE groups (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    section_id INT REFERENCES sections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE students (
    number SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    group_code VARCHAR(20) REFERENCES groups(code) ON DELETE SET NULL,
    speciality_id INT REFERENCES specialities(id) ON DELETE CASCADE,
    level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE group_delegates (
    id SERIAL PRIMARY KEY,
    group_code VARCHAR(30) NOT NULL REFERENCES groups(code) ON DELETE CASCADE ON UPDATE CASCADE,
    student_number INT NOT NULL REFERENCES students(number) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE(student_number),
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (group_code)
);

CREATE TABLE teachers (
    number SERIAL PRIMARY KEY,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    adj VARCHAR(10) NOT NULL DEFAULT 'Mr',
    speciality_id INT REFERENCES specialities(id) ON DELETE SET NULL,
    position VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE modules (
    code VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(20) NOT NULL,
    UNIQUE(short_name),
    type VARCHAR(50) NOT NULL DEFAULT 'fundamental' CHECK (type IN ('fundamental', 'speciality', 'optional')),
    factor INT NOT NULL DEFAULT 1,
    credits INT NOT NULL DEFAULT 2,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE teacher_modules (
    id SERIAL PRIMARY KEY,
    teacher_number INT REFERENCES teachers(number) ON DELETE CASCADE,
    module_code VARCHAR(30) REFERENCES modules(code) ON DELETE CASCADE,
    speciality_id INT REFERENCES specialities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    module_code VARCHAR(30) REFERENCES modules(code) ON DELETE CASCADE,
    group_code VARCHAR(20) REFERENCES groups(code) ON DELETE CASCADE,
    room_id INT REFERENCES rooms(id) ON DELETE SET NULL,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'Normal',
    date TIMESTAMP NOT NULL,
    start_hour DECIMAL(3,1) NOT NULL DEFAULT 8.5,
    end_hour DECIMAL(3,1) NOT NULL DEFAULT 11.0,
    validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE surveillance (
    id SERIAL PRIMARY KEY,
    exam_id INT REFERENCES exams(id) ON DELETE CASCADE,
    teacher_number INT REFERENCES teachers(number) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);

CREATE TABLE general_settings (
    id SERIAL PRIMARY KEY,
    semester VARCHAR(20) NOT NULL,
    academic_year_id INT REFERENCES academic_years(id) ON DELETE CASCADE,
    department_id INT REFERENCES departments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
);