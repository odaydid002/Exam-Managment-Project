<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groupe extends Model
{
    use HasFactory;

    protected $table = 'groups';
    protected $primaryKey = 'code';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'code',
        'name',
        'section_id',
    ];

    public function examens()
    {
        return $this->hasMany(Examen::class, 'group_code', 'code');
    }

    public function section()
    {
        return $this->belongsTo(Section::class, 'section_id');
    }

    public function students()
    {
        return $this->hasMany(\App\Models\Student::class, 'group_code', 'code');
    }
}
