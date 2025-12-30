<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReportController extends Controller
{
    // Get all reports
    public function index()
    {
        return Report::orderBy('created_at', 'desc')->get();
    }

    // Get reports by role
    public function getByRole($role)
    {
        return Report::where('target_role', $role)->orWhere('role', $role)->orderBy('created_at', 'desc')->get();
    }

    // Store a new report
    public function store(Request $request)
    {
        $data = $request->all();

        $validator = Validator::make($data, [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'criticity' => 'nullable|in:low,medium,high,critical',
            'role' => 'nullable|string|max:100',
            'target_type' => 'nullable|string|max:50',
            'target_role' => 'nullable|string|max:100',
            'target_user_id' => 'nullable|exists:users,id',
            'metadata' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $report = Report::create([
            'subject' => $data['subject'],
            'message' => $data['message'],
            'criticity' => $data['criticity'] ?? 'medium',
            'role' => $data['role'] ?? null,
            'reporter_user_id' => auth()->user() ? auth()->user()->id : ($data['reporter_user_id'] ?? null),
            'target_type' => $data['target_type'] ?? null,
            'target_role' => $data['target_role'] ?? null,
            'target_user_id' => $data['target_user_id'] ?? null,
            'metadata' => $data['metadata'] ?? null,
            'status' => 'open'
        ]);

        return response()->json($report, 201);
    }

    // Delete single report
    public function destroy($id)
    {
        $report = Report::find($id);
        if (!$report) return response()->json(['message' => 'Report not found'], 404);
        $report->delete();
        return response()->json(['message' => 'Report deleted'], 200);
    }

    // Delete reports by date range (expects start_date and end_date as ISO dates)
    public function destroyByDateRange(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'start_date' => 'required|date',
            'end_date' => 'required|date'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
        }

        $start = Carbon::parse($request->input('start_date'))->startOfDay();
        $end = Carbon::parse($request->input('end_date'))->endOfDay();

        $deleted = Report::whereBetween('created_at', [$start, $end])->delete();

        return response()->json(['message' => 'Reports deleted', 'count' => $deleted], 200);
    }
}
