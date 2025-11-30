<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupDelegate extends Model
{
    use HasFactory;

    protected $table = 'group_delegates';

    protected $fillable = [
        'group_code',
        'student_number',
        'assigned_at',
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
    ];

    public function group()
    {
        return $this->belongsTo(Groupe::class, 'group_code', 'code');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_number', 'number');
    }
}
