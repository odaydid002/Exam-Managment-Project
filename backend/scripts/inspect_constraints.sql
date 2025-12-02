-- Run these queries on your MySQL database to inspect current schema and FKs

-- List foreign keys that reference any `number` column
SELECT
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
  AND REFERENCED_COLUMN_NAME = 'number';

-- Show create table for parent tables
SHOW CREATE TABLE teachers;
SHOW CREATE TABLE students;

-- Show create table for commonly referenced child tables
SHOW CREATE TABLE teacher_modules;
SHOW CREATE TABLE surveillance;
SHOW CREATE TABLE group_delegates;

-- Inspect column types for potential problematic columns
SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND COLUMN_NAME IN ('number', 'teacher_number', 'student_number');
