<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo; // Pastikan ini ter-import

class StockRecord extends Model
{
    use HasFactory;

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

    // TAMBAHKAN RELASI INI
    public function depo(): BelongsTo
    {
        // Parameter kedua 'depo_id' ditambahkan untuk berjaga-jaga 
        // memastikan Laravel membaca Foreign Key dengan benar
        return $this->belongsTo(Depo::class, 'depo_id');
    }
}