<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockHistory extends Model
{
    protected $fillable = [
        'store_id', 'sap_id', 'stockdate', 'og_urgent_date',
        'account', 'outlet_name', 'source', 'region',
        'supplier', 'jwk', 'dsi', 'category', 'depo_id',
        'uploaded_by', 'uploaded_at',
    ];

    protected $casts = [
        'stockdate' => 'date',
        'og_urgent_date' => 'date',
        'uploaded_at' => 'datetime',
        'dsi' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function depo(): BelongsTo
    {
        return $this->belongsTo(Depo::class, 'depo_id');
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
