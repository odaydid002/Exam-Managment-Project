<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Examen extends Model
{
    use HasFactory;
    protected $table = 'exams';

    protected $fillable = [
        'module_code',
        'group_code',
        'room_id',
        'exam_type',
        'date',
        'start_hour',
        'end_hour',
        'validated',
        'academic_year_id',
        'semester_id',
    ];

    protected $casts = [
        'date' => 'datetime',
        'start_hour' => 'float',
        'end_hour' => 'float',
        'validated' => 'boolean',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'module_code', 'code');
    }

    public function salle()
    {
        return $this->belongsTo(Salle::class, 'room_id', 'id');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'group_code', 'code');
    }

    public function surveillances()
    {
        return $this->hasMany(Surveillance::class, 'exam_id');
    }
}
