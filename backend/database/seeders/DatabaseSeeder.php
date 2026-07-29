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
            'name' => 'Depo Yogyakarta',
            'address' => 'Jalan Magelang No.Km 8, Mulungan Wetan, Sendangadi, Kec. Mlati, Kabupaten Sleman',
            'postal_code' => '55285',
            'city' => 'Yogyakarta',
        ]);

        // 1. Akun Admin (Akses Penuh)
        User::create([
            'name' => 'admin9030',
            'email' => 'admin9030@oos.com',
            'password' => Hash::make('danone'),
            'role' => 'admin',
            'depo_id' => $depo->id,
        ]);

        user::create([
            'name' => 'kepala depo',
            'email' => 'kepala dep@oos.com',
            'password' => Hash::make('danone'),
            'role' => 'kepala_depo',
            'depo_id' => $depo->id,
        ]);

        // 2. Akun Kepala Distribusi (Bisa Upload, Tidak bisa kelola User)
        User::create([
            'name' => 'Kepala Distribusi',
            'email' => 'kepala@oos.com',
            'password' => Hash::make('danone'),
            'role' => 'kepala_distribusi',
            'depo_id' => $depo->id,
        ]);

        // 3. Akun Supervisor (Read-only)
        User::create([
            'name' => 'Supervisor Area',
            'email' => 'spv@oos.com',
            'password' => Hash::make('danone'),
            'role' => 'supervisor_distribusi',
            'depo_id' => $depo->id,
        ]);
    }
}