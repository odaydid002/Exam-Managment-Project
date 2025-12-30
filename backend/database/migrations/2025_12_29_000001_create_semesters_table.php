<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('semesters', function (Blueprint $table) {
            $table->id();
            $table->string('name', 50); // e.g., "Semester 1", "Semester 2"
            $table->integer('order')->default(1); // order within the academic year

            $table->foreignId('academic_year_id')->constrained('academic_years')->onDelete('cascade');

            $table->unique(['name', 'academic_year_id']);
            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('semesters');
    }
};
