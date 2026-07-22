# Design Document - OOS Monitoring System

## 1. Architecture

```
┌─────────────────────┐      REST JSON       ┌──────────────────────┐
│  Frontend (Vite)    │  ──────────────────►  │  Backend (Laravel)   │
│  React + TypeScript │  ◄──────────────────  │  API Resource        │
│  /frontend/         │     Auth: Bearer      │  /backend/           │
└─────────────────────┘                       └──────────┬───────────┘
                                                          │
                                                          ▼
                                                   ┌──────────────┐
                                                   │    MySQL     │
                                                   └──────────────┘
```

---

## 2. Frontend Design

### 2.1 Layout

```
┌────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────────┐│
│ │          │ │  Header                                ││
│ │  LOGO    │ │  [Page Title]          [User ▼]        ││
│ │          │ ├────────────────────────────────────────┤│
│ │  📊 Dash │ │                                        ││
│ │  🏪 Stores│ │         CONTENT AREA                   ││
│ │  📦 Stocks│ │   (stats cards, tables, map, forms)   ││
│ │  🚚 Delivery││                                        ││
│ │  🏭 Depo  │ │                                        ││
│ │          │ └────────────────────────────────────────┤│
│ │  SIDEBAR │ │  Footer                                ││
│ │  (w-64)  │ └────────────────────────────────────────┘│
│ └──────────┘                                          │
└────────────────────────────────────────────────────────┘
```

**Routing:** React Router v7 — setiap halaman adalah route terpisah.

**Struktur halaman:**
- **Sidebar** (fixed kiri, lebar 256px) — navigasi utama via `<NavLink>`
- **Header** (fixed atas, offset kiri 256px) — judul halaman + dropdown user
- **Content** (padding 24px) — konten utama per halaman
- **Footer** (opsional) — copyright

### 2.2 Sidebar Component

```tsx
import { NavLink } from 'react-router-dom';

const navItems = [
  { icon: '📊', label: 'Dashboard', to: '/' },
  { icon: '🏪', label: 'Stores', to: '/stores' },
  { icon: '📦', label: 'Stocks', to: '/stocks' },
  { icon: '🚚', label: 'Delivery', to: '/delivery' },
  { icon: '🏭', label: 'Depo', to: '/depo' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 z-30">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-xl font-bold text-blue-600">OOS Monitor</span>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
```

### 2.3 Header Component

```tsx
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/stores': 'Stores',
  '/stocks': 'Stocks',
  '/delivery': 'Delivery',
  '/depo': 'Depo',
};

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'OOS Monitor';

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 ml-64">
      <h1 className="text-lg font-semibold text-gray-700">{title}</h1>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user?.name}</span>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Log Out
        </button>
      </div>
    </header>
  );
}
```

### 2.4 Card Design

Statistik cards (grid 2-6 kolom):

```tsx
interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: string;
}

export default function StatCard({ icon, label, value, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
      <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center text-${color}-600 text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
```

### 2.5 Table Design

