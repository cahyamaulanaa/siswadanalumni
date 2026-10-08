<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Siswa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'siswa';

    protected $fillable = [
        'cabang_id',
        'nama_lengkap',
        'asal_sekolah',
        'tanggal_lahir',
        'jenis_kelamin',
        'no_hp',
        'provinsi_code',
        'kabupaten_code',
        'kecamatan_code',
        'desa_code',
        'jalan',
        'alamat',
        'email',
        'informasi_villa_merah',
        'foto',
        'tahun_masuk',
        'tahun_lulus',
        'kelas',
    ];

    protected function casts(): array
    {
        return [
            'tanggal_lahir' => 'date',
            'tahun_masuk' => 'date',
        ];
    }

    public function cabang(): BelongsTo
    {
        return $this->belongsTo(Cabang::class);
    }

    public function alumni(): HasOne
    {
        return $this->hasOne(Alumni::class);
    }

    public function program(): BelongsToMany
    {
        return $this->belongsToMany(Program::class, 'siswa_program');
    }
}
