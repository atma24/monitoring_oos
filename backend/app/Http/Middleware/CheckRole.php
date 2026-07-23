<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Cek apakah user sudah login dan role-nya ada di dalam array $roles yang diizinkan
        if (! $request->user() || ! in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Forbidden - Anda tidak memiliki izin (role) untuk mengakses fitur ini.'
            ], 403);
        }

        return $next($request);
    }
}