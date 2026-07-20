<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->string('sap_id', 50)->unique();
            $table->string('outlet_id', 20);
            $table->string('outlet_name', 255);
            $table->string('account', 50)->nullable();
            $table->string('region', 20)->nullable()->index();
            $table->string('source', 50)->nullable();
            $table->string('supplier', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stores');
    }
};
