<?php

namespace App\Http\Controllers;

use App\Models\Salle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class RoomController extends Controller
{
    public function index(Request $request)
    {
        $rooms = Salle::orderBy('name')->get();

        $data = $rooms->map(function ($r) {
            return [
                'id' => $r->id,
                'name' => $r->name,
                'capacity' => $r->capacity,
                'disabled' => (bool) $r->disabled,
            ];
        })->toArray();

        return response()->json(['total' => count($data), 'rooms' => $data]);
    }

    public function show($id)
    {
        $r = Salle::find($id);
        if (!$r) return response()->json(['message' => 'Room not found'], 404);

        return response()->json([
            'id' => $r->id,
            'name' => $r->name,
            'capacity' => $r->capacity,
            'disabled' => (bool) $r->disabled,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'name' => 'required|string|max:50|unique:rooms,name',
            'capacity' => 'required|integer|min:0',
            'disabled' => 'nullable|boolean',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $room = Salle::create([
            'name' => $request->name,
            'capacity' => $request->capacity,
            'disabled' => $request->disabled ?? false,
        ]);

        return response()->json(['message' => 'Room created', 'room' => $room], 201);
    }

    public function update(Request $request, $id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Salle::find($id);
        if (!$room) return response()->json(['message' => 'Room not found'], 404);

        $v = Validator::make($request->all(), [
            'name' => "nullable|string|max:50|unique:rooms,name,{$room->id}",
            'capacity' => 'nullable|integer|min:0',
            'disabled' => 'nullable|boolean',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        if ($request->filled('name')) $room->name = $request->name;
        if ($request->filled('capacity')) $room->capacity = $request->capacity;
        if ($request->filled('disabled')) $room->disabled = $request->disabled;
        $room->save();

        return response()->json(['message' => 'Room updated', 'room' => $room]);
    }

    public function destroy($id)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room = Salle::find($id);
        if (!$room) return response()->json(['message' => 'Room not found'], 404);

        try {
            DB::transaction(function () use ($room) {
                $room->delete();
            });
            return response()->json(['message' => 'Room deleted']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete', 'error' => $e->getMessage()], 500);
        }
    }

    public function bulkStore(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rooms' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('rooms', []);
        $created = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'name' => 'required|string|max:50|unique:rooms,name',
                'capacity' => 'required|integer|min:0',
                'disabled' => 'nullable|boolean',
            ]);

            if ($v->fails()) {
                $errors[] = ['index' => $index, 'status' => 'validation_failed', 'errors' => $v->errors()];
                continue;
            }

            try {
                DB::beginTransaction();
                $room = Salle::create([
                    'name' => $item['name'],
                    'capacity' => $item['capacity'],
                    'disabled' => $item['disabled'] ?? false,
                ]);
                DB::commit();
                $created[] = ['index' => $index, 'room' => $room];
            } catch (\Exception $e) {
                DB::rollBack();
                $errors[] = ['index' => $index, 'status' => 'failed', 'message' => $e->getMessage()];
            }
        }

        return response()->json([
            'total_received' => count($items),
            'created_count' => count($created),
            'created' => $created,
            'errors' => $errors,
        ]);
    }
}
