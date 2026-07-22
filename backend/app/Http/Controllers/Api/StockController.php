<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\StockRecord;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    use FiltersByDepo;

    public function index(Request $request): JsonResponse
    {
        $query = StockRecord::with('store');
        $this->applyDepoFilter($query, $request, 'stores');

        if ($request->filled('stockdate'))
            $query->where('stockdate', $request->stockdate);
        if ($request->filled('store_id'))
            $query->where('store_id', $request->store_id);
        if ($request->filled('category'))
            $query->where('category', $request->category);
        if ($request->filled('oos'))
            $query->where('oos', $request->oos);

        $user = $request->user();
        if ($user && $user->depo_id) {
            $query->whereHas('store', fn ($q) => $q->where('depo_id', $user->depo_id));
        }

        $records = $query->orderByDesc('stockdate')->paginate(20);

        return response()->json($records);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        return response()->json([
            'message' => 'Upload berhasil',
            'data' => ['success' => 0, 'failed' => 0],
        ]);
    }

    public function show(Request $request, Store $store): JsonResponse
    {
        if ($request->user()->depo_id && $store->depo_id !== $request->user()->depo_id) {
            abort(403);
        }
        $records = $store->stockRecords()
            ->orderByDesc('stockdate')->limit(90)->get();

        return response()->json([
            'data' => $records,
            'store' => $store,
        ]);
    }
}
