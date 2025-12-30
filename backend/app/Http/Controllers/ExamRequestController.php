<?php

namespace App\Http\Controllers;

use App\Models\ExamRequest;
use App\Models\Teacher;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ExamRequestController extends Controller
{
    // Get all requests (admin/employee)
    public function index()
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $requests = ExamRequest::with(['teacher.user', 'module', 'groupe'])->get();

        $payload = $requests->map(function ($r) {
            return [
                'id' => $r->id,
                'id_module' => $r->id_module,
                'module_name' => $r->module?->name,
                'group_code' => $r->group_code,
                'groupe_name' => $r->groupe?->name,
                'room_name' => $r->roomModel?->name ?? $r->room,
                'id_teacher' => $r->id_teacher,
                'teacher' => $r->teacher ? ($r->teacher->user ?? null) : null,
                'level' => $r->level,
                'room' => $r->room,
                'start_hour' => $r->start_hour,
                'end_hour' => $r->end_hour,
                'date' => $r->exam_date ? $r->exam_date->toDateString() : null,
                'exam_type' => $r->exam_type,
                'message' => $r->message,
                'status' => $r->status,
                'created_at' => $r->created_at,
            ];
        });

        return response()->json($payload);
    }

    // Get requests for a teacher
    public function getByTeacher($teacherNumber)
    {
        try {
            $requests = ExamRequest::with(['module', 'groupe', 'teacher.user'])
                ->where('id_teacher', $teacherNumber)
                ->get();

            $payload = $requests->map(function ($r) {
                return [
                    'id' => $r->id,
                    'id_module' => $r->id_module,
                    'module_name' => $r->module?->name,
                    'group_code' => $r->group_code,
                    'groupe_name' => $r->groupe?->name,
                    'room_name' => $r->roomModel?->name ?? $r->room,
                    'id_teacher' => $r->id_teacher,
                    'teacher' => $r->teacher ? ($r->teacher->user ?? null) : null,
                    'level' => $r->level,
                    'room' => $r->room,
                    'start_hour' => $r->start_hour,
                    'end_hour' => $r->end_hour,
                    'date' => $r->exam_date ? $r->exam_date->toDateString() : null,
                    'exam_type' => $r->exam_type,
                    'message' => $r->message,
                    'status' => $r->status,
                    'created_at' => $r->created_at,
                ];
            });

            return response()->json($payload);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to retrieve requests', 'error' => $e->getMessage()], 500);
        }
    }

    // Store a new teacher request
    public function store(Request $request)
    {
        try {
            $data = $request->all();

            $validator = Validator::make($data, [
                'id_module' => 'required|string',
                'group_code' => 'required|string',
                'level' => 'nullable|string',
                'room' => 'nullable|string',
                'start_hour' => 'nullable|numeric',
                'end_hour' => 'nullable|numeric',
                'exam_date' => 'nullable|date',
                'exam_type' => 'nullable|string',
                'message' => 'nullable|string',
                'id_teacher' => 'nullable|string'
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Validation failed', 'errors' => $validator->errors()], 422);
            }

            // If no teacher provided, use authenticated teacher
            if (empty($data['id_teacher']) && auth()->user() && auth()->user()->role === 'teacher') {
                $teacher = Teacher::where('user_id', auth()->user()->id)->first();
                if ($teacher) $data['id_teacher'] = $teacher->number;
            }

            $req = ExamRequest::create([
                'id_module' => $data['id_module'],
                'id_teacher' => $data['id_teacher'] ?? null,
                'group_code' => $data['group_code'] ?? null,
                'level' => $data['level'] ?? null,
                'room' => $data['room'] ?? null,
                'start_hour' => isset($data['start_hour']) ? floatval($data['start_hour']) : null,
                'end_hour' => isset($data['end_hour']) ? floatval($data['end_hour']) : null,
                'exam_date' => isset($data['exam_date']) ? date('Y-m-d', strtotime($data['exam_date'])) : null,
                'exam_type' => $data['exam_type'] ?? null,
                'message' => $data['message'] ?? null,
                'status' => 'pending',
            ]);

            // notify admins
            $timeRange = ($req->start_hour !== null || $req->end_hour !== null) ? (('start: ' . ($req->start_hour ?? 'TBA')) . ', end: ' . ($req->end_hour ?? 'TBA')) : 'TBA';
            $message = 'Exam request: module ' . $req->id_module . ', group ' . ($req->group_code ?? 'N/A') . ', level ' . ($req->level ?? 'N/A') . ', time ' . $timeRange;
            Notification::create([
                'user_id' => auth()->user() ? auth()->user()->id : null,
                'title' => 'New Exam Request',
                'message' => $message,
                'is_read' => false,
                'target_type' => 'role',
                'target_role' => 'admin',
            ]);

            return response()->json(['message' => 'Request created', 'request' => $req], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create request', 'error' => $e->getMessage()], 500);
        }
    }

    public function approve($id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $req = ExamRequest::with('teacher.user', 'module', 'groupe')->find($id);
        if (!$req) return response()->json(['message' => 'Request not found'], 404);

        DB::beginTransaction();
        try {
            $req->status = 'approved';
            $req->save();

            $teacherUserId = $req->teacher?->user?->id ?? null;
            $message = 'Your exam request has been approved: module ' . $req->id_module
                . ', group ' . ($req->group_code ?? 'N/A')
                . ', date ' . ($req->exam_date ? $req->exam_date->toDateString() : 'TBA');

            Notification::create([
                'user_id' => auth()->user() ? auth()->user()->id : null,
                'title' => 'Exam Request Approved',
                'message' => $message,
                'is_read' => false,
                'target_type' => 'user',
                'target_user_id' => $teacherUserId,
            ]);

            DB::commit();
            return response()->json(['message' => 'Request approved', 'request' => $req]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to approve request', 'error' => $e->getMessage()], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $req = ExamRequest::with('teacher.user', 'module', 'groupe')->find($id);
        if (!$req) return response()->json(['message' => 'Request not found'], 404);

        $reason = $request->input('reason');

        DB::beginTransaction();
        try {
            $req->status = 'rejected';
            $req->save();

            $teacherUserId = $req->teacher?->user?->id ?? null;
            $message = 'Your exam request has been rejected: module ' . $req->id_module
                . ', group ' . ($req->group_code ?? 'N/A') . '. ' . ($reason ? ('Reason: ' . $reason) : '');

            Notification::create([
                'user_id' => auth()->user() ? auth()->user()->id : null,
                'title' => 'Exam Request Rejected',
                'message' => $message,
                'is_read' => false,
                'target_type' => 'user',
                'target_user_id' => $teacherUserId,
            ]);

            DB::commit();
            return response()->json(['message' => 'Request rejected', 'request' => $req]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to reject request', 'error' => $e->getMessage()], 500);
        }
    }
}
