<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->enum('target_type', ['user', 'role', 'all'])->default('user')->after('user_id');
            $table->enum('target_role', ['student', 'teacher', 'admin', 'employee'])->nullable()->after('target_type');
            $table->foreignId('target_user_id')->nullable()->constrained('users')->onDelete('cascade')->after('target_role');

            $table->index(['target_type']);
            $table->index(['target_role']);
            $table->index(['target_user_id']);
        });
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropForeign(['target_user_id']);
            $table->dropIndex(['target_type']);
            $table->dropIndex(['target_role']);
            $table->dropIndex(['target_user_id']);
            $table->dropColumn(['target_type', 'target_role', 'target_user_id']);
        });
    }
};
