<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('cabang')->orderBy('created_at', 'desc');

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        $perPage = $request->input('per_page', 20);
        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $users->items(),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:150',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:super_admin,admin_cabang,pengajar,direksi,staff_karyawan',
            'cabang_id' => 'nullable|integer|exists:cabang,id',
            'is_active' => 'boolean',
        ]);

        if ($validated['role'] === 'admin_cabang' && empty($validated['cabang_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cabang harus dipilih untuk role Admin Cabang.',
            ], 422);
        }

        $user = User::create([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'cabang_id' => $validated['role'] === 'admin_cabang' ? $validated['cabang_id'] : null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User berhasil dibuat.',
        ], 201);
    }

    public function show($id)
    {
        $user = User::with('cabang')->find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|required|string|max:150',
            'email' => "sometimes|required|email|unique:users,email,{$id}",
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'sometimes|required|string|in:super_admin,admin_cabang,pengajar,direksi,staff_karyawan',
            'cabang_id' => 'nullable|integer|exists:cabang,id',
            'is_active' => 'boolean',
        ]);

        if (isset($validated['nama'])) $user->nama = $validated['nama'];
        if (isset($validated['email'])) $user->email = $validated['email'];
        if (!empty($validated['password'])) $user->password = Hash::make($validated['password']);
        if (isset($validated['role'])) $user->role = $validated['role'];
        if (array_key_exists('cabang_id', $validated)) $user->cabang_id = $validated['cabang_id'];
        if ($request->has('is_active')) $user->is_active = $request->boolean('is_active');

        $user->save();

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User berhasil diperbarui.',
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User tidak ditemukan.',
            ], 404);
        }

        // Remove any API tokens first (Sanctum) to avoid orphaned tokens
        if (method_exists($user, 'tokens')) {
            try {
                $user->tokens()->delete();
            } catch (\Exception $e) {
                // ignore token deletion errors, proceed with forced delete
            }
        }

        // Use forceDelete to permanently remove the user from the database
        $user->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil dihapus permanently.',
        ]);
    }
}
