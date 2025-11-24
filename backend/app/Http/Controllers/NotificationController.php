<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::with(['utilisateur', 'examen'])
                                   ->where('id_utilisateur', auth()->id())
                                   ->orderBy('created_at', 'desc')
                                   ->get();

        return response()->json(['notifications' => $notifications]);
    }

    public function markAsRead(Request $request)
    {
        $request->validate([
            'notification_ids' => 'required|array',
            'notification_ids.*' => 'exists:notifications,id_notification'
        ]);

        Notification::whereIn('id_notification', $request->notification_ids)
                   ->where('id_utilisateur', auth()->id())
                   ->update(['lu' => true]);

        return response()->json(['message' => 'Notifications marked as read']);
    }
}
