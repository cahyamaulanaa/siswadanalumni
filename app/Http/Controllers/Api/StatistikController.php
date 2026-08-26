<?php

namespace App\Http\Controllers\Api;

use App\Models\Alumni;
use App\Models\Program;
use App\Models\Siswa;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class StatistikController extends Controller
{
    // Statistik Kelulusan per Tahun - Grouped by tahun_diterima (graduation year)
    public function kelulusan(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);

        // Restrict admin_cabang hanya ke cabangnya sendiri
        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_kelulusan_{$cabang_id}_{$tahun}";

        if ($force) {
            Cache::forget($cacheKey);
        }
        
        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun) {
            // Build base query with joins
            $baseQuery = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id');

            if ($cabang_id) {
                $baseQuery->where('siswa.cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $baseQuery->whereYear('siswa.tahun_masuk', $tahun);
            }

            // Count total alumni (all alumni, not filtered by year)
            $total_alumni = (clone $baseQuery)->count();
            
            // Group by tahun_diterima (year alumni graduated) - shows graduation trends over all years
            $kelulusan_by_year = (clone $baseQuery)
                ->selectRaw('alumni.tahun_diterima as tahun, COUNT(*) as total')
                ->whereNotNull('alumni.tahun_diterima')
                ->groupBy('alumni.tahun_diterima')
                ->orderBy('alumni.tahun_diterima', 'asc')
                ->get();

            return [
                'total_alumni' => $total_alumni,
                'kelulusan_by_year' => $kelulusan_by_year,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Statistik PTN Terbanyak
    public function ptn(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);
        $limit = $request->input('limit', 10);
  
        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }
  
        $cacheKey = "statistik_ptn_{$cabang_id}_{$tahun}_{$limit}";
  
        if ($force) {
            Cache::forget($cacheKey);
        }
  
        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun, $limit) {
            $query = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
                ->selectRaw('alumni.ptn_diterima, COUNT(*) as total')
                // only include alumni who 'lolos' so PTN of tidak_lolos are not counted
                ->where('alumni.status_kelulusan', 'lolos')
                ->groupBy('alumni.ptn_diterima')
                ->orderByRaw('COUNT(*) DESC')
                ->whereNotNull('alumni.ptn_diterima')
                ->where('alumni.ptn_diterima', '!=', '');
  
            if ($cabang_id) {
                $query->where('siswa.cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('siswa.tahun_masuk', $tahun);
            }
  
            if ($limit !== 'all') {
                $limit = is_numeric($limit) ? intval($limit) : 10;
                $query->limit($limit);
            }
  
            return $query->get();
        });
 
        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Statistik Program Aktif
    public function programs(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);
        $limit = $request->input('limit', 0);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_programs_{$cabang_id}_{$tahun}_{$limit}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun, $limit) {
            $query = DB::table('siswa_program')
                ->join('siswa', 'siswa_program.siswa_id', '=', 'siswa.id')
                ->leftJoin('alumni', 'siswa.id', '=', 'alumni.siswa_id')
                ->join('program', 'siswa_program.program_id', '=', 'program.id')
                ->whereNull('alumni.id')
                ->selectRaw('program.id, program.nama, COUNT(*) as total')
                ->groupBy('program.id', 'program.nama')
                ->orderByDesc('total');

            if ($cabang_id) {
                $query->where('siswa.cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('siswa.tahun_masuk', $tahun);
            }

            if ($limit && is_numeric($limit)) {
                $query->limit(intval($limit));
            }

            return $query->get();
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Statistik Sekolah Penyumbang Siswa Aktif
    public function sekolah(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);
        $limit = $request->input('limit', 0);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_sekolah_{$cabang_id}_{$tahun}_{$limit}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun, $limit) {
            $query = Siswa::selectRaw('asal_sekolah as sekolah, COUNT(*) as total')
                ->when($cabang_id, function ($query) use ($cabang_id) {
                    return $query->where('cabang_id', $cabang_id);
                })
                ->when($tahun !== null && $tahun !== '' && $tahun !== 'all', function ($query) use ($tahun) {
                    return $query->whereYear('tahun_masuk', $tahun);
                })
                ->whereNotNull('asal_sekolah')
                ->where('asal_sekolah', '!=', '')
                ->groupBy('asal_sekolah')
                ->orderByDesc('total');

            if ($limit && is_numeric($limit)) {
                $query->limit(intval($limit));
            }

            return $query->get();
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Statistik Wilayah (Top contributors by wilayah level)
    public function wilayah(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);
        $limit = $request->input('limit', 5);
        $level = $request->input('level', 'provinsi'); // provinsi|kabupaten|kecamatan|desa

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $allowed = ['provinsi', 'kabupaten', 'kecamatan', 'desa'];
        if (!in_array($level, $allowed)) {
            return response()->json(['success' => false, 'message' => 'Invalid level'], 400);
        }

        $columnMap = [
            'provinsi' => 'provinsi_code',
            'kabupaten' => 'kabupaten_code',
            'kecamatan' => 'kecamatan_code',
            'desa' => 'desa_code',
        ];

        $column = $columnMap[$level];
        $cacheKey = "statistik_wilayah_{$cabang_id}_{$tahun}_{$level}_{$limit}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun, $limit, $column, $level) {
            $query = Siswa::selectRaw("{$column} as code, COUNT(*) as total")
                ->whereNotNull($column)
                ->where($column, '!=', '')
                ->groupBy($column)
                ->orderByRaw('COUNT(*) DESC');

            if ($cabang_id) {
                $query->where('cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('tahun_masuk', $tahun);
            }

            if ($limit && is_numeric($limit)) {
                $query->limit(intval($limit));
            }

            $results = $query->get();

            // Enrich with readable name extracted from siswa.alamat when available.
            // The DB stores wilayah as codes, but the visible label should be the actual name
            // selected by the user when creating/updating the student.
            $enriched = $results->map(function ($row) use ($column, $level, $cabang_id) {
                $code = $row->code;
                $name = $this->extractNameFromAlamat($code, $column, $level, $cabang_id);
                return (object) [
                    'code' => $code,
                    'name' => $name ?: 'Tidak diketahui',
                    'total' => $row->total,
                ];
            });

            return $enriched;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    /**
     * Try to get a readable name for a wilayah code by inspecting a sample siswa.alamat
     */
    protected function extractNameFromAlamat($code, $column, $level, $cabang_id = null)
    {
        if (!$code) {
            return $code;
        }

        $query = Siswa::where($column, $code)
            ->whereNotNull('alamat')
            ->where('alamat', '!=', '');

        if ($cabang_id) {
            $query->where('cabang_id', $cabang_id);
        }

        $siswa = $query->first();
        if (!$siswa || !$siswa->alamat) {
            return $code;
        }

        $parts = array_values(array_filter(array_map(function ($part) {
            return trim((string) $part);
        }, explode(',', $siswa->alamat)), function ($part) {
            return $part !== '' && $part !== '-';
        }));

        if (empty($parts)) {
            return $code;
        }

        $levelMap = [
            'desa' => 4,
            'kecamatan' => 3,
            'kabupaten' => 2,
            'provinsi' => 1,
        ];

        $offset = $levelMap[$level] ?? null;
        if ($offset === null || count($parts) < $offset) {
            return $parts[count($parts) - 1] ?? $code;
        }

        $index = count($parts) - $offset;
        return $parts[$index] ?? $code;
    }

    // Statistik Jalur Masuk
    public function jalurMasuk(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_jalur_masuk_{$cabang_id}_{$tahun}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun) {
            $query = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
                ->selectRaw('alumni.jalur_masuk, COUNT(*) as total')
                // only count jalur_masuk for alumni who 'lolos'
                ->where('alumni.status_kelulusan', 'lolos')
                ->groupBy('alumni.jalur_masuk')
                ->whereNotNull('alumni.jalur_masuk')
                ->where('alumni.jalur_masuk', '!=', '');

            if ($cabang_id) {
                $query->where('siswa.cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('siswa.tahun_masuk', $tahun);
            }

            return $query->get();
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Tren Pendaftaran (Siswa Aktif vs Alumni per Tahun)
    public function trenPendaftaran(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_tren_pendaftaran_{$cabang_id}_{$tahun}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun) {
            $query_base = Siswa::query();

            if ($cabang_id) {
                $query_base->where('cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query_base->whereYear('tahun_masuk', $tahun);
            }

            $tren = $query_base
                ->selectRaw('tahun_masuk as tahun, COUNT(*) as total_pendaftar')
                ->groupBy('tahun_masuk')
                ->orderBy('tahun_masuk', 'desc')
                ->get();

            return $tren;
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Statistik Jurusan Terbanyak
    public function jurusan(Request $request)
    {
        $user = $request->user();
        $tahun = $request->input('tahun');
        $cabang_id = $request->input('cabang_id');
        $force = $request->input('force_refresh', false);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_jurusan_{$tahun}_{$cabang_id}";

        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($tahun, $cabang_id) {
            $query = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
                ->selectRaw('alumni.jurusan, COUNT(*) as total')
                ->groupBy('alumni.jurusan')
                ->orderByRaw('COUNT(*) DESC')
                ->limit(10);

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('siswa.tahun_masuk', $tahun);
            }

            if ($cabang_id) {
                $query->where('siswa.cabang_id', $cabang_id);
            }

            return $query->get();
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    // Dashboard Summary
    public function summary(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $tahun = $request->input('tahun');
        $force = $request->input('force_refresh', false);

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $cacheKey = "statistik_summary_{$cabang_id}_{$tahun}";
 
        if ($force) {
            $data = $this->buildSummaryData($cabang_id, $tahun);
            Cache::put($cacheKey, $data, 60 * 60);
        } else {
            $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun) {
                return $this->buildSummaryData($cabang_id, $tahun);
            });
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function buildSummaryData($cabang_id, $tahun)
    {
        $query_siswa_aktif = Siswa::query();
        if ($cabang_id) {
            $query_siswa_aktif->where('cabang_id', $cabang_id);
        }
        if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
            $query_siswa_aktif->whereYear('tahun_masuk', $tahun);
        }

        $total_siswa_aktif = $query_siswa_aktif->count();
        $siswa_per_cabang = Siswa::join('cabang', 'siswa.cabang_id', '=', 'cabang.id')
            ->selectRaw('siswa.cabang_id, cabang.nama as cabang, COUNT(*) as total')
            ->when($cabang_id, function ($query) use ($cabang_id) {
                return $query->where('siswa.cabang_id', $cabang_id);
            })
            ->when($tahun !== null && $tahun !== '' && $tahun !== 'all', function ($query) use ($tahun) {
                return $query->whereYear('siswa.tahun_masuk', $tahun);
            })
            ->groupBy('siswa.cabang_id', 'cabang.nama')
            ->get()
            ->map(function ($item) {
                return [
                    'cabang' => $item->cabang ?: 'Tidak Diketahui',
                    'total' => $item->total,
                ];
            });

        $query_alumni = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id');
        if ($cabang_id) {
            $query_alumni->where('siswa.cabang_id', $cabang_id);
        }
        if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
            $query_alumni->whereYear('siswa.tahun_masuk', $tahun);
        }
        $total_alumni = $query_alumni->count();

        $alumni_per_cabang = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
            ->join('cabang', 'siswa.cabang_id', '=', 'cabang.id')
            ->selectRaw('siswa.cabang_id, cabang.nama as cabang, COUNT(*) as total')
            ->when($cabang_id, function ($query) use ($cabang_id) {
                return $query->where('siswa.cabang_id', $cabang_id);
            })
            ->when($tahun !== null && $tahun !== '' && $tahun !== 'all', function ($query) use ($tahun) {
                return $query->whereYear('siswa.tahun_masuk', $tahun);
            })
            ->groupBy('siswa.cabang_id', 'cabang.nama')
            ->get()
            ->map(function ($item) {
                return [
                    'cabang' => $item->cabang ?: 'Tidak Diketahui',
                    'total' => $item->total,
                ];
            });

        $top_programs = DB::table('siswa_program')
            ->join('siswa', 'siswa_program.siswa_id', '=', 'siswa.id')
            ->leftJoin('alumni', 'siswa.id', '=', 'alumni.siswa_id')
            ->join('program', 'siswa_program.program_id', '=', 'program.id')
            ->whereNull('alumni.id')
            ->when($cabang_id, function ($query) use ($cabang_id) {
                return $query->where('siswa.cabang_id', $cabang_id);
            })
            ->when($tahun !== null && $tahun !== '' && $tahun !== 'all', function ($query) use ($tahun) {
                return $query->whereYear('siswa.tahun_masuk', $tahun);
            })
            ->selectRaw('program.id, program.nama, COUNT(*) as total')
            ->groupBy('program.id', 'program.nama')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $top_schools = Siswa::selectRaw('asal_sekolah as sekolah, COUNT(*) as total')
            ->when($cabang_id, function ($query) use ($cabang_id) {
                return $query->where('cabang_id', $cabang_id);
            })
            ->when($tahun !== null && $tahun !== '' && $tahun !== 'all', function ($query) use ($tahun) {
                return $query->whereYear('tahun_masuk', $tahun);
            })
            ->whereNotNull('asal_sekolah')
            ->where('asal_sekolah', '!=', '')
            ->groupBy('asal_sekolah')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        $total_siswa_keseluruhan = $total_siswa_aktif + $total_alumni;

        return [
            'total_siswa_aktif' => $total_siswa_aktif,
            'total_alumni' => $total_alumni,
            'total_siswa_keseluruhan' => $total_siswa_keseluruhan,
            'siswa_per_cabang' => $siswa_per_cabang,
            'alumni_per_cabang' => $alumni_per_cabang,
            'top_programs' => $top_programs,
            'top_schools' => $top_schools,
        ];
    }

    // Statistik Persentase Kelulusan (Donut) - filterable by jalur
    public function kelulusanPersentase(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');
        $force = $request->input('force_refresh', false);
        $jalur = $request->input('jalur', 'all'); // all|snbp|snbt|mandiri

        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $tahun = $request->input('tahun');
        $cacheKey = "statistik_kelulusan_persen_{$cabang_id}_{$tahun}_{$jalur}";
        if ($force) {
            Cache::forget($cacheKey);
        }

        $data = Cache::remember($cacheKey, 60 * 60, function () use ($cabang_id, $tahun, $jalur) {
            $query = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
                ->selectRaw('alumni.status_kelulusan, COUNT(*) as total')
                ->whereNotNull('alumni.status_kelulusan')
                ->where('alumni.status_kelulusan', '!=', '')
                ->groupBy('alumni.status_kelulusan');

            if ($cabang_id) {
                $query->where('siswa.cabang_id', $cabang_id);
            }

            if ($tahun !== null && $tahun !== '' && $tahun !== 'all') {
                $query->whereYear('siswa.tahun_masuk', $tahun);
            }

            if ($jalur && $jalur !== 'all') {
                $query->where('alumni.jalur_masuk', $jalur);
            }

            $rows = $query->get();

            $lolos = 0;
            $tidak = 0;
            foreach ($rows as $r) {
                if ($r->status_kelulusan === 'lolos') $lolos = intval($r->total);
                if ($r->status_kelulusan === 'tidak_lolos') $tidak = intval($r->total);
            }

            $total = $lolos + $tidak;
            $percentLolos = $total > 0 ? round(($lolos / $total) * 100, 1) : 0;
            $percentTidak = $total > 0 ? round(($tidak / $total) * 100, 1) : 0;

            return [
                'labels' => ['Lolos', 'Tidak Lolos'],
                'counts' => [$lolos, $tidak],
                'percent' => [$percentLolos, $percentTidak],
                'total' => $total,
                'jalur' => $jalur,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}

