<?php

namespace Tests\Feature;

use App\Models\Alumni;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SiswaBulkToAlumniTest extends TestCase
{
    use RefreshDatabase;

    public function test_bulk_conversion_creates_alumni_and_keeps_siswa_record(): void
    {
        $user = User::factory()->create([
            'role' => 'super_admin',
            'is_active' => true,
        ]);

        $siswa = Siswa::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/siswa/bulk-to-alumni', [
            'ids' => [$siswa->id],
            'ptn_diterima' => 'UI',
            'jurusan' => 'Teknik Informatika',
            'jalur_masuk' => 'snbt',
            'tahun_diterima' => 2025,
        ]);

        $response->assertOk();
        $this->assertTrue(Alumni::where('siswa_id', $siswa->id)->exists());
        $this->assertTrue(Siswa::withTrashed()->where('id', $siswa->id)->exists());
        $this->assertNotNull(Siswa::withTrashed()->find($siswa->id));
    }
}
