<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class ImageController extends Controller
{
    public function upload(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'image' => 'required|image|max:5120',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $file = $request->file('image');
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('uploads', $filename, 'public');
        $url = asset('storage/' . $path);

        return response()->json([
            'message' => 'Image uploaded',
            'path' => $path,
            'url' => $url,
        ], 201);
    }

    public function show($path)
    {
        $path = ltrim($path, '/');

        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $full = storage_path('app/public/' . $path);
        return response()->file($full);
    }

    // Serve files specifically from the `uploads` directory so URLs like
    // `/images/image/<filename>` map to `storage/app/public/uploads/<filename>`.
    public function showUpload($path)
    {
        $path = ltrim($path, '/');
        $uploadPath = 'uploads/' . $path;

        if (!Storage::disk('public')->exists($uploadPath)) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        $full = storage_path('app/public/' . $uploadPath);
        return response()->file($full);
    }
}
