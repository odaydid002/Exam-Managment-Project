<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_requests', function (Blueprint $table) {
            $table->date('exam_date')->nullable()->after('room');
        });
    }

    public function down(): void
    {
        Schema::table('exam_requests', function (Blueprint $table) {
            $table->dropColumn('exam_date');
        });
    }
};
