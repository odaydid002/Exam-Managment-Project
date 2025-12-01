<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ImageController;

Route::get('/', function () {
    return view('welcome');
});
Route::get('/login', function () {
    return response()->json(['message' => 'Unauthorized'], 401);
})->name('login');

// Public image serving route (maps to storage/app/public/uploads/*)
Route::get('/images/image/{path}', [ImageController::class, 'showUpload'])->where('path', '.*');
