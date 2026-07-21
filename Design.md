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
// frontend/src/types/store.ts
export interface Store {
  id: number;
  sap_id: string;
  outlet_id: string;
  outlet_name: string;
  account: string | null;
  region: string | null;
  source: string | null;
  supplier: string | null;
  category: 'RED' | 'YELLOW' | 'GREEN' | 'NO_DATA';
  stock: number;
  oos: 'YES' | 'NO';
  dsi: number;
  latest_delivery: 'DELIVERED' | 'UNDELIVERED' | null;
  created_at: string;
  updated_at: string;
}

// frontend/src/types/stock.ts
export interface StockRecord {
  id: number;
  store_id: number;
  sap_id: string;
  stockdate: string;
  brand: string | null;
  stock: number;
  stockc: number;
  sellout: number;
  dsi: number;
  category: 'RED' | 'YELLOW' | 'GREEN';
  jwk: string | null;
  oos: 'YES' | 'NO';
  og_urgent: number;
  og_total: number;
  store?: Store;
}

// frontend/src/types/depo.ts
export interface Depo {
  id: number;
  name: string;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

// frontend/src/types/delivery.ts
export interface DeliveryStatus {
  id: number;
  store_id: number;
  sap_id: string;
  status: 'DELIVERED' | 'UNDELIVERED';
  check_date: string;
  store?: Store;
}

// frontend/src/types/api.ts
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

### 3.1 stores
```sql
CREATE TABLE stores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sap_id VARCHAR(50) NOT NULL UNIQUE,
    outlet_id VARCHAR(20) NOT NULL,
    outlet_name VARCHAR(255) NOT NULL,
    account VARCHAR(50) NULL,
    region VARCHAR(20) NULL,
    source VARCHAR(50) NULL,
    supplier VARCHAR(255) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_stores_sap_id (sap_id),
    INDEX idx_stores_region (region)
) ENGINE=InnoDB;
```

### 3.2 depo
```sql
CREATE TABLE depo (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NULL,
    contact_person VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;
```

### 3.3 stock_records
```sql
CREATE TABLE stock_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT UNSIGNED NOT NULL,
    sap_id VARCHAR(50) NOT NULL,
    stockdate DATE NOT NULL,
    brand VARCHAR(100) NULL,
    stock INT NOT NULL DEFAULT 0,
    stockc INT NOT NULL DEFAULT 0,
    sellout INT NOT NULL DEFAULT 0,
    dsi DECIMAL(10,2) NULL DEFAULT 0,
    category ENUM('RED','YELLOW','GREEN') NULL,
    jwk VARCHAR(50) NULL,
    oos ENUM('YES','NO') NOT NULL DEFAULT 'NO',
    og_urgent INT NULL DEFAULT 0,
    og_total INT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uniq_store_date_brand (store_id, stockdate, brand),
    INDEX idx_stock_sap_id (sap_id),
    INDEX idx_stock_date (stockdate),
    INDEX idx_stock_category (category),
    INDEX idx_stock_oos (oos),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

### 3.4 delivery_status
```sql
CREATE TABLE delivery_status (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT UNSIGNED NOT NULL,
    sap_id VARCHAR(50) NOT NULL,
    status ENUM('DELIVERED','UNDELIVERED') NOT NULL DEFAULT 'DELIVERED',
    check_date DATE NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY uniq_store_check_date (store_id, check_date),
    INDEX idx_delivery_sap_id (sap_id),
    INDEX idx_delivery_status (status),
    INDEX idx_delivery_date (check_date),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. Eloquent Models

### 4.1 Store.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Store extends Model
{
    protected $fillable = [
        'sap_id', 'outlet_id', 'outlet_name',
        'account', 'region', 'source', 'supplier',
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
}
```

### 4.2 StockRecord.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockRecord extends Model
{
    protected $fillable = [
        'store_id', 'sap_id', 'stockdate', 'brand',
        'stock', 'stockc', 'sellout', 'dsi', 'category',
        'jwk', 'oos', 'og_urgent', 'og_total',
    ];

    protected $casts = [
        'stockdate' => 'date',
        'stock' => 'integer',
        'stockc' => 'integer',
        'sellout' => 'integer',
        'dsi' => 'decimal:2',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public static function calculateCategory(float $dsi, string $oos): string
    {
        if ($oos === 'YES' || $dsi <= 0) return 'RED';
        if ($dsi < 5) return 'RED';
        if ($dsi < 14) return 'YELLOW';
        return 'GREEN';
    }
}
```

### 4.3 DeliveryStatus.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryStatus extends Model
{
    protected $fillable = [
        'store_id', 'sap_id', 'status', 'check_date',
    ];

    protected $casts = [
        'check_date' => 'date',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
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
            'outlet_id' => $this->outlet_id,
            'outlet_name' => $this->outlet_name,
            'account' => $this->account,
            'region' => $this->region,
            'source' => $this->source,
            'supplier' => $this->supplier,
            'category' => $this->latestStock?->category ?? 'NO_DATA',
            'stock' => $this->latestStock?->stock ?? 0,
            'oos' => $this->latestStock?->oos ?? 'NO',
            'dsi' => $this->latestStock?->dsi ?? 0,
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
            'brand' => $this->brand,
            'stock' => $this->stock,
            'stockc' => $this->stockc,
            'sellout' => $this->sellout,
            'dsi' => (float) $this->dsi,
            'category' => $this->category,
            'jwk' => $this->jwk,
            'oos' => $this->oos,
            'og_urgent' => $this->og_urgent,
            'og_total' => $this->og_total,
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
            'status' => $this->status,
            'check_date' => $this->check_date,
            'store' => new StoreResource($this->whenLoaded('store')),
        ];
    }
}
```

---

## 6. Controllers (API)

Controllers return JSON via API Resource, tidak lagi menggunakan Inertia.

### 6.1 DashboardController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StoreResource;
use App\Models\Store;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $date = $request->input('date', now()->toDateString());

        $stats = [
            'total_stores' => Store::count(),
            'oos_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('oos', 'YES');
            })->count(),
            'red_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'RED');
            })->count(),
            'yellow_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'YELLOW');
            })->count(),
            'green_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('stockdate', $date)->where('category', 'GREEN');
            })->count(),
        ];

        $stores = StoreResource::collection(
            Store::with('latestStock')->get()
        );

        return response()->json([
            'stats' => $stats,
            'stores' => $stores,
            'selected_date' => $date,
        ]);
    }
}
```

### 6.2 StoreController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\StoreResource;
use App\Models\Store;
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
                  ->orWhere('outlet_id', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('region')) {
            $query->where('region', $request->region);
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
        $store->load(['stockRecords' => function ($q) {
            $q->orderByDesc('stockdate')->limit(30);
        }]);

        return response()->json([
            'data' => new StoreResource($store),
            'stock_history' => $store->stockRecords,
        ]);
    }

    public function geojson(Request $request): JsonResponse
    {
        // Return data untuk Leaflet map
        $stores = Store::with('latestStock')->get();

        $features = $stores->map(fn ($store) => [
            'type' => 'Feature',
            'geometry' => [
                'type' => 'Point',
                'coordinates' => [$store->longitude, $store->latitude],
            ],
            'properties' => [
                'sap_id' => $store->sap_id,
                'name' => $store->outlet_name,
                'category' => $store->latestStock?->category ?? 'NO_DATA',
                'oos' => $store->latestStock?->oos ?? 'NO',
            ],
        ]);

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }
}
```

### 6.3 StockController.php
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
        if ($request->filled('store_id'))
            $query->where('store_id', $request->store_id);
        if ($request->filled('category'))
            $query->where('category', $request->category);
        if ($request->filled('oos'))
            $query->where('oos', $request->oos);

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
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $result = app(StockImportService::class)->import($request->file('file'));

        return response()->json([
            'message' => "Upload selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
            'data' => $result,
        ]);
    }

    public function show(Store $store): JsonResponse
    {
        $records = $store->stockRecords()
            ->orderByDesc('stockdate')->limit(90)->get();

        return response()->json([
            'data' => StockRecordResource::collection($records),
            'store' => new \App\Http\Resources\StoreResource($store),
        ]);
    }
}
```

### 6.4 DepotController.php
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
        return response()->json([
            'data' => new DepotResource($depot),
        ]);
    }

    public function update(Request $request, Depot $depot): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:depo,name,' . $depot->id,
            'address' => 'nullable|string',
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

