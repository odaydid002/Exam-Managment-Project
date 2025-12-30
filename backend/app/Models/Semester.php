<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    use HasFactory;

    protected $table = 'semesters';

    protected $fillable = [
        'name',
        'order',
        'academic_year_id',
    ];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class, 'academic_year_id');
    }

    public function exams()
    {
        return $this->hasMany(Examen::class, 'semester_id');
    }

    public function generalSettings()
    {
        return $this->hasMany(GeneralSetting::class, 'semester_id');
    }
}
