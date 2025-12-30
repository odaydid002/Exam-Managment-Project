<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Department;

class DepartmentController extends Controller
{
    public function index()
    {
        $items = Department::orderBy('name')->get();
        return response()->json(['departments' => $items]);
    }
}
