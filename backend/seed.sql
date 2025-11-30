INSERT INTO users (fname, lname, birth_date, gender, email, password, phone, role)
VALUES
('System', 'Admin', '1990-01-01', 'male', 'admin@system.com', '$2y$12$P.EwMMrgRnf5qZXXtWLWI.DLH5U1upEv5SLETtlO88oEShMhfYLqa', '0698765432', 'admin'),
('Office', 'Employee', '1995-01-01', 'female', 'employee@system.com', '$2y$12$.tVa3y3AqP7tyXV97g4UVOz.pw1PY/jjV0KegiQr/2C2.s.K.w4mW', '0698765432', 'employee');


INSERT INTO settings (user_id, theme, language, notifications, main_color)
VALUES
(1, 'dark', 'en', TRUE, '#F1504A'),
(2, 'light', 'en', TRUE, '#f75eb7ff');

INSERT INTO academic_years (start_year, end_year)
VALUES (2025, 2026);

INSERT INTO departments (name)
VALUES ('Computer Science');

INSERT INTO rooms (name, capacity)
SELECT CONCAT(prefix, LPAD(num::text, 3, '0')), 30
FROM (VALUES ('L'), ('B'), ('S')) AS p(prefix),
     generate_series(1, 10) AS num;

INSERT INTO rooms (name, capacity)
SELECT CONCAT(prefix, '1', LPAD(num::text, 2, '0')), 30
FROM (VALUES ('L'), ('B'), ('S')) AS p(prefix),
     generate_series(1, 10) AS num;

INSERT INTO rooms (name, capacity)
SELECT CONCAT(prefix, '2', LPAD(num::text, 2, '0')), 30
FROM (VALUES ('L'), ('B'), ('S')) AS p(prefix),
     generate_series(1, 10) AS num;

INSERT INTO specialities (name, short_name, department_id, description)
VALUES
('Software Engineering', 'SE', 1, 'Software development and engineering'),
('Networks & Telecommunications', 'NT', 1, 'Computer networks and telecom'),
('Artificial Intelligence', 'AI', 1, 'AI and Machine Learning'),
('Cyber Security', 'CS', 1, 'Security and protection'),
('Information Systems', 'IS', 1, 'Enterprise information systems'),
('Data Science', 'DS', 1, 'Data analysis and prediction'),
('Embedded Systems', 'ES', 1, 'Embedded hardware/software'),
('Web Technologies', 'WEB', 1, 'Web development'),
('Cloud Computing', 'CLOUD', 1, 'Cloud & virtualization'),
('Mobile Development', 'MOB', 1, 'Android/iOS apps'),
('Computer Vision', 'CV', 1, 'Image & video processing'),
('Game Development', 'GAME', 1, 'Game programming'),
('Robotics', 'ROB', 1, 'Robotics technologies'),
('Database Administration', 'DBA', 1, 'Database management'),
('DevOps Engineering', 'DEVOPS', 1, 'CI/CD & automation'),
('IOT Engineering', 'IOT', 1, 'Internet of Things'),
('High Performance Computing', 'HPC', 1, 'Parallel computing'),
('Human–Computer Interaction', 'HCI', 1, 'UI/UX + interaction'),
('Computer Science General', 'CSG', 1, 'General CS studies'),
('Virtual Reality', 'VR', 1, 'Virtual/Augmented reality');

INSERT INTO general_settings (semester, academic_year_id, department_id)
VALUES 
('Semester 1', 1, 1);
