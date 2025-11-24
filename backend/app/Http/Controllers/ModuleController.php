<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ModuleController extends Controller
{
    public function index()
    {
        $modules = Module::with(['enseignant'])->get();
        return response()->json(['modules' => $modules]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_module' => 'required|string|max:255',
            'code_module' => 'required|string|unique:modules',
            'semestre' => 'required|string',
            'id_enseignant' => 'required|exists:users,id_utilisateur'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $module = Module::create($request->all());

        return response()->json([
            'message' => 'Module created successfully',
            'module' => $module->load(['enseignant'])
        ], 201);
    }

    public function show($id)
    {
        $module = Module::with(['enseignant', 'examens'])->findOrFail($id);
        return response()->json(['module' => $module]);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module = Module::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom_module' => 'sometimes|string|max:255',
            'code_module' => 'sometimes|string|unique:modules,code_module,' . $id . ',id_module',
            'semestre' => 'sometimes|string',
            'id_enseignant' => 'sometimes|exists:users,id_utilisateur'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $module->update($request->all());

        return response()->json([
            'message' => 'Module updated successfully',
            'module' => $module->load(['enseignant'])
        ]);
    }

    public function destroy($id)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module = Module::findOrFail($id);
        $module->delete();

        return response()->json(['message' => 'Module deleted successfully']);
    }
}
