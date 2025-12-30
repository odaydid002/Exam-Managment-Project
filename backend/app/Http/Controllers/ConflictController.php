<?php

namespace App\Http\Controllers;

use App\Models\Examen;
use Illuminate\Http\Request;

class ConflictController extends Controller
{
    /**
     * Return simple conflict statistics: room and group overlaps.
     */
    public function stats(Request $request)
    {
        $user = auth()->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // allow only admin/employee
        if (!in_array($user->role, ['admin', 'employee'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $exams = Examen::select('id', 'room_id', 'group_code', 'date', 'start_hour', 'end_hour', 'module_code')->get();

        // group exams by day
        $byDay = [];
        foreach ($exams as $e) {
            $day = $e->date ? $e->date->toDateString() : null;
            if (!$day) continue;
            $byDay[$day][] = $e;
        }

        $roomConflicts = 0;
        $groupConflicts = 0;

        foreach ($byDay as $day => $list) {
            // room conflicts
            $roomBuckets = [];
            foreach ($list as $e) {
                $key = $e->room_id ? (string)$e->room_id : '__none__';
                $roomBuckets[$key][] = $e;
            }
            foreach ($roomBuckets as $bucket) {
                usort($bucket, function($a, $b) { return $a->start_hour <=> $b->start_hour; });
                for ($i = 0; $i < count($bucket); $i++) {
                    for ($j = $i+1; $j < count($bucket); $j++) {
                        $a = $bucket[$i]; $b = $bucket[$j];
                        if ($a->start_hour < $b->end_hour && $a->end_hour > $b->start_hour) {
                            $roomConflicts++;
                        }
                    }
                }
            }

            // group conflicts
            $groupBuckets = [];
            foreach ($list as $e) {
                $g = $e->group_code ?? '__none__';
                $groupBuckets[$g][] = $e;
            }
            foreach ($groupBuckets as $bucket) {
                usort($bucket, function($a, $b) { return $a->start_hour <=> $b->start_hour; });
                for ($i = 0; $i < count($bucket); $i++) {
                    for ($j = $i+1; $j < count($bucket); $j++) {
                        $a = $bucket[$i]; $b = $bucket[$j];
                        if ($a->start_hour < $b->end_hour && $a->end_hour > $b->start_hour) {
                            $groupConflicts++;
                        }
                    }
                }
            }
        }

        return response()->json([
            'room_conflicts' => $roomConflicts,
            'group_conflicts' => $groupConflicts,
            'total_conflicts' => $roomConflicts + $groupConflicts
        ]);
    }
}
