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
    Schema::create('stores', function (Blueprint $table) {
        $table->id();
        $table->string('sap_id', 50)->unique();
        $table->string('outlet_name');
        $table->string('street')->nullable();
        $table->string('city')->nullable();
        $table->string('postal_code', 20)->nullable();
        $table->decimal('latitude', 10, 7)->nullable();
        $table->decimal('longitude', 10, 7)->nullable();
        $table->foreignId('depo_id')->nullable()->constrained('depo')->onDelete('set null');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
