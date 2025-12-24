<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'system' option to the theme enum and set default to 'system'
        DB::statement("ALTER TABLE settings MODIFY COLUMN theme ENUM('light','dark','system') NOT NULL DEFAULT 'system'");
    }

    public function down(): void
    {
        // Revert to previous enum values and default
        DB::statement("ALTER TABLE settings MODIFY COLUMN theme ENUM('light','dark') NOT NULL DEFAULT 'light'");
    }
};
