<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Depo;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $depo1 = Depo::create([
            'id' => 9030,
            'name' => 'Depo Yogyakarta (AQUA)',
            'address' => 'Jalan Magelang No.Km 8, Mulungan Wetan, Sendangadi, Kec. Mlati, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55285',
            'city' => 'YOGYAKARTA',
            'postal_code' => '55285',
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Admin,
            'depo_id' => $depo1->id,
        ]);

        User::create([
            'name' => 'Kepala Distribusi',
            'email' => 'kepala@example.com',
            'password' => Hash::make('password'),
            'role' => Role::KepalaDistribusi,
            'depo_id' => $depo1->id,
        ]);

        User::create([
            'name' => 'Supervisor Yogyakarta',
            'email' => 'supervisor@example.com',
            'password' => Hash::make('password'),
            'role' => Role::SupervisorDistribusi,
            'depo_id' => $depo1->id,
        ]);
    }
}
