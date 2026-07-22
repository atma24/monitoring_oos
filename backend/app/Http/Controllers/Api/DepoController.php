<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\Depo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepoController extends Controller
{
    use FiltersByDepo;

    public function index(): JsonResponse
    {
        $paginated = Depo::orderBy('name')->paginate(20);

        return response()->json([
            'data' => $paginated->items(),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depo = Depo::create($validated);

        return response()->json([
            'data' => $depo,
            'message' => 'Depo berhasil ditambahkan',
        ], 201);
    }

    public function show(Request $request, Depo $depo): JsonResponse
    {
        if ($request->user()->depo_id && $depo->id !== $request->user()->depo_id) {
            abort(403);
        }
        return response()->json([
            'data' => $depo,
        ]);
    }

    public function update(Request $request, Depo $depo): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo,name,' . $depo->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depo->update($validated);

        return response()->json([
            'data' => $depo,
            'message' => 'Depo berhasil diupdate',
        ]);
    }

    public function destroy(Depo $depo): JsonResponse
    {
        $depo->delete();

        return response()->json([
            'message' => 'Depo berhasil dihapus',
        ]);
    }
}
