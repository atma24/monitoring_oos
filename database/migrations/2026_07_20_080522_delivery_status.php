<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_status', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->string('sap_id', 50)->index();
            $table->enum('status', ['DELIVERED', 'UNDELIVERED'])->default('DELIVERED')->index();
            $table->date('check_date')->index();
            $table->timestamps();

            // Memastikan 1 record per toko per upload sesuai dokumen
            $table->unique(['store_id', 'check_date'], 'uniq_store_check_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_status');
    }
};
