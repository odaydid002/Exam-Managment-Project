<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surveillance extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_surveillance';
    public $timestamps = true;

    protected $fillable = [
        'id_enseignant',
        'id_examen'
    ];

    public function enseignant()
    {
        return $this->belongsTo(User::class, 'id_enseignant');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'id_examen');
    }
}
