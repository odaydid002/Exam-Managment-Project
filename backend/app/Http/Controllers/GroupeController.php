<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class GroupeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $groupes = Groupe::all();
            return response()->json([
                'success' => true,
                'data' => $groupes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des groupes',
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
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent créer des groupes.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom_groupe' => 'required|string|max:255|unique:groupes',
            'niveau' => 'required|string|max:100',
            'specialite' => 'required|string|max:255'
        ], [
            'nom_groupe.required' => 'Le nom du groupe est obligatoire',
            'nom_groupe.unique' => 'Ce groupe existe déjà',
            'niveau.required' => 'Le niveau est obligatoire',
            'specialite.required' => 'La spécialité est obligatoire'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $groupe = Groupe::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Groupe créé avec succès',
                'data' => $groupe
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du groupe',
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
            $groupe = Groupe::find($id);

            if (!$groupe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Groupe non trouvé'
                ], 404);
            }

            // Charger les examens associés
            $groupe->load('examens');

            return response()->json([
                'success' => true,
                'data' => $groupe
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du groupe',
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
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent modifier des groupes.'
            ], 403);
        }

        try {
            $groupe = Groupe::find($id);

            if (!$groupe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Groupe non trouvé'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'nom_groupe' => 'sometimes|string|max:255|unique:groupes,nom_groupe,' . $id . ',id_groupe',
                'niveau' => 'sometimes|string|max:100',
                'specialite' => 'sometimes|string|max:255'
            ], [
                'nom_groupe.unique' => 'Ce groupe existe déjà'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Erreur de validation',
                    'errors' => $validator->errors()
                ], 422);
            }

            $groupe->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Groupe mis à jour avec succès',
                'data' => $groupe
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du groupe',
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
                'message' => 'Non autorisé. Seuls les chefs et responsables peuvent supprimer des groupes.'
            ], 403);
        }

        try {
            $groupe = Groupe::find($id);

            if (!$groupe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Groupe non trouvé'
                ], 404);
            }

            // Vérifier si le groupe est utilisé dans des examens
            if ($groupe->examens()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Impossible de supprimer ce groupe car il est utilisé dans des examens'
                ], 422);
            }

            $groupe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Groupe supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du groupe',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les groupes par niveau
     */
    public function getByNiveau($niveau)
    {
        try {
            $groupes = Groupe::where('niveau', $niveau)->get();

            return response()->json([
                'success' => true,
                'data' => $groupes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des groupes par niveau',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les groupes par spécialité
     */
    public function getBySpecialite($specialite)
    {
        try {
            $groupes = Groupe::where('specialite', $specialite)->get();

            return response()->json([
                'success' => true,
                'data' => $groupes
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des groupes par spécialité',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les statistiques des groupes
     */
    public function getStatistiques()
    {
        try {
            $statistiques = Groupe::withCount('examens')
                ->orderBy('examens_count', 'desc')
                ->get()
                ->map(function($groupe) {
                    return [
                        'id_groupe' => $groupe->id_groupe,
                        'nom_groupe' => $groupe->nom_groupe,
                        'niveau' => $groupe->niveau,
                        'specialite' => $groupe->specialite,
                        'nombre_examens' => $groupe->examens_count
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $statistiques
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des statistiques',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
