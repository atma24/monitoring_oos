<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\FiltersByDepo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    use FiltersByDepo;

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        return response()->json([
            'message' => 'Upload selesai',
            'data' => ['delivered' => 0, 'undelivered' => 0],
        ]);
    }
}
