<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTypeToRoomsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('rooms', 'type')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->string('type')->default('classroom')->after('name');
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
        if (Schema::hasColumn('rooms', 'type')) {
            Schema::table('rooms', function (Blueprint $table) {
                $table->dropColumn('type');
            });
        }
    }
}
