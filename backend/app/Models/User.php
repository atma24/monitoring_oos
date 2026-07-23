<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Pastikan baris ini ada
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // Aktifkan HasApiTokens untuk otentikasi login

    protected $fillable = [
        'name',
        'email',
        'password',
        'role', // Tambahkan role
        'depo_id', // Tambahkan depo_id
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relasi ke Depo
    public function depo(): BelongsTo
    {
        return $this->belongsTo(Depo::class, 'depo_id');
    }
}