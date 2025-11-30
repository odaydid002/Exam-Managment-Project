<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __call($method, $args)
    {
        return response()->json(['message' => 'This controller was removed. Use `User` and `Auth` endpoints.'], 410);
    }
}
