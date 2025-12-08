namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ExamReport;
use Illuminate\Http\Request;

class ExamReportController extends Controller
{
    // Liste des rapports
    public function index()
    {
        return ExamReport::with(['teacher', 'exam'])->get();
    }

    // Afficher un seul rapport
    public function show($id)
    {
        $report = ExamReport::with(['teacher', 'exam'])->find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        return $report;
    }

    // Ajouter un rapport
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'exam_id' => 'required|exists:exams,id',
            'type' => 'required|in:changement_date,conflit_horaire,absence_salle,absence_surveillants,erreur_liste_etudiants,duree_incorrecte,chevauchement_examens,module_incorrect,probleme_administratif,autre',
            'description' => 'nullable|string',
        ]);

        $report = ExamReport::create($validated);

        return response()->json($report, 201);
    }

    // Modifier un rapport
    public function update(Request $request, $id)
    {
        $report = ExamReport::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $validated = $request->validate([
            'type' => 'in:changement_date,conflit_horaire,absence_salle,absence_surveillants,erreur_liste_etudiants,duree_incorrecte,chevauchement_examens,module_incorrect,probleme_administratif,autre',
            'description' => 'nullable|string',
            'status' => 'in:en_attente,traite,rejete'
        ]);

        $report->update($validated);

        return $report;
    }

    // Supprimer un rapport
    public function destroy($id)
    {
        $report = ExamReport::find($id);

        if (!$report) {
            return response()->json(['message' => 'Report not found'], 404);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted'], 200);
    }
}
