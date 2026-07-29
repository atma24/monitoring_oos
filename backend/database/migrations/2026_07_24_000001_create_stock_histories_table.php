<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->string('sap_id', 50);
            $table->date('stockdate');
            $table->date('og_urgent_date')->nullable();
            $table->string('account', 50)->nullable();
            $table->string('outlet_name', 255)->nullable();
            $table->string('source', 50)->nullable();
            $table->string('region', 20)->nullable();
            $table->string('supplier', 255)->nullable();
            $table->string('jwk', 50)->nullable();
            $table->decimal('dsi', 10, 2)->nullable()->default(0);
            $table->string('category', 10)->nullable();
            $table->foreignId('depo_id')->nullable()->constrained('depo')->nullOnDelete();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('uploaded_at')->nullable();
            $table->timestamps();

            $table->index('sap_id');
            $table->index('stockdate');
            $table->index('uploaded_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_histories');
    }
};
