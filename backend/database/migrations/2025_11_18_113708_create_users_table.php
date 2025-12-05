<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        /* =======================================================
         * USERS
         * ======================================================= */
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('fname', 20);
            $table->string('lname', 20);
            $table->date('birth_date')->nullable();
            $table->string('gender', 10)->nullable();

            $table->string('email', 255)->unique();
            $table->string('password', 255);
            $table->string('phone', 20)->unique()->nullable();

            $table->enum('role', ['student', 'teacher', 'admin', 'employee']);
            $table->timestampsTz();
        });

        /* =======================================================
         * SETTINGS
         * ======================================================= */
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->enum('theme', ['light', 'dark'])->default('light');
            $table->enum('language', ['en', 'fr', 'ar'])->default('en');
            $table->boolean('notifications')->default(true);
            $table->string('main_color', 20)->default('#F1504A');

            $table->timestampsTz();
        });

        /* =======================================================
         * ACADEMIC YEARS
         * ======================================================= */
        Schema::create('academic_years', function (Blueprint $table) {
            $table->id();
            $table->integer('start_year');
            $table->integer('end_year');
            $table->timestampsTz();
        });

        /* =======================================================
         * DEPARTMENTS
         * ======================================================= */
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->timestampsTz();
        });

        /* =======================================================
         * ROOMS
         * ======================================================= */
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50);
            $table->integer('capacity');
            $table->boolean('disabled')->default(false);
            $table->timestampsTz();
        });

        /* =======================================================
         * SPECIALITIES
         * ======================================================= */
        Schema::create('specialities', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('short_name', 20);
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->text('description')->nullable();
            $table->timestampsTz();
        });

        /* =======================================================
         * SECTIONS
         * ======================================================= */
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->timestampsTz();
        });

        /* =======================================================
         * GROUPS
         * ======================================================= */
        Schema::create('groups', function (Blueprint $table) {
            $table->string('code', 20)->primary();
            $table->string('name', 100);

            $table->foreignId('section_id')->constrained('sections')->onDelete('cascade');
            $table->timestampsTz();
        });

        /* =======================================================
         * STUDENTS
         * ======================================================= */
        Schema::create('students', function (Blueprint $table) {
            $table->id('number');

            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');

            $table->string('group_code', 20)->nullable();
            $table->foreign('group_code')->references('code')->on('groups')->onDelete('set null');

            $table->foreignId('speciality_id')->constrained('specialities')->onDelete('cascade');

            $table->string('level', 50)->nullable();

            $table->timestampsTz();
        });

        /* =======================================================
         * GROUP DELEGATES
         * ======================================================= */
        Schema::create('group_delegates', function (Blueprint $table) {
            $table->id();

            $table->string('group_code', 30);
            $table->foreign('group_code')->references('code')->on('groups')->onDelete('cascade')->onUpdate('cascade');

            $table->unsignedBigInteger('student_number');
            $table->foreign('student_number')->references('number')->on('students')->onDelete('cascade')->onUpdate('cascade');

            $table->unique('student_number');
            $table->unique('group_code');

            $table->timestampTz('assigned_at')->useCurrent();
            $table->timestampsTz();
        });

        /* =======================================================
         * TEACHERS
         * ======================================================= */
        Schema::create('teachers', function (Blueprint $table) {
            $table->id('number');

            $table->foreignId('user_id')->unique()->constrained('users')->onDelete('cascade');

            $table->string('adj', 10)->default('Mr');
            $table->foreignId('speciality_id')->nullable()->constrained('specialities')->onDelete('set null');

            $table->string('position', 100)->nullable();

            $table->timestampsTz();
        });

        /* =======================================================
         * MODULES
         * ======================================================= */
        Schema::create('modules', function (Blueprint $table) {
            $table->string('code', 30)->primary();
            $table->string('name', 100);
            $table->string('short_name', 20)->unique();

            // allow any string for module type (previously an enum)
            $table->string('type', 50)->default('fundamental');
            $table->integer('factor')->default(1);
            $table->integer('credits')->default(2);

            $table->timestampsTz();
        });

        /* =======================================================
         * TEACHER MODULES
         * ======================================================= */
        Schema::create('teacher_modules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('teacher_number')->constrained('teachers', 'number')->onDelete('cascade');
            $table->string('module_code', 30);
            $table->foreign('module_code')->references('code')->on('modules')->onDelete('cascade');

            $table->foreignId('speciality_id')->constrained('specialities')->onDelete('cascade');

            $table->timestampsTz();
        });

        /* =======================================================
         * EXAMS
         * ======================================================= */
        Schema::create('exams', function (Blueprint $table) {
            $table->id();

            $table->string('module_code', 30);
            $table->foreign('module_code')->references('code')->on('modules')->onDelete('cascade');

            $table->string('group_code', 20);
            $table->foreign('group_code')->references('code')->on('groups')->onDelete('cascade');

            $table->foreignId('room_id')->nullable()->constrained('rooms')->onDelete('set null');

            $table->string('exam_type', 50)->default('Normal');
            $table->timestamp('date');

            $table->decimal('start_hour', 3, 1)->default(8.5);
            $table->decimal('end_hour', 3, 1)->default(11.0);

            $table->boolean('validated')->default(false);

            $table->timestampsTz();
        });

        /* =======================================================
         * SURVEILLANCE
         * ======================================================= */
        Schema::create('surveillance', function (Blueprint $table) {
            $table->id();

            $table->foreignId('exam_id')->constrained('exams')->onDelete('cascade');
            $table->foreignId('teacher_number')->constrained('teachers', 'number')->onDelete('cascade');

            $table->timestampsTz();
        });

        /* =======================================================
         * NOTIFICATIONS
         * ======================================================= */
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->string('title', 255);
            $table->text('message');
            $table->boolean('is_read')->default(false);

            $table->timestampsTz();
        });

        /* =======================================================
         * GENERAL SETTINGS
         * ======================================================= */
        Schema::create('general_settings', function (Blueprint $table) {
            $table->id();

            $table->string('semester', 20);

            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');

            $table->timestampsTz();
        });



        Schema::create('exam_reports', function (Blueprint $table) {
        $table->id();

        $table->unsignedBigInteger('user_id');   // enseignant
        $table->unsignedBigInteger('exam_id');      // planning exam

        $table->enum('type', [
            'changement_date',
            'conflit_horaire',
            'absence_salle',
            'absence_surveillants',
            'erreur_liste_etudiants',
            'duree_incorrecte',
            'chevauchement_examens',
            'module_incorrect',
            'probleme_administratif',
            'autre'
        ]);

        $table->text('description')->nullable();
        $table->string('status')->default('en_attente'); // en_attente / traite / rejete

        $table->timestamps();

        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        $table->foreign('exam_id')->references('id')->on('exams')->onDelete('cascade');
    });
    }

    public function down(): void
    {
        Schema::dropIfExists('general_settings');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('surveillance');
        Schema::dropIfExists('exams');
        Schema::dropIfExists('teacher_modules');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('teachers');
        Schema::dropIfExists('group_delegates');
        Schema::dropIfExists('students');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('sections');
        Schema::dropIfExists('specialities');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('departments');
        Schema::dropIfExists('academic_years');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('users');
        Schema::dropIfExists('exam_reports');
    }
};
