<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Planning extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_planning';
    public $timestamps = true;

    protected $fillable = [
        'titre_planning',
        'date_creation',
        'date_validation',
        'etat',
        'id_chef'
    ];

    protected $casts = [
        'date_creation' => 'date',
        'date_validation' => 'date',
    ];

    public function chef()
    {
        return $this->belongsTo(User::class, 'id_chef');
    }

    public function examens()
    {
        return $this->hasMany(Examen::class, 'id_planning');
    }
}
