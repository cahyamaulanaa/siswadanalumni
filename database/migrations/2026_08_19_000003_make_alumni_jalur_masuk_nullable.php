<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE alumni MODIFY jalur_masuk ENUM('snbp', 'snbt', 'mandiri') NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("UPDATE alumni SET jalur_masuk = 'mandiri' WHERE jalur_masuk IS NULL");
        DB::statement("ALTER TABLE alumni MODIFY jalur_masuk ENUM('snbp', 'snbt', 'mandiri') NOT NULL");
    }
};