### 6.5 DeliveryController.php
```php
<?php

namespace App\Http\Controllers\Api;

use App\Services\DeliveryImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $result = app(DeliveryImportService::class)->import($request->file('file'));

        return response()->json([
            'message' => "Upload selesai. Terkirim: {$result['delivered']}, Belum Terkirim: {$result['undelivered']}",
            'data' => $result,
        ]);
    }
}
```

---

## 7. StockImportService.php

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
        'sap_id' => 'sap_id',
        'outlet_id' => 'outlet_id',
        'outlet_name' => 'outlet_name',
        'account' => 'account',
        'region' => 'region',
        'source' => 'source',
        'supplier' => 'supplier',
        'stockdate' => 'stockdate',
        'stock' => 'stock',
        'stockc' => 'stockc',
        'sellout' => 'sellout',
        'DSI' => 'dsi',
        'Category' => 'category',
        'jwk' => 'jwk',
        'oos' => 'oos',
        'og_urgent' => 'og_urgent',
        'og_total' => 'og_total',
        'brand' => 'brand',
    ];

    public function import($file): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$results) {
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

                    $store = Store::firstOrCreate(
                        ['sap_id' => $sapId],
                        [
                            'outlet_id' => trim($row[$headerIndex['outlet_id']] ?? ''),
                            'outlet_name' => trim($row[$headerIndex['outlet_name']] ?? ''),
                            'account' => trim($row[$headerIndex['account']] ?? ''),
                            'region' => trim($row[$headerIndex['region']] ?? ''),
                            'source' => trim($row[$headerIndex['source']] ?? ''),
                            'supplier' => trim($row[$headerIndex['supplier']] ?? ''),
                        ]
                    );

                    $dsi = (float) str_replace(',', '.', $row[$headerIndex['dsi']] ?? 0);
                    $oosStatus = strtoupper(trim($row[$headerIndex['oos']] ?? 'NO'));
                    $category = strtoupper(trim($row[$headerIndex['category']] ?? ''));
                    if (empty($category)) {
                        $category = StockRecord::calculateCategory($dsi, $oosStatus);
                    }

                    StockRecord::updateOrCreate(
                        [
                            'store_id' => $store->id,
                            'stockdate' => $stockdate,
                            'brand' => trim($row[$headerIndex['brand']] ?? ''),
                        ],
                        [
                            'sap_id' => $sapId,
                            'stock' => (int) ($row[$headerIndex['stock']] ?? 0),
                            'stockc' => (int) ($row[$headerIndex['stockc']] ?? 0),
                            'sellout' => (int) ($row[$headerIndex['sellout']] ?? 0),
                            'dsi' => $dsi,
                            'category' => $category,
                            'jwk' => trim($row[$headerIndex['jwk']] ?? ''),
                            'oos' => $oosStatus,
                            'og_urgent' => (int) ($row[$headerIndex['og_urgent']] ?? 0),
                            'og_total' => (int) ($row[$headerIndex['og_total']] ?? 0),
                        ]
                    );

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNum,
                        'message' => $e->getMessage(),
                    ];
                    Log::warning("Stock import error row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
```

---

## 8. Routes (api.php)

Semua endpoint berada di `routes/api.php` dengan prefix `/api`. Tidak ada web routes untuk halaman — frontend adalah SPA terpisah.

```php
<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DeliveryController;
use App\Http\Controllers\Api\DepotController;
use App\Http\Controllers\Api\StockController;
use App\Http\Controllers\Api\StoreController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index']);

    Route::get('stores', [StoreController::class, 'index']);
    Route::get('stores/geojson', [StoreController::class, 'geojson']);
    Route::get('stores/{store}', [StoreController::class, 'show']);

    Route::get('stocks', [StockController::class, 'index']);
    Route::post('stocks/upload', [StockController::class, 'upload']);
    Route::get('stocks/{store}', [StockController::class, 'show']);

    Route::get('depo', [DepotController::class, 'index']);
    Route::post('depo', [DepotController::class, 'store']);
    Route::get('depo/{depot}', [DepotController::class, 'show']);
    Route::put('depo/{depot}', [DepotController::class, 'update']);
    Route::delete('depo/{depot}', [DepotController::class, 'destroy']);

    Route::post('delivery/upload', [DeliveryController::class, 'upload']);
});

