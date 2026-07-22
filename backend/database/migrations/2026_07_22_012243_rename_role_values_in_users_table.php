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
        DB::table('users')->where('role', 'kepala_supervisor')->update(['role' => 'kepala_distribusi']);
        DB::table('users')->where('role', 'supervisor')->update(['role' => 'supervisor_distribusi']);
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'kepala_distribusi')->update(['role' => 'kepala_supervisor']);
        DB::table('users')->where('role', 'supervisor_distribusi')->update(['role' => 'supervisor']);
    }
};
