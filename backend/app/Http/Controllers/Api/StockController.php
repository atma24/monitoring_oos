<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\StockRecord;
use App\Models\Store;
use App\Services\StockImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    use FiltersByDepo;

    public function index(Request $request): JsonResponse
    {
        $query = StockRecord::with('store');
        $this->applyDepoFilter($query, $request);

        if ($request->filled('stockdate'))
            $query->where('stockdate', $request->stockdate);
        if ($request->filled('store_id'))
            $query->where('store_id', $request->store_id);
        if ($request->filled('category'))
            $query->where('category', $request->category);

        $paginated = $query->orderByDesc('stockdate')->paginate(20);

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

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $result = app(StockImportService::class)->import($request->file('file'));

        return response()->json([
            'message' => "Upload selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
            'data' => $result,
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
