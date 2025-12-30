<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;

class UserController extends Controller
{
    public function getProfile($id)
    {
        $user = User::with(['setting', 'department', 'student.group.speciality.department', 'teacher.speciality.department'])->findOrFail($id);

        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $response = [
            'id' => $user->id,
            'fname' => $user->fname,
            'lname' => $user->lname,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address ?? null,
            'image' => $user->image ?? null,
            'role' => $user->role ?? null,
            'birth_date' => $user->birth_date ? $user->birth_date->toDateString() : null,
            'gender' => $user->gender ?? null,
            'settings' => $user->setting ?? null,
            'department_id' => $user->department_id ?? null,
            'department' => $user->department ? ['id' => $user->department->id, 'name' => $user->department->name] : null,
        ];

        if ($user->student) {
            $s = $user->student;
            $group = $s->group;
            $speciality = $s->speciality;
            $department = $speciality && $speciality->department ? $speciality->department->name : null;

            $response['student'] = [
                'number' => (string) $s->number,
                'group_code' => $group->code ?? null,
                'group_name' => $group->name ?? null,
                'speciality' => $speciality->name ?? null,
                'department' => $department,
                'level' => $s->level ?? null,
            ];
        }

        if ($user->teacher) {
            $t = $user->teacher;
            $speciality = $t->speciality;
            $department = $speciality && $speciality->department ? $speciality->department->name : null;

            $response['teacher'] = [
                'number' => (string) $t->number,
                'adj' => $t->adj ?? null,
                'speciality' => $speciality->name ?? null,
                'department' => $department,
                'position' => $t->position ?? null,
            ];
        }

        return response()->json(['user' => $response]);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() != $id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'fname' => 'sometimes|string|max:20',
            'lname' => 'sometimes|string|max:20',
            'birth_date' => 'sometimes|date',
            'gender' => 'sometimes|string|max:10',
            'address' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'phone' => 'sometimes|string|max:20|unique:users,phone,' . $id,
            'current_password' => 'required_with:password',
            'password' => 'sometimes|confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }


        if ($request->has('password')) {
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect'], 422);
            }
            $user->password = Hash::make($request->password);
        }

        $data = $request->except(['password', 'current_password', 'password_confirmation']);
        $user->fill($data);
        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function deleteAccount($id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }

