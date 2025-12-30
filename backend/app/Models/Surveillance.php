<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Surveillance extends Model
{
    use HasFactory;
    protected $table = 'surveillance';

    protected $fillable = [
        'exam_id',
        'teacher_number',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'teacher_number', 'number');
    }

    public function examen()
    {
        return $this->belongsTo(Examen::class, 'exam_id', 'id');
    }
}
