<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('ALTER TABLE alumni MODIFY tahun_diterima INT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('UPDATE alumni SET tahun_diterima = 0 WHERE tahun_diterima IS NULL');
        DB::statement('ALTER TABLE alumni MODIFY tahun_diterima INT NOT NULL');
    }
};