```tsx
interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

export default function Table<T extends Record<string, unknown>>({ columns, data, onRowClick }: TableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            {columns.map((col) => (
              <th key={String(col.key)} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className="border-b last:border-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3">
                  {col.render ? col.render(row[col.key], row) : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 2.6 Page Layout per Fitur

**Dashboard:**
```
┌─────────────── Grid Kartu Statistik (6 kolom) ──────────────┐
│ [🏪 Total] [❗ OOS] [🔴 RED] [🟡 YELLOW] [🟢 GREEN] [🚫 Blm Kirim] │
├─────────────────────────────────────────────────────────────┤
│                     Peta Leaflet.js                          │
│              (marker berwarna sesuai category)                │
├─────────────────────────────────────────────────────────────┤
│           Tabel 10 toko terbaru / terbanyak OOS              │
└─────────────────────────────────────────────────────────────┘
```

**Stores Index:**
```
┌── Filter Bar ────────────────────────────────────────┐
│ [Cari...    ] [Region ▼] [🔍 Cari]                   │
├── Tabel ─────────────────────────────────────────────┤
│ SAP ID │ Nama │ Outlet │ Region │ Category │ OOS │ Kirim │
├── Pagination ────────────────────────────────────────┤
│ Page 1 of 10  < 1 2 3 4 5 >                         │
└──────────────────────────────────────────────────────┘
```

**Stocks Index:**
```
┌── Filter Bar ───────────────────────────────────────────┐
│ [Tanggal ▼] [Category ▼] [OOS ▼] [Filter]  [Upload Stok] │
├── Tabel ────────────────────────────────────────────────┤
│ Tanggal │ SAP │ Toko │ Stock │ SO │ DSI │ Cat │ OOS │ OG │
└─────────────────────────────────────────────────────────┘
```

**Upload Pages (Stocks & Delivery):**
```
┌── Upload File ────────────────────────────────────────┐
│                                                        │
│  ┌────────────────────────────────────────────────┐    │
│  │         [Drag & drop atau klik untuk upload]    │    │
│  └────────────────────────────────────────────────┘    │
│                                                        │
│  [📤 Upload]                                           │
│                                                        │
│  Hasil: 100 berhasil, 2 gagal                          │
│  ⚠ Row 5: SAP ID kosong                               │
└────────────────────────────────────────────────────────┘
```

### 2.7 Color Palette (Tailwind)

| Penggunaan | Kelas Tailwind |
|-----------|---------------|
| Sidebar background | `bg-white` |
| Sidebar item active | `bg-blue-50 text-blue-600 font-medium` |
| Header background | `bg-white border-b border-gray-200` |
| Card background | `bg-white rounded-xl shadow-sm border border-gray-200` |
| Primary button | `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2` |
| Secondary button | `bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg px-4 py-2` |
| Table header | `bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wide` |
| Badge RED | `bg-red-100 text-red-800` |
| Badge YELLOW | `bg-yellow-100 text-yellow-800` |
| Badge GREEN | `bg-green-100 text-green-800` |
| Badge OOS YES | `text-red-600 font-semibold` |
| Badge OOS NO | `text-green-600 font-semibold` |
| Badge TERKIRIM | `bg-green-100 text-green-800` |
| Badge BELUM TERKIRIM | `bg-orange-100 text-orange-800` |

### 2.8 Folder Structure (Frontend)

```
frontend/src/
├── main.tsx                 # Entry point + React Router setup
├── App.tsx                  # Layout wrapper (Sidebar + Header + Outlet)
├── types/
│   ├── store.ts             # Store, StockRecord, DeliveryStatus types
│   ├── depo.ts              # Depo types
│   ├── api.ts               # API response types (paginated, resources)
│   └── index.ts             # Re-export
├── api/
│   ├── client.ts            # Axios instance + interceptors
│   ├── stores.ts            # Store API calls
│   ├── stocks.ts            # Stock API calls
│   ├── depo.ts              # Depo API calls
│   └── delivery.ts          # Delivery API calls
├── hooks/
│   ├── useAuth.ts           # Auth context + login/logout
│   ├── useStores.ts         # React Query hooks for stores
│   ├── useStocks.ts         # React Query hooks for stocks
│   └── useDepo.ts           # React Query hooks for depo
├── components/
│   ├── Layout.tsx            # Sidebar + Header + <Outlet />
│   ├── Sidebar.tsx           # NavLink navigasi
│   ├── Header.tsx            # Page title + user dropdown
│   ├── StatCard.tsx          # Kartu statistik
│   ├── Table.tsx             # Generic table component
│   ├── Map.tsx               # Leaflet map wrapper
│   ├── FileUpload.tsx        # Drag & drop upload component
│   ├── Pagination.tsx        # Pagination component
│   └── Badge.tsx             # Category/OOS/Delivery badge
├── pages/
│   ├── Dashboard.tsx         # Peta + statistik + tabel
│   ├── Login.tsx             # Halaman login
│   ├── Stores/
│   │   ├── StoreList.tsx     # List toko + filter
│   │   └── StoreDetail.tsx   # Detail toko + riwayat stok
│   ├── Stocks/
│   │   ├── StockList.tsx     # Tabel stok + filter
│   │   ├── StockUpload.tsx   # Form upload stok
│   │   └── StockDetail.tsx   # Riwayat stok per toko
│   ├── Delivery/
│   │   └── DeliveryUpload.tsx # Form upload delivery
│   └── Depo/
│       ├── DepoList.tsx      # List depo
│       ├── DepoCreate.tsx    # Tambah depo
│       ├── DepoDetail.tsx    # Detail depo
│       └── DepoEdit.tsx      # Edit depo
├── lib/
│   └── utils.ts             # Helper functions
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

### 2.9 TypeScript Type Definitions

