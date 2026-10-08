<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\Siswa;
use Illuminate\Support\Facades\Cache;
use Illuminate\Http\Request;

class AlumniController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Alumni::with(['siswa' => function ($q) {
            $q->withTrashed()->with(['cabang', 'program']);
        }]);

        // Filter berdasarkan cabang
        if ($user->role === 'admin_cabang') {
            $query->whereHas('siswa', function ($q) use ($user) {
                $q->withTrashed()->where('cabang_id', $user->cabang_id);
            });
        } elseif ($request->has('cabang_id') && $request->cabang_id) {
            $allowedBranchFilterRoles = ['super_admin', 'direksi', 'pengajar', 'staff_karyawan'];

            if (!in_array($user->role, $allowedBranchFilterRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk filter cabang lain.',
                ], 403);
            }

            $query->whereHas('siswa', function ($q) use ($request) {
                $q->withTrashed()->where('cabang_id', $request->cabang_id);
            });
        }

        // Filter berdasarkan tahun diterima
        if ($request->has('tahun_diterima') && !empty($request->tahun_diterima)) {
            $query->where('alumni.tahun_diterima', $request->tahun_diterima);
        }

        // Filter berdasarkan jalur masuk PTN
        if ($request->has('jalur_masuk') && !empty($request->jalur_masuk)) {
            $query->where('alumni.jalur_masuk', $request->jalur_masuk);
        }

        // Filter berdasarkan nama siswa
        if ($request->has('nama_lengkap') && !empty($request->nama_lengkap)) {
            $query->whereHas('siswa', function ($q) use ($request) {
                $q->where('nama_lengkap', 'LIKE', '%' . $request->nama_lengkap . '%');
            });
        }

        // Filter berdasarkan PTN
        if ($request->has('ptn_diterima') && !empty($request->ptn_diterima)) {
            $query->where('alumni.ptn_diterima', 'LIKE', '%' . $request->ptn_diterima . '%');
        }

        // Filter berdasarkan jurusan
        if ($request->has('jurusan') && !empty($request->jurusan)) {
            $query->where('alumni.jurusan', $request->jurusan);
        }

        // Filter berdasarkan status kelulusan (lolos / tidak_lolos)
        // Only apply if the provided value is one of the allowed statuses to avoid accidental filtering
        if ($request->has('status_kelulusan') && in_array($request->status_kelulusan, ['lolos', 'tidak_lolos'], true)) {
            $query->where('alumni.status_kelulusan', $request->status_kelulusan);
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'alumni.tahun_diterima');
        $sortDir = $request->input('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $alumni = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $alumni->items(),
            'pagination' => [
                'total' => $alumni->total(),
                'per_page' => $alumni->perPage(),
                'current_page' => $alumni->currentPage(),
                'last_page' => $alumni->lastPage(),
            ]
        ]);
    }

    public function show($id)
    {
        $alumni = Alumni::with(['siswa' => function ($q) {
            $q->withTrashed()->with(['cabang', 'program']);
        }])->find($id);

        if (!$alumni) {
            return response()->json([
                'success' => false,
                'message' => 'Alumni tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $alumni,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Hanya super_admin dan admin_cabang yang bisa create
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membuat alumni.',
            ], 403);
        }

        $validated = $request->validate([
            'siswa_id' => 'required|integer|exists:siswa,id',
            'status_kelulusan' => 'nullable|in:lolos,tidak_lolos',
            'ptn_diterima' => 'nullable|string|max:255',
            'jurusan' => 'nullable|string|max:255',
            'jalur_masuk' => 'nullable|string|max:100',
            'tahun_diterima' => 'nullable|integer|min:2020|max:' . date('Y'),
            'testimoni' => 'nullable|string',
        ]);

        // If status_kelulusan is 'tidak_lolos', clear related fields so the database stays valid.
        // Keep jalur_masuk if provided: preserve jalur_masuk even when tidak_lolos.
        if (isset($validated['status_kelulusan']) && $validated['status_kelulusan'] === 'tidak_lolos') {
            $validated['ptn_diterima'] = '';
            $validated['jurusan'] = '';
            // DO NOT null jalur_masuk here; allow saving jalur_masuk value
            $validated['tahun_diterima'] = null;
            $validated['testimoni'] = '';
        }

        // Normalize jalur_masuk: treat empty string or '-' as NULL, otherwise standardize value to lowercase
        if (isset($validated['jalur_masuk'])) {
            if (in_array($validated['jalur_masuk'], ['', '-', null], true)) {
                $validated['jalur_masuk'] = null;
            } else {
                $validated['jalur_masuk'] = strtolower(trim($validated['jalur_masuk']));
            }
        }

        // Verify siswa belongs to user's cabang if admin_cabang
        if ($user->role === 'admin_cabang') {
            $siswa = Siswa::find($validated['siswa_id']);
            if ($siswa->cabang_id !== $user->cabang_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk siswa dari cabang lain.',
                ], 403);
            }
        }

        $alumni = Alumni::create($validated);

        $siswa = Siswa::find($validated['siswa_id']);
        $cabangId = $siswa ? $siswa->cabang_id : null;
        $this->invalidateStatistikCaches($cabangId);

        return response()->json([
            'success' => true,
            'data' => $alumni,
            'message' => 'Alumni berhasil ditambahkan.',
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();
        $alumni = Alumni::find($id);

        if (!$alumni) {
            return response()->json([
                'success' => false,
                'message' => 'Alumni tidak ditemukan.',
            ], 404);
        }

        // Check authorization
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengubah alumni.',
            ], 403);
        }

        if ($user->role === 'admin_cabang') {
            $siswa = Siswa::find($alumni->siswa_id);
            if ($siswa->cabang_id !== $user->cabang_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk alumni dari cabang lain.',
                ], 403);
            }
        }

        $validated = $request->validate([
            'jenis_kelamin' => 'nullable|in:laki-laki,perempuan',
            'status_kelulusan' => 'nullable|in:lolos,tidak_lolos',
            'ptn_diterima' => 'nullable|string|max:255',
            'jurusan' => 'nullable|string|max:255',
            'jalur_masuk' => 'nullable|string|max:100',
            'tahun_diterima' => 'nullable|integer|min:2020|max:' . date('Y'),
            'testimoni' => 'nullable|string',
        ]);

        // If status_kelulusan is 'tidak_lolos', clear related fields so the database stays valid.
        // Keep jalur_masuk if provided: preserve jalur_masuk even when tidak_lolos.
        if (isset($validated['status_kelulusan']) && $validated['status_kelulusan'] === 'tidak_lolos') {
            $validated['ptn_diterima'] = '';
            $validated['jurusan'] = '';
            // DO NOT null jalur_masuk here; allow saving jalur_masuk value
            $validated['tahun_diterima'] = null;
            $validated['testimoni'] = '';
        }

        // Normalize jalur_masuk: treat empty string or '-' as NULL, otherwise standardize to lowercase
        if (isset($validated['jalur_masuk'])) {
            if (in_array($validated['jalur_masuk'], ['', '-', null], true)) {
                $validated['jalur_masuk'] = null;
            } else {
                $validated['jalur_masuk'] = strtolower(trim($validated['jalur_masuk']));
            }
        }

        if (array_key_exists('jenis_kelamin', $validated)) {
            Siswa::withTrashed()->where('id', $alumni->siswa_id)->update([
                'jenis_kelamin' => $validated['jenis_kelamin'],
            ]);
            unset($validated['jenis_kelamin']);
        }

        $alumni->update($validated);

        $siswa = Siswa::withTrashed()->find($alumni->siswa_id);
        $cabangId = $siswa ? $siswa->cabang_id : null;
        $this->invalidateStatistikCaches($cabangId);

        return response()->json([
            'success' => true,
            'data' => $alumni,
            'message' => 'Alumni berhasil diperbarui.',
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $alumni = Alumni::find($id);

        if (!$alumni) {
            return response()->json([
                'success' => false,
                'message' => 'Alumni tidak ditemukan.',
            ], 404);
        }

        // Check authorization
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus alumni.',
            ], 403);
        }

        if ($user->role === 'admin_cabang') {
            $siswa = Siswa::find($alumni->siswa_id);
            if ($siswa->cabang_id !== $user->cabang_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk alumni dari cabang lain.',
                ], 403);
            }
        }

        $alumni->delete();

        $siswa = Siswa::find($alumni->siswa_id);
        $cabangId = $siswa ? $siswa->cabang_id : null;
        $this->invalidateStatistikCaches($cabangId);

        return response()->json([
            'success' => true,
            'message' => 'Alumni berhasil dihapus.',
        ]);
    }

    public function getStatistics(Request $request)
    {
        $user = $request->user();
        $cabang_id = $request->input('cabang_id');

        // Restrict admin_cabang
        if ($user->role === 'admin_cabang') {
            $cabang_id = $user->cabang_id;
        }

        $query = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
            ->when($cabang_id, function ($q) use ($cabang_id) {
                return $q->where('siswa.cabang_id', $cabang_id);
            });

        $totalAlumni = $query->count();
        
        // Top PTN
        $topPtn = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
            ->selectRaw('alumni.ptn_diterima, COUNT(*) as total')
            ->where('alumni.ptn_diterima', '!=', null)
            // only include alumni who actually 'lolos' so tidak_lolos PTN are not counted
            ->where('alumni.status_kelulusan', 'lolos')
            ->when($cabang_id, function ($q) use ($cabang_id) {
                return $q->where('siswa.cabang_id', $cabang_id);
            })
            ->groupBy('alumni.ptn_diterima')
            ->orderByRaw('COUNT(*) DESC')
            ->limit(5)
            ->get();

        // Jalur Masuk
        $jalurMasuk = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
            ->selectRaw('alumni.jalur_masuk, COUNT(*) as total')
            ->where('alumni.jalur_masuk', '!=', null)
            // only count jalur_masuk for alumni who 'lolos'
            ->where('alumni.status_kelulusan', 'lolos')
            ->when($cabang_id, function ($q) use ($cabang_id) {
                return $q->where('siswa.cabang_id', $cabang_id);
            })
            ->groupBy('alumni.jalur_masuk')
            ->orderByRaw('COUNT(*) DESC')
            ->get();

        // Alumni by Year
        $alumniByYear = Alumni::join('siswa', 'alumni.siswa_id', '=', 'siswa.id')
            ->selectRaw('alumni.tahun_diterima as tahun, COUNT(*) as total')
            ->when($cabang_id, function ($q) use ($cabang_id) {
                return $q->where('siswa.cabang_id', $cabang_id);
            })
            ->groupBy('alumni.tahun_diterima')
            ->orderBy('alumni.tahun_diterima', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'total_alumni' => $totalAlumni,
                'top_ptn' => $topPtn,
                'jalur_masuk' => $jalurMasuk,
                'alumni_by_year' => $alumniByYear,
            ]
        ]);
    }

    private function invalidateStatistikCaches(?int $cabangId = null): void
    {
        $segments = ['', $cabangId];
        $tahun = date('Y');
        $jalurs = ['all', 'snbp', 'snbt', 'mandiri'];

        foreach ($segments as $segment) {
            $segmentKey = $segment === '' || $segment === null ? '' : (string) $segment;

            Cache::forget("statistik_summary_{$segmentKey}_{$tahun}");
            Cache::forget("statistik_kelulusan_{$segmentKey}");
            Cache::forget("statistik_ptn_{$segmentKey}");
            Cache::forget("statistik_jalur_masuk_{$segmentKey}");
            Cache::forget("statistik_tren_pendaftaran_{$segmentKey}");
            Cache::forget("statistik_jurusan_{$tahun}_{$segmentKey}");

            foreach ($jalurs as $jalur) {
                Cache::forget("statistik_kelulusan_persen_{$segmentKey}_{$jalur}");
            }
        }
    }
}
