<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $table = 'settings';

    protected $fillable = [
        'user_id',
        'theme',
        'language',
        'notifications',
        'exam_reminder',
        'schedule_updates',
        'login_alerts',
        'two_factor_authentication',
        'main_color',
    ];

    protected $casts = [
        'notifications' => 'boolean',
        'exam_reminder' => 'boolean',
        'schedule_updates' => 'boolean',
        'login_alerts' => 'boolean',
        'two_factor_authentication' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
