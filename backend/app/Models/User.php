<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'id_utilisateur';
    public $timestamps = true;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'role'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function examensPlanifies()
    {
        return $this->hasMany(Examen::class, 'id_responsable');
    }

    public function surveillances()
    {
        return $this->hasMany(Surveillance::class, 'id_enseignant');
    }

    public function modules()
    {
        return $this->hasMany(Module::class, 'id_enseignant');
    }

    public function plannings()
    {
        return $this->hasMany(Planning::class, 'id_chef');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'id_utilisateur');
    }

    public function hasRole($role)
    {
        return $this->role === $role || (is_array($role) && in_array($this->role, $role));
    }
}