    public function notifications()
    {
        $user = auth()->user();

        $notifications = \App\Models\Notification::where(function ($q) use ($user) {
            $q->where('target_type', 'all')
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('target_type', 'role')
                     ->where('target_role', $user->role);
              })
              ->orWhere(function ($q3) use ($user) {
                  $q3->where('target_type', 'user')
                     ->where('target_user_id', $user->id);
              })
              ->orWhere(function ($q4) use ($user) {
                  // legacy: notifications with user_id column set to recipient
                  $q4->where('user_id', $user->id);
              });
        })->orderBy('created_at', 'desc')->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function getNotificationsByUser($userId)
    {
        if (!auth()->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Check if user is admin or requesting their own notifications
        if (auth()->user()->id != $userId && auth()->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $user = \App\Models\User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $notifications = \App\Models\Notification::where(function ($q) use ($user) {
            $q->where('target_type', 'all')
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('target_type', 'role')
                     ->where('target_role', $user->role);
              })
              ->orWhere(function ($q3) use ($user) {
                  $q3->where('target_type', 'user')
                     ->where('target_user_id', $user->id);
              })
              ->orWhere(function ($q4) use ($user) {
                  // legacy: notifications with user_id column set to recipient
                  $q4->where('user_id', $user->id)
                     ->whereNull('target_type');
              });
        })->orderBy('created_at', 'desc')->get();

        return response()->json(['user_id' => $userId, 'notifications' => $notifications]);
    }

    public function markNotificationsRead(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        $user = auth()->user();

        $ids = $request->notification_ids;
        $notifications = \App\Models\Notification::whereIn('id', $ids)->get();

        $allowed = $notifications->filter(function ($n) use ($user) {
            return $n->targetsUser($user) || $n->user_id == $user->id;
        })->pluck('id')->toArray();

        if (!empty($allowed)) {
            \App\Models\Notification::whereIn('id', $allowed)->update(['is_read' => true]);
        }

        return response()->json(['message' => 'Notifications marked as read', 'updated' => count($allowed)]);
    }

    /**
     * Update user password (user must provide current password unless admin)
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updatePassword(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Only allow owner or admin/employee to change password
        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $rules = [
            'password' => 'required|string|min:8|confirmed',
        ];

        // If the authenticated user is the owner, require either current_password or otp
        if (auth()->id() == $id) {
            $rules['current_password'] = 'required_without:otp|string';
            $rules['otp'] = 'required_without:current_password|digits:6';
        }

        $validator = Validator::make($request->all(), $rules);
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        if (auth()->id() == $id) {
            // Owner flow: either current_password or OTP must be valid
            if ($request->filled('current_password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json(['message' => 'Current password is incorrect'], 422);
                }
            } else {
                // Validate OTP from cache
                $cached = Cache::get('password_otp_' . $id);
                if (!$cached || (string) $cached !== (string) $request->otp) {
                    return response()->json(['message' => 'Invalid or expired OTP'], 422);
                }
                // consume OTP
                Cache::forget('password_otp_' . $id);
                Cache::forget('password_otp_verified_' . $id);
            }
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Send a one-time OTP to user's email for password change
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendPasswordOtp(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Only allow owner or admin/employee to request OTP
        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$user->email) {
            return response()->json(['message' => 'No email configured for this user'], 422);
        }

        try {
            $otp = random_int(100000, 999999);
            // store OTP for 10 minutes
            Cache::put('password_otp_' . $id, $otp, now()->addMinutes(10));

            Mail::raw("Your password change OTP is: {$otp}. It expires in 10 minutes.", function ($m) use ($user) {
                $m->to($user->email)
                    ->subject('Password change OTP')
                    ->from(config('mail.from.address'), config('mail.from.name'));
            });

            return response()->json(['success' => true, 'message' => 'OTP sent to user email']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Failed to send OTP: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Verify OTP sent to user's email
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function verifyPasswordOtp(Request $request, $id)
    {
        $request->validate([
            'otp' => 'required|digits:6',
        ]);

        $user = User::findOrFail($id);

        // Only allow owner or admin/employee to verify OTP
        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cached = Cache::get('password_otp_' . $id);
        if (!$cached || (string) $cached !== (string) $request->otp) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired OTP'], 422);
        }

        // mark as verified for short window (optional)
        Cache::put('password_otp_verified_' . $id, true, now()->addMinutes(10));

        return response()->json(['success' => true, 'message' => 'OTP verified']);
    }

    /**
     * Get user settings (owner or admin/employee)
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSettings($id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $setting = $user->setting;
        if (!$setting) {
            // return sensible defaults
            $setting = [
                'theme' => 'system',
                'language' => 'en',
                'notifications' => true,
                'exam_reminder' => false,
                'schedule_updates' => false,
                'login_alerts' => false,
                'two_factor_authentication' => false,
                'main_color' => '#1976d2',
            ];
            return response()->json(['settings' => $setting]);
        }

        return response()->json(['settings' => $setting]);
    }

    /**
     * Update user settings
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateSettings(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'theme' => 'sometimes|string|in:light,dark,system',
            'language' => 'sometimes|string|max:10',
            'notifications' => 'sometimes|boolean',
            'exam_reminder' => 'sometimes|boolean',
            'schedule_updates' => 'sometimes|boolean',
            'login_alerts' => 'sometimes|boolean',
            'two_factor_authentication' => 'sometimes|boolean',
            'main_color' => 'sometimes|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        $setting = $user->setting;
        if (!$setting) {
            $setting = new \App\Models\Setting();
            $setting->user_id = $user->id;
        }

        foreach ($data as $key => $value) {
            $setting->{$key} = $value;
        }

        $setting->save();

        return response()->json(['message' => 'Settings updated', 'settings' => $setting]);
    }
}
