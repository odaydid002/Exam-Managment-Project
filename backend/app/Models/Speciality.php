<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Speciality extends Model
{
    use HasFactory;

    protected $table = 'specialities';

    protected $fillable = [
        'name',
        'short_name',
        'department_id',
        'description',
    ];

    public function department()
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class, 'speciality_id');
    }

    public function modules()
    {
        return $this->hasMany(TeacherModule::class, 'speciality_id');
    }
}