```ts
// frontend/src/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'kepala_distribusi' | 'supervisor_distribusi';
  depo_id: number | null;
}

export interface Store {
  id: number;
  sap_id: string;
  outlet_name: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  depo_id: number | null;
  category: 'RED' | 'YELLOW' | 'GREEN' | 'NO_DATA';
  dsi: number;
  latest_delivery: 'DELIVERED' | 'UNDELIVERED' | null;
  created_at: string;
  updated_at: string;
}

export interface StockRecord {
  id: number;
  store_id: number;
  sap_id: string;
  stockdate: string;
  og_urgent_date: string | null;
  account: string | null;
  outlet_name: string;
  source: string | null;
  region: string | null;
  supplier: string | null;
  jwk: string | null;
  dsi: number;
  category: 'RED' | 'YELLOW' | 'GREEN';
  depo_id: number | null;
  store?: Store;
}

export interface Depo {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_person: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryStatus {
  id: number;
  store_id: number;
  sap_id: string;
  site_name: string | null;
  cust_name: string | null;
  sales_type: string | null;
  po_number: string | null;
  so_number: string | null;
  product_id: string | null;
  product_name: string | null;
  orig_deliv_date: string | null;
  po_qty: number | null;
  do_qty: number | null;
  billing_block: string | null;
  driver_name: string | null;
  status: 'DELIVERED' | 'UNDELIVERED';
  check_date: string;
  depo_id: number | null;
  store?: Store;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

---

## 3. Database Schema

### 3.1 users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','kepala_distribusi','supervisor_distribusi') NOT NULL DEFAULT 'supervisor_distribusi',
    depo_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (depo_id) REFERENCES depo(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### 3.2 depo
```sql
CREATE TABLE depo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NULL,
    city VARCHAR(255) NULL,
    postal_code VARCHAR(20) NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    contact_person VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;
