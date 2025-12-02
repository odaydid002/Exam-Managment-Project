<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Disable FK checks to allow column modifications
        DB::connection()->getDoctrineSchemaManager()->getDatabasePlatform()->registerDoctrineTypeMapping('enum', 'string');
        
        // Disable FK constraint checks
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        try {
            // Modify teacher number column
            Schema::table('teachers', function (Blueprint $table) {
                $table->string('number', 40)->change();
            });

            // Modify student number column
            Schema::table('students', function (Blueprint $table) {
                $table->string('number', 40)->change();
            });

            // Modify teacher_modules foreign key column
            Schema::table('teacher_modules', function (Blueprint $table) {
                $table->string('teacher_number', 40)->nullable()->change();
            });

            // Modify group_delegates foreign key column
            Schema::table('group_delegates', function (Blueprint $table) {
                $table->string('student_number', 40)->nullable()->change();
            });

            // Modify surveillance foreign key column
            Schema::table('surveillance', function (Blueprint $table) {
                $table->string('teacher_number', 40)->nullable()->change();
            });
        } finally {
            // Re-enable FK checks
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        }
    }

    public function down(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        try {
            Schema::table('teachers', function (Blueprint $table) {
                $table->unsignedInteger('number')->change();
            });

            Schema::table('students', function (Blueprint $table) {
                $table->unsignedInteger('number')->change();
            });

            Schema::table('teacher_modules', function (Blueprint $table) {
                $table->unsignedInteger('teacher_number')->nullable()->change();
            });

            Schema::table('group_delegates', function (Blueprint $table) {
                $table->unsignedInteger('student_number')->nullable()->change();
            });

            Schema::table('surveillance', function (Blueprint $table) {
                $table->unsignedInteger('teacher_number')->nullable()->change();
            });
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        }
    }
};
