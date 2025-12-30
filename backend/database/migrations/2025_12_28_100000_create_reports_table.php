<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->string('subject');
            $table->text('message');
            $table->enum('criticity', ['low', 'medium', 'high', 'critical'])->default('medium');

            // Who reported (nullable if anonymous/system)
            $table->foreignId('reporter_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Target can be a role (teacher/student/employee) or a specific user
            $table->string('target_type')->nullable();
            $table->string('target_role')->nullable();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();

            // Extra structured context
            $table->json('metadata')->nullable();

            // Simple lifecycle state
            $table->enum('status', ['open', 'closed'])->default('open');

            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
