<?php

namespace App\Http\Controllers;

use App\Models\Surveillance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SurveillanceController extends Controller
{
    public function index()
    {
        $surveillances = Surveillance::with(['enseignant', 'examen'])->get();
        return response()->json(['surveillances' => $surveillances]);
    }

    public function __call($method, $args)
    {
        return response()->json(['message' => 'This controller was removed. Use `User` and `Auth` endpoints.'], 410);
    }
    }
