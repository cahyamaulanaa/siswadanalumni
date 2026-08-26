<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('alumni', function (Blueprint $table) {
            if (!Schema::hasColumn('alumni', 'status_kelulusan')) {
                $table->enum('status_kelulusan', ['lolos', 'tidak_lolos'])->nullable()->after('siswa_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('alumni', function (Blueprint $table) {
            if (Schema::hasColumn('alumni', 'status_kelulusan')) {
                $table->dropColumn('status_kelulusan');
            }
        });
    }
};
