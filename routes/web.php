<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Jika user mengakses root domain, arahkan ke dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

// Rute untuk user yang belum login (Guest)
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

// Rute untuk user yang sudah login (Auth)
Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
    
    // Placeholder untuk Dashboard agar setelah login tidak 404
    Route::get('dashboard', function () {
        return Inertia::render('Dashboard'); // Pastikan file resources/js/Pages/Dashboard.jsx ada
    })->name('dashboard');
});