<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TeacherController extends Controller
{
    /**
     * Create a new teacher (and associated user).
     */
    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'number' => 'required|string|max:40|unique:teachers,number',
            'fname' => 'required|string|max:20',
            'lname' => 'required|string|max:20',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:20|unique:users,phone',
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:10',
            'image' => 'nullable|string|max:255',
            'adj' => 'nullable|string|max:10',
            'speciality_id' => 'nullable|exists:specialities,id',
            'position' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Always create a new user first, then create teacher in a transaction.
        try {
            $result = DB::transaction(function () use ($request) {
                $user = User::create([
                    'fname' => $request->fname,
                    'lname' => $request->lname,
                    'birth_date' => $request->birth_date,
                    'gender' => $request->gender,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'phone' => $request->phone,
                    'image' => $request->image,
                    'role' => 'teacher',
                ]);

                $teacher = Teacher::create([
                    'number' => $request->number,
                    'user_id' => $user->id,
                    'adj' => $request->adj ?? 'Mr',
                    'speciality_id' => $request->speciality_id,
                    'position' => $request->position,
                ]);

                return [$user, $teacher];
            });

            [$user, $teacher] = $result;

            return response()->json([
                'message' => 'Teacher created successfully',
                'teacher' => $teacher->load('user', 'speciality')
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Return all teachers in the requested format.
     */
    public function index(Request $request)
    {
        // Only authenticated users can view teacher list
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $teachers = Teacher::with(['user', 'speciality.department'])->orderBy('number', 'desc')->get();

        $data = $teachers->map(function ($t) {
            $user = $t->user;
            $speciality = $t->speciality;
            $department = $speciality && $speciality->department ? $speciality->department->name : null;

            return [
                'fname' => $user->fname ?? null,
                'lname' => $user->lname ?? null,
                'adj' => $t->adj ?? null,
                'number' => (string) $t->number,
                'departement' => $department,
                'position' => $t->position ?? null,
                'speciality' => $speciality->name ?? null,
                'phone' => $user->phone ?? null,
                'email' => $user->email ?? null,
                'image' => $user->image ?? null,
            ];
        })->toArray();

        return response()->json([
            'total' => count($data),
            'teachers' => $data,
        ]);
    }

    /**
     * Bulk create teachers. Expects JSON: { "teachers": [ { ... }, ... ] }
     * Returns created items and per-item errors.
     */
    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'teachers' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $items = $request->input('teachers', []);
        $created = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'number' => 'required|string|max:40|unique:teachers,number',
                'fname' => 'required|string|max:50',
                'lname' => 'required|string|max:50',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6',
                'phone' => 'nullable|string|max:20|unique:users,phone',
                'birth_date' => 'nullable|date',
                'gender' => 'nullable|string|max:10',
                'image' => 'nullable|string|max:255',
                'adj' => 'nullable|string|max:10',
                'speciality_id' => 'nullable|exists:specialities,id',
                'position' => 'nullable|string|max:100',
            ]);

            if ($v->fails()) {
                $errors[] = [
                    'index' => $index,
                    'status' => 'validation_failed',
                    'errors' => $v->errors()
                ];
                continue;
            }

            try {
                DB::beginTransaction();

                $user = User::create([
                    'fname' => $item['fname'],
                    'lname' => $item['lname'],
                    'birth_date' => $item['birth_date'] ?? null,
                    'gender' => $item['gender'] ?? null,
                    'email' => $item['email'],
                    'password' => Hash::make($item['password']),
                    'phone' => $item['phone'] ?? null,
                    'image' => $item['image'] ?? null,
                    'role' => 'teacher',
                ]);

                $teacher = Teacher::create([
                    'number' => $item['number'],
                    'user_id' => $user->id,
                    'adj' => $item['adj'] ?? 'Mr',
                    'speciality_id' => $item['speciality_id'] ?? null,
                    'position' => $item['position'] ?? null,
                ]);

                DB::commit();

                // Map to the same response shape as index
                $spec = $teacher->speciality;
                $dept = $spec && $spec->department ? $spec->department->name : null;

                $created[] = [
                    'index' => $index,
                    'teacher' => [
                        'fname' => $user->fname,
                        'lname' => $user->lname,
                        'adj' => $teacher->adj,
                        'number' => (string) $teacher->number,
                        'departement' => $dept,
                        'position' => $teacher->position,
                        'speciality' => $spec->name ?? null,
                        'phone' => $user->phone,
                        'email' => $user->email,
                        'image' => $user->image,
                    ]
                ];
            } catch (\Exception $e) {
                DB::rollBack();
                $errors[] = [
                    'index' => $index,
                    'status' => 'failed',
                    'message' => $e->getMessage()
                ];
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
     * Update a teacher and the associated user.
     * Sequence: update `users` table first, then `teachers` table.
     */
    public function update(Request $request, $number)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $teacher = Teacher::where('number', $number)->first();
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found'], 404);
        }

        $user = $teacher->user;

        $validator = Validator::make(array_merge($request->all(), ['number' => $number]), [
            'number' => "required|string|max:40|unique:teachers,number,{$teacher->number},number",
            'fname' => 'nullable|string|max:50',
            'lname' => 'nullable|string|max:50',
            'email' => "nullable|email|unique:users,email,{$user->id}",
            'phone' => "nullable|string|max:20|unique:users,phone,{$user->id}",
            'birth_date' => 'nullable|date',
            'gender' => 'nullable|string|max:10',
            'image' => 'nullable|string|max:255',
            'adj' => 'nullable|string|max:10',
            'speciality_id' => 'nullable|exists:specialities,id',
            'position' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        try {
            $result = DB::transaction(function () use ($request, $teacher, $user) {
                // Update user first
                $user->fname = $request->filled('fname') ? $request->fname : $user->fname;
                $user->lname = $request->filled('lname') ? $request->lname : $user->lname;
                if ($request->filled('email')) $user->email = $request->email;
                if ($request->filled('phone')) $user->phone = $request->phone;
                if ($request->filled('birth_date')) $user->birth_date = $request->birth_date;
                if ($request->filled('gender')) $user->gender = $request->gender;
                if ($request->filled('image')) $user->image = $request->image;
                if ($request->filled('password')) $user->password = Hash::make($request->password);
                $user->save();

                // Then update teacher
                if ($request->filled('number') && $request->number !== $teacher->number) {
                    $teacher->number = $request->number;
                }
                if ($request->filled('adj')) $teacher->adj = $request->adj;
                if ($request->filled('speciality_id')) $teacher->speciality_id = $request->speciality_id;
                if ($request->filled('position')) $teacher->position = $request->position;
                $teacher->save();

                return $teacher->fresh()->load('user', 'speciality.department');
            });

            return response()->json(['message' => 'Teacher updated', 'teacher' => $result]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update teacher', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a teacher and the associated user.
     * To avoid FK constraint issues we delete the teacher first, then the user, in a transaction.
     */
    public function destroy(Request $request, $number)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $teacher = Teacher::where('number', $number)->first();
        if (!$teacher) {
            return response()->json(['message' => 'Teacher not found'], 404);
        }

        try {
            DB::transaction(function () use ($teacher) {
                $user = $teacher->user;

                // Delete teacher first (child), then delete user (parent)
                $teacher->delete();

                if ($user) {
                    $user->delete();
                }
            });

            return response()->json(['message' => 'Teacher and associated user deleted'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }
}
