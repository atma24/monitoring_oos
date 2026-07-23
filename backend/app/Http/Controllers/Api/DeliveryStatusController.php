<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DeliveryStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DeliveryStatusController extends Controller
{
    public function index()
    {
        $deliveries = DeliveryStatus::with(['store', 'depo'])->latest()->paginate(20);

        return response()->json([
            'status' => 'success',
            'message' => 'Daftar data Delivery Status berhasil diambil',
            'data' => $deliveries
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'store_id' => [
                'required',
                'exists:stores,id',
                Rule::unique('delivery_statuses')->where(function ($query) use ($request) {
                    return $query->where('check_date', $request->check_date);
                })
            ],
            'check_date'      => 'required|date',
            'depo_id'         => 'nullable|exists:depo,id',
            'sap_id'          => 'nullable|string|max:50',
            'site_name'       => 'nullable|string|max:255',
            'cust_name'       => 'nullable|string|max:255',
            'sales_type'      => 'nullable|string|max:50',
            'po_number'       => 'nullable|string|max:100',
            'so_number'       => 'nullable|string|max:100',
            'product_id'      => 'nullable|string|max:50',
            'product_name'    => 'nullable|string|max:255',
            'orig_deliv_date' => 'nullable|date',
            'po_qty'          => 'nullable|integer',
            'do_qty'          => 'nullable|integer',
            'billing_block'   => 'nullable|string|max:20',
            'driver_name'     => 'nullable|string|max:255',
            'status'          => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        $delivery = DeliveryStatus::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data Delivery Status berhasil ditambahkan',
            'data' => $delivery
        ], 201);
    }

    public function show(string $id)
    {
        $delivery = DeliveryStatus::with(['store', 'depo'])->find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Delivery Status tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Detail data Delivery Status',
            'data' => $delivery
        ], 200);
    }

    public function update(Request $request, string $id)
    {
        $delivery = DeliveryStatus::find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Delivery Status tidak ditemukan'
            ], 404);
        }

        // Logic validasi mirip dengan fungsi store, namun mengabaikan $id yang sedang diupdate
        $validator = Validator::make($request->all(), [
            'store_id' => 'required|exists:stores,id',
            'check_date' => 'required|date',
            // ... (bisa ditambahkan detail validasi lain seperti di atas jika diperlukan)
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors()
            ], 422);
        }

        $delivery->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data Delivery Status berhasil diperbarui',
            'data' => $delivery
        ], 200);
    }

    public function destroy(string $id)
    {
        $delivery = DeliveryStatus::find($id);

        if (!$delivery) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data Delivery Status tidak ditemukan'
            ], 404);
        }

        $delivery->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data Delivery Status berhasil dihapus'
        ], 200);
    }

    /**
     * UPLOAD: Mengimpor data Excel Adop
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv'
        ]);

        try {
            // Kita akan buat DeliveryStatusImportService setelah ini
            $service = new \App\Services\DeliveryStatusImportService();
            $service->import($request->file('file'));

            return response()->json([
                'status' => 'success',
                'message' => 'Data Delivery Status berhasil diupload'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}