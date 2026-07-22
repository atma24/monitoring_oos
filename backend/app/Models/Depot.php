<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Depot extends Model
{
    protected $table = 'depo';

    protected $fillable = [
        'name', 'address', 'contact_person', 'contact_phone',
    ];

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class, 'depo_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'depo_id');
    }
}
