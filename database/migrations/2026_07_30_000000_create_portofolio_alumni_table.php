<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('portofolio_alumni', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alumni_id')->constrained('alumni')->cascadeOnDelete();
            $table->string('gambar_suasana');
            $table->string('gambar_karya_bebas');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('portofolio_alumni');
    }
};
