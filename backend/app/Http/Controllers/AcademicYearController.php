<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AcademicYear;

class AcademicYearController extends Controller
{
    public function index()
    {
        $items = AcademicYear::orderByDesc('id')->get();
        return response()->json(['academic_years' => $items]);
    }
}
