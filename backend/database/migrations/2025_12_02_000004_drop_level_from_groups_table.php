<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class DropLevelFromGroupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('groups') && Schema::hasColumn('groups', 'level')) {
            Schema::table('groups', function (Blueprint $table) {
                // drop the level column if present
                $table->dropColumn('level');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasTable('groups') && !Schema::hasColumn('groups', 'level')) {
            Schema::table('groups', function (Blueprint $table) {
                $table->string('level')->nullable();
            });
        }
    }
}
