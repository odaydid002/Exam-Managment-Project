<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * Return all students in a similar shape to teachers.
     */
    public function index(Request $request)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $q = Student::with(['user', 'group', 'speciality.department'])->orderBy('number', 'desc');

        // filters: department (id or name), level, speciality_id or speciality
        if ($request->filled('level')) {
            $q->where('level', $request->input('level'));
        }

        if ($request->filled('speciality_id')) {
            $q->where('speciality_id', $request->input('speciality_id'));
        } elseif ($request->filled('speciality')) {
            $q->whereHas('speciality', function ($sq) use ($request) {
                $sq->where('name', 'like', '%' . $request->input('speciality') . '%');
            });
        }

        if ($request->filled('department_id')) {
            $q->whereHas('speciality.department', function ($dq) use ($request) {
                $dq->where('id', $request->input('department_id'));
            });
        } elseif ($request->filled('department')) {
            $q->whereHas('speciality.department', function ($dq) use ($request) {
                $dq->where('name', 'like', '%' . $request->input('department') . '%');
            });
        }

        if ($request->filled('group_code')) {
            $q->where('group_code', $request->input('group_code'));
        }

        $students = $q->get();

        $data = $students->map(function ($s) {
            $user = $s->user;
            $group = $s->group;
            $speciality = $s->speciality;
            $department = $speciality && method_exists($speciality, 'department') ? $speciality->department : null;
            return [
                'id' => $user->id ?? null,
                'fname' => $user->fname ?? null,
                'lname' => $user->lname ?? null,
                'newbie' => $user->newbie ?? true,
                'number' => (string) $s->number,
                'group_code' => $group->code ?? null,
                'group_name' => $group->name ?? null,
                'speciality' => $speciality->name ?? null,
                'department' => $department->name ?? null,
                'level' => $s->level ?? null,
                'phone' => $user->phone ?? null,
                'email' => $user->email ?? null,
                'address' => $user->address ?? null,
                'image' => $user->image ?? null,
                'settings' => $user->setting ?? null,
            ];
        })->toArray();

        return response()->json([
            'total' => count($data),
            'students' => $data,
        ]);
    }

    /**
     * Create a single student (and associated user).
     */
    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'number' => 'required|string|max:40|unique:students,number',
            'fname' => 'required|string|max:50',
            'lname' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:10',
            'image' => 'nullable|string|max:255',
            'group_code' => 'nullable|exists:groups,code',
            'speciality_id' => 'nullable|exists:specialities,id',
            'level' => 'nullable|string|max:50',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        try {
            $result = DB::transaction(function () use ($request) {
                $adminDepartmentId = auth()->user()->department_id ?? null;
                $user = User::create([
                    'fname' => $request->fname,
                    'lname' => $request->lname,
                    'birth_date' => $request->birth_date ?? null,
                    'gender' => $request->gender ?? null,
                    'email' => $request->email,
                    'password' => Hash::make((string) $request->password),
                    'phone' => $request->phone ?? null,
                    'image' => $request->image ?? null,
                    'role' => 'student',
                    'department_id' => $adminDepartmentId,
                    'newbie' => true,
                ]);

                $student = Student::create([
                    'number' => $request->number,
                    'user_id' => $user->id,
                    'group_code' => $request->group_code ?? null,
                    'speciality_id' => $request->speciality_id ?? null,
                    'level' => $request->level ?? null,
                ]);

                return $student->load('user', 'group', 'speciality');
            });

            return response()->json(['message' => 'Student created', 'student' => $result], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create student', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Bulk create students. Expects { students: [ ... ] }
     */
    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'students' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('students', []);
        $created = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'number' => 'required|int|unique:students,number',
                'fname' => 'required|string|max:50',
                'lname' => 'required|string|max:50',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|max:20|unique:users,phone',
                'birth_date' => 'nullable|date',
                'gender' => 'nullable|string|max:10',
                'image' => 'nullable|string|max:255',
                'group_code' => 'nullable|exists:groups,code',
                'speciality_id' => 'nullable|exists:specialities,id',
                'level' => 'nullable|string|max:50',
            ]);

            if ($v->fails()) {
                $errors[] = ['index' => $index, 'status' => 'validation_failed', 'errors' => $v->errors()];
                continue;
            }

            try {
                DB::beginTransaction();

                $adminDepartmentId = auth()->user()->department_id ?? null;
                $user = User::create([
                    'fname' => $item['fname'],
                    'lname' => $item['lname'],
                    'birth_date' => $item['birth_date'] ?? null,
                    'gender' => $item['gender'] ?? null,
                    'email' => $item['email'],
                    'password' => Hash::make((string) $item['password']),
                    'phone' => $item['phone'] ?? null,
                    'image' => $item['image'] ?? null,
                    'role' => 'student',
                    'department_id' => $adminDepartmentId,
                    'newbie' => true,
                ]);

                $student = Student::create([
                    'number' => $item['number'],
                    'user_id' => $user->id,
                    'group_code' => $item['group_code'] ?? null,
                    'speciality_id' => $item['speciality_id'] ?? null,
                    'level' => $item['level'] ?? null,
                ]);

                DB::commit();

                $created[] = ['index' => $index, 'student' => $student->load('user', 'group', 'speciality')];
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

    /**
     * Update a student and associated user. Updates user first then student.
     */
    public function update(Request $request, $number)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = Student::where('number', $number)->first();
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $user = $student->user;

        $validator = Validator::make(array_merge($request->all(), ['number' => $number]), [
            'number' => "required|string|max:40|unique:students,number,{$student->number},number",
            'fname' => 'nullable|string|max:50',
            'lname' => 'nullable|string|max:50',
            'email' => "nullable|email|unique:users,email,{$user->id}",
            'phone' => "nullable|string|max:20|unique:users,phone,{$user->id}",
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:10',
            'image' => 'nullable|string|max:255',
            'group_code' => 'nullable|exists:groups,code',
            'speciality_id' => 'nullable|exists:specialities,id',
            'level' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        try {
            $result = DB::transaction(function () use ($request, $student, $user) {
                $adminDepartmentId = auth()->user()->department_id ?? null;
                // update user
                $user->fname = $request->filled('fname') ? $request->fname : $user->fname;
                $user->lname = $request->filled('lname') ? $request->lname : $user->lname;
                if ($request->filled('email')) $user->email = $request->email;
                if ($request->filled('phone')) $user->phone = $request->phone;
                if ($request->filled('birth_date')) $user->birth_date = $request->birth_date;
                if ($request->filled('gender')) $user->gender = $request->gender;
                if ($request->filled('image')) $user->image = $request->image;
                if ($request->filled('password')) $user->password = Hash::make((string) $request->password);
                if (!$user->department_id) $user->department_id = $adminDepartmentId;
                $user->save();

                // update student
                if ($request->filled('number') && $request->number !== $student->number) {
                    $student->number = $request->number;
                }
                if ($request->filled('group_code')) $student->group_code = $request->group_code;
                if ($request->filled('speciality_id')) $student->speciality_id = $request->speciality_id;
                if ($request->filled('level')) $student->level = $request->level;
                $student->save();

                return $student->fresh()->load('user', 'group', 'speciality');
            });

            return response()->json(['message' => 'Student updated', 'student' => $result]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update student', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a student and the associated user.
     */
    public function destroy(Request $request, $number)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = Student::where('number', $number)->first();
        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        try {
            DB::transaction(function () use ($student) {
                $user = $student->user;
                $student->delete();
                if ($user) $user->delete();
            });

            return response()->json(['message' => 'Student and associated user deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Show student or user by student number or user id.
     */
    public function show($identifier)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = Student::with(['user', 'group', 'speciality'])->where('number', $identifier)->first();
        if ($student) {
            $user = $student->user;
            $group = $student->group;
            $speciality = $student->speciality;

            $department = $speciality && method_exists($speciality, 'department') ? $speciality->department : null;

            return response()->json([
                'id' => $user->id ?? null,
                'fname' => $user->fname ?? null,
                'lname' => $user->lname ?? null,
                'newbie' => $user->newbie ?? true,
                'number' => (string) $student->number,
                'group_code' => $group->code ?? null,
                'group_name' => $group->name ?? null,
                'groupe_name' => $group->name ?? null,
                'section_name' => ($group && method_exists($group, 'section') && $group->section) ? $group->section->name : null,
                'speciality' => $speciality->name ?? null,
                'department' => $department->name ?? null,
                'level' => $student->level ?? null,
                'phone' => $user->phone ?? null,
                'email' => $user->email ?? null,
                'address' => $user->address ?? null,
                'image' => $user->image ?? null,
                'settings' => $user->setting ?? null,
            ]);
        }

        $user = \App\Models\User::find($identifier);
        if (!$user) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $student = $user->student ? $user->student->load('group', 'speciality') : null;
        if (!$student) {
            return response()->json(['user' => $user]);
        }

        $group = $student->group;
        $speciality = $student->speciality;

        $department = $speciality && method_exists($speciality, 'department') ? $speciality->department : null;

        return response()->json([
            'fname' => $user->fname ?? null,
            'lname' => $user->lname ?? null,
            'newbie' => $user->newbie ?? true,
            'number' => (string) $student->number,
            'group_code' => $group->code ?? null,
            'group_name' => $group->name ?? null,
            'groupe_name' => $group->name ?? null,
            'section_name' => ($group && method_exists($group, 'section') && $group->section) ? $group->section->name : null,
            'speciality' => $speciality->name ?? null,
            'department' => $department->name ?? null,
            'department_id' => $department->id ?? null,
            'level' => $student->level ?? null,
            'phone' => $user->phone ?? null,
            'email' => $user->email ?? null,
            'image' => $user->image ?? null,
        ]);
    }

    /**
     * Return exams for a student identified by their student number or user id.
     */
    public function exams($identifier)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $student = Student::with(['group'])->where('number', $identifier)->first();
        if (!$student) {
            $user = \App\Models\User::find($identifier);
            if ($user && $user->student) {
                $student = $user->student->load('group');
            }
        }

        if (!$student) {
            return response()->json(['message' => 'Student not found'], 404);
        }

        $groupCode = $student->group_code;
        if (!$groupCode) {
            return response()->json(['total' => 0, 'exams' => []]);
        }

        $exams = \App\Models\Examen::with(['module', 'salle', 'surveillances.teacher.user'])
            ->where('group_code', $groupCode)
            ->where('validated', true)
            ->orderBy('date')
            ->get();

        $data = $exams->map(function ($e) {
            $survs = $e->surveillances->map(function ($s) {
                $teacher = $s->teacher;
                $user = $teacher ? $teacher->user : null;
                $name = $user ? trim(($user->fname ?? '') . ' ' . ($user->lname ?? '')) : null;
                $pronoun = null;
                if ($teacher && !empty($teacher->adj)) {
                    $pronoun = $teacher->adj;
                } else {
                    $gender = $user->gender ?? null;
                    if ($gender) {
                        $g = strtolower($gender);
                        if (in_array($g, ['f', 'female', 'woman', 'feminine'])) $pronoun = 'Ms';
                        elseif (in_array($g, ['m', 'male', 'man', 'masculine'])) $pronoun = 'Mr';
                    }
                }
                return [
                    'name' => $name,
                    'pronoun' => $pronoun,
                    'image' => $user ? ($user->image ?? null) : null,
                ];
            })->toArray();

            return [
                'module_name' => $e->module ? $e->module->name : null,
                'module_credit' => $e->module ? $e->module->credits : null,
                'module_factor' => $e->module ? $e->module->factor : null,
                'exam_type' => $e->exam_type,
                'date' => $e->date ? $e->date->toDateString() : null,
                'startHour' => $e->start_hour,
                'endHour' => $e->end_hour,
                'room' => $e->salle ? $e->salle->name : null,
                'surveillances' => $survs,
            ];
        })->toArray();

        return response()->json($data);
    }
}
