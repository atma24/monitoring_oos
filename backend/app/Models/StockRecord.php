<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockRecord extends Model
{
    protected $fillable = [
        'store_id', 'sap_id', 'stockdate', 'og_urgent_date',
        'account', 'outlet_name', 'source', 'region', 'supplier',
        'jwk', 'dsi', 'category', 'depo_id',
    ];

    protected $casts = [
        'stockdate' => 'date',
        'og_urgent_date' => 'date',
        'dsi' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
