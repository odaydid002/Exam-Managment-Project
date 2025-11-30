<?php

namespace App\Http\Controllers;

use App\Models\Speciality;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

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

    /**
     * Create a speciality.
     */
    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:specialities,name',
            'short_name' => 'nullable|string|max:50',
            'department_id' => 'nullable|exists:departments,id',
            'description' => 'nullable|string',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $spec = Speciality::create([
            'name' => $request->name,
            'short_name' => $request->short_name ?? null,
            'department_id' => $request->department_id ?? null,
            'description' => $request->description ?? null,
        ]);

        return response()->json(['message' => 'Speciality created', 'speciality' => $spec], 201);
    }

    /**
     * Show a single speciality.
     */
    public function show($id)
    {
        $spec = Speciality::with('department')->find($id);
        if (!$spec) {
            return response()->json(['message' => 'Speciality not found'], 404);
        }

        return response()->json([
            'id' => $spec->id,
            'name' => $spec->name,
            'short_name' => $spec->short_name,
            'department' => $spec->department->name ?? null,
            'description' => $spec->description ?? null,
        ]);
    }

    /**
     * Update a speciality.
     */
    public function update(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $spec = Speciality::find($id);
        if (!$spec) {
            return response()->json(['message' => 'Speciality not found'], 404);
        }

        $v = Validator::make($request->all(), [
            'name' => "nullable|string|max:255|unique:specialities,name,{$spec->id}",
            'short_name' => 'nullable|string|max:50',
            'department_id' => 'nullable|exists:departments,id',
            'description' => 'nullable|string',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $spec->name = $request->filled('name') ? $request->name : $spec->name;
        $spec->short_name = $request->filled('short_name') ? $request->short_name : $spec->short_name;
        $spec->department_id = $request->filled('department_id') ? $request->department_id : $spec->department_id;
        $spec->description = $request->filled('description') ? $request->description : $spec->description;
        $spec->save();

        return response()->json(['message' => 'Speciality updated', 'speciality' => $spec]);
    }

    /**
     * Delete a speciality. Prevent deletion if linked to teachers.
     */
    public function destroy($id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $spec = Speciality::withCount('teachers')->find($id);
        if (!$spec) {
            return response()->json(['message' => 'Speciality not found'], 404);
        }

        if ($spec->teachers_count > 0) {
            return response()->json(['message' => 'Cannot delete speciality with assigned teachers'], 409);
        }

        try {
            DB::transaction(function () use ($spec) {
                $spec->delete();
            });
            return response()->json(['message' => 'Speciality deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Bulk create specialities. Expects: { "specialities": [ {name, short_name?, department_id?, description?}, ... ] }
     */
    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'specialities' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('specialities', []);
        $created = [];
        $errors = [];
        $seenNames = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'name' => 'required|string|max:255',
                'short_name' => 'nullable|string|max:50',
                'department_id' => 'nullable|exists:departments,id',
                'description' => 'nullable|string',
            ]);

            if ($v->fails()) {
                $errors[] = [
                    'index' => $index,
                    'status' => 'validation_failed',
                    'errors' => $v->errors()
                ];
                continue;
            }

            $name = trim($item['name']);
            if (in_array(strtolower($name), $seenNames, true)) {
                $errors[] = ['index' => $index, 'status' => 'duplicate_in_payload', 'message' => 'Duplicate speciality name in payload'];
                continue;
            }

            if (Speciality::whereRaw('LOWER(name) = ?', [strtolower($name)])->exists()) {
                $errors[] = ['index' => $index, 'status' => 'already_exists', 'message' => 'Speciality with this name already exists'];
                continue;
            }

            try {
                DB::beginTransaction();

                $spec = Speciality::create([
                    'name' => $name,
                    'short_name' => $item['short_name'] ?? null,
                    'department_id' => $item['department_id'] ?? null,
                    'description' => $item['description'] ?? null,
                ]);

                DB::commit();

                $seenNames[] = strtolower($name);
                $created[] = ['index' => $index, 'speciality' => $spec];
            } catch (\Exception $e) {
                DB::rollBack();
                $errors[] = ['index' => $index, 'status' => 'failed', 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'total_received' => count($items),
            'created_count' => count($created),
            'created' => $created,
            'errors' => $errors,
        ]);
    }
}
