<?php

namespace App\Http\Controllers;

use App\Models\Speciality;
use Illuminate\Http\Request;

class SpecialityController extends Controller
{
    /**
     * Return all specialities with their department.
     */
    public function index(Request $request)
    {
        $specialities = Speciality::with('department')->orderBy('name')->get();

        $data = $specialities->map(function ($s) {
            return [
                'id' => $s->id,
                'name' => $s->name,
                'short_name' => $s->short_name,
                'department' => $s->department->name ?? null,
                'description' => $s->description ?? null,
            ];
        })->toArray();

        return response()->json([
            'total' => count($data),
            'specialities' => $data,
        ]);
    }
}
