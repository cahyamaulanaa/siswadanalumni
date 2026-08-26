<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->query('per_page', 20);
        if ($perPage <= 0) $perPage = 20;

        $query = Program::with('kategoriProgram')->orderBy('nama');

        $items = $query->paginate($perPage);

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
            'nama' => ['required', 'string', 'max:255', Rule::unique('program', 'nama')],
            'kategori_program_id' => ['required', 'exists:kategori_program,id'],
            'kelas_min' => ['required', 'integer', 'between:1,12'],
            'kelas_max' => ['required', 'integer', 'between:1,12'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        if ($data['kelas_min'] > $data['kelas_max']) {
            return response()->json(['success' => false, 'message' => 'kelas_min tidak boleh lebih besar dari kelas_max'], 422);
        }

        $program = Program::create($data);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil dibuat']);
    }

    public function show($id)
    {
        $program = Program::with('kategoriProgram')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $program]);
    }

    public function update(Request $request, $id)
    {
        $program = Program::findOrFail($id);

        $data = $request->validate([
            'nama' => ['required', 'string', 'max:255', Rule::unique('program', 'nama')->ignore($program->id)],
            'kategori_program_id' => ['required', 'exists:kategori_program,id'],
            'kelas_min' => ['required', 'integer', 'between:1,12'],
            'kelas_max' => ['required', 'integer', 'between:1,12'],
            'deskripsi' => ['nullable', 'string'],
        ]);

        if ($data['kelas_min'] > $data['kelas_max']) {
            return response()->json(['success' => false, 'message' => 'kelas_min tidak boleh lebih besar dari kelas_max'], 422);
        }

        $program->update($data);

        return response()->json(['success' => true, 'data' => $program, 'message' => 'Program berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $program = Program::findOrFail($id);
        $program->delete();
        return response()->json(['success' => true, 'message' => 'Program dihapus']);
    }
}
