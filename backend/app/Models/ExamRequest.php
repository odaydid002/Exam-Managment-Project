<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ExamRequest extends Model
{
    use HasFactory;

    protected $table = 'exam_requests';

    protected $fillable = [
        'id_module',
        'id_teacher',
        'group_code',
        'level',
        'status',
        'room',
        'start_hour',
        'end_hour',
        'exam_date',
        'exam_type',
        'message',
    ];

    protected $casts = [
        'start_hour' => 'float',
        'end_hour' => 'float',
        'exam_date' => 'date',
    ];

    public function teacher()
    {
        return $this->belongsTo(Teacher::class, 'id_teacher', 'number');
    }

    public function module()
    {
        return $this->belongsTo(Module::class, 'id_module', 'code');
    }

    public function groupe()
    {
        return $this->belongsTo(Groupe::class, 'group_code', 'code');
    }

    public function roomModel()
    {
        return $this->belongsTo(Salle::class, 'room', 'id');
    }
}
