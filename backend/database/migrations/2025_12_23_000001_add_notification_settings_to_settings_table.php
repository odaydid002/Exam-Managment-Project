<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->boolean('exam_reminder')->default(false)->after('notifications');
            $table->boolean('schedule_updates')->default(false)->after('exam_reminder');
            $table->boolean('login_alerts')->default(false)->after('schedule_updates');
            $table->boolean('two_factor_authentication')->default(false)->after('login_alerts');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'exam_reminder',
                'schedule_updates',
                'login_alerts',
                'two_factor_authentication',
            ]);
        });
    }
};
