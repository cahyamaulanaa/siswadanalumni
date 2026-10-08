<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alumni;
use App\Models\Program;
use App\Models\Siswa;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Request;

class SiswaController extends Controller
{
    public function getWilayahProvinces()
    {
        try {
            $response = Http::timeout(10)->get('https://wilayah.id/api/provinces.json');
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data provinsi.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getWilayahRegencies($provinceCode)
    {
        try {
            $response = Http::timeout(10)->get("https://wilayah.id/api/regencies/{$provinceCode}.json");
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kabupaten/kota.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getWilayahDistricts($regencyCode)
    {
        try {
            $response = Http::timeout(10)->get("https://wilayah.id/api/districts/{$regencyCode}.json");
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kecamatan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getWilayahVillages($districtCode)
    {
        try {
            $response = Http::timeout(10)->get("https://wilayah.id/api/villages/{$districtCode}.json");
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memuat data kelurahan/desa.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function index(Request $request)
    {
        $user = $request->user();
        $query = Siswa::with(['cabang', 'alumni', 'program']);

        // Filter berdasarkan cabang
        if ($user->role === 'admin_cabang') {
            $query->where('cabang_id', $user->cabang_id);
        } elseif ($request->has('cabang_id') && $request->cabang_id) {
            $allowedBranchFilterRoles = ['super_admin', 'direksi', 'pengajar', 'staff_karyawan'];

            if (!in_array($user->role, $allowedBranchFilterRoles, true)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk filter cabang lain.',
                ], 403);
            }

            $query->where('cabang_id', $request->cabang_id);
        }

        // Filter berdasarkan tahun masuk
        if ($request->has('tahun_masuk') && !empty($request->tahun_masuk)) {
            $query->whereYear('tahun_masuk', $request->tahun_masuk);
        }

        // Filter berdasarkan nama lengkap (search)
        if ($request->has('nama_lengkap') && !empty($request->nama_lengkap)) {
            $query->where('nama_lengkap', 'LIKE', '%' . $request->nama_lengkap . '%');
        }

        // Filter berdasarkan kelas
        if ($request->has('kelas') && !empty($request->kelas)) {
            $query->where('kelas', $request->kelas);
        }

        // Filter berdasarkan program
        if ($request->has('program_id') && !empty($request->program_id)) {
            $query->whereHas('program', function ($q) use ($request) {
                $q->where('program.id', $request->program_id);
            });
        }

        // Sorting
        $sortBy = $request->input('sort_by', 'nama_lengkap');
        $sortDir = $request->input('sort_dir', 'asc');
        $query->orderBy($sortBy, $sortDir);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $siswa = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $siswa->items(),
            'pagination' => [
                'total' => $siswa->total(),
                'per_page' => $siswa->perPage(),
                'current_page' => $siswa->currentPage(),
                'last_page' => $siswa->lastPage(),
            ]
        ]);
    }

    public function show($id)
    {
        $siswa = Siswa::with(['cabang', 'alumni', 'program'])->find($id);

        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $siswa,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Hanya super_admin dan admin_cabang yang bisa create
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk membuat siswa.',
            ], 403);
        }

        if ($request->has('program_id') && !is_array($request->program_id)) {
            $request->merge(['program_id' => [$request->program_id]]);
        }

        $validated = $request->validate([
            'cabang_id' => 'required|integer|exists:cabang,id',
            'nama_lengkap' => 'required|string|max:150',
            'kelas' => 'required|integer|between:1,12',
            'asal_sekolah' => 'required|string|max:150',
            'tanggal_lahir' => 'required|date',
            'jenis_kelamin' => 'required|in:laki-laki,perempuan',
            'no_hp' => 'required|string|max:20',
            // Wilayah codes and jalan
            'provinsi_code' => 'required|string|max:20',
            'kabupaten_code' => 'required|string|max:20',
            'kecamatan_code' => 'required|string|max:20',
            'desa_code' => 'required|string|max:20',
            'jalan' => 'required|string|max:250',
            'alamat' => 'required|string',
            'email' => 'required|email|unique:siswa,email',
            'informasi_villa_merah' => 'required|in:website,instagram,tiktok,kerabat,orang_tua,teman',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tahun_masuk' => 'required|date_format:Y-m-d',
            'tahun_lulus' => 'nullable|integer',
            'program_id' => 'nullable|array',
            'program_id.*' => 'integer|exists:program,id',
        ]);

        // Check cabang access
        if ($user->role === 'admin_cabang' && $validated['cabang_id'] != $user->cabang_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya bisa menambah siswa ke cabang Anda sendiri.',
            ], 403);
        }

