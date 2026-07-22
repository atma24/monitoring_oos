<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\Store;
use App\Services\StoreImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    use FiltersByDepo;

    public function index(Request $request): JsonResponse
    {
        $query = Store::with('latestStock', 'latestDelivery');
        $this->applyDepoFilter($query, $request);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('outlet_name', 'like', "%{$request->search}%")
                  ->orWhere('sap_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('city')) {
            $query->where('city', $request->city);
        }

        $paginated = $query->orderBy('outlet_name')->paginate(20);

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

    public function show(Request $request, Store $store): JsonResponse
    {
        if ($request->user()->depo_id && $store->depo_id !== $request->user()->depo_id) {
            abort(403);
        }
        $store->load(['stockRecords' => function ($q) {
            $q->orderByDesc('stockdate')->limit(30);
        }]);

        return response()->json([
            'data' => $store,
            'stock_history' => $store->stockRecords,
        ]);
    }

    public function geojson(Request $request): JsonResponse
    {
        $stores = Store::query();
        $this->applyDepoFilter($stores, $request);
        $stores = $stores->get();

        $features = $stores->map(fn ($store) => [
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [$store->longitude, $store->latitude],
            ],
            'properties' => [
                'sap_id' => $store->sap_id,
                'name' => $store->outlet_name,
                'city' => $store->city,
                'category' => $store->latestStock?->category ?? 'NO_DATA',
            ],
        ]);

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $result = app(StoreImportService::class)->import($request->file('file'));

        return response()->json([
            'message' => "Upload selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
            'data' => $result,
        ]);
    }
}
