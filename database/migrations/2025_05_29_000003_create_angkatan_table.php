<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('angkatan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cabang_id')->constrained('cabang')->onDelete('cascade');
            $table->integer('tahun');
            $table->enum('program', ['reguler', 'intensif']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('angkatan');
    }
};
