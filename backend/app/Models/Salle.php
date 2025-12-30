<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salle extends Model
{
    use HasFactory;

    protected $table = 'rooms';

    protected $fillable = [
        'name',
        'capacity',
        'disabled',
        'type',
    ];

    protected $casts = [
        'disabled' => 'boolean',
    ];

    public function examens()
    {
        return $this->hasMany(Examen::class, 'room_id');
    }
}
