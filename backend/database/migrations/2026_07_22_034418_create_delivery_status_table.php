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
    Schema::create('delivery_status', function (Blueprint $table) {
        $table->id();
        $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
        $table->string('sap_id', 50);
        $table->string('site_name')->nullable();
        $table->string('cust_name')->nullable();
        $table->string('sales_type', 50)->nullable();
        $table->string('po_number', 100)->nullable();
        $table->string('so_number', 100)->nullable();
        $table->string('product_id', 50)->nullable();
        $table->string('product_name')->nullable();
        $table->date('orig_deliv_date')->nullable();
        $table->integer('po_qty')->default(0);
        $table->integer('do_qty')->default(0);
        $table->string('billing_block', 20)->nullable();
        $table->string('driver_name')->nullable();
        $table->string('status', 20)->default('DELIVERED');
        $table->date('check_date');
        $table->foreignId('depo_id')->nullable()->constrained('depo')->onDelete('set null');
        $table->timestamps();

        $table->unique(['store_id', 'check_date'], 'uniq_store_check_date');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_status');
    }
};
