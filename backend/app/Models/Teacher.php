<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'teachers';

    protected $primaryKey = 'number';

    protected $fillable = [
        'number',
        'user_id',
        'adj',
        'speciality_id',
        'position',
    ];

    // `number` is provided manually and is not an auto-incrementing integer
    public $incrementing = false;
    protected $keyType = 'string';

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function speciality()
    {
        return $this->belongsTo(Speciality::class, 'speciality_id');
    }

    public function teacherModules()
    {
        return $this->hasMany(TeacherModule::class, 'teacher_number', 'number');
    }

    public function surveillances()
    {
        return $this->hasMany(Surveillance::class, 'teacher_number', 'number');
    }
}
