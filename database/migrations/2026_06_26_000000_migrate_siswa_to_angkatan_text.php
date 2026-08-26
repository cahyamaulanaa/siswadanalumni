<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            if (!Schema::hasColumn('siswa', 'angkatan_text')) {
                $table->string('angkatan_text', 150)->nullable()->after('cabang_id');
            }
        });

        if (Schema::hasColumn('siswa', 'angkatan_id')) {
            DB::statement(
                "UPDATE siswa
                 JOIN angkatan ON siswa.angkatan_id = angkatan.id
                 SET siswa.angkatan_text = CONCAT(angkatan.tahun, ' - ', angkatan.program)
                 WHERE siswa.angkatan_id IS NOT NULL"
            );
        }

        Schema::table('siswa', function (Blueprint $table) {
            if (Schema::hasColumn('siswa', 'angkatan_id')) {
                $table->dropForeign(['angkatan_id']);
                $table->dropColumn('angkatan_id');
            }
            if (Schema::hasColumn('siswa', 'status')) {
                $table->dropColumn('status');
            }
        });

        Schema::table('siswa', function (Blueprint $table) {
            $table->string('angkatan_text', 150)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('siswa', function (Blueprint $table) {
            if (!Schema::hasColumn('siswa', 'angkatan_id')) {
                $table->foreignId('angkatan_id')->nullable()->constrained('angkatan')->onDelete('cascade')->after('cabang_id');
            }
            if (!Schema::hasColumn('siswa', 'status')) {
                $table->enum('status', ['aktif', 'alumni'])->default('aktif')->after('foto');
            }
        });

        if (Schema::hasColumn('siswa', 'angkatan_id')) {
            DB::statement(
                "UPDATE siswa
                 LEFT JOIN angkatan ON siswa.angkatan_text = CONCAT(angkatan.tahun, ' - ', angkatan.program)
                 SET siswa.angkatan_id = angkatan.id
                 WHERE siswa.angkatan_id IS NULL"
            );
        }

        DB::statement(
            "UPDATE siswa
             SET status = 'alumni'
             WHERE id IN (SELECT siswa_id FROM alumni)"
        );

        Schema::table('siswa', function (Blueprint $table) {
            $table->dropColumn('angkatan_text');
        });
    }
};
