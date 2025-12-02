<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * This migration attempts to safely convert `number` columns on primary
     * tables (teachers, students) and their referencing foreign key columns
     * to VARCHAR(40). It drops and recreates foreign keys by reading
     * INFORMATION_SCHEMA so it adapts to actual constraint names.
     *
     * IMPORTANT: Backup your database before running this. This migration
     * disables foreign key checks while performing ALTER statements.
     */
    public function up(): void
    {
        DB::beginTransaction();
        try {
            // Temporarily disable FK checks for smooth alterations
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $refs = DB::select(
                "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_COLUMN_NAME = 'number'"
            );

            // Drop each foreign key that references a `number` column
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $constraint = $ref->CONSTRAINT_NAME;
                // Some constraints may not exist or already dropped; guard with try/catch
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$constraint}`");
                } catch (\Exception $e) {
                    // ignore if unable to drop (constraint may not exist)
                }
            }

            // Change parent tables first: teachers and students (if present)
            $parents = ['teachers', 'students'];
            foreach ($parents as $parent) {
                // Only attempt if table exists
                $exists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if ($exists && $exists->c) {
                    // Use raw ALTER to avoid requiring doctrine/dbal
                    try {
                        DB::statement("ALTER TABLE `{$parent}` MODIFY `number` VARCHAR(40) NOT NULL");
                    } catch (\Exception $e) {
                        // If it fails, throw so we can rollback and log
                        throw $e;
                    }
                }
            }

            // Change child columns to VARCHAR(40) based on previously collected refs
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;
                // Skip if parent table didn't exist
                $parent = $ref->REFERENCED_TABLE_NAME;
                $pExists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if (!($pExists && $pExists->c)) {
                    continue;
                }

                try {
                    DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` VARCHAR(40) NOT NULL");
                } catch (\Exception $e) {
                    // ignore and continue; failing here means manual intervention required
                }
            }

            // Recreate foreign keys using the same names, referencing `number` on parent
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;
                $constraint = $ref->CONSTRAINT_NAME;
                $parent = $ref->REFERENCED_TABLE_NAME;

                // Recreate constraint if parent exists
                $pExists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if (!($pExists && $pExists->c)) {
                    continue;
                }

                // Some constraint names are long; recreate similarly but guard exceptions
                try {
                    DB::statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$constraint}` FOREIGN KEY (`{$column}`) REFERENCES `{$parent}`(`number`) ON DELETE CASCADE ON UPDATE CASCADE");
                } catch (\Exception $e) {
                    // If recreate fails, ignore — manual recreation may be needed
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            throw $e;
        }
    }

    /**
     * Reverse the migrations.
     *
     * NOTE: The down method tries to convert back to BIGINT UNSIGNED which
     * may not be safe for all setups. Review and adapt before running.
     */
    public function down(): void
    {
        DB::beginTransaction();
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            $refs = DB::select(
                "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_COLUMN_NAME = 'number'"
            );

            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $constraint = $ref->CONSTRAINT_NAME;
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$constraint}`");
                } catch (\Exception $e) {
                    // ignore
                }
            }

            // Attempt to change parent columns back to BIGINT UNSIGNED
            $parents = ['teachers', 'students'];
            foreach ($parents as $parent) {
                $exists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if ($exists && $exists->c) {
                    try {
                        DB::statement("ALTER TABLE `{$parent}` MODIFY `number` BIGINT UNSIGNED NOT NULL");
                    } catch (\Exception $e) {
                        // ignore — manual fix may be required
                    }
                }
            }

            // Change child columns back to BIGINT UNSIGNED
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;
                try {
                    DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}` BIGINT UNSIGNED NOT NULL");
                } catch (\Exception $e) {
                    // ignore
                }
            }

            // Try to recreate FKs (best-effort)
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;
                $constraint = $ref->CONSTRAINT_NAME;
                $parent = $ref->REFERENCED_TABLE_NAME;
                try {
                    DB::statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$constraint}` FOREIGN KEY (`{$column}`) REFERENCES `{$parent}`(`number`) ON DELETE CASCADE ON UPDATE CASCADE");
                } catch (\Exception $e) {
                    // ignore
                }
            }

            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            DB::statement('SET FOREIGN_KEY_CHECKS=1');
            throw $e;
        }
    }
};
