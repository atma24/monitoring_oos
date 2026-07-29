<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Services\StoreImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Exception;
use App\Services\GeocodeService;

class StoreController extends Controller
{
    /**
     * READ: Menampilkan semua data toko (bisa ditambah paginasi/pencarian nanti)
     */
    public function index()
    {
        // Mengambil semua toko beserta nama deponya
        $stores = Store::with('depo')->latest()->get();
        
        return response()->json([
            'status'  => 'success',
            'message' => 'Data master toko berhasil diambil',
            'data'    => $stores
        ], 200);
    }

    /**
     * CREATE: Menambah satu toko baru secara manual
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sap_id'    => 'required|unique:stores,sap_id',
            'depo_id'   => 'required|exists:depos,id',
            'name'      => 'required|string|max:255',
            'type'      => 'nullable|string',
            'city'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $store = Store::create($request->all());

        return response()->json([
            'status'  => 'success',
            'message' => 'Toko baru berhasil ditambahkan',
            'data'    => $store
        ], 201);
    }

    /**
     * READ ONE: Menampilkan detail satu toko
     */
    public function show($id)
    {
        $store = Store::with('depo')->find($id);

        if (!$store) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Toko tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status'  => 'success',
            'message' => 'Detail toko berhasil diambil',
            'data'    => $store
        ], 200);
    }

    /**
     * UPDATE: Mengedit data toko
     */
    public function update(Request $request, $id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Toko tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'sap_id'    => 'sometimes|required|unique:stores,sap_id,' . $store->id,
            'depo_id'   => 'sometimes|required|exists:depos,id',
            'name'      => 'sometimes|required|string|max:255',
            'type'      => 'nullable|string',
            'city'      => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors()
            ], 422);
        }

        $store->update($request->all());

        return response()->json([
            'status'  => 'success',
            'message' => 'Data toko berhasil diperbarui',
            'data'    => $store
        ], 200);
    }

    /**
     * DELETE: Menghapus toko
     */
    public function destroy($id)
    {
        $store = Store::find($id);

        if (!$store) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Toko tidak ditemukan'
            ], 404);
        }

        $store->delete();

        return response()->json([
            'status'  => 'success',
            'message' => 'Data toko berhasil dihapus'
        ], 200);
    }

    /**
     * UPLOAD: Import massal via Excel (Fungsi yang sudah kita buat sebelumnya)
     */
    public function upload(Request $request, StoreImportService $importService)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            $importService->import($request->file('file'), $request->user()->depo_id);

            return response()->json([
                'status'  => 'success',
                'message' => 'Data Master Toko berhasil di-import!',
            ], 200);
            
        } catch (Exception $e) {
            return response()->json([
                'status'  => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    // Jangan lupa tambahkan di atas: use App\Services\GeocodeService;

    /**
     * Memproses Geocoding untuk toko yang belum memiliki koordinat
     */
    public function processGeocoding(GeocodeService $geocodeService)
    {
        // Cari 1 toko terlama yang belum memiliki koordinat
        // Kita proses 1 per 1 agar bisa dilacak progressnya oleh frontend
        $store = Store::whereNull('latitude')
                      ->orWhereNull('longitude')
                      ->oldest()
                      ->first();

        if (!$store) {
            return response()->json([
                'status' => 'completed',
                'message' => 'Semua toko sudah memiliki koordinat.'
            ]);
        }

        $result = $geocodeService->geocodeStore($store);

        // Hitung total sisa yang perlu diproses
        $remaining = Store::whereNull('latitude')->orWhereNull('longitude')->count();
        $total = Store::count();
        
        return response()->json([
            'status' => 'processing',
            'result' => $result,
            'remaining' => $remaining,
            'total' => $total
        ]);
    }
}