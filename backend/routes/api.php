<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepoController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

// Rute Publik
Route::post('login', [AuthController::class, 'login']);

// Rute dengan Token Sanctum (Harus Login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    // --- Rute Read-Only (Bisa diakses Supervisor juga) ---
    Route::get('depo', [DepoController::class, 'index']);
    Route::get('depo/{depo}', [DepoController::class, 'show']);
    
    // Nanti rute GET untuk list stores bisa ditaruh di sini:
    // Route::get('stores', [StoreController::class, 'index']);

    // --- Rute Khusus Tulis/Upload (Hanya Admin & Kepala Distribusi) ---
    Route::middleware('role:admin,kepala_distribusi')->group(function () {
        Route::post('depo', [DepoController::class, 'store']);
        Route::post('stores/upload', [StoreController::class, 'upload']);
    });
});