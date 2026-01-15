<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Mail;
use App\Mail\ExamScheduleMail;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\User;
use App\Models\Examen;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ExamenController extends Controller
{
    private function formatExamData($exams)
    {
        return $exams->map(function ($e) {
            $firstStudent = ($e->groupe && $e->groupe->students) ? $e->groupe->students->first() : null;
            $speciality = null;
            if ($e->groupe && $e->groupe->section && isset($e->groupe->section->speciality) && $e->groupe->section->speciality) {
                $speciality = $e->groupe->section->speciality->name;
            } else {
                if ($firstStudent && $firstStudent->speciality) $speciality = $firstStudent->speciality->name;
            }

            $level = null;
            if ($e->groupe && $e->groupe->section && isset($e->groupe->section->level)) {
                $level = $e->groupe->section->level;
            } else {
                if ($firstStudent && isset($firstStudent->level)) $level = $firstStudent->level;
            }

            return [
                'id' => $e->id,
                'module_code' => $e->module_code,
                'module_name' => $e->module ? $e->module->name : null,
                'group_code' => $e->group_code,
                'group_name' => $e->groupe ? $e->groupe->name : null,
                'section' => ($e->groupe && $e->groupe->section) ? $e->groupe->section->name : null,
                'speciality' => $speciality,
                'level' => $level,
                'room_id' => $e->room_id,
                'room_name' => $e->salle ? $e->salle->name : null,
                'exam_type' => $e->exam_type,
                'date' => $e->date ? (function($date) {
                    try {
                        return Carbon::parse($date)->toDateTimeString();
                    } catch (\Exception $ex) {
                        return $date; // return as is if parsing fails
                    }
                })($e->date) : null,
                'start_hour' => $e->start_hour,
                'end_hour' => $e->end_hour,
                'validated' => (bool) $e->validated,
            ];
        })->toArray();
    }

    public function index(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $exams = Examen::with(['module', 'groupe.section.speciality', 'groupe.students.speciality', 'salle'])->orderBy('date', 'desc')->get();

            $data = $this->formatExamData($exams);
            return response()->json(['total' => count($data), 'exams' => $data]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to load exams', 'details' => $e->getMessage()], 500);
        }
    }

    public function getNonValidated(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $exams = Examen::with(['module', 'groupe.section.speciality', 'groupe.students.speciality', 'salle'])
            ->where('validated', false)
            ->orderBy('date', 'desc')
            ->get();

        $data = $this->formatExamData($exams);
        return response()->json(['total' => count($data), 'exams' => $data]);
    }

    public function show($id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $e = Examen::with(['module', 'groupe.section.speciality', 'groupe.students.speciality', 'salle'])->find($id);
        if (!$e) return response()->json(['message' => 'Exam not found'], 404);
        $speciality = null;
        if ($e->groupe && $e->groupe->section && isset($e->groupe->section->speciality) && $e->groupe->section->speciality) {
            $speciality = $e->groupe->section->speciality->name;
        } else {
            $firstStudent = ($e->groupe && $e->groupe->students) ? $e->groupe->students->first() : null;
            if ($firstStudent && $firstStudent->speciality) $speciality = $firstStudent->speciality->name;
        }

            $level = null;
            if ($e->groupe && $e->groupe->section && isset($e->groupe->section->level)) {
                $level = $e->groupe->section->level;
            } else {
                $firstStudent = ($e->groupe && $e->groupe->students) ? $e->groupe->students->first() : null;
                if ($firstStudent && isset($firstStudent->level)) $level = $firstStudent->level;
            }

        return response()->json([
            'id' => $e->id,
            'module_code' => $e->module_code,
            'module_name' => $e->module->name ?? null,
            'group_code' => $e->group_code,
            'group_name' => $e->groupe ? $e->groupe->name : null,
            'section' => ($e->groupe && $e->groupe->section) ? $e->groupe->section->name : null,
            'speciality' => $speciality,
                'room_id' => $e->room_id,
                'level' => $level,
            'room_name' => $e->salle->name ?? null,
            'exam_type' => $e->exam_type,
            'date' => $e->date ? $e->date->toDateTimeString() : null,
            'start_hour' => $e->start_hour,
            'end_hour' => $e->end_hour,
            'validated' => (bool) $e->validated,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'module_code' => 'required|exists:modules,code',
            'group_code' => 'required|exists:groups,code',
            'room_id' => 'nullable|exists:rooms,id',
            'exam_type' => 'nullable|string|max:50',
            'date' => 'required|date',
            'start_hour' => 'required|numeric',
            'end_hour' => 'required|numeric|gt:start_hour',
                    'academic_year_id' => 'nullable|exists:academic_years,id',
                    'semester_id' => 'nullable|exists:semesters,id',
                'validated' => 'nullable|boolean',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        if ($request->room_id) {
            $dateOnly = Carbon::parse($request->date)->toDateString();
            $conflict = $this->roomHasConflict($request->room_id, $dateOnly, $request->start_hour, $request->end_hour);
            if ($conflict) {
                return response()->json(['message' => 'Room is already booked at the requested time', 'conflict' => $conflict], 422);
            }
        }

        try {
            $exam = DB::transaction(function () use ($request) {
                $user = auth()->user();
                $ay = $request->academic_year_id ?? ($user ? $user->currentAcademicYearId() : null);
                $sem = $request->semester_id ?? ($user ? $user->currentSemesterId() : null);

                return Examen::create([
                    'module_code' => $request->module_code,
                    'group_code' => $request->group_code,
                    'room_id' => $request->room_id ?? null,
                    'exam_type' => $request->exam_type ?? 'Normal',
                    'date' => $request->date,
                    'start_hour' => $request->start_hour,
                    'end_hour' => $request->end_hour,
                    'academic_year_id' => $ay,
                    'semester_id' => $sem,
                    'validated' => $request->validated ?? false,
                ]);
            });

            // Send notification to admins
            $module = Module::find($request->module_code);
            $group = Groupe::find($request->group_code);
            Notification::create([
                'user_id' => auth()->user()->id,
                'title' => 'New Exam Created',
                'message' => 'A new exam has been created: ' . ($module ? $module->name : $request->module_code) . ' for group ' . ($group ? $group->name : $request->group_code),
                'is_read' => false,
                'target_type' => 'role',
                'target_role' => 'admin',
            ]);

            return response()->json(['message' => 'Exam created', 'exam' => $exam], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create exam', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $exam = Examen::find($id);
        if (!$exam) return response()->json(['message' => 'Exam not found'], 404);

        $v = Validator::make($request->all(), [
            'module_code' => 'nullable|exists:modules,code',
            'group_code' => 'nullable|exists:groups,code',
            'room_id' => 'nullable|exists:rooms,id',
            'exam_type' => 'nullable|string|max:50',
            'date' => 'nullable|date',
            'start_hour' => 'nullable|numeric',
            'end_hour' => 'nullable|numeric|gt:start_hour',
                'academic_year_id' => 'nullable|exists:academic_years,id',
                'semester_id' => 'nullable|exists:semesters,id',
                'validated' => 'nullable|boolean',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $newRoom = $request->has('room_id') ? $request->room_id : $exam->room_id;
        $newDate = $request->filled('date') ? Carbon::parse($request->date)->toDateString() : ($exam->date ? $exam->date->toDateString() : null);
        $newStart = $request->filled('start_hour') ? $request->start_hour : $exam->start_hour;
        $newEnd = $request->filled('end_hour') ? $request->end_hour : $exam->end_hour;

        if ($newRoom && $newDate) {
            $conflict = $this->roomHasConflict($newRoom, $newDate, $newStart, $newEnd, $exam->id);
            if ($conflict) {
                return response()->json(['message' => 'Room is already booked at the requested time', 'conflict' => $conflict], 422);
            }
        }

        try {
            $isBeingValidated = $request->has('validated') && $request->validated === true && !$exam->validated;

            $originalDate = $exam->date;
            $originalStart = $exam->start_hour;
            $originalEnd = $exam->end_hour;
            $originalRoom = $exam->room_id;
            $originalExamType = $exam->exam_type;

            DB::transaction(function () use ($request, $exam, $originalDate) {
                if ($request->filled('module_code')) $exam->module_code = $request->module_code;
                if ($request->filled('group_code')) $exam->group_code = $request->group_code;
                if ($request->has('room_id')) $exam->room_id = $request->room_id;
                if ($request->filled('exam_type')) $exam->exam_type = $request->exam_type;
                if ($request->filled('date')) $exam->date = $request->date;
                else $exam->date = $originalDate;
                if ($request->filled('start_hour')) $exam->start_hour = $request->start_hour;
                if ($request->filled('end_hour')) $exam->end_hour = $request->end_hour;
                    if ($request->filled('academic_year_id')) $exam->academic_year_id = $request->academic_year_id;
                    if ($request->filled('semester_id')) $exam->semester_id = $request->semester_id;
                if ($request->has('validated')) $exam->validated = $request->validated;
                $exam->save();
            });

            $exam->refresh();

            $origDateStr = $originalDate ? $originalDate->toDateTimeString() : null;
            $newDateStr = $exam->date ? $exam->date->toDateTimeString() : null;
            $scheduleChanged = ($origDateStr !== $newDateStr)
                || ($originalStart != $exam->start_hour)
                || ($originalEnd != $exam->end_hour)
                || ($originalRoom != $exam->room_id)
                || ($originalExamType != $exam->exam_type);

            if ($scheduleChanged) {
                $exam->load('groupe.students.user', 'surveillances.teacher.user', 'module');
                $moduleName = $exam->module ? $exam->module->name : $exam->module_code;

                if ($exam->groupe && $exam->groupe->students) {
                    foreach ($exam->groupe->students as $student) {
                        if ($student->user) {
                            Notification::create([
                                'user_id' => $student->user->id,
                                'title' => 'Exam Schedule Updated',
                                'message' => 'The schedule for ' . $moduleName . ' has been updated to ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                                'is_read' => false,
                                'target_type' => 'user',
                                'target_user_id' => $student->user->id,
                            ]);
                        }
                    }
                }

                if ($exam->surveillances) {
                    foreach ($exam->surveillances as $surveillance) {
                        if ($surveillance->teacher && $surveillance->teacher->user) {
                            Notification::create([
                                'user_id' => $surveillance->teacher->user->id,
                                'title' => 'Exam Schedule Updated',
                                'message' => 'The schedule for the ' . $moduleName . ' exam has been updated to ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                                'is_read' => false,
                                'target_type' => 'user',
                                'target_user_id' => $surveillance->teacher->user->id,
                            ]);
                        }
                    }
                }

                // Notify teachers assigned to this module
                $moduleTeachers = \App\Models\TeacherModule::where('module_code', $exam->module_code)
                    ->with('teacher.user')
                    ->get();
                $notifiedTeacherIds = $exam->surveillances ? $exam->surveillances->pluck('teacher.user.id')->filter()->toArray() : [];

                foreach ($moduleTeachers as $tm) {
                    if ($tm->teacher && $tm->teacher->user && !in_array($tm->teacher->user->id, $notifiedTeacherIds)) {
                        Notification::create([
                            'user_id' => $tm->teacher->user->id,
                            'title' => 'Exam Schedule Updated',
                            'message' => 'The schedule for ' . $moduleName . ' has been updated to ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $tm->teacher->user->id,
                        ]);
                    }
                }
            }

            if ($isBeingValidated) {
                $exam->load('groupe.students.user', 'surveillances.teacher.user', 'module');

                $moduleName = $exam->module ? $exam->module->name : $exam->module_code;

                if ($exam->groupe && $exam->groupe->students) {
                    foreach ($exam->groupe->students as $student) {
                        if ($student->user) {
                            Notification::create([
                                'user_id' => $student->user->id,
                                'title' => 'New Exam Scheduled',
                                'message' => 'A new exam has been scheduled for ' . $moduleName . ' on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                                'is_read' => false,
                                'target_type' => 'user',
                                'target_user_id' => $student->user->id,
                            ]);
                        }
                    }
                }

                if ($exam->surveillances) {
                    foreach ($exam->surveillances as $surveillance) {
                        if ($surveillance->teacher && $surveillance->teacher->user) {
                            Notification::create([
                                'user_id' => $surveillance->teacher->user->id,
                                'title' => 'Exam Assigned for Surveillance',
                                'message' => 'You have been assigned to supervise the ' . $moduleName . ' exam on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                                'is_read' => false,
                                'target_type' => 'user',
                                'target_user_id' => $surveillance->teacher->user->id,
                            ]);
                        }
                    }
                }

                // Notify teachers assigned to this module
                $moduleTeachers = \App\Models\TeacherModule::where('module_code', $exam->module_code)
                    ->with('teacher.user')
                    ->get();
                $notifiedTeacherIds = $exam->surveillances ? $exam->surveillances->pluck('teacher.user.id')->filter()->toArray() : [];

                foreach ($moduleTeachers as $tm) {
                    if ($tm->teacher && $tm->teacher->user && !in_array($tm->teacher->user->id, $notifiedTeacherIds)) {
                        Notification::create([
                            'user_id' => $tm->teacher->user->id,
                            'title' => 'Exam Scheduled for Your Module',
                            'message' => 'An exam has been scheduled for ' . $moduleName . ' on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $tm->teacher->user->id,
                        ]);
                    }
                }
            }

            return response()->json(['message' => 'Exam updated', 'exam' => $exam]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update exam', 'error' => $e->getMessage()], 500);
        }
    }

    public function validateExam(Request $request, $id)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Only admins can validate exams'], 403);
        }

        $exam = Examen::find($id);
        if (!$exam) {
            return response()->json(['message' => 'Exam not found'], 404);
        }
        $existingDate = $exam->date ? $exam->date->toDateTimeString() : null;

        if ($exam->validated) {
            return response()->json(['message' => 'Exam is already validated'], 400);
        }

        try {
            DB::transaction(function () use ($exam, $existingDate) {
                DB::table('exams')->where('id', $exam->id)->update(['validated' => true, 'date' => $existingDate]);
            });

            $exam = Examen::find($id);
            $exam->load('groupe.students.user', 'surveillances.teacher.user', 'module');

            $moduleName = $exam->module ? $exam->module->name : $exam->module_code;

            if ($exam->groupe && $exam->groupe->students) {
                foreach ($exam->groupe->students as $student) {
                    if ($student->user) {
                        Notification::create([
                            'user_id' => $student->user->id,
                            'title' => 'New Exam Scheduled',
                            'message' => 'A new exam has been scheduled for ' . $moduleName . ' on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $student->user->id,
                        ]);
                    }
                }
            }

            if ($exam->surveillances) {
                foreach ($exam->surveillances as $surveillance) {
                    if ($surveillance->teacher && $surveillance->teacher->user) {
                        Notification::create([
                            'user_id' => $surveillance->teacher->user->id,
                            'title' => 'Exam Assigned for Surveillance',
                            'message' => 'You have been assigned to supervise the ' . $moduleName . ' exam on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $surveillance->teacher->user->id,
                        ]);
                    }
                }
            }

            // Notify teachers assigned to this module
            $moduleTeachers = \App\Models\TeacherModule::where('module_code', $exam->module_code)
                ->with('teacher.user')
                ->get();
            $notifiedTeacherIds = $exam->surveillances ? $exam->surveillances->pluck('teacher.user.id')->filter()->toArray() : [];

            foreach ($moduleTeachers as $tm) {
                if ($tm->teacher && $tm->teacher->user && !in_array($tm->teacher->user->id, $notifiedTeacherIds)) {
                    Notification::create([
                        'user_id' => $tm->teacher->user->id,
                        'title' => 'Exam Scheduled for Your Module',
                        'message' => 'An exam has been scheduled for ' . $moduleName . ' on ' . ($exam->date ? $exam->date->toDateString() : 'TBA'),
                        'is_read' => false,
                        'target_type' => 'user',
                        'target_user_id' => $tm->teacher->user->id,
                    ]);
                }
            }

            return response()->json([
                'message' => 'Exam validated successfully',
                'id' => $exam->id,
                'module_code' => $exam->module_code,
                'group_code' => $exam->group_code,
                'validated' => true,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error validating exam: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $exam = Examen::find($id);
        if (!$exam) return response()->json(['message' => 'Exam not found'], 404);

        try {
            $exam->load('groupe.students.user', 'surveillances.teacher.user', 'module');
            $moduleName = $exam->module ? $exam->module->name : $exam->module_code;

            if ($exam->groupe && $exam->groupe->students) {
                foreach ($exam->groupe->students as $student) {
                    if ($student->user) {
                        Notification::create([
                            'user_id' => $student->user->id,
                            'title' => 'Exam Canceled',
                            'message' => 'The ' . $moduleName . ' exam scheduled on ' . ($exam->date ? $exam->date->toDateString() : 'TBA') . ' has been canceled.',
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $student->user->id,
                        ]);
                    }
                }
            }

            if ($exam->surveillances) {
                foreach ($exam->surveillances as $surveillance) {
                    if ($surveillance->teacher && $surveillance->teacher->user) {
                        Notification::create([
                            'user_id' => $surveillance->teacher->user->id,
                            'title' => 'Exam Canceled',
                            'message' => 'The ' . $moduleName . ' exam scheduled on ' . ($exam->date ? $exam->date->toDateString() : 'TBA') . ' has been canceled.',
                            'is_read' => false,
                            'target_type' => 'user',
                            'target_user_id' => $surveillance->teacher->user->id,
                        ]);
                    }
                }
            }

            // Notify teachers assigned to this module
            $moduleTeachers = \App\Models\TeacherModule::where('module_code', $exam->module_code)
                ->with('teacher.user')
                ->get();
            $notifiedTeacherIds = $exam->surveillances ? $exam->surveillances->pluck('teacher.user.id')->filter()->toArray() : [];

            foreach ($moduleTeachers as $tm) {
                if ($tm->teacher && $tm->teacher->user && !in_array($tm->teacher->user->id, $notifiedTeacherIds)) {
                    Notification::create([
                        'user_id' => $tm->teacher->user->id,
                        'title' => 'Exam Canceled',
                        'message' => 'The ' . $moduleName . ' exam scheduled on ' . ($exam->date ? $exam->date->toDateString() : 'TBA') . ' has been canceled.',
                        'is_read' => false,
                        'target_type' => 'user',
                        'target_user_id' => $tm->teacher->user->id,
                    ]);
                }
            }

            DB::transaction(function () use ($exam) {
                $exam->delete();
            });

            return response()->json(['message' => 'Exam deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete exam', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'exams' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('exams', []);
        $created = [];
        $errors = [];

        // track bookings in this batch to avoid intra-batch double-booking
        $batchBookings = [];

        foreach ($items as $index => $item) {
            $user = auth()->user();
            if (!isset($item['academic_year_id']) && $user) {
                $item['academic_year_id'] = $user->currentAcademicYearId();
            }
            if (!isset($item['semester_id']) && $user) {
                $item['semester_id'] = $user->currentSemesterId();
            }
            $v = Validator::make($item, [
                'module_code' => 'required|exists:modules,code',
                'group_code' => 'required|exists:groups,code',
                'room_id' => 'nullable|exists:rooms,id',
                'exam_type' => 'nullable|string|max:50',
                'date' => 'required|date',
                'start_hour' => 'required|numeric',
                'end_hour' => 'required|numeric|gt:start_hour',
                'validated' => 'nullable|boolean',
                    'academic_year_id' => 'required|exists:academic_years,id',
                    'semester_id' => 'required|exists:semesters,id',
                ]);

            if ($v->fails()) {
                $errors[] = ['index' => $index, 'status' => 'validation_failed', 'errors' => $v->errors()];
                continue;
            }

            // conflict check against DB
            if (!empty($item['room_id'])) {
                $dateOnly = Carbon::parse($item['date'])->toDateString();
                $conflict = $this->roomHasConflict($item['room_id'], $dateOnly, $item['start_hour'], $item['end_hour']);
                if ($conflict) {
                    $errors[] = ['index' => $index, 'status' => 'conflict', 'message' => 'Room already booked', 'conflict' => $conflict];
                    continue;
                }

                // check intra-batch conflicts
                $key = $item['room_id'] . '|' . $dateOnly;
                if (!isset($batchBookings[$key])) $batchBookings[$key] = [];
                $overlap = false;
                foreach ($batchBookings[$key] as $b) {
                    if ($this->intervalsOverlap($b['start'], $b['end'], $item['start_hour'], $item['end_hour'])) {
                        $overlap = true; break;
                    }
                }
                if ($overlap) {
                    $errors[] = ['index' => $index, 'status' => 'conflict', 'message' => 'Room already booked in this batch for same time'];
                    continue;
                }
                $batchBookings[$key][] = ['start' => $item['start_hour'], 'end' => $item['end_hour']];
            }

            try {
                DB::beginTransaction();
                $exam = Examen::create([
                    'module_code' => $item['module_code'],
                    'group_code' => $item['group_code'],
                    'room_id' => $item['room_id'] ?? null,
                    'exam_type' => $item['exam_type'] ?? 'Normal',
                    'date' => $item['date'],
                    'start_hour' => $item['start_hour'],
                    'end_hour' => $item['end_hour'],
                    'academic_year_id' => $item['academic_year_id'],
                    'semester_id' => $item['semester_id'],
                    'validated' => $item['validated'] ?? false,
                ]);
                DB::commit();

                // Send notification to admins
                $module = Module::find($item['module_code']);
                $group = Groupe::find($item['group_code']);
                Notification::create([
                    'user_id' => auth()->user()->id,
                    'title' => 'New Exam Created',
                    'message' => 'A new exam has been created: ' . ($module ? $module->name : $item['module_code']) . ' for group ' . ($group ? $group->name : $item['group_code']),
                    'is_read' => false,
                    'target_type' => 'role',
                    'target_role' => 'admin',
                ]);

                $created[] = ['index' => $index, 'exam' => $exam];
            } catch (\Exception $e) {
                DB::rollBack();
                $errors[] = ['index' => $index, 'status' => 'failed', 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'total_received' => count($items),
            'created_count' => count($created),
            'created' => $created,
            'errors' => $errors,
        ]);
    }

    private function roomHasConflict($roomId, $dateOnly, $startHour, $endHour, $excludeId = null)
    {
        $query = Examen::where('room_id', $roomId)
            ->whereDate('date', $dateOnly)
            ->where(function ($q) use ($startHour, $endHour) {
                $q->where('start_hour', '<', $endHour)
                  ->where('end_hour', '>', $startHour);
            });

        if ($excludeId) $query->where('id', '!=', $excludeId);

        $conflict = $query->first();
        if (!$conflict) return null;

        return [
            'id' => $conflict->id,
            'module_code' => $conflict->module_code,
            'group_code' => $conflict->group_code,
            'start_hour' => $conflict->start_hour,
            'end_hour' => $conflict->end_hour,
            'date' => $conflict->date ? $conflict->date->toDateTimeString() : null,
        ];
    }

    private function intervalsOverlap($aStart, $aEnd, $bStart, $bEnd)
    {
        return ($aStart < $bEnd) && ($aEnd > $bStart);
    }

    public function sendExamSchedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'pdf_base64' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => 'Invalid data', 'details' => $validator->errors()], 400);
        }

        try {
            // Decode the Base64 PDF
            $pdfData = base64_decode($request->pdf_base64);
            $pdfPath = storage_path('app/temp_exam_schedule.pdf');
            file_put_contents($pdfPath, $pdfData);

            // Get all teacher and student emails
            $teacherEmails = User::where('role', 'teacher')->whereNotNull('email')->pluck('email')->toArray();
            $studentEmails = User::where('role', 'student')->whereNotNull('email')->pluck('email')->toArray();
            $allEmails = array_merge($teacherEmails, $studentEmails);

            if (empty($allEmails)) {
                return response()->json(['error' => 'No emails found'], 400);
            }

            // Send email to all
            Mail::to('noreply@example.com')->bcc($allEmails)->send(new ExamScheduleMail($pdfPath));

            // Clean up temp file
            if (file_exists($pdfPath)) {
                unlink($pdfPath);
            }

            return response()->json(['message' => 'Exam schedule sent successfully to ' . count($allEmails) . ' recipients']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to send email', 'details' => $e->getMessage()], 500);
        }
    }
}
