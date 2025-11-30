<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $table = 'departments';

    protected $fillable = [
        'name',
    ];

    public function specialities()
    {
        return $this->hasMany(Speciality::class, 'department_id');
    }

    public function generalSettings()
    {
        return $this->hasMany(GeneralSetting::class, 'department_id');
    }
}
