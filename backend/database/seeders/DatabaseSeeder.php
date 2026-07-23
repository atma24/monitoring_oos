<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Depo;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Buat 1 Depo awal
        $depo = Depo::create([
            'id' => 9030,
            'name' => 'Depo Pusat Bekasi',
            'address' => 'Jl. Jend. Sudirman, Bekasi',
            'city' => 'Bekasi',
        ]);

        // 1. Akun Admin (Akses Penuh)
        User::create([
            'name' => 'Admin Super',
            'email' => 'admin@oos.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'depo_id' => $depo->id,
        ]);

        // 2. Akun Kepala Distribusi (Bisa Upload, Tidak bisa kelola User)
        User::create([
            'name' => 'Kepala Distribusi',
            'email' => 'kepala@oos.com',
            'password' => Hash::make('password123'),
            'role' => 'kepala_distribusi',
            'depo_id' => $depo->id,
        ]);

        // 3. Akun Supervisor (Read-only)
        User::create([
            'name' => 'Supervisor Area',
            'email' => 'spv@oos.com',
            'password' => Hash::make('password123'),
            'role' => 'supervisor_distribusi',
            'depo_id' => $depo->id,
        ]);
    }
}