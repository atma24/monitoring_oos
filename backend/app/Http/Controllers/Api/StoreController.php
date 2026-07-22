<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    use FiltersByDepo;

    public function index(Request $request): JsonResponse
    {
        $query = Store::with('latestStock', 'latestDelivery');
        $this->applyDepoFilter($query, $request, 'stores');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('outlet_name', 'like', "%{$request->search}%")
                  ->orWhere('sap_id', 'like', "%{$request->search}%")
                  ->orWhere('outlet_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }

        $stores = $query->orderBy('outlet_name')->paginate(20);

        return response()->json($stores);
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
        $stores = Store::with('latestStock');
        $this->applyDepoFilter($stores, $request, 'stores');
        $stores = $stores->get();

        $features = $stores->map(fn ($store) => [
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [$store->longitude ?? 0, $store->latitude ?? 0],
            ],
            'properties' => [
                'sap_id' => $store->sap_id,
                'name' => $store->outlet_name,
                'category' => $store->latestStock?->category ?? 'NO_DATA',
                'oos' => $store->latestStock?->oos ?? 'NO',
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

        return response()->json([
            'message' => 'Upload berhasil',
            'data' => ['success' => 0, 'failed' => 0],
        ]);
    }
}
