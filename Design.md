# Design Document - OOS Monitoring System

## 1. Architecture

```
Browser (React) → Inertia.js → Laravel Backend → MySQL
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
│ │  📦 Stocks│ │                                        ││
│ │  🚚 Delivery││   (stats cards, tables, map, forms)   ││
│ │  🏭 Depots│ │                                        ││
│ │          │ └────────────────────────────────────────┤│
│ │  SIDEBAR │ │  Footer                                ││
│ │  (w-64)  │ └────────────────────────────────────────┘│
│ └──────────┘                                          │
└────────────────────────────────────────────────────────┘
```

**Struktur halaman:**
- **Sidebar** (fixed kiri, lebar 256px) — navigasi utama
- **Header** (fixed atas, offset kiri 256px) — judul halaman + dropdown user
- **Content** (padding 24px) — konten utama per halaman
- **Footer** (opsional) — copyright

### 2.2 Sidebar Component

```jsx
<aside className="w-64 bg-white border-r h-screen fixed left-0 top-0 z-30">
  <div className="h-16 flex items-center px-6 border-b">
    <span className="text-xl font-bold text-blue-600">OOS Monitor</span>
  </div>
  <nav className="p-4 space-y-1">
    <NavItem icon="📊" label="Dashboard" href={route('dashboard')} />
    <NavItem icon="🏪" label="Stores" href={route('stores.index')} />
    <NavItem icon="📦" label="Stocks" href={route('stocks.index')} />
    <NavItem icon="🚚" label="Delivery" href={route('delivery.upload')} />
    <NavItem icon="🏭" label="Depots" href={route('depots.index')} />
  </nav>
</aside>
```

### 2.3 Header Component

```jsx
<header className="h-16 bg-white border-b flex items-center justify-between px-6 ml-64">
  <h1 className="text-lg font-semibold text-gray-700">{pageTitle}</h1>
  <div className="flex items-center gap-3">
    <span className="text-sm text-gray-500">{user.name}</span>
    <Dropdown>
      <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
      <Dropdown.Link href={route('logout')} method="post" as="button">
        Log Out
      </Dropdown.Link>
    </Dropdown>
  </div>
</header>
```

### 2.4 Card Design

Statistik cards (grid 2-6 kolom):

```jsx
<div className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4">
  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl">
    🏪
  </div>
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide">Total Toko</p>
    <p className="text-2xl font-bold text-gray-800">{stats.total_stores}</p>
  </div>
</div>
```

### 2.5 Table Design

```jsx
<div className="bg-white rounded-xl shadow-sm border overflow-hidden">
  <table className="w-full text-sm">
    <thead>
      <tr className="bg-gray-50 border-b">
        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kolom</th>
      </tr>
    </thead>
    <tbody>
      <tr className="border-b last:border-0 hover:bg-gray-50">
        <td className="px-4 py-3">{value}</td>
      </tr>
    </tbody>
  </table>
</div>
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

### 2.8 Pages Structure

```
resources/js/Pages/
├── Dashboard.jsx            # Peta + statistik + tabel
├── Auth/                    # Breeze auth pages
├── Profile/                 # Breeze profile pages
├── Stores/
│   ├── Index.jsx            # List toko + filter
│   └── Show.jsx             # Detail toko + riwayat stok
├── Stocks/
│   ├── Index.jsx            # Tabel stok + filter
│   ├── Upload.jsx           # Form upload stok
│   └── Show.jsx             # Riwayat stok per toko
├── Delivery/
│   └── Upload.jsx           # Form upload delivery
└── Depots/
    ├── Index.jsx            # List depo
    ├── Create.jsx           # Tambah depo
    ├── Show.jsx             # Detail depo
    └── Edit.jsx             # Edit depo
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

### 3.2 depots
```sql
CREATE TABLE depots (
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

## 5. Controllers

### 5.1 DashboardController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
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

        $stores = Store::with('latestStock')->get()->map(function ($store) {
            return [
                'id' => $store->id,
                'sap_id' => $store->sap_id,
                'name' => $store->outlet_name,
                'category' => $store->latestStock?->category ?? 'NO_DATA',
                'stock' => $store->latestStock?->stock ?? 0,
                'oos' => $store->latestStock?->oos ?? 'NO',
                'dsi' => $store->latestStock?->dsi ?? 0,
            ];
        });

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'stores' => $stores,
            'selectedDate' => $date,
        ]);
    }
}
```

