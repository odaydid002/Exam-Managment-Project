<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GeneralSetting;
use Illuminate\Support\Facades\Validator;

class GeneralSettingController extends Controller
{
    public function show($departmentId)
    {
        $gs = GeneralSetting::with(['semester', 'academicYear', 'department'])
            ->where('department_id', $departmentId)
            ->orderByDesc('id')
            ->first();

        return response()->json(['general_setting' => $gs]);
    }

    public function update(Request $request, $departmentId)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'semester_id' => 'nullable|exists:semesters,id',
            'academic_year_id' => 'nullable|exists:academic_years,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $data = [
            'department_id' => $departmentId,
            'semester_id' => $request->input('semester_id') ?: null,
            'academic_year_id' => $request->input('academic_year_id') ?: null,
        ];

        $gs = GeneralSetting::create($data);

        return response()->json(['general_setting' => $gs->load('semester', 'academicYear', 'department')]);
    }
}
