<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            // Add a temporary column
            $table->date('tahun_masuk_temp')->nullable();
        });

        // Convert data from tahun_masuk (integer) to tahun_masuk_temp (date)
        // For existing year values, convert them to '2024-01-01' format
        DB::statement("UPDATE siswa SET tahun_masuk_temp = CONCAT(tahun_masuk, '-01-01') WHERE tahun_masuk IS NOT NULL");

        Schema::table('siswa', function (Blueprint $table) {
            // Drop the old column
            $table->dropColumn('tahun_masuk');
        });

        Schema::table('siswa', function (Blueprint $table) {
            // Rename temporary column to tahun_masuk
            $table->renameColumn('tahun_masuk_temp', 'tahun_masuk');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            // Add back the old integer column temporarily
            $table->integer('tahun_masuk_temp')->nullable();
        });

        // Convert data back from date to year
        DB::statement("UPDATE siswa SET tahun_masuk_temp = YEAR(tahun_masuk) WHERE tahun_masuk IS NOT NULL");

        Schema::table('siswa', function (Blueprint $table) {
            // Drop the date column
            $table->dropColumn('tahun_masuk');
        });

        Schema::table('siswa', function (Blueprint $table) {
            // Rename back to tahun_masuk
            $table->renameColumn('tahun_masuk_temp', 'tahun_masuk');
        });
    }
};
