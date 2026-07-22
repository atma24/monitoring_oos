<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DepoController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::get('stores', [StoreController::class, 'index']);
    Route::get('stores/geojson', [StoreController::class, 'geojson']);
    Route::get('stores/{store}', [StoreController::class, 'show']);

    Route::get('stocks', [StockController::class, 'index']);
    Route::get('stocks/{store}', [StockController::class, 'show']);

    Route::get('depo', [DepoController::class, 'index']);
    Route::get('depo/{depo}', [DepoController::class, 'show']);

    // Role: admin & kepala_distribusi (canWrite)
    Route::middleware('role:admin,kepala_distribusi')->group(function () {
        Route::post('stocks/upload', [StockController::class, 'upload']);
        Route::post('stores/upload', [StoreController::class, 'upload']);
        Route::post('delivery/upload', [DeliveryController::class, 'upload']);
        Route::post('depo', [DepoController::class, 'store']);
        Route::put('depo/{depo}', [DepoController::class, 'update']);
        Route::delete('depo/{depo}', [DepoController::class, 'destroy']);
    });

    // Role: admin only (canManageUsers)
    Route::middleware('role:admin')->group(function () {
        Route::get('users', [AuthController::class, 'indexUsers']);
        Route::post('users', [AuthController::class, 'createUser']);
        Route::put('users/{user}', [AuthController::class, 'updateUser']);
        Route::delete('users/{user}', [AuthController::class, 'deleteUser']);
    });
});
