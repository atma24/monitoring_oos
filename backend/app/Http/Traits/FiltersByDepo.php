<?php

namespace App\Http\Traits;

use App\Enums\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait FiltersByDepo
{
    protected function applyDepoFilter(Builder $query, Request $request): Builder
    {
        $user = $request->user();

        if ($user && $user->role === Role::SupervisorDistribusi && $user->depo_id) {
            $table = $query->getModel()->getTable();
            $query->where("{$table}.depo_id", $user->depo_id);
        }

        return $query;
    }
}
