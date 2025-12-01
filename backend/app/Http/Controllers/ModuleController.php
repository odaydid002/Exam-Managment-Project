<?php

namespace App\Http\Controllers;

use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ModuleController extends Controller
{
    public function index(Request $request)
    {
        $modules = Module::orderBy('name')->get();

        $data = $modules->map(function ($m) {
            return [
                'code' => $m->code,
                'name' => $m->name,
                'short_name' => $m->short_name,
                'type' => $m->type,
                'factor' => $m->factor,
                'credits' => $m->credits,
            ];
        })->toArray();

        return response()->json(['total' => count($data), 'modules' => $data]);
    }

    public function show($code)
    {
        $m = Module::find($code);
        if (!$m) return response()->json(['message' => 'Module not found'], 404);

        return response()->json([
            'code' => $m->code,
            'name' => $m->name,
            'short_name' => $m->short_name,
            'type' => $m->type,
            'factor' => $m->factor,
            'credits' => $m->credits,
        ]);
    }

    public function store(Request $request)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $v = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:modules,code',
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
            'factor' => 'nullable|numeric',
            'credits' => 'nullable|integer',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        $module = Module::create([
            'code' => $request->code,
            'name' => $request->name,
            'short_name' => $request->short_name ?? null,
            'type' => $request->type ?? null,
            'factor' => $request->factor ?? null,
            'credits' => $request->credits ?? null,
        ]);

        return response()->json(['message' => 'Module created', 'module' => $module], 201);
    }

    public function update(Request $request, $code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module = Module::find($code);
        if (!$module) return response()->json(['message' => 'Module not found'], 404);

        $v = Validator::make($request->all(), [
            'name' => 'nullable|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'type' => 'nullable|string|max:50',
            'factor' => 'nullable|numeric',
            'credits' => 'nullable|integer',
        ]);

        if ($v->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $v->errors()], 422);
        }

        if ($request->filled('name')) $module->name = $request->name;
        if ($request->filled('short_name')) $module->short_name = $request->short_name;
        if ($request->filled('type')) $module->type = $request->type;
        if ($request->filled('factor')) $module->factor = $request->factor;
        if ($request->filled('credits')) $module->credits = $request->credits;
        $module->save();

        return response()->json(['message' => 'Module updated', 'module' => $module]);
    }

    public function destroy($code)
    {
        if (!auth()->user() || !auth()->user()->hasRole(['admin', 'employee'])) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $module = Module::find($code);
        if (!$module) return response()->json(['message' => 'Module not found'], 404);

        try {
            DB::transaction(function () use ($module) {
                // optionally check related records and prevent deletion
                $module->delete();
            });
            return response()->json(['message' => 'Module deleted']);
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
            'modules' => 'required|array|min:1'
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
        }

        $items = $request->input('modules', []);
        $created = [];
        $errors = [];

        foreach ($items as $index => $item) {
            $v = Validator::make($item, [
                'code' => 'required|string|max:50|unique:modules,code',
                'name' => 'required|string|max:255',
                'short_name' => 'nullable|string|max:50',
                'type' => 'nullable|string|max:50',
                'factor' => 'nullable|numeric',
                'credits' => 'nullable|integer',
            ]);

            if ($v->fails()) {
                $errors[] = ['index' => $index, 'status' => 'validation_failed', 'errors' => $v->errors()];
                continue;
            }

            try {
                DB::beginTransaction();
                $module = Module::create([
                    'code' => $item['code'],
                    'name' => $item['name'],
                    'short_name' => $item['short_name'] ?? null,
                    'type' => $item['type'] ?? null,
                    'factor' => $item['factor'] ?? null,
                    'credits' => $item['credits'] ?? null,
                ]);
                DB::commit();
                $created[] = ['index' => $index, 'module' => $module];
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

    // Return statistics about modules: total and counts by factor categories
    public function stats()
    {
        $total = Module::count();
        $fundamental = Module::where('factor', '>=', 3)->count();
        $methodological = Module::where('factor', 2)->count();
        $transversal = Module::where('factor', 1)->count();

        return response()->json([
            'total' => $total,
            'fundamental' => $fundamental,
            'methodological' => $methodological,
            'transversal' => $transversal,
        ]);
    }
}

