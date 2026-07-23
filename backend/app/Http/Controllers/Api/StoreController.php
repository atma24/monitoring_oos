<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StoreImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $depoId = $request->user()->depo_id;

        $service = new StoreImportService();
        $result = $service->import($request->file('file'), $depoId);

        return response()->json([
            'message' => "Upload antrean selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
            'data' => $result,
        ]);
    }
}