<?php

namespace App\Models;

use App\Enums\Role;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'depo_id'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === Role::Admin;
    }

    public function isKepalaDistribusi(): bool
    {
        return $this->role === Role::KepalaDistribusi;
    }

    public function isSupervisorDistribusi(): bool
    {
        return $this->role === Role::SupervisorDistribusi;
    }

    public function canManageUsers(): bool
    {
        return $this->role === Role::Admin;
    }

    public function canWrite(): bool
    {
        return $this->role !== Role::SupervisorDistribusi;
    }

    public function depo(): BelongsTo
    {
        return $this->belongsTo(Depot::class, 'depo_id');
    }
}
