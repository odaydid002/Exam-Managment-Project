<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Semester;

class SemesterController extends Controller
{
    public function index()
    {
        $items = Semester::with('academicYear')->orderBy('academic_year_id')->orderBy('order')->get();
        return response()->json(['semesters' => $items]);
    }
}