```

### 3.3 stores
```sql
CREATE TABLE stores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sap_id VARCHAR(50) NOT NULL UNIQUE,
    outlet_name VARCHAR(255) NOT NULL,
    street VARCHAR(255) NULL,
    city VARCHAR(255) NULL,
    postal_code VARCHAR(20) NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    depo_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_stores_sap_id (sap_id),
    INDEX idx_stores_city (city),
    INDEX idx_stores_depo_id (depo_id),
    FOREIGN KEY (depo_id) REFERENCES depo(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### 3.4 stock_records (Preventif)
```sql
CREATE TABLE stock_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT UNSIGNED NOT NULL,
    sap_id VARCHAR(50) NOT NULL,
    stockdate DATE NOT NULL,
    og_urgent_date DATE NULL,
    account VARCHAR(50) NULL,
    outlet_name VARCHAR(255) NULL,
    source VARCHAR(50) NULL,
    region VARCHAR(20) NULL,
    supplier VARCHAR(255) NULL,
    jwk VARCHAR(50) NULL,
    dsi DECIMAL(10,2) NULL DEFAULT 0,
    category VARCHAR(10) NULL,
    depo_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uniq_store_date (store_id, stockdate),
    INDEX idx_stock_sap_id (sap_id),
    INDEX idx_stock_date (stockdate),
    INDEX idx_stock_category (category),
    INDEX idx_stock_depo_id (depo_id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (depo_id) REFERENCES depo(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

### 3.5 delivery_status (Adop)
```sql
CREATE TABLE delivery_status (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT UNSIGNED NOT NULL,
    sap_id VARCHAR(50) NOT NULL,
    site_name VARCHAR(255) NULL,
    cust_name VARCHAR(255) NULL,
    sales_type VARCHAR(50) NULL,
    po_number VARCHAR(100) NULL,
    so_number VARCHAR(100) NULL,
    product_id VARCHAR(50) NULL,
    product_name VARCHAR(255) NULL,
    orig_deliv_date DATE NULL,
    po_qty INT NULL DEFAULT 0,
    do_qty INT NULL DEFAULT 0,
    billing_block VARCHAR(20) NULL,
    driver_name VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DELIVERED',
    check_date DATE NOT NULL,
    depo_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uniq_store_check_date (store_id, check_date),
    INDEX idx_delivery_sap_id (sap_id),
    INDEX idx_delivery_status (status),
    INDEX idx_delivery_date (check_date),
    INDEX idx_delivery_depo_id (depo_id),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (depo_id) REFERENCES depo(id) ON DELETE SET NULL
) ENGINE=InnoDB;
```

---

## 4. Eloquent Models

### 4.1 User.php (app/Models/User.php)
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role', 'depo_id'];

    protected $hidden = ['password'];

    protected $casts = ['role' => 'string'];

    public function depo()
    {
        return $this->belongsTo(Depot::class, 'depo_id');
    }
}
```

### 4.2 Store.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    use \App\Models\Traits\FiltersByDepo;

    protected $fillable = [
        'sap_id', 'outlet_name', 'street', 'city',
        'postal_code', 'latitude', 'longitude', 'depo_id',
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
```

### 4.3 StockRecord.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockRecord extends Model
{
    use \App\Models\Traits\FiltersByDepo;

    protected $fillable = [
        'store_id', 'sap_id', 'stockdate', 'og_urgent_date',
        'account', 'outlet_name', 'source', 'region',
        'supplier', 'jwk', 'dsi', 'category', 'depo_id',
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
```

### 4.4 DeliveryStatus.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryStatus extends Model
{
    use \App\Models\Traits\FiltersByDepo;

    protected $fillable = [
        'store_id', 'sap_id', 'site_name', 'cust_name',
        'sales_type', 'po_number', 'so_number', 'product_id',
        'product_name', 'orig_deliv_date', 'po_qty', 'do_qty',
        'billing_block', 'driver_name', 'status', 'check_date', 'depo_id',
    ];

    protected $casts = [
        'check_date' => 'date',
        'orig_deliv_date' => 'date',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
```

### 4.5 Depot.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Depot extends Model
{
    protected $fillable = [
        'name', 'address', 'city', 'postal_code',
        'latitude', 'longitude', 'contact_person', 'contact_phone',
    ];

    public function stores()
    {
        return $this->hasMany(Store::class, 'depo_id');
    }
}
```

### 4.6 FiltersByDepo Trait
```php
<?php

namespace App\Models\Traits;

use Illuminate\Support\Facades\Auth;

trait FiltersByDepo
{
    protected static function bootFiltersByDepo(): void
    {
        static::addGlobalScope('depo', function ($builder) {
            $user = Auth::user();
            if ($user && $user->role === 'supervisor_distribusi' && $user->depo_id) {
                $builder->where('depo_id', $user->depo_id);
            }
        });
    }
}
```

---

## 5. API Resources

API Resources mentransform Eloquent model ke JSON response terstruktur untuk frontend.

### 5.1 StoreResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StoreResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'sap_id' => $this->sap_id,
            'outlet_name' => $this->outlet_name,
            'street' => $this->street,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'depo_id' => $this->depo_id,
            'category' => $this->latestStock?->category ?? 'NO_DATA',
            'dsi' => (float) ($this->latestStock?->dsi ?? 0),
            'latest_delivery' => $this->latestDelivery?->status ?? null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### 5.2 StockRecordResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StockRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'sap_id' => $this->sap_id,
            'stockdate' => $this->stockdate,
            'og_urgent_date' => $this->og_urgent_date,
            'account' => $this->account,
            'outlet_name' => $this->outlet_name,
            'source' => $this->source,
            'region' => $this->region,
            'supplier' => $this->supplier,
            'jwk' => $this->jwk,
            'dsi' => (float) $this->dsi,
            'category' => $this->category,
            'depo_id' => $this->depo_id,
            'store' => new StoreResource($this->whenLoaded('store')),
        ];
    }
}
```

### 5.3 DepotResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'latitude' => (float) $this->latitude,
            'longitude' => (float) $this->longitude,
            'contact_person' => $this->contact_person,
            'contact_phone' => $this->contact_phone,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

### 5.4 DeliveryStatusResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryStatusResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'store_id' => $this->store_id,
            'sap_id' => $this->sap_id,
            'site_name' => $this->site_name,
            'cust_name' => $this->cust_name,
            'sales_type' => $this->sales_type,
            'po_number' => $this->po_number,
            'so_number' => $this->so_number,
            'product_id' => $this->product_id,
            'product_name' => $this->product_name,
            'orig_deliv_date' => $this->orig_deliv_date,
            'po_qty' => $this->po_qty,
            'do_qty' => $this->do_qty,
            'billing_block' => $this->billing_block,
            'driver_name' => $this->driver_name,
            'status' => $this->status,
            'check_date' => $this->check_date,
            'depo_id' => $this->depo_id,
            'store' => new StoreResource($this->whenLoaded('store')),
        ];
    }
}
```

### 5.5 UserResource.php
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'depo_id' => $this->depo_id,
            'depo' => new DepotResource($this->whenLoaded('depo')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
```

---

## 6. Controllers (API)

### 6.1 AuthController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }
}
```

### 6.2 DashboardController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Models\StockRecord;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());

        $stores = Store::with('latestStock', 'latestDelivery')->get();

        $geoFeatures = $stores->filter(fn($s) => $s->latitude && $s->longitude)
            ->map(fn($s) => [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [$s->longitude, $s->latitude],
                ],
                'properties' => [
                    'sap_id' => $s->sap_id,
                    'name' => $s->outlet_name,
                    'category' => $s->latestStock?->category ?? 'NO_DATA',
                    'dsi' => (float) ($s->latestStock?->dsi ?? 0),
                    'latest_delivery' => $s->latestDelivery?->status ?? null,
                ],
            ]);

        $stats = [
            'total_stores' => $stores->count(),
            'red_count' => $stores->filter(fn($s) => $s->latestStock?->category === 'RED')->count(),
            'yellow_count' => $stores->filter(fn($s) => $s->latestStock?->category === 'YELLOW')->count(),
            'green_count' => $stores->filter(fn($s) => $s->latestStock?->category === 'GREEN')->count(),
        ];

        return response()->json([
            'stats' => $stats,
            'geojson' => [
                'type' => 'FeatureCollection',
                'features' => $geoFeatures->values(),
            ],
            'selected_date' => $date,
        ]);
    }
}
```

### 6.3 StoreController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StoreResource;
use App\Models\Store;
use App\Services\StoreImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StoreController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Store::with('latestStock', 'latestDelivery');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('outlet_name', 'like', "%{$request->search}%")
                  ->orWhere('sap_id', 'like', "%{$request->search}%")
                  ->orWhere('city', 'like', "%{$request->search}%");
            });
        }

        $stores = $query->orderBy('outlet_name')->paginate(20);

        return response()->json([
            'data' => StoreResource::collection($stores),
            'meta' => [
                'current_page' => $stores->currentPage(),
                'last_page' => $stores->lastPage(),
                'per_page' => $stores->perPage(),
                'total' => $stores->total(),
            ],
        ]);
    }

    public function show(Store $store): JsonResponse
    {
        $store->load([
            'stockRecords' => fn($q) => $q->orderByDesc('stockdate')->limit(30),
        ]);

        return response()->json([
            'data' => new StoreResource($store),
            'stock_history' => $store->stockRecords,
        ]);
    }

    public function geojson(Request $request): JsonResponse
    {
        $stores = Store::with('latestStock')->get();

        $features = $stores->filter(fn($s) => $s->latitude && $s->longitude)
            ->map(fn($s) => [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [$s->longitude, $s->latitude],
                ],
                'properties' => [
                    'sap_id' => $s->sap_id,
                    'name' => $s->outlet_name,
                    'category' => $s->latestStock?->category ?? 'NO_DATA',
                ],
            ]);

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features->values(),
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $result = app(StoreImportService::class)->import($request->file('file'));

        return response()->json($result);
    }
}
```

