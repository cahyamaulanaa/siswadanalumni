<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SiswaController;
use App\Http\Controllers\Api\StatistikController;
use App\Http\Controllers\Api\AlumniController;
use Illuminate\Support\Facades\Route;

// Public routes (no auth required)
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (auth required)
Route::middleware(['auth:sanctum', 'log_activity'])->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Siswa routes
    Route::get('/siswa', [SiswaController::class, 'index']);
    Route::get('/siswa/{id}', [SiswaController::class, 'show']);
    Route::post('/siswa', [SiswaController::class, 'store']);
    Route::put('/siswa/{id}', [SiswaController::class, 'update']);
    Route::delete('/siswa/{id}', [SiswaController::class, 'destroy']);
    Route::get('/siswa-data/cabang', [SiswaController::class, 'getCabang']);
    Route::get('/siswa-data/program-by-kelas', [SiswaController::class, 'getProgramByKelas']);
    Route::get('/siswa-data/filter-data', [SiswaController::class, 'getFilterData']);
    Route::get('/wilayah/provinces', [SiswaController::class, 'getWilayahProvinces']);
    Route::get('/wilayah/regencies/{provinceCode}', [SiswaController::class, 'getWilayahRegencies']);
    Route::get('/wilayah/districts/{regencyCode}', [SiswaController::class, 'getWilayahDistricts']);
    Route::get('/wilayah/villages/{districtCode}', [SiswaController::class, 'getWilayahVillages']);
    Route::post('/siswa/bulk-to-alumni', [SiswaController::class, 'bulkToAlumni']);
    Route::post('/siswa/bulk-move', [SiswaController::class, 'bulkMove']);

    // Statistik routes
    Route::get('/statistik/kelulusan', [StatistikController::class, 'kelulusan']);
    Route::get('/statistik/ptn', [StatistikController::class, 'ptn']);
    Route::get('/statistik/jalur-masuk', [StatistikController::class, 'jalurMasuk']);
    Route::get('/statistik/tren-pendaftaran', [StatistikController::class, 'trenPendaftaran']);
    Route::get('/statistik/jurusan', [StatistikController::class, 'jurusan']);
    Route::get('/statistik/programs', [StatistikController::class, 'programs']);
    Route::get('/statistik/sekolah', [StatistikController::class, 'sekolah']);
    Route::get('/statistik/summary', [StatistikController::class, 'summary']);
    Route::get('/statistik/wilayah', [StatistikController::class, 'wilayah']);
    Route::get('/statistik/kelulusan-persen', [StatistikController::class, 'kelulusanPersentase']);

    // Cabang routes (super_admin only)
    // Route::middleware('check_role:super_admin')->group(function () {
    //     Route::apiResource('cabang', \App\Http\Controllers\Api\CabangController::class);
    // });

    // Users routes (super_admin only)
    Route::middleware('check_role:super_admin')->group(function () {
        Route::get('/activity-logs', [\App\Http\Controllers\Api\ActivityLogController::class, 'index']);
        Route::get('/activity-logs/export', [\App\Http\Controllers\Api\ActivityLogController::class, 'export']);

        Route::get('/users', [\App\Http\Controllers\Api\UserController::class, 'index']);
        Route::post('/users', [\App\Http\Controllers\Api\UserController::class, 'store']);
        Route::get('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'show']);
        Route::put('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'update']);
        Route::delete('/users/{id}', [\App\Http\Controllers\Api\UserController::class, 'destroy']);

        // Kategori Program routes
        Route::get('/kategori-program', [\App\Http\Controllers\Api\KategoriProgramController::class, 'index']);
        Route::post('/kategori-program', [\App\Http\Controllers\Api\KategoriProgramController::class, 'store']);
        Route::get('/kategori-program/{id}', [\App\Http\Controllers\Api\KategoriProgramController::class, 'show']);
        Route::put('/kategori-program/{id}', [\App\Http\Controllers\Api\KategoriProgramController::class, 'update']);
        Route::delete('/kategori-program/{id}', [\App\Http\Controllers\Api\KategoriProgramController::class, 'destroy']);

        // Program routes
        Route::get('/program', [\App\Http\Controllers\Api\ProgramController::class, 'index']);
        Route::post('/program', [\App\Http\Controllers\Api\ProgramController::class, 'store']);
        Route::get('/program/{id}', [\App\Http\Controllers\Api\ProgramController::class, 'show']);
        Route::put('/program/{id}', [\App\Http\Controllers\Api\ProgramController::class, 'update']);
        Route::delete('/program/{id}', [\App\Http\Controllers\Api\ProgramController::class, 'destroy']);
    });

    // Angkatan routes
    // Route::middleware('check_role:super_admin,admin_cabang')->group(function () {
    //     Route::apiResource('angkatan', \App\Http\Controllers\Api\AngkatanController::class);
    // });

    // Alumni routes
    Route::get('/alumni', [AlumniController::class, 'index']);
    Route::get('/alumni/{id}', [AlumniController::class, 'show']);
    Route::post('/alumni', [AlumniController::class, 'store']);
    Route::put('/alumni/{id}', [AlumniController::class, 'update']);
    Route::delete('/alumni/{id}', [AlumniController::class, 'destroy']);
    Route::get('/alumni-statistics', [AlumniController::class, 'getStatistics']);

    // Portofolio Alumni routes
    Route::get('/portofolio-alumni', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'index']);
    Route::get('/portofolio-alumni/{id}', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'show']);
    Route::post('/portofolio-alumni', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'store']);
    Route::put('/portofolio-alumni/{id}', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'update']);
    Route::post('/portofolio-alumni/{id}', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'update']);
    Route::delete('/portofolio-alumni/{id}', [\App\Http\Controllers\Api\PortofolioAlumniController::class, 'destroy']);

    // Sesi Kelas routes
    // Route::apiResource('sesi-kelas', \App\Http\Controllers\Api\SesiKelasController::class);

});
