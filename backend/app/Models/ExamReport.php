namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExamReport extends Model
{
    protected $fillable = [
        'user_id',
        'exam_id',
        'type',
        'description',
        'status'
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function exam()
    {
        return $this->belongsTo(Exam::class);
    }
}
