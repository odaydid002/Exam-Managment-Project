<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop legacy exam_reports table if present
        Schema::dropIfExists('exam_reports');
    }

    public function down(): void
    {
        // no-op: original creation handled in older migrations
    }
};
