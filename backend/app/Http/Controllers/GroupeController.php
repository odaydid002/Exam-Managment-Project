<?php

namespace App\Http\Controllers;

use App\Models\Groupe;
use App\Models\GroupDelegate;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class GroupeController extends Controller
{
    public function index(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $q = Groupe::with(['section.speciality', 'students.speciality'])->withCount('students')->orderBy('name');

        if ($request->filled('section_id')) {
            $q->where('section_id', $request->input('section_id'));
        }

        if ($request->filled('speciality_id')) {
            $q->whereHas('students', function ($sq) use ($request) {
                $sq->where('speciality_id', $request->input('speciality_id'));
            });
        } elseif ($request->filled('speciality')) {
            $q->whereHas('students.speciality', function ($ssq) use ($request) {
                $ssq->where('name', 'like', '%' . $request->input('speciality') . '%');
            });
        }

        if ($request->filled('members_min')) {
            $q->having('students_count', '>=', intval($request->input('members_min')));
        }
        if ($request->filled('members_max')) {
            $q->having('students_count', '<=', intval($request->input('members_max')));
        }

        $groups = $q->get();

        $data = $groups->map(function ($g) {
            // speciality: prefer section.speciality, fallback to first student's speciality
            $speciality = null;
            if ($g->section && isset($g->section->speciality) && $g->section->speciality) {
                $speciality = $g->section->speciality->name;
            } else {
                $firstStudent = $g->students->first();
                if ($firstStudent && $firstStudent->speciality) {
                    $speciality = $firstStudent->speciality->name;
                }
            }

            // delegates: may be zero, one or multiple
            $delegates = GroupDelegate::where('group_code', $g->code)
                ->with('student.user')
                ->get()
                ->map(function ($d) {
                    $student = $d->student;
                    $user = $student ? $student->user : null;
                    return [
                        'id' => $student ? $student->number : null,
                        'fname' => $user ? $user->fname : null,
                        'lname' => $user ? $user->lname : null,
                        'image' => $user ? ($user->image ?? null) : null,
                    ];
                })->toArray();

            return [
                'code' => $g->code,
                'name' => $g->name,
                'level' => $g->section ? ($g->section->level ?? null) : null,
                'speciality' => $speciality,
                'section' => $g->section ? $g->section->name : null,
                'members' => $g->students_count ?? 0,
                'delegate' => $delegates,
            ];
        })->toArray();

        return response()->json(['total' => count($data), 'groups' => $data]);
    }

    public function show($code)
    {
        $g = Groupe::with(['section', 'students.speciality'])->find($code);
        if (!$g) return response()->json(['message' => 'Group not found'], 404);

        $speciality = null;
        $firstStudent = $g->students->first();
        if ($firstStudent && $firstStudent->speciality) {
            $speciality = $firstStudent->speciality->name;
        }

        $delegates = GroupDelegate::where('group_code', $g->code)
            ->with('student.user')
            ->get()
            ->map(function ($d) {
                $student = $d->student;
                $user = $student ? $student->user : null;
                return [
                    'id' => $student ? $student->number : null,
                    'fname' => $user ? $user->fname : null,
                    'lname' => $user ? $user->lname : null,
                    'image' => $user ? ($user->image ?? null) : null,
                ];
            })->toArray();

        return response()->json([
            'code' => $g->code,
            'name' => $g->name,
            'level' => $g->section ? ($g->section->level ?? null) : null,
            'speciality' => $speciality,
            'section' => $g->section ? $g->section->name : null,
            'members' => $g->students()->count(),
            'delegate' => $delegates,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'code' => 'required|string|max:20|unique:groups,code',
            'name' => 'required|string|max:100',
            'section_id' => 'required|exists:sections,id',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $group = Groupe::create([
            'code' => $request->code,
            'name' => $request->name,
            'section_id' => $request->section_id,
        ]);

        return response()->json(['message' => 'Group created', 'group' => $group], 201);
    }

    public function update(Request $request, $code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group = Groupe::find($code);
        if (!$group) return response()->json(['message' => 'Group not found'], 404);

        $v = Validator::make($request->all(), [
            'name' => "nullable|string|max:100",
            'section_id' => 'nullable|exists:sections,id',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        if ($request->filled('name')) $group->name = $request->name;
        if ($request->filled('section_id')) $group->section_id = $request->section_id;
        // level is derived from the linked section; do not accept level here
        $group->save();

        return response()->json(['message' => 'Group updated', 'group' => $group]);
    }

    public function destroy($code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $group = Groupe::find($code);
        if (!$group) return response()->json(['message' => 'Group not found'], 404);

        try {
            DB::transaction(function () use ($group) {
                $group->delete();
            });
            return response()->json(['message' => 'Group deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'groups' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('groups', []);
        $created = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'code' => 'required|string|max:20|unique:groups,code',
                'name' => 'required|string|max:100',
                'section_id' => 'required|exists:sections,id',
            ]);

            if ($v->fails()) {
                $errors[] = ['index' => $index, 'status' => 'validation_failed', 'errors' => $v->errors()];
                continue;
            }

            try {
                DB::beginTransaction();
                $group = Groupe::create([
                    'code' => $item['code'],
                    'name' => $item['name'],
                    'section_id' => $item['section_id'],
                ]);
                DB::commit();
                $created[] = ['index' => $index, 'group' => $group];
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

    public function setDelegate(Request $request, $code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'student_number' => 'required|exists:students,number',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $student = Student::find($request->student_number);
        if (!$student) return response()->json(['message' => 'Student not found'], 404);

        if ($student->group_code !== $code) {
            return response()->json(['message' => 'Student does not belong to this group'], 422);
        }

        $existing = GroupDelegate::where('student_number', $student->number)->first();
        if ($existing && $existing->group_code !== $code) {
            return response()->json(['message' => 'Student is already delegate of another group'], 422);
        }

        try {
            DB::transaction(function () use ($code, $student) {
                GroupDelegate::where('group_code', $code)->delete();

                GroupDelegate::create([
                    'group_code' => $code,
                    'student_number' => $student->number,
                    'assigned_at' => now(),
                ]);
            });

            $delegate = GroupDelegate::where('group_code', $code)->first();
            return response()->json(['message' => 'Delegate assigned', 'delegate' => $delegate]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to assign delegate', 'error' => $e->getMessage()], 500);
        }
    }

    public function removeDelegate($code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $delegate = GroupDelegate::where('group_code', $code)->first();
        if (!$delegate) return response()->json(['message' => 'No delegate for this group'], 404);

        try {
            DB::transaction(function () use ($delegate) {
                $delegate->delete();
            });
            return response()->json(['message' => 'Delegate removed']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to remove delegate', 'error' => $e->getMessage()], 500);
        }
    }

    public function changeDelegate(Request $request, $code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'student_number' => 'required|exists:students,number',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $student = Student::find($request->student_number);
        if (!$student) return response()->json(['message' => 'Student not found'], 404);

        if ($student->group_code !== $code) {
            return response()->json(['message' => 'Student does not belong to this group'], 422);
        }

        try {
            DB::transaction(function () use ($code, $student) {
                GroupDelegate::where('group_code', $code)->delete();

                GroupDelegate::where('student_number', $student->number)->delete();

                GroupDelegate::create([
                    'group_code' => $code,
                    'student_number' => $student->number,
                    'assigned_at' => now(),
                ]);
            });

            $delegate = GroupDelegate::where('group_code', $code)->first();
            return response()->json(['message' => 'Delegate changed', 'delegate' => $delegate]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to change delegate', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignStudent(Request $request, $code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'student_number' => 'required|exists:students,number',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $group = Groupe::find($code);
        if (!$group) return response()->json(['message' => 'Group not found'], 404);

        $student = Student::find($request->student_number);
        if (!$student) return response()->json(['message' => 'Student not found'], 404);

        try {
            DB::transaction(function () use ($student, $group) {
                $student->group_code = $group->code;
                $student->save();
            });

            // refresh counts
            $members = $group->students()->count();

            return response()->json([
                'message' => 'Student assigned to group',
                'student' => $student,
                'group_members' => $members,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to assign student', 'error' => $e->getMessage()], 500);
        }
    }
}
