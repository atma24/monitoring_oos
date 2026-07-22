<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $file = public_path('build/index.html');
    if (file_exists($file)) {
        return response(file_get_contents($file))
            ->header('Content-Type', 'text/html');
    }
    return redirect('http://localhost:5173' . request()->getRequestUri());
})->where('any', '.*');