        // Handle foto upload
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('siswa', 'public');
            $validated['foto'] = $fotoPath;
        }

        // Extract program_id dari validated
        $programIds = $validated['program_id'] ?? [];
        unset($validated['program_id']);

        $siswa = Siswa::create($validated);

        // Attach program jika ada
        if (!empty($programIds)) {
            $siswa->program()->attach($programIds);
        }

        // Load relations untuk response
        $siswa = $siswa->load(['cabang', 'alumni', 'program']);

        $this->invalidateStatistikCaches($siswa->cabang_id);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan.',
            'data' => $siswa,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = $request->user();

        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan.',
            ], 404);
        }

        // Hanya super_admin dan admin_cabang yang bisa update
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengupdate siswa.',
            ], 403);
        }

        // Check cabang access
        if ($user->role === 'admin_cabang' && $siswa->cabang_id != $user->cabang_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya bisa mengupdate siswa di cabang Anda sendiri.',
            ], 403);
        }

        if ($request->has('program_id') && !is_array($request->program_id)) {
            $request->merge(['program_id' => [$request->program_id]]);
        }

        $validated = $request->validate([
            'cabang_id' => 'sometimes|integer|exists:cabang,id',
            'nama_lengkap' => 'sometimes|string|max:150',
            'kelas' => 'sometimes|integer|between:1,12',
            'asal_sekolah' => 'sometimes|string|max:150',
            'tanggal_lahir' => 'sometimes|date',
            'jenis_kelamin' => 'sometimes|in:laki-laki,perempuan',
            'no_hp' => 'sometimes|string|max:20',
            // Wilayah codes and jalan
            'provinsi_code' => 'sometimes|string|max:20',
            'kabupaten_code' => 'sometimes|string|max:20',
            'kecamatan_code' => 'sometimes|string|max:20',
            'desa_code' => 'sometimes|string|max:20',
            'jalan' => 'sometimes|string|max:250',
            'alamat' => 'sometimes|string',
            'email' => 'sometimes|email|unique:siswa,email,' . $id,
            'informasi_villa_merah' => 'sometimes|in:website,instagram,tiktok,kerabat,orang_tua,teman',
            'foto' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'tahun_masuk' => 'sometimes|date_format:Y-m-d',
            'tahun_lulus' => 'nullable|integer',
            'program_id' => 'nullable|array',
            'program_id.*' => 'integer|exists:program,id',
        ]);

        // Handle foto upload
        if ($request->hasFile('foto')) {
            $fotoPath = $request->file('foto')->store('siswa', 'public');
            $validated['foto'] = $fotoPath;
        }

        // Extract program_id dari validated
        $programIds = $validated['program_id'] ?? null;
        unset($validated['program_id']);

        $siswa->update($validated);

        // Update program jika ada
        if (is_array($programIds)) {
            $siswa->program()->sync($programIds);
        } elseif (!empty($programIds)) {
            $siswa->program()->sync([$programIds]);
        }

        // Load relations untuk response
        $siswa = $siswa->load(['cabang', 'alumni', 'program']);

        $this->invalidateStatistikCaches($siswa->cabang_id);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil diupdate.',
            'data' => $siswa,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        $siswa = Siswa::find($id);
        if (!$siswa) {
            return response()->json([
                'success' => false,
                'message' => 'Siswa tidak ditemukan.',
            ], 404);
        }

        // Hanya super_admin dan admin_cabang yang bisa delete
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk menghapus siswa.',
            ], 403);
        }

        // Check cabang access
        if ($user->role === 'admin_cabang' && $siswa->cabang_id != $user->cabang_id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda hanya bisa menghapus siswa di cabang Anda sendiri.',
            ], 403);
        }

        // Delete related records
        $siswa->alumni()->delete(); // Delete related alumni record
        $siswa->program()->detach(); // Remove program relationships

        // Permanently delete siswa record from database
        $siswa->forceDelete();

        $this->invalidateStatistikCaches($siswa->cabang_id);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil dihapus.',
        ]);
    }

    public function bulkToAlumni(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk mengkonversi siswa menjadi alumni.',
            ], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:siswa,id',
            'ptn_diterima' => 'nullable|string|max:100',
            'jurusan' => 'nullable|string|max:150',
            'jalur_masuk' => 'nullable|in:snbp,snbt,mandiri',
            'tahun_diterima' => 'nullable|integer|min:2020|max:' . date('Y'),
        ]);

        $defaultPtn = $validated['ptn_diterima'] ?? 'N/A';
        $defaultJurusan = $validated['jurusan'] ?? 'Belum Ditentukan';
        $defaultJalur = $validated['jalur_masuk'] ?? 'mandiri';
        $defaultTahun = $validated['tahun_diterima'] ?? date('Y');

        $query = Siswa::whereIn('id', $validated['ids']);
        if ($user->role === 'admin_cabang') {
            $query->where('cabang_id', $user->cabang_id);
        }

        $siswas = $query->get();

        if ($siswas->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada siswa yang dapat dikonversi.',
            ], 404);
        }

        $cabangIds = $siswas->pluck('cabang_id')->unique()->toArray();
        $convertedCount = 0;

        DB::transaction(function () use ($siswas, $defaultPtn, $defaultJurusan, $defaultJalur, $defaultTahun, &$convertedCount) {
            foreach ($siswas as $siswa) {
                if ($siswa->alumni()->exists()) {
                    continue;
                }

                Alumni::create([
                    'siswa_id' => $siswa->id,
                    'ptn_diterima' => $defaultPtn,
                    'jurusan' => $defaultJurusan,
                    'jalur_masuk' => $defaultJalur,
                    'tahun_diterima' => $defaultTahun,
                ]);

                // Keep the siswa-program pivot so alumni can still show the program data.
                $siswa->delete();
                $convertedCount++;
            }
        });

        foreach ($cabangIds as $cabangId) {
            $this->invalidateStatistikCaches((int) $cabangId);
        }

        return response()->json([
            'success' => true,
            'message' => "Berhasil mengkonversi {$convertedCount} siswa menjadi alumni.",
        ]);
    }

    public function bulkMove(Request $request)
    {
        $user = $request->user();

        // Only allow super_admin and admin_cabang to perform bulk move
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses untuk memindahkan siswa.',
            ], 403);
        }

        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:siswa,id',
            'kelas' => 'required|integer|between:1,12',
            'program_id' => 'nullable|array',
            'program_id.*' => 'integer|exists:program,id',
        ]);

        $query = Siswa::whereIn('id', $validated['ids']);
        if ($user->role === 'admin_cabang') {
            $query->where('cabang_id', $user->cabang_id);
        }

        $siswas = $query->get();

        if ($siswas->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak ada siswa yang dapat dipindahkan.',
            ], 404);
        }

        $cabangIds = $siswas->pluck('cabang_id')->unique()->toArray();

        DB::transaction(function () use ($siswas, $validated) {
            foreach ($siswas as $siswa) {
                $siswa->kelas = $validated['kelas'];
                $siswa->save();

                if (isset($validated['program_id'])) {
                    // synchronize program pivot
                    $siswa->program()->sync($validated['program_id']);
                }
            }
        });

        foreach ($cabangIds as $cabangId) {
            $this->invalidateStatistikCaches((int) $cabangId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Berhasil memindahkan ' . count($siswas) . ' siswa ke kelas/ program baru.',
        ]);
    }

    private function invalidateStatistikCaches(?int $cabangId = null): void
    {
        $segments = ['', $cabangId];
        $tahunFilters = [date('Y'), 'all'];
        $levels = ['provinsi', 'kabupaten', 'kecamatan', 'desa'];
        $limits = [5, 0, 'all'];
        $jalurs = ['all', 'snbp', 'snbt', 'mandiri'];

        foreach ($segments as $segment) {
            $segmentKey = $segment === '' || $segment === null ? '' : (string) $segment;

            foreach ($tahunFilters as $tahun) {
                Cache::forget("statistik_summary_{$segmentKey}_{$tahun}");
            }
            Cache::forget("statistik_kelulusan_{$segmentKey}");
            Cache::forget("statistik_ptn_{$segmentKey}");
            Cache::forget("statistik_jalur_masuk_{$segmentKey}");
            Cache::forget("statistik_tren_pendaftaran_{$segmentKey}");
            Cache::forget("statistik_jurusan_{$tahun}_{$segmentKey}");

            foreach ($jalurs as $jalur) {
                Cache::forget("statistik_kelulusan_persen_{$segmentKey}_{$jalur}");
            }

            foreach ($levels as $lvl) {
                foreach ($limits as $lim) {
                    foreach ($tahunFilters as $tahun) {
                        Cache::forget("statistik_wilayah_{$segmentKey}_{$tahun}_{$lvl}_{$lim}");
                    }
                }
            }
        }
    }

    public function getCabang(Request $request)
    {
        $user = $request->user();
        $query = \App\Models\Cabang::query();

        // Admin cabang hanya bisa lihat cabang sendiri
        if ($user->role === 'admin_cabang') {
            $query->where('id', $user->cabang_id);
        }

        $cabang = $query->get();

        return response()->json([
            'success' => true,
            'data' => $cabang,
        ]);
    }


    public function getProgramByKelas(Request $request)
    {
        $kelas = $request->input('kelas');

        if (!$kelas || $kelas < 1 || $kelas > 12) {
            return response()->json([
                'success' => false,
                'message' => 'Kelas harus antara 1-12.',
            ], 400);
        }

        $programs = Program::whereBetween('kelas_min', [1, $kelas])
            ->where('kelas_max', '>=', $kelas)
            ->with('kategoriProgram')
            ->get()
            ->groupBy('kategoriProgram.nama');

        return response()->json([
            'success' => true,
            'data' => $programs,
        ]);
    }

    public function getFilterData(Request $request)
    {
        $user = $request->user();
        $query = Siswa::query();

        // Filter berdasarkan cabang
        if ($user->role === 'admin_cabang') {
            $query->where('cabang_id', $user->cabang_id);
        } elseif ($request->has('cabang_id') && !empty($request->cabang_id)) {
            if ($user->role !== 'super_admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak memiliki akses untuk filter cabang lain.',
                ], 403);
            }
            $query->where('cabang_id', $request->cabang_id);
        }

        // Get unique kelas
        $kelas = $query->distinct('kelas')
            ->pluck('kelas')
            ->filter()
            ->sort()
            ->values();

        // Get unique programs with their details
        $programs = $query->distinct('siswa.id')
            ->join('siswa_program', 'siswa.id', '=', 'siswa_program.siswa_id')
            ->join('program', 'siswa_program.program_id', '=', 'program.id')
            ->select('program.id', 'program.nama')
            ->orderBy('program.nama')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'kelas' => $kelas,
                'programs' => $programs,
            ]
        ]);
    }
}