### 6.4 StockController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StockRecordResource;
use App\Models\StockRecord;
use App\Models\Store;
use App\Services\StockImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StockController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StockRecord::with('store');

        if ($request->filled('stockdate'))
            $query->where('stockdate', $request->stockdate);
        if ($request->filled('category'))
            $query->where('category', $request->category);

        $records = $query->orderByDesc('stockdate')->paginate(20);

        return response()->json([
            'data' => StockRecordResource::collection($records),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $result = app(StockImportService::class)->import($request->file('file'));

        return response()->json($result);
    }

    public function show(Store $store): JsonResponse
    {
        $records = $store->stockRecords()
            ->orderByDesc('stockdate')->limit(90)->get();

        return response()->json([
            'data' => StockRecordResource::collection($records),
            'store' => new StoreResource($store),
        ]);
    }
}
```

### 6.5 DepotController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DepotResource;
use App\Models\Depot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepotController extends Controller
{
    public function index(): JsonResponse
    {
        $depo = Depot::orderBy('name')->paginate(20);

        return response()->json([
            'data' => DepotResource::collection($depo),
            'meta' => [
                'current_page' => $depo->currentPage(),
                'last_page' => $depo->lastPage(),
                'per_page' => $depo->perPage(),
                'total' => $depo->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depot = Depot::create($validated);

        return response()->json([
            'data' => new DepotResource($depot),
            'message' => 'Depo berhasil ditambahkan',
        ], 201);
    }

    public function show(Depot $depot): JsonResponse
    {
        $depot->load('stores');

        return response()->json([
            'data' => new DepotResource($depot),
            'stores' => $depot->stores,
        ]);
    }

    public function update(Request $request, Depot $depot): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo,name,' . $depot->id,
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:20',
            'contact_person' => 'nullable|string|max:255',
            'contact_phone' => 'nullable|string|max:50',
        ]);

        $depot->update($validated);

        return response()->json([
            'data' => new DepotResource($depot),
            'message' => 'Depo berhasil diupdate',
        ]);
    }

    public function destroy(Depot $depot): JsonResponse
    {
        $depot->delete();

        return response()->json([
            'message' => 'Depo berhasil dihapus',
        ]);
    }
}
```

