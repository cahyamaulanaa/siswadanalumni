<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            // wilayah codes from wilayah.id API
            $table->string('provinsi_code', 20)->nullable()->after('no_hp');
            $table->string('kabupaten_code', 20)->nullable()->after('provinsi_code');
            $table->string('kecamatan_code', 20)->nullable()->after('kabupaten_code');
            $table->string('desa_code', 20)->nullable()->after('kecamatan_code');

            // jalan (street) stored separately from alamat which is the full assembled address
            $table->string('jalan', 250)->nullable()->after('desa_code');
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn(['provinsi_code', 'kabupaten_code', 'kecamatan_code', 'desa_code', 'jalan']);
        });
    }
};
