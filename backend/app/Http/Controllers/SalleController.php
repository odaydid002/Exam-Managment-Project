<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $salles = Salle::all();
            return response()->json([
                'success' => true,
                'data' => $salles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des salles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Vérifier les autorisations
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent créer des salles.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_salle' => 'required|string|max:255|unique:salles',
            'capacite' => 'required|integer|min:1',
            'localisation' => 'required|string|max:255'
        ], [
            'nom_salle.required' => 'Le nom de la salle est obligatoire',
            'nom_salle.unique' => 'Cette salle existe déjà',
            'capacite.required' => 'La capacité est obligatoire',
            'capacite.min' => 'La capacité doit être au moins de 1',
            'localisation.required' => 'La localisation est obligatoire'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $salle = Salle::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Salle créée avec succès',
                'data' => $salle
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création de la salle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $salle = Salle::find($id);

            if (!$salle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salle non trouvée'
                ], 404);
            }

            // Charger les examens associés
            $salle->load('examens');

            return response()->json([
                'success' => true,
                'data' => $salle
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de la salle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Vérifier les autorisations
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent modifier des salles.'
            ], 403);
        }

        try {
            $salle = Salle::find($id);

            if (!$salle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salle non trouvée'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nom_salle' => 'sometimes|string|max:255|unique:salles,nom_salle,' . $id . ',id_salle',
                'capacite' => 'sometimes|integer|min:1',
                'localisation' => 'sometimes|string|max:255'
            ], [
                'nom_salle.unique' => 'Cette salle existe déjà',
                'capacite.min' => 'La capacité doit être au moins de 1'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $salle->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Salle mise à jour avec succès',
                'data' => $salle
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour de la salle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        // Vérifier les autorisations
        if (!auth()->user()->hasRole(['chef', 'resp'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent supprimer des salles.'
            ], 403);
        }

        try {
            $salle = Salle::find($id);

            if (!$salle) {
                return response()->json([
                    'success' => false,
                    'message' => 'Salle non trouvée'
                ], 404);
            }

            // Vérifier si la salle est utilisée dans des examens
            if ($salle->examens()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer cette salle car elle est utilisée dans des examens'
                ], 422);
            }

            $salle->delete();

            return response()->json([
                'success' => true,
                'message' => 'Salle supprimée avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression de la salle',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les salles disponibles pour une date et heure donnée
     */
    public function getSallesDisponibles(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date_examen' => 'required|date',
            'heure_debut' => 'required|date_format:H:i',
            'heure_fin' => 'required|date_format:H:i|after:heure_debut'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Récupérer les salles qui ne sont pas utilisées pendant cette plage horaire
            $sallesOccupees = Salle::whereHas('examens', function($query) use ($request) {
                $query->where('date_examen', $request->date_examen)
                      ->where(function($q) use ($request) {
                          $q->whereBetween('heure_debut', [$request->heure_debut, $request->heure_fin])
                            ->orWhereBetween('heure_fin', [$request->heure_debut, $request->heure_fin])
                            ->orWhere(function($q2) use ($request) {
                                $q2->where('heure_debut', '<=', $request->heure_debut)
                                   ->where('heure_fin', '>=', $request->heure_fin);
                            });
                      });
            })->pluck('id_salle');

            $sallesDisponibles = Salle::whereNotIn('id_salle', $sallesOccupees)->get();

            return response()->json([
                'success' => true,
                'data' => $sallesDisponibles
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche des salles disponibles',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
