<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Setting;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'fname',
        'lname',
        'email',
        'password',
        'phone',
        'address',
        'role',
        'birth_date',
        'gender',
        'image',
        'department_id',
        'newbie',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'birth_date' => 'date',
        'newbie' => 'boolean',
    ];

    /* ----------------------------
     | Relationships
     |---------------------------- */

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'user_id');
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'user_id');
    }

    public function setting()
    {
        return $this->hasOne(Setting::class, 'user_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    /* ----------------------------
     | Replaces MySQL Trigger
     |---------------------------- */

    protected static function booted()
    {
        static::created(function (User $user) {
            Setting::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'theme' => 'light',
                    'language' => 'en',
                    'notifications' => true,
                    'exam_reminder' => true,
                    'schedule_updates' => true,
                    'login_alerts' => true,
                    'two_factor_authentication' => false,
                ]
            );
        });
    }

    /* ----------------------------
     | Helpers
     |---------------------------- */

    public function currentGeneralSetting()
    {
        if (!$this->department_id) return null;

        return \App\Models\GeneralSetting::where('department_id', $this->department_id)
            ->orderByDesc('id')
            ->first();
    }

    public function currentAcademicYearId()
    {
        $gs = $this->currentGeneralSetting();
        return $gs ? $gs->academic_year_id : null;
    }

    public function currentSemesterId()
    {
        $gs = $this->currentGeneralSetting();
        return $gs ? $gs->semester_id : null;
    }

    public function hasRole($role)
    {
        return is_array($role)
            ? in_array($this->role, $role)
            : $this->role === $role;
    }
}
