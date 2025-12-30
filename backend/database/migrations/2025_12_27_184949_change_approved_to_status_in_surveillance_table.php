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
        Schema::table('surveillance', function (Blueprint $table) {
            // remove old boolean column if exists and add new status column
            if (Schema::hasColumn('surveillance', 'approved')) {
                $table->dropColumn('approved');
            }
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surveillance', function (Blueprint $table) {
            if (Schema::hasColumn('surveillance', 'status')) {
                $table->dropColumn('status');
            }
            $table->boolean('approved')->default(false);
        });
    }
};
