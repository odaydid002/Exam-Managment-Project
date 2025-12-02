<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $table = 'sections';

    protected $fillable = [
        'name',
        'level',
        'speciality_id',
    ];

    public function groups()
    {
        return $this->hasMany(Groupe::class, 'section_id');
    }

    public function speciality()
    {
        return $this->belongsTo(\App\Models\Speciality::class, 'speciality_id');
    }
}