// Auth (tanpa middleware sanctum)
Route::post('login', [AuthController::class, 'login']);
Route::post('logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
```

---

## 9. DeliveryImportService.php

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

            $custIdx = array_search('Cust ID', $header);
            $prodIdx = array_search('Product Name', $header);
            $bbIdx = array_search('Billing Block', $header);

            if ($custIdx === false || $prodIdx === false || $bbIdx === false)
                throw new \Exception('Kolom Cust ID, Product Name, atau Billing Block tidak ditemukan');

            $galonCustIds = [];
            foreach ($rows as $r => $row) {
                if ($r === 0) continue;
                $prod = strtoupper(trim($row[$prodIdx] ?? ''));
                if (!str_contains($prod, 'GALLON')) continue;

                $custId = trim($row[$custIdx] ?? '');
                $bb = strtoupper(trim($row[$bbIdx] ?? ''));

                if (!isset($galonCustIds[$custId])) {
                    $galonCustIds[$custId] = ['hasZ3' => false];
                }
                if ($bb === 'Z3') {
                    $galonCustIds[$custId]['hasZ3'] = true;
                }
            }

            $checkDate = now()->toDateString();

            foreach ($galonCustIds as $custId => $data) {
                try {
                    $store = Store::where('sap_id', $custId)->first();
                    if (!$store) continue;

                    $status = $data['hasZ3'] ? 'UNDELIVERED' : 'DELIVERED';

                    DeliveryStatus::updateOrCreate(
                        ['store_id' => $store->id, 'check_date' => $checkDate],
                        ['sap_id' => $custId, 'status' => $status]
                    );

                    if ($status === 'DELIVERED') $result['delivered']++;
                    else $result['undelivered']++;
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

## 10. CSV Template

```
sap_id,outlet_id,outlet_name,account,region,source,supplier,brand,stockdate,stock,stockc,sellout,DSI,Category,jwk,oos,og_urgent,og_total
950202119,F0L1,BOROBUDUR 2(F0L1),IDM,R3,Depo,9000 ID YOGYAKARTA DC TIV,AQUA,14/07/2026,2,2,0,0,RED,Jumat-Genap,YES,7,7
950073961,F14Q,PAKEM 2-SLEMAN(F14Q),IDM,R3,Depo,9000 ID YOGYAKARTA DC TIV,AQUA,14/07/2026,15,15,0,4.79,YELLOW,Kamis,NO,0,0
```

---

## 11. Delivery Upload (data adop delivery.xlsx)

File delivery dari SAP dengan struktur kolom:
- `Cust ID` → sap_id di stores
- `Product Name` → filter galon (mengandung "GALLON")
- `Billing Block` → Z3 = belum terkirim

Proses import:
1. Baca semua baris
2. Filter produk galon (`5 GALLON AQUA LOCAL`, `5 GALLON VIT LOCAL`)
3. Group by Cust ID
4. Jika ada Billing Block = Z3 → status UNDELIVERED
5. Simpan ke `delivery_status` per (store_id, check_date)
