<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeacherController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'Hello API']);
});
Route::post('/auth/signup', [AuthController::class, 'signup']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/check', function (Request $request) {
        return response()->json($request->user());
    });
    Route::get('/auth/refreshToken', [AuthController::class, 'refreshToken']);

    // User
    Route::get('/user/{id}/profile', [UserController::class, 'getProfile']);
    Route::put('/user/{id}/profile', [UserController::class, 'updateProfile']);
    Route::delete('/user/{id}/deleteAccount', [UserController::class, 'deleteAccount']);

    // Notifications (user-facing)
    Route::get('/notifications', [UserController::class, 'notifications']);
    Route::post('/notifications/mark-read', [UserController::class, 'markNotificationsRead']);

    // Teachers
    Route::get('/teachers/all', [TeacherController::class, 'index']);
    Route::post('/teachers/bulk', [TeacherController::class, 'bulkStore']);
    Route::post('/teachers/add', [TeacherController::class, 'store']);
    Route::put('/teachers/edit/{number}', [TeacherController::class, 'update']);
    Route::delete('/teachers/delete/{number}', [TeacherController::class, 'destroy']);
});
