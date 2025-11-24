<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ExamenController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\SalleController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\PlanningController;
use App\Http\Controllers\SurveillanceController;
use App\Http\Controllers\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/refreshToken', [AuthController::class, 'refreshToken']);

    // User
    Route::get('/user/{id}/profile', [UserController::class, 'getProfile']);
    Route::put('/user/{id}/profile', [UserController::class, 'updateProfile']);
    Route::delete('/user/{id}/deleteAccount', [UserController::class, 'deleteAccount']);

    // Examens
    Route::apiResource('examens', ExamenController::class);
    Route::post('/examens/{id}/validate', [ExamenController::class, 'validateExamen']);

    // Modules
    Route::apiResource('modules', ModuleController::class);

// Routes pour Salle
Route::get('/salles/disponibles', [SalleController::class, 'getSallesDisponibles']);

// Routes pour Groupe
Route::get('/groupes/niveau/{niveau}', [GroupeController::class, 'getByNiveau']);
Route::get('/groupes/specialite/{specialite}', [GroupeController::class, 'getBySpecialite']);
Route::get('/groupes/statistiques', [GroupeController::class, 'getStatistiques']);

    // Plannings
    Route::apiResource('plannings', PlanningController::class);
    Route::post('/plannings/{id}/validate', [PlanningController::class, 'validatePlanning']);

    // Surveillances
    Route::apiResource('surveillances', SurveillanceController::class);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAsRead']);
});
