<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Depo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepoController extends Controller
{
    /**
     * READ: Menampilkan semua data Depo
     */
    public function index()
    {
        // Mengambil data terbaru (bisa diganti jadi paginate(10) kalau data depo ribuan)
        $depos = Depo::latest()->get(); 

        return response()->json([
            'status' => 'success',
            'message' => 'Daftar data depo berhasil diambil',
            'data' => $depos
        ], 200);
    }

    /**
     * CREATE: Menyimpan data Depo baru
     */
    public function store(Request $request)
    {
        // Validasi data masuk
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255|unique:depo,name',
            'address'        => 'nullable|string',
            'city'           => 'nullable|string|max:255',
            'postal_code'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone'  => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Simpan ke database
        $depo = Depo::create($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data depo berhasil ditambahkan',
            'data' => $depo
        ], 201);
    }

    /**
     * READ (Detail): Menampilkan satu data Depo berdasarkan ID
     */
    public function show(string $id)
    {
        $depo = Depo::find($id);

        if (!$depo) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data depo tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Detail data depo',
            'data' => $depo
        ], 200);
    }

    /**
     * UPDATE: Mengubah data Depo yang sudah ada
     */
    public function update(Request $request, string $id)
    {
        $depo = Depo::find($id);

        if (!$depo) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data depo tidak ditemukan'
            ], 404);
        }

        // Validasi data masuk (Pengecualian unique untuk ID yang sedang diupdate)
        $validator = Validator::make($request->all(), [
            'name'           => 'required|string|max:255|unique:depo,name,' . $id,
            'address'        => 'nullable|string',
            'city'           => 'nullable|string|max:255',
            'postal_code'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric',
            'longitude'      => 'nullable|numeric',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone'  => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update database
        $depo->update($request->all());

        return response()->json([
            'status' => 'success',
            'message' => 'Data depo berhasil diperbarui',
            'data' => $depo
        ], 200);
    }

    /**
     * DELETE: Menghapus data Depo
     */
    public function destroy(string $id)
    {
        $depo = Depo::find($id);

        if (!$depo) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data depo tidak ditemukan'
            ], 404);
        }

        $depo->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data depo berhasil dihapus'
        ], 200);
    }
}