<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepoController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StockRecordController;
use App\Http\Controllers\Api\DeliveryStatusController;
use App\Http\Controllers\Api\DashboardController;
// Rute Publik
Route::post('login', [AuthController::class, 'login']);

// Rute dengan Token Sanctum (Harus Login)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('depo', [DepoController::class, 'index']);
    Route::get('depo/{depo}', [DepoController::class, 'show']);
    Route::get('stores', [StoreController::class, 'index']);
    Route::get('stock-records', [StockRecordController::class, 'index']);
    Route::get('stock-records/{id}', [StockRecordController::class, 'show']);
    Route::get('delivery-statuses', [DeliveryStatusController::class, 'index']);
    Route::get('delivery-statuses/{id}', [DeliveryStatusController::class, 'show']);


    // Nanti rute GET untuk list stores bisa ditaruh di sini:
    // Route::get('stores', [StoreController::class, 'index']);
    Route::middleware('role:admin,kepala_distribusi')->group(function () {
        // Modul Depo
        Route::post('depo', [DepoController::class, 'store']);
        Route::put('depo/{id}', [DepoController::class, 'update']);
        Route::delete('depo/{id}', [DepoController::class, 'destroy']);
        
        // Modul Stores
        Route::post('stores/upload', [StoreController::class, 'upload']);

        // Modul Stock Records (OOS Preventif)
        Route::post('stock-records', [StockRecordController::class, 'store']); // Garis miring dihapus!
        Route::post('stock-records/upload', [StockRecordController::class, 'upload']); // Rute baru untuk Excel
        Route::put('stock-records/{id}', [StockRecordController::class, 'update']);
        Route::delete('stock-records/{id}', [StockRecordController::class, 'destroy']);

        // Modul Delivery Status (Adop)
        Route::post('delivery-statuses', [DeliveryStatusController::class, 'store']);
        Route::post('delivery-statuses/upload', [DeliveryStatusController::class, 'upload']);
        Route::put('delivery-statuses/{id}', [DeliveryStatusController::class, 'update']);
        Route::delete('delivery-statuses/{id}', [DeliveryStatusController::class, 'destroy']);
    });
});