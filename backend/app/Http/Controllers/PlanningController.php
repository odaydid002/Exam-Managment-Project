<?php

namespace App\Http\Controllers;

use App\Models\Planning;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlanningController extends Controller
{
    public function index()
    {
        $plannings = Planning::with(['chef'])->get();
        return response()->json(['plannings' => $plannings]);
    }

    public function store(Request $request)
    {
        if (!auth()->user()->hasRole('chef')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titre_planning' => 'required|string|max:255',
            'date_creation' => 'required|date',
            'etat' => 'required|in:Brouillon,Validé,Archivé'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $planning = Planning::create([
            ...$request->all(),
            'id_chef' => auth()->id()
        ]);

        return response()->json([
            'message' => 'Planning created successfully',
            'planning' => $planning->load(['chef'])
        ], 201);
    }

    public function show($id)
    {
        $planning = Planning::with(['chef', 'examens'])->findOrFail($id);
        return response()->json(['planning' => $planning]);
    }

    public function update(Request $request, $id)
    {
        $planning = Planning::findOrFail($id);

        if ($planning->id_chef != auth()->id() && !auth()->user()->hasRole('chef')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titre_planning' => 'sometimes|string|max:255',
            'date_creation' => 'sometimes|date',
            'etat' => 'sometimes|in:Brouillon,Validé,Archivé'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $planning->update($request->all());

        return response()->json([
            'message' => 'Planning updated successfully',
            'planning' => $planning->load(['chef'])
        ]);
    }

    public function destroy($id)
    {
        $planning = Planning::findOrFail($id);

        if ($planning->id_chef != auth()->id() && !auth()->user()->hasRole('chef')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning->delete();

        return response()->json(['message' => 'Planning deleted successfully']);
    }

    public function validatePlanning($id)
    {
        $planning = Planning::findOrFail($id);

        if (!auth()->user()->hasRole('chef')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning->update([
            'etat' => 'Validé',
            'date_validation' => now()
        ]);

        return response()->json([
            'message' => 'Planning validated successfully',
            'planning' => $planning
        ]);
    }
}
