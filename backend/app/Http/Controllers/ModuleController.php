<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModuleController extends Controller
{
    public function __call($method, $args)
    {
        return response()->json(['message' => 'This controller was removed. Use `User` and `Auth` endpoints.'], 410);
    }
}
