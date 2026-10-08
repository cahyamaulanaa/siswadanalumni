<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortofolioAlumni;
use App\Models\Alumni;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PortofolioAlumniController extends Controller
{
    public function index(Request $request)
    {
        $query = PortofolioAlumni::with(['alumni.siswa.cabang', 'alumni.siswa.program']);

        if ($request->has('nama_lengkap') && !empty($request->nama_lengkap)) {
            $query->whereHas('alumni.siswa', function ($q) use ($request) {
                $q->where('nama_lengkap', 'LIKE', '%' . $request->nama_lengkap . '%');
            });
        }

        if ($request->has('cabang_id') && !empty($request->cabang_id)) {
            $query->whereHas('alumni.siswa', function ($q) use ($request) {
                $q->where('cabang_id', $request->cabang_id);
            });
        }

        if ($request->has('program_id') && !empty($request->program_id)) {
            $query->whereHas('alumni.siswa.program', function ($q) use ($request) {
                $q->where('program.id', $request->program_id);
            });
        }

        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);

        $data = $query->paginate($perPage, ['*'], 'page', $page);

        $items = collect($data->items())->map(function ($item) {
            return $item->append(['gambar_suasana_url', 'gambar_karya_bebas_url']);
        });

        return response()->json([
            'success' => true,
            'data' => $items,
            'pagination' => [
                'total' => $data->total(),
                'per_page' => $data->perPage(),
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
            ],
        ]);
    }

    public function show($id)
    {
        $portofolio = PortofolioAlumni::with(['alumni.siswa.cabang', 'alumni.siswa.program'])->find($id);

        if (!$portofolio) {
            return response()->json(['success' => false, 'message' => 'Portofolio tidak ditemukan.'], 404);
        }

        $portofolio->append(['gambar_suasana_url', 'gambar_karya_bebas_url']);

        return response()->json(['success' => true, 'data' => $portofolio]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Only super_admin and admin_cabang can create
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk menambahkan portofolio.'], 403);
        }

        $validated = $request->validate([
            'alumni_id' => 'required|integer|exists:alumni,id',
            'gambar_suasana' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'gambar_karya_bebas' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        // If admin_cabang, ensure alumni belongs to same cabang
        if ($user->role === 'admin_cabang') {
            $alumni = Alumni::with('siswa')->find($validated['alumni_id']);
            if (!$alumni || !$alumni->siswa || $alumni->siswa->cabang_id !== $user->cabang_id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk alumni dari cabang lain.'], 403);
            }
        }

        $gambarSuasanaPath = $request->file('gambar_suasana')->store('portofolio_alumni', 'public');
        $gambarKaryaPath = $request->file('gambar_karya_bebas')->store('portofolio_alumni', 'public');

        $portofolio = PortofolioAlumni::create([
            'alumni_id' => $validated['alumni_id'],
            'gambar_suasana' => $gambarSuasanaPath,
            'gambar_karya_bebas' => $gambarKaryaPath,
        ]);

        $portofolio->load(['alumni.siswa.cabang', 'alumni.siswa.program'])->append(['gambar_suasana_url', 'gambar_karya_bebas_url']);

        return response()->json(['success' => true, 'data' => $portofolio], 201);
    }

    public function update(Request $request, $id)
    {
        $portofolio = PortofolioAlumni::find($id);

        if (!$portofolio) {
            return response()->json(['success' => false, 'message' => 'Portofolio tidak ditemukan.'], 404);
        }

        $user = $request->user();

        // Only super_admin and admin_cabang can update
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk memperbarui portofolio.'], 403);
        }

        $validated = $request->validate([
            'alumni_id' => 'required|integer|exists:alumni,id',
            'gambar_suasana' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'gambar_karya_bebas' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($user->role === 'admin_cabang') {
            $alumni = Alumni::with('siswa')->find($validated['alumni_id']);
            if (!$alumni || !$alumni->siswa || $alumni->siswa->cabang_id !== $user->cabang_id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk alumni dari cabang lain.'], 403);
            }
        }

        $portofolio->alumni_id = $validated['alumni_id'];

        if ($request->hasFile('gambar_suasana')) {
            if ($portofolio->gambar_suasana) {
                Storage::disk('public')->delete($portofolio->gambar_suasana);
            }
            $portofolio->gambar_suasana = $request->file('gambar_suasana')->store('portofolio_alumni', 'public');
        }

        if ($request->hasFile('gambar_karya_bebas')) {
            if ($portofolio->gambar_karya_bebas) {
                Storage::disk('public')->delete($portofolio->gambar_karya_bebas);
            }
            $portofolio->gambar_karya_bebas = $request->file('gambar_karya_bebas')->store('portofolio_alumni', 'public');
        }

        $portofolio->save();

        $portofolio->load(['alumni.siswa.cabang', 'alumni.siswa.program'])->append(['gambar_suasana_url', 'gambar_karya_bebas_url']);

        return response()->json(['success' => true, 'data' => $portofolio]);
    }

    public function destroy($id)
    {
        $portofolio = PortofolioAlumni::find($id);

        if (!$portofolio) {
            return response()->json(['success' => false, 'message' => 'Portofolio tidak ditemukan.'], 404);
        }

        $user = request()->user();

        // Only super_admin and admin_cabang can delete
        if (!in_array($user->role, ['super_admin', 'admin_cabang'])) {
            return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk menghapus portofolio.'], 403);
        }

        // If admin_cabang, ensure alumni belongs to same cabang
        if ($user->role === 'admin_cabang') {
            $alumni = Alumni::with('siswa')->find($portofolio->alumni_id);
            if (!$alumni || !$alumni->siswa || $alumni->siswa->cabang_id !== $user->cabang_id) {
                return response()->json(['success' => false, 'message' => 'Anda tidak memiliki akses untuk portofolio dari cabang lain.'], 403);
            }
        }

        if ($portofolio->gambar_suasana) {
            Storage::disk('public')->delete($portofolio->gambar_suasana);
        }
        if ($portofolio->gambar_karya_bebas) {
            Storage::disk('public')->delete($portofolio->gambar_karya_bebas);
        }

        $portofolio->delete();

        return response()->json(['success' => true, 'message' => 'Portofolio berhasil dihapus.']);
    }
}
