<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create a trigger that inserts a default settings row for each new user
        // Uses a single-statement trigger to avoid delimiter issues
        DB::unprepared(<<<'SQL'
            CREATE TRIGGER trg_users_after_insert_add_setting
            AFTER INSERT ON users
            FOR EACH ROW
            INSERT INTO settings (user_id, created_at, updated_at)
            SELECT NEW.id, NOW(), NOW()
            WHERE NOT EXISTS (SELECT 1 FROM settings WHERE user_id = NEW.id);
        SQL
        );
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_users_after_insert_add_setting');
    }
};
