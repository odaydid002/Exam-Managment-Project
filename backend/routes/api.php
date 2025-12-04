<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\SpecialityController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ModuleController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\GroupeController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ExamenController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\SurveillanceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/test', function () {
    return response()->json(['message' => 'Hello API']);
});
// Serve uploaded images (public)
Route::get('/images/{path}', [ImageController::class, 'show'])->where('path', '.*');
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

    // Specialities
    Route::get('/specialities/all', [SpecialityController::class, 'index']);
    Route::post('/specialities/bulk', [SpecialityController::class, 'bulkStore']);
    Route::post('/specialities/add', [SpecialityController::class, 'store']);
    Route::get('/specialities/{id}', [SpecialityController::class, 'show']);
    Route::put('/specialities/edit/{id}', [SpecialityController::class, 'update']);
    Route::delete('/specialities/delete/{id}', [SpecialityController::class, 'destroy']);

    // Sections
    Route::get('/sections/all', [SectionController::class, 'index']);
    Route::post('/sections/add', [SectionController::class, 'store']);
    Route::get('/sections/{id}', [SectionController::class, 'show']);
    Route::put('/sections/edit/{id}', [SectionController::class, 'update']);
    Route::delete('/sections/delete/{id}', [SectionController::class, 'destroy']);

    // Teachers
    Route::get('/teachers/all', [TeacherController::class, 'index']);
    Route::get('/teachers/{identifier}', [TeacherController::class, 'show']);
    Route::post('/teachers/bulk', [TeacherController::class, 'bulkStore']);
    Route::post('/teachers/add', [TeacherController::class, 'store']);
    Route::put('/teachers/edit/{number}', [TeacherController::class, 'update']);
    Route::delete('/teachers/delete/{number}', [TeacherController::class, 'destroy']);

    // Students
    Route::get('/students/all', [StudentController::class, 'index']);
    Route::get('/students/{identifier}', [StudentController::class, 'show']);
    Route::post('/students/bulk', [StudentController::class, 'bulkStore']);
    Route::post('/students/add', [StudentController::class, 'store']);
    Route::put('/students/edit/{number}', [StudentController::class, 'update']);
    Route::delete('/students/delete/{number}', [StudentController::class, 'destroy']);

    // Modules
    Route::get('/modules/all', [ModuleController::class, 'index']);
    Route::get('/modules/stats', [ModuleController::class, 'stats']);
    Route::post('/modules/{code}/assign', [ModuleController::class, 'assignTeacher']);
    Route::put('/modules/{code}/assign/{teacher_number}', [ModuleController::class, 'updateAssignment']);
    Route::delete('/modules/{code}/assign/{teacher_number}', [ModuleController::class, 'unassignTeacher']);
    Route::post('/modules/bulk', [ModuleController::class, 'bulkStore']);
    Route::post('/modules/add', [ModuleController::class, 'store']);
    Route::get('/modules/{code}', [ModuleController::class, 'show']);
    Route::put('/modules/edit/{code}', [ModuleController::class, 'update']);
    Route::delete('/modules/delete/{code}', [ModuleController::class, 'destroy']);
    
    // Rooms
    Route::get('/rooms/all', [RoomController::class, 'index']);
    Route::post('/rooms/bulk', [RoomController::class, 'bulkStore']);
    Route::post('/rooms/add', [RoomController::class, 'store']);
    Route::get('/rooms/{id}', [RoomController::class, 'show']);
    Route::put('/rooms/edit/{id}', [RoomController::class, 'update']);
    Route::delete('/rooms/delete/{id}', [RoomController::class, 'destroy']);

    // Groups
    Route::get('/groups/all', [GroupeController::class, 'index']);
    Route::post('/groups/bulk', [GroupeController::class, 'bulkStore']);
    Route::post('/groups/add', [GroupeController::class, 'store']);
    Route::post('/groups/{code}/assign', [GroupeController::class, 'assignStudent']);
    Route::get('/groups/{code}', [GroupeController::class, 'show']);
    Route::put('/groups/edit/{code}', [GroupeController::class, 'update']);
    Route::delete('/groups/delete/{code}', [GroupeController::class, 'destroy']);
        // Group Delegate
        Route::post('/groups/{code}/delegate/set', [GroupeController::class, 'setDelegate']);
        Route::put('/groups/{code}/delegate/edit', [GroupeController::class, 'changeDelegate']);
        Route::delete('/groups/{code}/delegate/remove', [GroupeController::class, 'removeDelegate']);
        
    // Image upload (authenticated)
    Route::post('/images/upload', [ImageController::class, 'upload']);
    
    // Exams
    Route::get('/exams/all', [ExamenController::class, 'index']);
    Route::post('/exams/bulk', [ExamenController::class, 'bulkStore']);
    Route::post('/exams/add', [ExamenController::class, 'store']);
    Route::get('/exams/{id}', [ExamenController::class, 'show']);
    Route::put('/exams/edit/{id}', [ExamenController::class, 'update']);
    Route::delete('/exams/delete/{id}', [ExamenController::class, 'destroy']);

    // Surveillance
    Route::get('/surveillance/exam/{examId}', [SurveillanceController::class, 'getByExam']);
    Route::post('/surveillance/assign', [SurveillanceController::class, 'assign']);
    Route::delete('/surveillance/{examId}/{teacherNumber}', [SurveillanceController::class, 'unassign']);
});
