<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // Attempt to drop the unique index on group_code if it exists, then add a regular index
        try {
            DB::statement('ALTER TABLE `group_delegates` DROP INDEX `group_delegates_group_code_unique`');
        } catch (\Exception $e) {
            // ignore if it doesn't exist
        }

        Schema::table('group_delegates', function (Blueprint $table) {
            // add a non-unique index for faster lookups
            $table->index('group_code');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('group_delegates', function (Blueprint $table) {
            // remove non-unique index
            $table->dropIndex(['group_code']);
        });

        try {
            DB::statement('ALTER TABLE `group_delegates` ADD UNIQUE `group_delegates_group_code_unique` (`group_code`)');
        } catch (\Exception $e) {
            // ignore
        }
    }
};
