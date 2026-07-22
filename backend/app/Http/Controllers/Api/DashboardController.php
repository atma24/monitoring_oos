<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use FiltersByDepo;

    public function index(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());

        $storesQuery = Store::query();
        $this->applyDepoFilter($storesQuery, $request);

        $storeIds = (clone $storesQuery)->pluck('id');

        $stats = [
            'total_stores' => (clone $storesQuery)->count(),
            'red_count' => Store::whereIn('id', $storeIds)->whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'RED');
            })->count(),
            'yellow_count' => Store::whereIn('id', $storeIds)->whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'YELLOW');
            })->count(),
            'green_count' => Store::whereIn('id', $storeIds)->whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'GREEN');
            })->count(),
        ];

        $stores = (clone $storesQuery)->with('latestStock')->get();

        return response()->json([
            'stats' => $stats,
            'stores' => $stores,
            'selected_date' => $date,
        ]);
    }
}
