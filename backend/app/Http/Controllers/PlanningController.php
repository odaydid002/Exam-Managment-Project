<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Planning;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class PlanningController extends Controller
{
    /**
     * Get all planning records
     */
    public function index(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning = Planning::with('chef')->orderBy('date_creation', 'desc')->get();

        $data = $planning->map(function ($p) {
            return [
                'id_planning' => $p->id_planning,
                'titre_planning' => $p->titre_planning,
                'date_creation' => $p->date_creation ? $p->date_creation->toDateString() : null,
                'date_validation' => $p->date_validation ? $p->date_validation->toDateString() : null,
                'etat' => $p->etat,
                'id_chef' => $p->id_chef,
                'chef_name' => $p->chef ? $p->chef->name : null,
            ];
        })->toArray();

        return response()->json(['total' => count($data), 'planning' => $data]);
    }

    /**
     * Get a specific planning record
     */
    public function show($id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning = Planning::with(['chef', 'examens'])->find($id);
        if (!$planning) {
            return response()->json(['message' => 'Planning not found'], 404);
        }

        return response()->json([
            'id_planning' => $planning->id_planning,
            'titre_planning' => $planning->titre_planning,
            'date_creation' => $planning->date_creation ? $planning->date_creation->toDateString() : null,
            'date_validation' => $planning->date_validation ? $planning->date_validation->toDateString() : null,
            'etat' => $planning->etat,
            'id_chef' => $planning->id_chef,
            'chef_name' => $planning->chef ? $planning->chef->name : null,
            'exams_count' => $planning->examens ? count($planning->examens) : 0,
        ]);
    }

    /**
     * Create a new planning record
     */
    public function store(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'titre_planning' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $planning = Planning::create([
                'titre_planning' => $request->titre_planning,
                'date_creation' => Carbon::now(),
                'etat' => 'brouillon',
                'id_chef' => auth()->user()->id,
            ]);

            return response()->json([
                'message' => 'Planning created successfully',
                'id_planning' => $planning->id_planning,
                'titre_planning' => $planning->titre_planning,
                'etat' => $planning->etat,
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error creating planning: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update a planning record
     */
    public function update(Request $request, $id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning = Planning::find($id);
        if (!$planning) {
            return response()->json(['message' => 'Planning not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'titre_planning' => 'string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            if ($request->has('titre_planning')) {
                $planning->titre_planning = $request->titre_planning;
            }
            $planning->save();

            return response()->json([
                'message' => 'Planning updated successfully',
                'id_planning' => $planning->id_planning,
                'titre_planning' => $planning->titre_planning,
                'etat' => $planning->etat,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error updating planning: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Validate exam planning (admin only)
     */
    public function validate(Request $request, $id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if user is admin
        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admins can validate planning'], 403);
        }

        $planning = Planning::find($id);
        if (!$planning) {
            return response()->json(['message' => 'Planning not found'], 404);
        }

        try {
            $planning->etat = 'validé';
            $planning->date_validation = Carbon::now();
            $planning->save();

            return response()->json([
                'message' => 'Planning validated successfully',
                'id_planning' => $planning->id_planning,
                'titre_planning' => $planning->titre_planning,
                'etat' => $planning->etat,
                'date_validation' => $planning->date_validation ? $planning->date_validation->toDateString() : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error validating planning: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Delete a planning record
     */
    public function destroy($id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $planning = Planning::find($id);
        if (!$planning) {
            return response()->json(['message' => 'Planning not found'], 404);
        }

        try {
            $planning->delete();

            return response()->json(['message' => 'Planning deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error deleting planning: ' . $e->getMessage()], 500);
        }
    }
}
