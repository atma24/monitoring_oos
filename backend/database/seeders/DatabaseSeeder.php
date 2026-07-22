<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Depot;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $depo1 = Depot::create([
            'name' => 'Depo Yogyakarta',
            'address' => 'Jl. Yogyakarta No. 1',
            'contact_person' => 'Budi',
            'contact_phone' => '081234567890',
        ]);

        $depo2 = Depot::create([
            'name' => 'Depo Solo',
            'address' => 'Jl. Solo No. 1',
            'contact_person' => 'Ani',
            'contact_phone' => '081234567891',
        ]);

        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => Role::Admin,
        ]);

        User::create([
            'name' => 'Kepala Distribusi',
            'email' => 'kepala@example.com',
            'password' => Hash::make('password'),
            'role' => Role::KepalaDistribusi,
        ]);

        User::create([
            'name' => 'Supervisor Yogyakarta',
            'email' => 'supervisor@example.com',
            'password' => Hash::make('password'),
            'role' => Role::SupervisorDistribusi,
            'depo_id' => $depo1->id,
        ]);

        User::create([
            'name' => 'Supervisor Solo',
            'email' => 'supervisor2@example.com',
            'password' => Hash::make('password'),
            'role' => Role::SupervisorDistribusi,
            'depo_id' => $depo2->id,
        ]);
    }
}
