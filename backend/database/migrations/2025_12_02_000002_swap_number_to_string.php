<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Conservative approach:
     * - Add new `_str` columns to parents and children
     * - Copy CAST(number AS CHAR) into the new columns
     * - Drop FK constraints
     * - Drop old columns and rename new columns into place
     * - Recreate FKs and primary keys
     *
     * This approach avoids in-place type changes and allows easier rollback.
     */
    public function up(): void
    {
        DB::beginTransaction();
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Parent tables to convert
            $parents = ['teachers', 'students'];

            // Query all foreign key references pointing to a `number` column
            $refs = DB::select(
                "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_COLUMN_NAME = 'number'"
            );

            // 1) Add new parent columns number_str and populate them
            foreach ($parents as $parent) {
                $exists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if (!($exists && $exists->c)) {
                    continue;
                }

                // Add column if not exists
                $colExists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'number_str'", [$parent]);
                if (!($colExists && $colExists->c)) {
                    DB::statement("ALTER TABLE `{$parent}` ADD `number_str` VARCHAR(40) NULL");
                }

                // Copy and make NOT NULL
                DB::statement("UPDATE `{$parent}` SET `number_str` = CAST(`number` AS CHAR)");
                DB::statement("ALTER TABLE `{$parent}` MODIFY `number_str` VARCHAR(40) NOT NULL");
            }

            // 2) For each referencing FK, drop the FK constraint
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $constraint = $ref->CONSTRAINT_NAME;
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$constraint}`");
                } catch (\Exception $e) {
                    // ignore if cannot drop
                }
            }

            // 3) For each child column, add column_str and copy values
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;

                $colExists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?", [$table, $column.'_str']);
                if (!($colExists && $colExists->c)) {
                    DB::statement("ALTER TABLE `{$table}` ADD `{$column}_str` VARCHAR(40) NULL");
                }

                // Copy numeric value to string column
                DB::statement("UPDATE `{$table}` SET `{$column}_str` = CAST(`{$column}` AS CHAR)");
                DB::statement("ALTER TABLE `{$table}` MODIFY `{$column}_str` VARCHAR(40) NOT NULL");
            }

            // 4) Swap columns: drop old child columns and rename new ones
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;

                // Drop old column (if exists) and rename new one
                try {
                    DB::statement("ALTER TABLE `{$table}` DROP COLUMN `{$column}`");
                } catch (\Exception $e) {
                    // ignore if drop fails
                }
                try {
                    DB::statement("ALTER TABLE `{$table}` CHANGE `{$column}_str` `{$column}` VARCHAR(40) NOT NULL");
                } catch (\Exception $e) {
                    // ignore — manual fix might be necessary
                }
            }

            // 5) For each parent: drop old PK column and rename number_str to number
            foreach ($parents as $parent) {
                $exists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if (!($exists && $exists->c)) {
                    continue;
                }

                // Drop primary key constraint if exists
                try {
                    DB::statement("ALTER TABLE `{$parent}` DROP PRIMARY KEY");
                } catch (\Exception $e) {
                    // ignore — sometimes PK name differs
                }

                // Drop old numeric column
                try {
                    DB::statement("ALTER TABLE `{$parent}` DROP COLUMN `number`");
                } catch (\Exception $e) {
                    // ignore
                }

                // Rename number_str to number and set as primary key
                try {
                    DB::statement("ALTER TABLE `{$parent}` CHANGE `number_str` `number` VARCHAR(40) NOT NULL");
                    DB::statement("ALTER TABLE `{$parent}` ADD PRIMARY KEY (`number`)");
                } catch (\Exception $e) {
                    // ignore — manual intervention may be needed
                }
            }

            // 6) Recreate foreign keys (best-effort)
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

    /**
     * Reverse the migration — best-effort convert back to BIGINT UNSIGNED
     */
    public function down(): void
    {
        DB::beginTransaction();
        try {
            DB::statement('SET FOREIGN_KEY_CHECKS=0');

            // Identify refs again
            $refs = DB::select(
                "SELECT CONSTRAINT_NAME, TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
                 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                 WHERE REFERENCED_TABLE_SCHEMA = DATABASE()
                   AND REFERENCED_COLUMN_NAME = 'number'"
            );

            // Drop FKs
            foreach ($refs as $ref) {
                try {
                    DB::statement("ALTER TABLE `{$ref->TABLE_NAME}` DROP FOREIGN KEY `{$ref->CONSTRAINT_NAME}`");
                } catch (\Exception $e) {
                }
            }

            // Change parent columns back to BIGINT UNSIGNED where possible
            $parents = ['teachers', 'students'];
            foreach ($parents as $parent) {
                $exists = DB::selectOne("SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?", [$parent]);
                if (!($exists && $exists->c)) continue;

                try {
                    // Add a temporary numeric column
                    DB::statement("ALTER TABLE `{$parent}` ADD `number_old` BIGINT UNSIGNED NULL");
                    // Copy cast value (best-effort)
                    DB::statement("UPDATE `{$parent}` SET `number_old` = CAST(`number` AS UNSIGNED)");
                    // Drop current PK and column
                    DB::statement("ALTER TABLE `{$parent}` DROP PRIMARY KEY");
                    DB::statement("ALTER TABLE `{$parent}` DROP COLUMN `number`");
                    DB::statement("ALTER TABLE `{$parent}` CHANGE `number_old` `number` BIGINT UNSIGNED NOT NULL");
                    DB::statement("ALTER TABLE `{$parent}` ADD PRIMARY KEY (`number`)");
                } catch (\Exception $e) {
                    // ignore
                }
            }

            // For children, attempt to convert back
            foreach ($refs as $ref) {
                $table = $ref->TABLE_NAME;
                $column = $ref->COLUMN_NAME;
                try {
                    DB::statement("ALTER TABLE `{$table}` ADD `{$column}_old` BIGINT UNSIGNED NULL");
                    DB::statement("UPDATE `{$table}` SET `{$column}_old` = CAST(`{$column}` AS UNSIGNED)");
                    DB::statement("ALTER TABLE `{$table}` DROP COLUMN `{$column}`");
                    DB::statement("ALTER TABLE `{$table}` CHANGE `{$column}_old` `{$column}` BIGINT UNSIGNED NOT NULL");
                } catch (\Exception $e) {
                    // ignore
                }
            }

            // Recreate FKs (best-effort)
            foreach ($refs as $ref) {
                try {
                    DB::statement("ALTER TABLE `{$ref->TABLE_NAME}` ADD CONSTRAINT `{$ref->CONSTRAINT_NAME}` FOREIGN KEY (`{$ref->COLUMN_NAME}`) REFERENCES `{$ref->REFERENCED_TABLE_NAME}`(`number`) ON DELETE CASCADE ON UPDATE CASCADE");
                } catch (\Exception $e) {
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
