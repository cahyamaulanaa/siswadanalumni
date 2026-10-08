<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class LogActivity
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->isMethod('GET') || $request->is('api/activity-logs')) {
            return $response;
        }

        $user = $request->user();

        if ($user) {
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => strtoupper($request->method()) . ' ' . $request->path(),
                'method' => strtoupper($request->method()),
                'route' => $request->route()?->getName() ?: $request->path(),
                'description' => $response->isSuccessful() ? 'Permintaan berhasil' : 'Permintaan gagal',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metadata' => [
                    'status' => $response->status(),
                ],
            ]);
        }

        return $response;
    }
}
