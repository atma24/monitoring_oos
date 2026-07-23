<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait FiltersByDepo
{
    /**
     * Membatasi query agar SEMUA ROLE hanya bisa melihat data di deponya sendiri.
     */
    public function applyDepoFilter(Builder $query, Request $request): void
    {
        $user = $request->user();
        
        // Selama user punya depo_id, kunci semua datanya ke depo tersebut
        if ($user && $user->depo_id) {
            $query->where('depo_id', $user->depo_id);
        }
    }
}