<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KategoriProgram extends Model
{
    use HasFactory;

    protected $table = 'kategori_program';

    protected $fillable = [
        'nama',
        'deskripsi',
        'tipe',
    ];

    public function program(): HasMany
    {
        return $this->hasMany(Program::class);
    }
}
