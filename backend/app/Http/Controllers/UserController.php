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
        $user = User::findOrFail($id);

        if (auth()->id() != $id && !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['user' => $user]);
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
        $notifications = $user->notifications()->orderBy('created_at', 'desc')->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function markNotificationsRead(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id'
        ]);

        $user = auth()->user();
        \App\Models\Notification::whereIn('id', $request->notification_ids)
            ->where('user_id', $user->id)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Notifications marked as read']);
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
                'theme' => 'light',
                'language' => 'en',
                'notifications' => true,
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
            'theme' => 'sometimes|string|in:light,dark',
            'language' => 'sometimes|string|max:10',
            'notifications' => 'sometimes|boolean',
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
