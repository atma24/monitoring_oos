<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class StockRecordController extends Controller
{
    /**
     * READ: Menampilkan data OOS Preventif dengan Pagination
     */
    public function index()
    {
        // Eager load relasi ke toko dan depo, lalu di-paginate per 20 baris
        $records = StockRecord::with(['store', 'depo'])->latest()->paginate(20);

        return response()->json([
            'status' => 'success',
            'message' => 'Daftar data Stock Record berhasil diambil',
            'data' => $records
        ], 200);
    }

    /**
     * CREATE: Menyimpan data laporan OOS baru
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            // Validasi Relasi dan Kombinasi Unik
            'store_id' => [
                'required',
                'exists:stores,id',
                Rule::unique('stock_records')->where(function ($query) use ($request) {
                    return $query->where('stockdate', $request->stockdate);
                })
            ],
            'stockdate' => 'required|date',
            'depo_id'   => 'nullable|exists:depo,id',
            
            // Validasi data pelengkap
            'sap_id'         => 'nullable|string|max:50',
            'og_urgent_date' => 'nullable|date',
            'account'        => 'nullable|string|max:50',
            'outlet_name'    => 'nullable|string|max:255',
            'source'         => 'nullable|string|max:50',
            'region'         => 'nullable|string|max:20',
            'supplier'       => 'nullable|string|max:255',
            'jwk'            => 'nullable|string|max:50',
            'dsi'            => 'nullable|numeric',
            'category'       => 'nullable|string|in:RED,YELLOW,GREEN',
        ], [
            // Pesan Error Custom
            'store_id.unique' => 'Toko ini sudah memiliki laporan stok pada tanggal tersebut.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = StockRecord::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data Stock Record berhasil ditambahkan',
            'data' => $record
        ], 201);
    }
    /**
     * UPLOAD: Mengimpor data Excel OOS Preventif
     */
    public function upload(Request $request)
    {
        // Validasi wajib kirim file Excel
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            // Nanti kita akan panggil class Service khusus di sini
            $service = new \App\Services\StockRecordImportService();
            $service->import($request->file('file'));

            return response()->json([
                'status' => 'success',
                'message' => 'Data OOS Preventif berhasil diupload'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * READ (Detail): Menampilkan spesifik 1 laporan
     */
    public function show(string $id)
    {
        $record = StockRecord::with(['store', 'depo'])->find($id);

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stock Record tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Detail data Stock Record',
            'data' => $record
        ], 200);
    }

    /**
     * UPDATE: Mengubah data pelaporan
     */
    public function update(Request $request, string $id)
    {
        $record = StockRecord::find($id);

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stock Record tidak ditemukan'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'store_id' => [
                'required',
                'exists:stores,id',
                Rule::unique('stock_records')->where(function ($query) use ($request) {
                    return $query->where('stockdate', $request->stockdate);
                })->ignore($id) // Abaikan ID ini saat update
            ],
            'stockdate' => 'required|date',
            'depo_id'   => 'nullable|exists:depo,id',
            'sap_id'         => 'nullable|string|max:50',
            'og_urgent_date' => 'nullable|date',
            'account'        => 'nullable|string|max:50',
            'outlet_name'    => 'nullable|string|max:255',
            'source'         => 'nullable|string|max:50',
            'region'         => 'nullable|string|max:20',
            'supplier'       => 'nullable|string|max:255',
            'jwk'            => 'nullable|string|max:50',
            'dsi'            => 'nullable|numeric',
            'category'       => 'nullable|string|in:RED,YELLOW,GREEN',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $record->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data Stock Record berhasil diperbarui',
            'data' => $record
        ], 200);
    }

    /**
     * DELETE: Menghapus data pelaporan
     */
    public function destroy(string $id)
    {
        $record = StockRecord::find($id);

        if (!$record) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Stock Record tidak ditemukan'
            ], 404);
        }

        $record->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Stock Record berhasil dihapus'
        ], 200);
    }
}