### 6.6 DeliveryController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\DeliveryStatusResource;
use App\Models\DeliveryStatus;
use App\Services\DeliveryImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = DeliveryStatus::with('store');

        if ($request->filled('check_date'))
            $query->where('check_date', $request->check_date);
        if ($request->filled('status'))
            $query->where('status', $request->status);

        $records = $query->orderByDesc('check_date')->paginate(20);

        return response()->json([
            'data' => DeliveryStatusResource::collection($records),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page' => $records->lastPage(),
                'per_page' => $records->perPage(),
                'total' => $records->total(),
            ],
        ]);
    }

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $result = app(DeliveryImportService::class)->import($request->file('file'));

        return response()->json($result);
    }
}
```

### 6.7 UserController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::with('depo')->orderBy('name')->paginate(20);

        return response()->json([
            'data' => UserResource::collection($users),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'kepala_distribusi', 'supervisor_distribusi'])],
            'depo_id' => 'nullable|exists:depo,id',
        ]);

        $validated['password'] = Hash::make($validated['password']);
        $user = User::create($validated);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User berhasil ditambahkan',
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(['admin', 'kepala_distribusi', 'supervisor_distribusi'])],
            'depo_id' => 'nullable|exists:depo,id',
        ]);

        if ($validated['password'] ?? false)
            $validated['password'] = Hash::make($validated['password']);
        else
            unset($validated['password']);

        $user->update($validated);

        return response()->json([
            'data' => new UserResource($user),
            'message' => 'User berhasil diupdate',
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus']);
    }
}
```

---

## 7. StoreImportService.php

```php
<?php

namespace App\Services;

use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreImportService
{
    public function import($file): array
    {
        $result = ['success' => 0, 'failed' => 0, 'errors' => []];

        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();
        $header = $rows[0];

        $colMap = [
            'Customer', 'Name 1', 'Street', 'City', 'PostalCode',
        ];

        $colIdx = [];
        foreach ($colMap as $col) {
            $idx = array_search($col, $header);
            if ($idx === false && $col === 'Customer')
                throw new \Exception("Kolom $col tidak ditemukan");
            $colIdx[$col] = $idx;
        }

        foreach ($rows as $r => $row) {
            if ($r === 0) continue;
            $rowNum = $r + 1;
            try {
                $sapId = trim($row[$colIdx['Customer']] ?? '');
                if (empty($sapId)) continue;

                $city = trim($row[$colIdx['City'] ?? -1] ?? '');
                $coords = $this->geocode($city);

                Store::updateOrCreate(
                    ['sap_id' => $sapId],
                    [
                        'outlet_name' => trim($row[$colIdx['Name 1'] ?? -1] ?? ''),
                        'street' => trim($row[$colIdx['Street'] ?? -1] ?? ''),
                        'city' => $city,
                        'postal_code' => trim($row[$colIdx['PostalCode'] ?? -1] ?? ''),
                        'latitude' => $coords['lat'] ?? null,
                        'longitude' => $coords['lng'] ?? null,
                    ]
                );

                $result['success']++;
            } catch (\Exception $e) {
                $result['failed']++;
                $result['errors'][] = ['row' => $rowNum, 'message' => $e->getMessage()];
                Log::warning("Store import error row {$rowNum}: " . $e->getMessage());
            }
        }

        return $result;
    }

    private function geocode(string $city): ?array
    {
        if (empty($city)) return null;
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'OOSMonitor/1.0',
            ])->get('https://nominatim.openstreetmap.org/search', [
                'q' => $city . ', Indonesia',
                'format' => 'json',
                'limit' => 1,
            ]);
            $data = $response->json();
            if (!empty($data[0])) {
                return ['lat' => $data[0]['lat'], 'lng' => $data[0]['lon']];
            }
        } catch (\Exception $e) {
            Log::warning("Geocode failed for {$city}: " . $e->getMessage());
        }
        return null;
    }
}
```

---

## 8. Routes (api.php)

```php
<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DepotController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\StoreController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('user', [AuthController::class, 'user']);
    Route::post('logout', [AuthController::class, 'logout']);

    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::get('stores', [StoreController::class, 'index']);
    Route::get('stores/geojson', [StoreController::class, 'geojson']);
    Route::get('stores/{store}', [StoreController::class, 'show']);
    Route::post('stores/upload', [StoreController::class, 'upload']);
    Route::get('template/store', [StoreController::class, 'template']);

    Route::get('stocks', [StockController::class, 'index']);
    Route::post('stocks/upload', [StockController::class, 'upload']);
    Route::get('stocks/{store}', [StockController::class, 'show']);
    Route::get('template/stocks', [StockController::class, 'template']);

    Route::get('delivery', [DeliveryController::class, 'index']);
    Route::post('delivery/upload', [DeliveryController::class, 'upload']);

    Route::get('depo', [DepotController::class, 'index']);
    Route::post('depo', [DepotController::class, 'store']);
    Route::get('depo/{depot}', [DepotController::class, 'show']);
    Route::put('depo/{depot}', [DepotController::class, 'update']);
    Route::delete('depo/{depot}', [DepotController::class, 'destroy']);

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::get('users', [UserController::class, 'index']);
        Route::post('users', [UserController::class, 'store']);
        Route::put('users/{user}', [UserController::class, 'update']);
        Route::delete('users/{user}', [UserController::class, 'destroy']);
    });
});
```

