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
        if (!Schema::hasTable('stores')) {
            Schema::create('stores', function (Blueprint $table) {
                $table->id();
                $table->string('sap_id', 50)->unique();
                $table->string('outlet_name');
                $table->string('street')->nullable();
                $table->string('city')->nullable();
                $table->string('postal_code', 20)->nullable();
                $table->foreignId('depo_id')->nullable()->constrained('depo')->nullOnDelete();
                $table->timestamps();
                $table->index('sap_id');
            });
        } else {
            Schema::table('stores', function (Blueprint $table) {
                if (!Schema::hasColumn('stores', 'depo_id')) {
                    $table->foreignId('depo_id')->nullable()->constrained('depo')->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('stores')) {
            Schema::table('stores', function (Blueprint $table) {
                $table->dropForeign(['depo_id']);
                $table->dropColumn('depo_id');
            });
        }
    }
};
