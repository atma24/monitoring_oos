<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('store_id')->constrained('stores')->onDelete('cascade');
            $table->string('sap_id', 50)->index();
            $table->date('stockdate')->index();
            $table->string('brand', 100)->nullable();
            $table->integer('stock')->default(0);
            $table->integer('stockc')->default(0);
            $table->integer('sellout')->default(0);
            $table->decimal('dsi', 10, 2)->nullable()->default(0);
            $table->enum('category', ['RED', 'YELLOW', 'GREEN'])->nullable()->index();
            $table->string('jwk', 50)->nullable();
            $table->enum('oos', ['YES', 'NO'])->default('NO')->index();
            $table->integer('og_urgent')->nullable()->default(0);
            $table->integer('og_total')->nullable()->default(0);
            $table->timestamps();

            // Constraint unik kombinasi 3 kolom sesuai desain
            $table->unique(['store_id', 'stockdate', 'brand'], 'uniq_store_date_brand');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_records');
    }
};
