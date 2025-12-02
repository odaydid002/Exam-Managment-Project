<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddSpecialityIdToSectionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (Schema::hasTable('sections') && !Schema::hasColumn('sections', 'speciality_id')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->unsignedBigInteger('speciality_id')->nullable()->after('level');
                $table->foreign('speciality_id')->references('id')->on('specialities')->onDelete('set null');
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
        if (Schema::hasTable('sections') && Schema::hasColumn('sections', 'speciality_id')) {
            Schema::table('sections', function (Blueprint $table) {
                $table->dropForeign([ 'speciality_id' ]);
                $table->dropColumn('speciality_id');
            });
        }
    }
}
