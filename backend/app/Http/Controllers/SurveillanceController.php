<?php

namespace App\Http\Controllers;

use App\Models\Surveillance;
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

            // Create new surveillance record
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
}
