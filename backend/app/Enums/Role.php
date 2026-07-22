<?php

namespace App\Enums;

enum Role: string
{
    case Admin = 'admin';
    case KepalaDistribusi = 'kepala_distribusi';
    case SupervisorDistribusi = 'supervisor_distribusi';
}
