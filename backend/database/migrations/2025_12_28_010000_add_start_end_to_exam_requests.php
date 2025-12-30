<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('exam_requests', function (Blueprint $table) {
            $table->float('start_hour')->nullable()->after('room');
            $table->float('end_hour')->nullable()->after('start_hour');
            if (Schema::hasColumn('exam_requests', 'exam_date')) {
                $table->dropColumn('exam_date');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('exam_requests', 'exam_date')) {
                $table->dateTime('exam_date')->nullable()->after('room');
            }
            if (Schema::hasColumn('exam_requests', 'start_hour')) {
                $table->dropColumn('start_hour');
            }
            if (Schema::hasColumn('exam_requests', 'end_hour')) {
                $table->dropColumn('end_hour');
            }
        });
    }
};
