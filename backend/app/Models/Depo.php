<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // Jangan lupa import ini

class Depo extends Model
{
    use HasFactory;

    // Kunci wajib karena nama tabelmu tidak pakai 's' (singular)
    protected $table = 'depo';

    protected $fillable = [
        'name',
        'address',
        'city',
        'postal_code',
        'latitude',
        'longitude',
        'contact_person',
        'contact_phone',
    ];

    /**
     * Relasi: Satu Depo menyuplai banyak Toko
     */
    public function stores(): HasMany
    {
        return $this->hasMany(Store::class, 'depo_id');
    }

    /**
     * Relasi: Satu Depo memiliki banyak laporan Stock Record (OOS)
     */
    public function stockRecords(): HasMany
    {
        return $this->hasMany(StockRecord::class, 'depo_id');
    }

    /**
     * Relasi: Satu Depo memiliki banyak data Delivery (Adop)
     */
    public function deliveryStatuses(): HasMany
    {
        return $this->hasMany(DeliveryStatus::class, 'depo_id');
    }
}