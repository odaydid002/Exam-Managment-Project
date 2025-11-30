<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    use HasFactory;

    protected $table = 'modules';
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name',
        'short_name',
        'type',
        'factor',
        'credits',
    ];

    public function examens()
    {
        return $this->hasMany(Examen::class, 'module_code', 'code');
    }

    public function teacherModules()
    {
        return $this->hasMany(TeacherModule::class, 'module_code', 'code');
    }
}
