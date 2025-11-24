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

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'id_enseignant' => 'required|exists:users,id_utilisateur',
            'id_examen' => 'required|exists:examens,id_examen'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si la surveillance existe déjà
        $existing = Surveillance::where('id_enseignant', $request->id_enseignant)
                               ->where('id_examen', $request->id_examen)
                               ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Cette surveillance existe déjà'
            ], 422);
        }

        $surveillance = Surveillance::create($request->all());

        return response()->json([
            'message' => 'Surveillance created successfully',
            'surveillance' => $surveillance->load(['enseignant', 'examen'])
        ], 201);
    }

    public function show($id)
    {
        $surveillance = Surveillance::with(['enseignant', 'examen'])->findOrFail($id);
        return response()->json(['surveillance' => $surveillance]);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $surveillance = Surveillance::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'id_enseignant' => 'sometimes|exists:users,id_utilisateur',
            'id_examen' => 'sometimes|exists:examens,id_examen'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $surveillance->update($request->all());

        return response()->json([
            'message' => 'Surveillance updated successfully',
            'surveillance' => $surveillance->load(['enseignant', 'examen'])
        ]);
    }

    public function destroy($id)
    {
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $surveillance = Surveillance::findOrFail($id);
        $surveillance->delete();

        return response()->json(['message' => 'Surveillance deleted successfully']);
    }
}
