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

    public function index(Request $request): JsonResponse
    {
        $query = Depo::query();
        
        // Jika user punya depo_id, dia cuma bisa lihat deponya sendiri di list
        if ($request->user()->depo_id) {
            $query->where('id', $request->user()->depo_id);
        }

        $depo = $query->orderBy('name')->get();
        return response()->json(['data' => $depo]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
        ]);

        $depo = Depo::create($validated);
        return response()->json(['data' => $depo, 'message' => 'Depo berhasil ditambahkan'], 201);
    }

    public function show(Request $request, Depo $depo): JsonResponse
    {
        // Keamanan ketat: Tidak boleh mengintip depo lain lewat URL
        if ($request->user()->depo_id && $depo->id !== $request->user()->depo_id) {
            return response()->json(['message' => 'Forbidden - Anda tidak memiliki akses ke depo ini.'], 403);
        }
        
        return response()->json(['data' => $depo]);
    }
}