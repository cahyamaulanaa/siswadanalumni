<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KategoriProgram;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class KategoriProgramController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage <= 0) $perPage = 20;
        $items = KategoriProgram::orderBy('nama')->paginate($perPage);
        return response()->json([
            'success' => true,
            'data' => $items->items(),
            'pagination' => [
                'total' => $items->total(),
                'per_page' => $items->perPage(),
                'current_page' => $items->currentPage(),
                'last_page' => $items->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('kategori_program', 'nama')],
            'deskripsi' => ['nullable', 'string'],
            'tipe' => ['nullable', 'string', 'max:100'],
        ]);

        $kategori = KategoriProgram::create($data);

        return response()->json(['success' => true, 'data' => $kategori, 'message' => 'Kategori program berhasil dibuat']);
    }

    public function show($id)
    {
        $kategori = KategoriProgram::findOrFail($id);
        return response()->json(['success' => true, 'data' => $kategori]);
    }

    public function update(Request $request, $id)
    {
        $kategori = KategoriProgram::findOrFail($id);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('kategori_program', 'nama')->ignore($kategori->id)],
            'deskripsi' => ['nullable', 'string'],
            'tipe' => ['nullable', 'string', 'max:100'],
        ]);

        $kategori->update($data);

        return response()->json(['success' => true, 'data' => $kategori, 'message' => 'Kategori program berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $kategori = KategoriProgram::findOrFail($id);
        $kategori->delete();
        return response()->json(['success' => true, 'message' => 'Kategori program dihapus']);
    }
}
