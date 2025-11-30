<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherModule extends Model
{
    use HasFactory;

    protected $table = 'teacher_modules';

    protected $fillable = [
        'teacher_number',
        'module_code',
        'speciality_id',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_number', 'number');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_code', 'code');
    }

    public function speciality()
    {
        return $this->belongsTo(Speciality::class, 'speciality_id');
    }
}
