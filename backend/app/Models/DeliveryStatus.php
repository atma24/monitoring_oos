<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryStatus extends Model
{
    // Mengarahkan ke nama tabel yang tepat sesuai migration
    protected $table = 'delivery_status';

    protected $fillable = [
        'store_id', 'sap_id', 'site_name', 'cust_name',
        'sales_type', 'po_number', 'so_number', 'product_id',
        'product_name', 'orig_deliv_date', 'po_qty', 'do_qty',
        'billing_block', 'driver_name', 'status', 'check_date', 'depo_id',
    ];

    protected $casts = [
        'check_date' => 'date',
        'orig_deliv_date' => 'date',
        'po_qty' => 'integer',
        'do_qty' => 'integer',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}