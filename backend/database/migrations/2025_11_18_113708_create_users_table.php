<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('id_utilisateur');
            $table->string('nom');
            $table->string('number')->unique();
            $table->string('department');
            $table->string('level');
            $table->string('speciality');
            $table->string('section');
            $table->string('group_code');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->string('phone')->nullable();
            $table->enum('role', ['chef', 'responsable', 'enseignant', 'etudiant']);
            $table->timestamps();
        });

        Schema::create('groupes', function (Blueprint $table) {
            $table->id('id_groupe');
            $table->string('name');
            $table->string('level');
            $table->string('speciality');
            $table->string('section');
            $table->integer('members')->default(0);
            $table->unsignedBigInteger('delegate_id')->nullable();
            $table->timestamps();

            $table->foreign('delegate_id')->references('id_utilisateur')->on('users');
        });

        Schema::create('salles', function (Blueprint $table) {
            $table->id('id_salle');
            $table->string('nom_salle');
            $table->integer('capacite');
            $table->string('localisation');
            $table->timestamps();
        });

        Schema::create('modules', function (Blueprint $table) {
            $table->id('id_module');
            $table->string('name');
            $table->string('code')->unique();
            $table->string('type');
            $table->integer('factor');
            $table->integer('credit');
            $table->unsignedBigInteger('id_enseignant');
            $table->timestamps();

            $table->foreign('id_enseignant')->references('id_utilisateur')->on('users');
        });

        Schema::create('examens', function (Blueprint $table) {
            $table->id('id_examen');
            $table->date('date_examen');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->enum('type_examen', ['ecrit', 'tp', 'rattrapage']);
            $table->enum('etat_validation', ['en_attente', 'valide'])->default('en_attente');

            $table->unsignedBigInteger('id_module');
            $table->unsignedBigInteger('id_salle');
            $table->unsignedBigInteger('id_groupe');
            $table->unsignedBigInteger('id_responsable');

            $table->timestamps();

            $table->foreign('id_module')->references('id_module')->on('modules');
            $table->foreign('id_salle')->references('id_salle')->on('salles');
            $table->foreign('id_groupe')->references('id_groupe')->on('groupes');
            $table->foreign('id_responsable')->references('id_utilisateur')->on('users');
        });

        Schema::create('surveillances', function (Blueprint $table) {
            $table->id('id_surveillance');
            $table->unsignedBigInteger('id_enseignant');
            $table->unsignedBigInteger('id_examen');
            $table->timestamps();

            $table->foreign('id_enseignant')->references('id_utilisateur')->on('users');
            $table->foreign('id_examen')->references('id_examen')->on('examens');
        });

        Schema::create('plannings', function (Blueprint $table) {
            $table->id('id_planning');
            $table->string('titre_planning');
            $table->date('date_creation');
            $table->date('date_validation')->nullable();
            $table->string('etat')->default('en_attente');

            $table->unsignedBigInteger('id_chef');
            $table->timestamps();

            $table->foreign('id_chef')->references('id_utilisateur')->on('users');
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->id('id_notification');
            $table->string('message');
            $table->dateTime('date_envoi');
            $table->string('type_notification');
            $table->unsignedBigInteger('id_utilisateur');
            $table->unsignedBigInteger('id_examen')->nullable();
            $table->timestamps();

            $table->foreign('id_utilisateur')->references('id_utilisateur')->on('users');
            $table->foreign('id_examen')->references('id_examen')->on('examens');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('plannings');
        Schema::dropIfExists('surveillances');
        Schema::dropIfExists('examens');
        Schema::dropIfExists('modules');
        Schema::dropIfExists('salles');
        Schema::dropIfExists('groupes');
        Schema::dropIfExists('users');
    }
};
