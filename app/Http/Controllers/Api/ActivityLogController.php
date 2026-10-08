<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->filteredQuery($request)->with('user:id,nama,email,role');

        $perPage = min(max((int) $request->input('per_page', 20), 1), 100);
        $logs = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function export(Request $request)
    {
        $logs = $this->filteredQuery($request)
            ->with('user:id,nama,email,role')
            ->get();

        return response()->streamDownload(function () use ($logs) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'Waktu',
                'Nama Pengguna',
                'Email',
                'Role',
                'Aktivitas',
                'Metode',
                'Route',
                'Status',
                'IP Address',
                'User Agent',
            ]);

            foreach ($logs as $log) {
                fputcsv($handle, [
                    $log->created_at?->format('Y-m-d H:i:s'),
                    $log->user?->nama ?? 'Pengguna dihapus',
                    $log->user?->email ?? '',
                    $log->user?->role ?? '',
                    $log->action,
                    $log->method,
                    $log->route,
                    $log->metadata['status'] ?? '',
                    $log->ip_address,
                    $log->user_agent,
                ]);
            }

            fclose($handle);
        }, 'log-activity-' . now()->format('Y-m-d-His') . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    private function filteredQuery(Request $request)
    {
        return ActivityLog::query()
            ->when($request->filled('action'), function ($query) use ($request) {
                $query->where('action', 'like', '%' . $request->input('action') . '%');
            })
            ->when($request->filled('user_id'), function ($query) use ($request) {
                $query->where('user_id', $request->input('user_id'));
            })
            ->when($request->filled('date'), function ($query) use ($request) {
                $query->whereDate('created_at', $request->input('date'));
            })
            ->latest();
    }
}
