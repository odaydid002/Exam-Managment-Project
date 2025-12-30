<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            // Add semester_id column
            $table->foreignId('semester_id')
                ->nullable()
                ->constrained('semesters')
                ->onDelete('cascade')
                ->after('department_id');
        });

        // Optionally: migrate existing data if needed
        // This assumes semesters were already created from the previous migration
        // You may need to manually handle this or update seed data
    }

    public function down(): void
    {
        Schema::table('general_settings', function (Blueprint $table) {
            $table->dropForeignKeyIfExists(['semester_id']);
            $table->dropColumn('semester_id');
        });
    }
};
