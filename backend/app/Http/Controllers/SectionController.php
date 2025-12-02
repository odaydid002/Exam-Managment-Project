<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $sections = Section::orderBy('name');

        if ($request->filled('name')) {
            $sections->where('name', 'like', '%' . $request->input('name') . '%');
        }

        $list = $sections->get()->toArray();
        return response()->json(['total' => count($list), 'sections' => $list]);
    }

    public function show($id)
    {
        $s = Section::find($id);
        if (!$s) return response()->json(['message' => 'Section not found'], 404);
        return response()->json($s);
    }

    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'level' => 'nullable|string|max:50',
            'speciality_id' => 'nullable|exists:specialities,id',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $section = Section::create([
            'name' => $request->input('name'),
            'level' => $request->input('level') ?? null,
            'speciality_id' => $request->input('speciality_id') ?? null,
        ]);

        return response()->json(['message' => 'Section created', 'section' => $section], 201);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $section = Section::find($id);
        if (!$section) return response()->json(['message' => 'Section not found'], 404);

        $v = Validator::make($request->all(), [
            'name' => 'nullable|string|max:100',
            'level' => 'nullable|string|max:50',
            'speciality_id' => 'nullable|exists:specialities,id',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        if ($request->filled('name')) $section->name = $request->input('name');
        if ($request->filled('level')) $section->level = $request->input('level');
        if ($request->filled('speciality_id')) $section->speciality_id = $request->input('speciality_id');
        $section->save();

        return response()->json(['message' => 'Section updated', 'section' => $section]);
    }

    public function destroy($id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $section = Section::find($id);
        if (!$section) return response()->json(['message' => 'Section not found'], 404);

        try {
            $section->delete();
            return response()->json(['message' => 'Section deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }
}
