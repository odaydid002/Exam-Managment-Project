<?php

namespace App\Http\Controllers;

use App\Models\Surveillance;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SurveillanceController extends Controller
{
    public function index()
    {
        $surveillances = Surveillance::with(['teacher', 'examen'])->get();
        return response()->json(['surveillances' => $surveillances]);
    }

    /**
     * Get all surveillance records for a specific exam
     */
    public function getByExam($examId)
    {
        try {
            $surveillance = Surveillance::where('exam_id', $examId)
                ->with(['teacher.user'])
                ->get();

            // Format response with teacher data
            $result = $surveillance->map(function ($record) {
                $teacherData = null;
                if ($record->teacher && $record->teacher->user) {
                    $teacherData = [
                        'number' => $record->teacher->number,
                        'fname' => $record->teacher->user->fname,
                        'lname' => $record->teacher->user->lname,
                        'image' => $record->teacher->user->image
                    ];
                }

                return [
                    'id' => $record->id,
                    'exam_id' => $record->exam_id,
                    'teacher_number' => $record->teacher_number,
                    'status' => $record->status,
                    'teacher' => $teacherData
                ];
            });

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve surveillance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all exams where a teacher is assigned as surveillance
     */
    public function getTeacherExams($teacherId)
    {
        try {
            // Find all surveillance records for this teacher
            $surveillanceRecords = Surveillance::where('teacher_number', $teacherId)
                ->with(['examen', 'teacher'])
                ->get();

            if ($surveillanceRecords->isEmpty()) {
                return response()->json([]);
            }

            // Get unique exam IDs
            $examIds = $surveillanceRecords->pluck('exam_id')->unique();

            // Fetch all exams with their surveillance data, module, and room (only validated)
            $exams = \App\Models\Examen::whereIn('id', $examIds)
                ->where('validated', true)
                ->with(['module', 'salle', 'surveillances' => function ($q) {
                    $q->with('teacher.user');
                }])
                ->get();

            // Format response - one object per teacher surveillance
            $result = [];
            foreach ($exams as $exam) {
                $survs = $exam->surveillances ?? collect([]);

                // Find this teacher's surveillance for this exam
                $teacherSurveillance = $survs->firstWhere('teacher_number', $teacherId);

                if (!$teacherSurveillance) {
                    continue;
                }

                // Get status for this teacher's surveillance
                $status = $teacherSurveillance->status ?? 'pending';

                // Get approved surveillances for this exam (excluding this teacher)
                $approvedSurvellances = $survs
                    ->where('status', 'approved')
                    ->where('teacher_number', '!=', $teacherId)
                    ->map(function ($s) {
                        return [
                            'teacher_number' => $s->teacher_number,
                            'adj' => $s->teacher && $s->teacher->adj ? $s->teacher->adj : '',
                            'fname' => $s->teacher && $s->teacher->user ? $s->teacher->user->fname : '',
                            'lname' => $s->teacher && $s->teacher->user ? $s->teacher->user->lname : '',
                            'image' => $s->teacher && $s->teacher->user ? $s->teacher->user->image : null
                        ];
                    })
                    ->values()
                    ->toArray();

                $result[] = [
                    'surveillance_id' => $teacherSurveillance->id,
                    'status' => $status,
                    'exam_id' => $exam->id,
                    'exam_type' => $exam->exam_type ?? $exam->type ?? '',
                    'module_name' => $exam->module ? $exam->module->name : '',
                    'module_code' => $exam->module_code ?? '',
                    'module_credit' => $exam->module ? $exam->module->credits : 0,
                    'module_factor' => $exam->module ? $exam->module->factor : 0,
                    'date' => $exam->date ?? $exam->day ?? '',
                    'start_hour' => $exam->start_hour ?? $exam->startHour ?? 0,
                    'end_hour' => $exam->end_hour ?? $exam->endHour ?? 0,
                    'room' => $exam->salle ? $exam->salle->name : '',
                    'surveillances' => $approvedSurvellances
                ];
            }

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve teacher exams',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all surveillance records for a specific teacher
     */
    public function getByTeacher($teacherId)
    {
        try {
            $surveillance = Surveillance::where('teacher_number', $teacherId)
                ->with(['teacher.user', 'examen'])
                ->get();

            // Normalize status property for each surveillance
            $normalized = $surveillance->map(function ($s) {
                $status = null;
                if (isset($s->status)) {
                    $status = $s->status;
                } else if (isset($s->approved)) {
                    $status = $s->approved ? 'approved' : 'pending';
                } else {
                    $status = 'pending';
                }

                return array_merge($s->toArray(), ['status' => $status]);
            });

            return response()->json($normalized);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve teacher surveillance records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign a teacher to proctor an exam
     */
    public function assign(Request $request)
    {
        try {
            $validated = $request->validate([
                'exam_id' => 'required|integer|exists:exams,id',
                'teacher_number' => 'required|string|exists:teachers,number'
            ]);

            // Check if already assigned
            $existing = Surveillance::where('exam_id', $validated['exam_id'])
                ->where('teacher_number', $validated['teacher_number'])
                ->first();

            if ($existing) {
                return response()->json([
                    'message' => 'Teacher is already assigned to this exam'
                ], 409);
            }

            // Create new surveillance record (status defaults to 'pending')
            $validated['status'] = $validated['status'] ?? 'pending';
            $surveillance = Surveillance::create($validated);

            return response()->json([
                'message' => 'Teacher assigned successfully',
                'surveillance' => $surveillance->load('teacher')
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to assign teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove a teacher from proctoring an exam
     */
    public function unassign($examId, $teacherNumber)
    {
        try {
            $surveillance = Surveillance::where('exam_id', $examId)
                ->where('teacher_number', $teacherNumber)
                ->first();

            if (!$surveillance) {
                return response()->json([
                    'message' => 'Surveillance record not found'
                ], 404);
            }

            $surveillance->delete();

            return response()->json([
                'message' => 'Teacher unassigned successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to unassign teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a surveillance assignment
     */
    public function approve(Request $request)
    {
        try {
            $validated = $request->validate([
                'surveillance_id' => 'required|integer|exists:surveillance,id'
            ]);

            $surveillance = Surveillance::find($validated['surveillance_id']);

            if (!$surveillance) {
                return response()->json([
                    'message' => 'Surveillance record not found'
                ], 404);
            }

            // Update only the specific surveillance record
            $surveillance->status = 'approved';
            $surveillance->save();

            // Reload relationships for response/notification
            $surveillance->load(['examen', 'teacher.user']);
            $examName = $surveillance->examen ? $surveillance->examen->code : 'Unknown Exam';
            $teacherName = $surveillance->teacher && $surveillance->teacher->user
                ? $surveillance->teacher->user->fname . ' ' . $surveillance->teacher->user->lname
                : 'Unknown Teacher';

            // Send notification to admins/employees
            Notification::create([
                'user_id' => auth()->user()->id,
                'title' => 'Surveillance Approved',
                'message' => $teacherName . ' has approved surveillance for exam ' . $examName,
                'is_read' => false,
                'target_type' => 'role',
                'target_role' => 'admin',
            ]);

            return response()->json([
                'message' => 'Surveillance approved successfully',
                'surveillance' => $surveillance
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to approve surveillance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a surveillance assignment
     */
    public function reject(Request $request)
    {
        try {
            $validated = $request->validate([
                'surveillance_id' => 'required|integer|exists:surveillance,id'
            ]);

            $surveillance = Surveillance::find($validated['surveillance_id']);

            if (!$surveillance) {
                return response()->json([
                    'message' => 'Surveillance record not found'
                ], 404);
            }

            // Update only the specific surveillance record
            $surveillance->status = 'rejected';
            $surveillance->save();

            // Reload relationships for response/notification
            $surveillance->load(['examen', 'teacher.user']);
            $examName = $surveillance->examen ? $surveillance->examen->code : 'Unknown Exam';
            $teacherName = $surveillance->teacher && $surveillance->teacher->user
                ? $surveillance->teacher->user->fname . ' ' . $surveillance->teacher->user->lname
                : 'Unknown Teacher';

            // Send notification to admins/employees
            Notification::create([
                'user_id' => auth()->user()->id,
                'title' => 'Surveillance Rejected',
                'message' => $teacherName . ' has rejected surveillance for exam ' . $examName,
                'is_read' => false,
                'target_type' => 'role',
                'target_role' => 'admin',
            ]);

            return response()->json([
                'message' => 'Surveillance rejected successfully',
                'surveillance' => $surveillance
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reject surveillance',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
