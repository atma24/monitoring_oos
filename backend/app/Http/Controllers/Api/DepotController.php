<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\Depot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepotController extends Controller
{
    use FiltersByDepo;

    public function index(): JsonResponse
    {
        $depo = Depot::orderBy('name')->paginate(20);

        return response()->json($depo);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo',
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depot = Depot::create($validated);

        return response()->json([
            'data' => $depot,
            'message' => 'Depo berhasil ditambahkan',
        ], 201);
    }

    public function show(Request $request, Depot $depot): JsonResponse
    {
        if ($request->user()->depo_id && $depot->id !== $request->user()->depo_id) {
            abort(403);
        }
        return response()->json([
            'data' => $depot,
        ]);
    }

    public function update(Request $request, Depot $depot): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo,name,' . $depot->id,
            'address' => 'nullable|string',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depot->update($validated);

        return response()->json([
            'data' => $depot,
            'message' => 'Depo berhasil diupdate',
        ]);
    }

    public function destroy(Depot $depot): JsonResponse
    {
        $depot->delete();

        return response()->json([
            'message' => 'Depo berhasil dihapus',
        ]);
    }
}
