<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->foreignId('academic_year_id')
                ->nullable()
                ->constrained('academic_years')
                ->onDelete('cascade')
                ->after('validated');

            $table->foreignId('semester_id')
                ->nullable()
                ->constrained('semesters')
                ->onDelete('cascade')
                ->after('academic_year_id');
        });
    }

    public function down(): void
    {
        Schema::table('exams', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['academic_year_id']);
            $table->dropForeignKeyIfExists(['semester_id']);
            $table->dropColumn(['academic_year_id', 'semester_id']);
        });
    }
};
