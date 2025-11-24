<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $primaryKey = 'id_notification';
    public $timestamps = true;

    protected $fillable = [
        'message',
        'date_envoi',
        'type_notification',
        'id_utilisateur',
        'id_examen',
        'lu'
    ];

    protected $casts = [
        'date_envoi' => 'datetime',
        'lu' => 'boolean',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(User::class, 'id_utilisateur');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'id_examen');
    }
}
