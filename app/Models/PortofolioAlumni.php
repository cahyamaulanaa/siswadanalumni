<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortofolioAlumni extends Model
{
    use HasFactory;

    protected $table = 'portofolio_alumni';

    protected $fillable = [
        'alumni_id',
        'gambar_suasana',
        'gambar_karya_bebas',
    ];

    protected $appends = [
        'gambar_suasana_url',
        'gambar_karya_bebas_url',
    ];

    public function alumni(): BelongsTo
    {
        return $this->belongsTo(Alumni::class);
    }

    public function getGambarSuasanaUrlAttribute(): ?string
    {
        return $this->resolveImageUrl($this->gambar_suasana);
    }

    public function getGambarKaryaBebasUrlAttribute(): ?string
    {
        return $this->resolveImageUrl($this->gambar_karya_bebas);
    }

    protected function resolveImageUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        $relativePath = str_starts_with($path, 'public/') ? Str::after($path, 'public/') : $path;

        if (!Storage::disk('public')->exists($relativePath)) {
            return null;
        }

        $relativeUrl = '/storage/' . ltrim($relativePath, '/');

        $request = request();
        if ($request) {
            $baseUrl = rtrim($request->getSchemeAndHttpHost() . $request->getBaseUrl(), '/');

            return $baseUrl . $relativeUrl;
        }

        return url($relativeUrl);
    }
}
