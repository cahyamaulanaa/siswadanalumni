<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCabangAccess
{
    /**
     * Middleware untuk memastikan admin_cabang hanya bisa akses data cabangnya sendiri.
     * Super admin bisa akses semua cabang.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        // Super admin bisa akses semua
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // Admin cabang hanya bisa akses data dengan cabang_id miliknya
        if ($user->role === 'admin_cabang') {
            // Jika ada cabang_id di request, periksa apakah sama dengan cabang user
            $cabang_id = $request->route('cabang_id') 
                      ?? $request->input('cabang_id') 
                      ?? $request->query('cabang_id');

            if ($cabang_id && $cabang_id != $user->cabang_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda hanya bisa mengakses data cabang Anda sendiri.',
                ], 403);
            }
        }

        return $next($request);
    }
}