### 5.2 StoreController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $query = Store::with('latestStock');

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

        $stores = $query->orderBy('outlet_name')->paginate(20)->withQueryString();

        return Inertia::render('Stores/Index', [
            'stores' => $stores,
            'filters' => $request->only(['search', 'region']),
        ]);
    }

    public function show(Store $store)
    {
        $store->load(['stockRecords' => function ($q) {
            $q->orderByDesc('stockdate')->limit(30);
        }]);

        return Inertia::render('Stores/Show', [
            'store' => $store,
        ]);
    }
}
```

### 5.3 StockController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\StockRecord;
use App\Models\Store;
use App\Services\StockImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockController extends Controller
{
    public function index(Request $request)
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

        $records = $query->orderByDesc('stockdate')
            ->paginate(20)->withQueryString();

        return Inertia::render('Stocks/Index', [
            'records' => $records,
            'filters' => $request->only(['stockdate', 'store_id', 'category', 'oos']),
        ]);
    }

    public function upload()
    {
        return Inertia::render('Stocks/Upload');
    }

    public function processUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $result = app(StockImportService::class)->import($request->file('file'));

        return back()->with([
            'import_result' => $result,
            'success' => "Upload selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
        ]);
    }

    public function show(Store $store)
    {
        $records = $store->stockRecords()
            ->orderByDesc('stockdate')->limit(90)->get();

        return Inertia::render('Stocks/Show', [
            'store' => $store,
            'records' => $records,
        ]);
    }
}
```

### 5.4 DeliveryController.php
```php
<?php

namespace App\Http\Controllers;

use App\Models\DeliveryStatus;
use App\Models\Store;
use App\Services\DeliveryImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function upload()
    {
        return Inertia::render('Delivery/Upload');
    }

    public function processUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $result = app(DeliveryImportService::class)->import($request->file('file'));

        return back()->with([
            'import_result' => $result,
            'success' => "Upload selesai. Terkirim: {$result['delivered']}, Belum Terkirim: {$result['undelivered']}",
        ]);
    }
}
```

---

## 6. StockImportService.php

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

## 7. DeliveryImportService.php

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

## 8. Routes (web.php)

```php
<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeliveryController;
use App\Http\Controllers\DepotController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\StoreController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function () {
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('stores', [StoreController::class, 'index'])->name('stores.index');
    Route::get('stores/{store}', [StoreController::class, 'show'])->name('stores.show');

    Route::get('stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::get('stocks/upload', [StockController::class, 'upload'])->name('stocks.upload');
    Route::post('stocks/upload', [StockController::class, 'processUpload'])->name('stocks.process-upload');
    Route::get('stocks/{store}', [StockController::class, 'show'])->name('stocks.show');

    Route::resource('depots', DepotController::class)->except(['show']);
    Route::get('depots/{depot}', [DepotController::class, 'show'])->name('depots.show');

    Route::get('delivery/upload', [DeliveryController::class, 'upload'])->name('delivery.upload');
    Route::post('delivery/upload', [DeliveryController::class, 'processUpload'])->name('delivery.process-upload');
});
```

---

## 9. CSV Template

```
sap_id,outlet_id,outlet_name,account,region,source,supplier,brand,stockdate,stock,stockc,sellout,DSI,Category,jwk,oos,og_urgent,og_total
950202119,F0L1,BOROBUDUR 2(F0L1),IDM,R3,Depo,9000 ID YOGYAKARTA DC TIV,AQUA,14/07/2026,2,2,0,0,RED,Jumat-Genap,YES,7,7
950073961,F14Q,PAKEM 2-SLEMAN(F14Q),IDM,R3,Depo,9000 ID YOGYAKARTA DC TIV,AQUA,14/07/2026,15,15,0,4.79,YELLOW,Kamis,NO,0,0
```

---

## 10. Delivery Upload (data adop delivery.xlsx)

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