---

## 9. StockImportService.php (Preventif)

```php
<?php

namespace App\Services;

use App\Models\StockRecord;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StockImportService
{
    private array $columnMap = [
        'stockdate' => 'stockdate',
        'og_urgent_date' => 'og_urgent_date',
        'account' => 'account',
        'outlet_name' => 'outlet_name',
        'sap_id' => 'sap_id',
        'source' => 'source',
        'region' => 'region',
        'supplier' => 'supplier',
        'jwk' => 'jwk',
        'DSI' => 'dsi',
        'Category' => 'category',
    ];

    public function import($file): array
    {
        $result = ['success' => 0, 'failed' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$result) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            $header = array_shift($rows);
            $headerIndex = [];
            foreach ($header as $i => $col) {
                $col = trim($col);
                if (isset($this->columnMap[$col]))
                    $headerIndex[$this->columnMap[$col]] = $i;
            }

            foreach ($rows as $i => $row) {
                $rowNum = $i + 2;
                try {
                    $sapId = trim($row[$headerIndex['sap_id']] ?? '');
                    $date = $row[$headerIndex['stockdate']] ?? null;

                    if (empty($sapId) || empty($date))
                        throw new \Exception('SAP ID dan tanggal wajib diisi');

                    $stockdate = \Carbon\Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d');
                    $store = Store::where('sap_id', $sapId)->first();

                    if (!$store)
                        throw new \Exception("Store dengan SAP ID $sapId tidak ditemukan. Upload toko terlebih dahulu.");

                    StockRecord::updateOrCreate(
                        ['store_id' => $store->id, 'stockdate' => $stockdate],
                        [
                            'sap_id' => $sapId,
                            'og_urgent_date' => !empty($row[$headerIndex['og_urgent_date']] ?? '')
                                ? \Carbon\Carbon::createFromFormat('d/m/Y', $row[$headerIndex['og_urgent_date']])->format('Y-m-d')
                                : null,
                            'account' => trim($row[$headerIndex['account']] ?? ''),
                            'outlet_name' => trim($row[$headerIndex['outlet_name']] ?? ''),
                            'source' => trim($row[$headerIndex['source']] ?? ''),
                            'region' => trim($row[$headerIndex['region']] ?? ''),
                            'supplier' => trim($row[$headerIndex['supplier']] ?? ''),
                            'jwk' => trim($row[$headerIndex['jwk']] ?? ''),
                            'dsi' => (float) str_replace(',', '.', $row[$headerIndex['dsi']] ?? 0),
                            'category' => strtoupper(trim($row[$headerIndex['category']] ?? 'GREEN')),
                            'depo_id' => $store->depo_id,
                        ]
                    );

                    $result['success']++;
                } catch (\Exception $e) {
                    $result['failed']++;
                    $result['errors'][] = ['row' => $rowNum, 'message' => $e->getMessage()];
                    Log::warning("Stock import error row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $result;
    }
}
```

---

## 10. DeliveryImportService.php (Adop)

