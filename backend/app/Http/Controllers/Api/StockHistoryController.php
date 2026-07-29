<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockHistoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockHistory::with(['store', 'depo', 'uploader']);

        if ($request->filled('stockdate')) {
            $query->where('stockdate', $request->stockdate);
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('depo_id')) {
            $query->where('depo_id', $request->depo_id);
        }

        $histories = $query->latest('uploaded_at')->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $histories,
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        $query = StockHistory::query();

        if ($request->filled('start_date')) {
            $query->where('stockdate', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('stockdate', '<=', $request->end_date);
        }
        if ($request->filled('depo_id')) {
            $query->where('depo_id', $request->depo_id);
        }

        $totalUploads = (clone $query)->distinct('uploaded_at')->count('uploaded_at');
        $avgDsi = (clone $query)->avg('dsi');
        $categoryCounts = (clone $query)
            ->selectRaw("category, count(*) as total")
            ->groupBy('category')
            ->pluck('total', 'category');

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_uploads' => $totalUploads,
                'avg_dsi' => round((float) $avgDsi, 2),
                'category_counts' => $categoryCounts,
            ],
        ]);
    }
}
