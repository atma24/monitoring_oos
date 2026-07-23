<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Depo extends Model
{
    // Mengarahkan model ke nama tabel yang benar (tanpa huruf s di belakang)
    protected $table = 'depo'; 

    protected $fillable = [
        'name', 'address', 'city', 'postal_code', 'contact_person', 'contact_phone',
    ];

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class, 'depo_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'depo_id');
    }

    public function stockRecords(): HasMany
    {
        return $this->hasMany(StockRecord::class, 'depo_id');
    }

    public function deliveryStatuses(): HasMany
    {
        return $this->hasMany(DeliveryStatus::class, 'depo_id');
    }
}