```php
<?php

namespace App\Services;

use App\Models\DeliveryStatus;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DeliveryImportService
{
    public function import($file): array
    {
        $result = ['delivered' => 0, 'undelivered' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$result) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            $header = $rows[0];

            $colIdx = [
                'cust_id' => array_search('Cust ID', $header),
                'site_name' => array_search('Site Name', $header),
                'cust_name' => array_search('Cust Name', $header),
                'sales_type' => array_search('Sales Type', $header),
                'po_number' => array_search('PO Number', $header),
                'so_number' => array_search('SO Number', $header),
                'product_id' => array_search('Product ID', $header),
                'product_name' => array_search('Product Name', $header),
                'orig_deliv_date' => array_search('Orig Deliv. Date', $header),
                'po_qty' => array_search('PO Qty', $header),
                'do_qty' => array_search('DO Qty', $header),
                'billing_block' => array_search('Billing Block', $header),
                'driver_name' => array_search('Driver Name', $header),
            ];

            if ($colIdx['cust_id'] === false || $colIdx['product_name'] === false)
                throw new \Exception('Kolom Cust ID atau Product Name tidak ditemukan');

            $galonDeliveries = [];
            foreach ($rows as $r => $row) {
                if ($r === 0) continue;
                $prod = strtoupper(trim($row[$colIdx['product_name']] ?? ''));
                if (!str_contains($prod, 'GALLON')) continue;

                $custId = trim($row[$colIdx['cust_id']] ?? '');
                $bb = strtoupper(trim($row[$colIdx['billing_block']] ?? ''));

                if (!isset($galonDeliveries[$custId])) {
                    $galonDeliveries[$custId] = [
                        'site_name' => trim($row[$colIdx['site_name']] ?? ''),
                        'cust_name' => trim($row[$colIdx['cust_name']] ?? ''),
                        'sales_type' => trim($row[$colIdx['sales_type']] ?? ''),
                        'po_number' => trim($row[$colIdx['po_number']] ?? ''),
                        'so_number' => trim($row[$colIdx['so_number']] ?? ''),
                        'product_id' => trim($row[$colIdx['product_id']] ?? ''),
                        'product_name' => $prod,
                        'orig_deliv_date' => $row[$colIdx['orig_deliv_date']] ?? null,
                        'po_qty' => (int) ($row[$colIdx['po_qty']] ?? 0),
                        'do_qty' => (int) ($row[$colIdx['do_qty']] ?? 0),
                        'driver_name' => trim($row[$colIdx['driver_name']] ?? ''),
                        'hasZ3' => false,
                    ];
                }
                if ($bb === 'Z3') {
                    $galonDeliveries[$custId]['hasZ3'] = true;
                }
            }

            $checkDate = now()->toDateString();

            foreach ($galonDeliveries as $custId => $data) {
                try {
                    $store = Store::where('sap_id', $custId)->first();
                    if (!$store) continue;

                    DeliveryStatus::updateOrCreate(
                        ['store_id' => $store->id, 'check_date' => $checkDate],
                        [
                            'sap_id' => $custId,
                            'site_name' => $data['site_name'],
                            'cust_name' => $data['cust_name'],
                            'sales_type' => $data['sales_type'],
                            'po_number' => $data['po_number'],
                            'so_number' => $data['so_number'],
                            'product_id' => $data['product_id'],
                            'product_name' => $data['product_name'],
                            'orig_deliv_date' => $data['orig_deliv_date'],
                            'po_qty' => $data['po_qty'],
                            'do_qty' => $data['do_qty'],
                            'billing_block' => $data['hasZ3'] ? 'Z3' : null,
                            'driver_name' => $data['driver_name'],
                            'status' => $data['hasZ3'] ? 'UNDELIVERED' : 'DELIVERED',
                            'depo_id' => $store->depo_id,
                        ]
                    );

                    if ($data['hasZ3']) $result['undelivered']++;
                    else $result['delivered']++;
                } catch (\Exception $e) {
                    $result['errors'][] = ['cust_id' => $custId, 'message' => $e->getMessage()];
                    Log::warning("Delivery import error for {$custId}: " . $e->getMessage());
                }
            }
        });

        return $result;
    }
}
```

---

## 11. Template Format

### Store Upload (SAP)
| Customer | Name 1 | Street | City | PostalCode |
|----------|--------|--------|------|------------|
| 950202119 | BOROBUDUR 2 | JL MERAPI 12 | YOGYAKARTA | 55123 |

### Stock Upload (Preventif)
| stockdate | og_urgent_date | account | outlet_name | sap_id | source | region | supplier | jwk | DSI | Category |
|-----------|---------------|---------|-------------|--------|--------|--------|----------|-----|-----|----------|
| 14/07/2026 | 14/07/2026 | IDM | BOROBUDUR 2 | 950202119 | Depo | R3 | 9000 ID YOGYAKARTA DC TIV | Jumat-Genap | 1.23 | RED |

### Delivery Upload (Adop)
| Cust ID | Site Name | Cust Name | Sales Type | PO Number | SO Number | Product ID | Product Name | Orig Deliv. Date | PO Qty | DO Qty | Billing Block | Driver Name |
|---------|-----------|-----------|------------|-----------|-----------|------------|--------------|-----------------|--------|--------|--------------|-------------|
| 950202119 | SLMG1 | BOROBUDUR 2 | ZSPO | 4500012345 | 8000123456 | GAL5 | 5 GALLON AQUA LOCAL | 14/07/2026 | 50 | 50 | Z3 | BUDI |
