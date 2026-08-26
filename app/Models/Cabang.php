<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cabang extends Model
{
    use HasFactory;

    protected $table = 'cabang';

    protected $fillable = [
        'nama',
        'kota',
        'alamat',
        'telepon',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function angkatan(): HasMany
    {
        return $this->hasMany(Angkatan::class);
    }

    public function siswa(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }

    public function sesiKelas(): HasMany
    {
        return $this->hasMany(SesiKelas::class);
    }
}
