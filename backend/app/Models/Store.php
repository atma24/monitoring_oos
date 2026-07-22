<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    protected $fillable = [
        'sap_id', 'outlet_name', 'street', 'city', 'postal_code', 'depo_id',
    ];

    public function stockRecords(): HasMany
    {
        return $this->hasMany(StockRecord::class);
    }

    public function latestStock(): HasOne
    {
        return $this->hasOne(StockRecord::class)->latestOfMany('stockdate');
    }

    public function deliveryStatuses(): HasMany
    {
        return $this->hasMany(DeliveryStatus::class);
    }

    public function latestDelivery(): HasOne
    {
        return $this->hasOne(DeliveryStatus::class)->latestOfMany('check_date');
    }

    public function depo(): BelongsTo
    {
        return $this->belongsTo(Depot::class, 'depo_id');
    }
}
