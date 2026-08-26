<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Program extends Model
{
    use HasFactory;

    protected $table = 'program';

    protected $fillable = [
        'kategori_program_id',
        'nama',
        'kelas_min',
        'kelas_max',
        'deskripsi',
    ];

    public function kategoriProgram(): BelongsTo
    {
        return $this->belongsTo(KategoriProgram::class);
    }

    public function siswa(): BelongsToMany
    {
        return $this->belongsToMany(Siswa::class, 'siswa_program')->withTimestamps();
    }

    /**
     * Get programs untuk kelas tertentu
     */
    public static function getByKelas($kelas)
    {
        return self::whereBetween('kelas_min', [1, $kelas])
            ->where('kelas_max', '>=', $kelas)
            ->get();
    }
}
