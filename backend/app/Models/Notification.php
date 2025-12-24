<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Notification extends Model
{
    use HasFactory;
    protected $table = 'notifications';

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'is_read',
        'target_type',
        'target_role',
        'target_user_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'exam_id');
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    /**
     * Determine whether the notification targets the given user.
     *
     * @param \App\Models\User $user
     * @return bool
     */
    public function targetsUser(User $user)
    {
        if ($this->target_type === 'all') return true;
        if ($this->target_type === 'user' && $this->target_user_id == $user->id) return true;
        if ($this->target_type === 'role' && $this->target_role && $user->role === $this->target_role) return true;
        return false;
    }
}
