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
    Schema::create('stock_records', function (Blueprint $table) {
        $table->id();
        $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
        $table->string('sap_id', 50);
        $table->date('stockdate');
        $table->date('og_urgent_date')->nullable();
        $table->string('account', 50)->nullable();
        $table->string('outlet_name');
        $table->string('source', 50)->nullable();
        $table->string('region', 20)->nullable();
        $table->string('supplier')->nullable();
        $table->string('jwk', 50)->nullable();
        $table->decimal('dsi', 10, 2)->default(0);
        $table->string('category', 10)->nullable();
        $table->foreignId('depo_id')->nullable()->constrained('depo')->onDelete('set null');
        $table->timestamps();

        $table->unique(['store_id', 'stockdate'], 'uniq_store_date');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_records');
    }
};
