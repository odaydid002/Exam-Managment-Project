<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    use HasFactory;

    protected $table = 'academic_years';

    protected $fillable = [
        'start_year',
        'end_year',
    ];

    public function semesters()
    {
        return $this->hasMany(Semester::class, 'academic_year_id');
    }

    public function sections()
    {
        return $this->hasMany(Section::class, 'academic_year_id');
    }

    public function groups()
    {
        return $this->hasMany(Groupe::class, 'academic_year_id');
    }

    public function exams()
    {
        return $this->hasMany(Examen::class, 'academic_year_id');
    }

    public function generalSettings()
    {
        return $this->hasMany(GeneralSetting::class, 'academic_year_id');
    }
}
