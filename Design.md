# Design Document - OOS Monitoring System

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser (React)                     │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│  │Dashboard │  │  Stores  │  │ Stocks  │  │  Depots  │  │
│  │  + Map   │  │   Page   │  │  Page   │  │   Page   │  │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  │
│       └──────────────┴─────────────┴─────────────┘       │
│                           │                              │
│                    Inertia.js Router                     │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP
┌───────────────────────────┴─────────────────────────────┐
│                    Laravel Backend                        │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌──────────┐  │
│  │Dashboard │  │ Store    │  │ Stock   │  │  Depot   │  │
│  │Controller│  │Controller│  │Controller│  │Controller│  │
│  └────┬─────┘  └────┬─────┘  └────┬────┘  └────┬─────┘  │
│       └──────────────┴─────────────┴─────────────┘       │
│                           │                              │
│                    Eloquent ORM                          │
└───────────────────────────┬─────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │     MySQL     │
                    └───────────────┘
```

---

## 2. Directory Structure

```
monitoring_oos/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   └── RegisteredUserController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── StoreController.php
│   │   │   ├── StockController.php
│   │   │   └── DepotController.php
│   │   ├── Requests/
│   │   │   ├── StoreRequest.php
│   │   │   ├── StockUploadRequest.php
│   │   │   └── DepotRequest.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── Store.php
│   │   ├── StockRecord.php
│   │   └── Depot.php
│   └── Services/
│       ├── StockImportService.php
│       └── StoreImportService.php
├── database/
│   ├── migrations/
│   │   ├── create_depots_table.php
│   │   ├── create_stores_table.php
│   │   └── create_stock_records_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── resources/
│   ├── js/
│   │   ├── app.jsx
│   │   ├── Pages/
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Stores/
│   │   │   │   ├── Index.jsx
│   │   │   │   ├── Show.jsx
│   │   │   │   ├── Create.jsx
│   │   │   │   ├── Edit.jsx
│   │   │   │   └── Import.jsx
│   │   │   ├── Stocks/
│   │   │   │   ├── Index.jsx
│   │   │   │   └── Upload.jsx
│   │   │   └── Depots/
│   │   │       ├── Index.jsx
│   │   │       ├── Show.jsx
│   │   │       ├── Create.jsx
│   │   │       └── Edit.jsx
│   │   ├── Components/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── MapView.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   └── StatusBadge.jsx
│   │   └── Hooks/
│   │       └── useMap.js
│   └── css/
│       └── app.css
├── routes/
│   └── web.php
└── vite.config.js
```

---

## 3. Database Schema (MySQL)

### 3.1 users
```sql
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB;
```

### 3.2 depots
```sql
CREATE TABLE depots (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    contact_person VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_depots_name (name)
) ENGINE=InnoDB;
```

### 3.3 stores
```sql
CREATE TABLE stores (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    depot_id BIGINT UNSIGNED NOT NULL,
    contact_person VARCHAR(255) NULL,
    contact_phone VARCHAR(50) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    INDEX idx_stores_depot (depot_id),
    INDEX idx_stores_location (latitude, longitude),
    FOREIGN KEY (depot_id) REFERENCES depots(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
```

### 3.4 stock_records
```sql
CREATE TABLE stock_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT UNSIGNED NOT NULL,
    date DATE NOT NULL,
    quantity_available INT NOT NULL DEFAULT 0,
    quantity_oos INT NOT NULL DEFAULT 0,
    status ENUM('available', 'low_stock', 'oos') NOT NULL DEFAULT 'available',
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    UNIQUE KEY unique_store_date (store_id, date),
    INDEX idx_stock_date (date),
    INDEX idx_stock_status (status),
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```

---

## 4. Eloquent Models

### 4.1 Depot.php
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Depot extends Model
{
    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
        'contact_person',
        'contact_phone',
    ];

    public function stores(): HasMany
    {
        return $this->hasMany(Store::class);
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
    protected $fillable = [
        'name',
        'address',
        'latitude',
        'longitude',
        'depot_id',
        'contact_person',
        'contact_phone',
    ];

    public function depot(): BelongsTo
    {
        return $this->belongsTo(Depot::class);
    }

    public function stockRecords(): HasMany
    {
        return $this->hasMany(StockRecord::class);
    }

    public function latestStock(): HasOne
    {
        return $this->hasOne(StockRecord::class)->latestOfMany('date');
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
    protected $fillable = [
        'store_id',
        'date',
        'quantity_available',
        'quantity_oos',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'quantity_available' => 'integer',
        'quantity_oos' => 'integer',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public static function calculateStatus(int $available, int $oos): string
    {
        if ($available === 0 && $oos > 0) {
            return 'oos';
        }
        if ($available > 0 && $available < 10) {
            return 'low_stock';
        }
        return 'available';
    }
}
```

---

## 5. Controllers

### 5.1 DashboardController.php
```php
<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\StockRecord;
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
                $q->where('date', $date)->where('status', 'oos');
            })->count(),
            'low_stock_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('date', $date)->where('status', 'low_stock');
            })->count(),
            'available_count' => Store::whereHas('latestStock', function ($q) use ($date) {
                $q->where('date', $date)->where('status', 'available');
            })->count(),
        ];

        $stores = Store::with(['latestStock', 'depot'])
            ->get()
            ->map(function ($store) {
                return [
                    'id' => $store->id,
                    'name' => $store->name,
                    'latitude' => $store->latitude,
                    'longitude' => $store->longitude,
                    'status' => $store->latestStock?->status ?? 'no_data',
                    'quantity_available' => $store->latestStock?->quantity_available ?? 0,
                    'quantity_oos' => $store->latestStock?->quantity_oos ?? 0,
                    'depot' => $store->depot->name,
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

namespace App\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRequest;
use App\Models\Store;
use App\Services\StoreImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $query = Store::with(['depot', 'latestStock']);

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('address', 'like', "%{$request->search}%");
            });
        }

        if ($request->filled('depot_id')) {
            $query->where('depot_id', $request->depot_id);
        }

        $stores = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('Stores/Index', [
            'stores' => $stores,
            'depots' => \App\Models\Depot::orderBy('name')->get(),
            'filters' => $request->only(['search', 'depot_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Stores/Create', [
            'depots' => \App\Models\Depot::orderBy('name')->get(),
        ]);
    }

    public function store(StoreRequest $request)
    {
        Store::create($request->validated());
        return redirect()->route('stores.index')->with('success', 'Toko berhasil ditambahkan');
    }

    public function show(Store $store)
    {
        $store->load(['depot', 'stockRecords' => function ($q) {
            $q->orderByDesc('date')->limit(30);
        }]);

        return Inertia::render('Stores/Show', [
            'store' => $store,
        ]);
    }

    public function edit(Store $store)
    {
        return Inertia::render('Stores/Edit', [
            'store' => $store,
            'depots' => \App\Models\Depot::orderBy('name')->get(),
        ]);
    }

    public function update(StoreRequest $request, Store $store)
    {
        $store->update($request->validated());
        return redirect()->route('stores.index')->with('success', 'Toko berhasil diupdate');
    }

    public function destroy(Store $store)
    {
        $store->delete();
        return redirect()->route('stores.index')->with('success', 'Toko berhasil dihapus');
    }

    public function import()
    {
        return Inertia::render('Stores/Import', [
            'depots' => \App\Models\Depot::orderBy('name')->get(),
        ]);
    }

    public function processImport(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $service = app(StoreImportService::class);
        $result = $service->import($request->file('file'));

        return back()->with([
            'import_result' => $result,
            'success' => "Import selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
        ]);
    }
}
```

### 5.3 StockController.php
```php
<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
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

        if ($request->filled('date')) {
            $query->where('date', $request->date);
        }

        if ($request->filled('store_id')) {
            $query->where('store_id', $request->store_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $records = $query->orderByDesc('date')
            ->orderBy('store_id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Stocks/Index', [
            'records' => $records,
            'stores' => Store::orderBy('name')->get(),
            'filters' => $request->only(['date', 'store_id', 'status']),
        ]);
    }

    public function upload()
    {
        return Inertia::render('Stocks/Upload', [
            'stores' => Store::orderBy('name')->get(),
        ]);
    }

    public function processUpload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        $service = app(StockImportService::class);
        $result = $service->import($request->file('file'));

        return back()->with([
            'import_result' => $result,
            'success' => "Upload selesai. Berhasil: {$result['success']}, Gagal: {$result['failed']}",
        ]);
    }

    public function history(Store $store)
    {
        $records = $store->stockRecords()
            ->orderByDesc('date')
            ->limit(90)
            ->get();

        return Inertia::render('Stocks/History', [
            'store' => $store,
            'records' => $records,
        ]);
    }
}
```

### 5.4 DepotController.php
```php
<?php

namespace App\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\DepotRequest;
use App\Models\Depot;
use Inertia\Inertia;

class DepotController extends Controller
{
    public function index()
    {
        $depots = Depot::withCount('stores')->orderBy('name')->paginate(15);
        return Inertia::render('Depots/Index', [
            'depots' => $depots,
        ]);
    }

    public function create()
    {
        return Inertia::render('Depots/Create');
    }

    public function store(DepotRequest $request)
    {
        Depot::create($request->validated());
        return redirect()->route('depots.index')->with('success', 'Depo berhasil ditambahkan');
    }

    public function show(Depot $depot)
    {
        $depot->load(['stores' => function ($q) {
            $q->with('latestStock')->orderBy('name');
        }]);

        return Inertia::render('Depots/Show', [
            'depot' => $depot,
        ]);
    }

    public function edit(Depot $depot)
    {
        return Inertia::render('Depots/Edit', [
            'depot' => $depot,
        ]);
    }

    public function update(DepotRequest $request, Depot $depot)
    {
        $depot->update($request->validated());
        return redirect()->route('depots.index')->with('success', 'Depo berhasil diupdate');
    }

    public function destroy(Depot $depot)
    {
        $depot->delete();
        return redirect()->route('depots.index')->with('success', 'Depo berhasil dihapus');
    }
}
```

---

## 6. Services

### 6.1 StockImportService.php
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
    public function import($file): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$results) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Skip header row
            $header = array_shift($rows);

            foreach ($rows as $index => $row) {
                $rowNum = $index + 2;

                try {
                    $storeName = trim($row[0] ?? '');
                    $date = $row[1] ?? null;
                    $qtyAvailable = (int) ($row[2] ?? 0);
                    $qtyOos = (int) ($row[3] ?? 0);

                    if (empty($storeName) || empty($date)) {
                        throw new \Exception('Nama toko dan tanggal wajib diisi');
                    }

                    $store = Store::where('name', $storeName)->first();
                    if (!$store) {
                        throw new \Exception("Toko '{$storeName}' tidak ditemukan");
                    }

                    $status = StockRecord::calculateStatus($qtyAvailable, $qtyOos);

                    StockRecord::updateOrCreate(
                        ['store_id' => $store->id, 'date' => $date],
                        [
                            'quantity_available' => $qtyAvailable,
                            'quantity_oos' => $qtyOos,
                            'status' => $status,
                        ]
                    );

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNum,
                        'message' => $e->getMessage(),
                    ];
                    Log::warning("Stock import error at row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
```

### 6.2 StoreImportService.php
```php
<?php

namespace App\Services;

use App\Models\Store;
use App\Models\Depot;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreImportService
{
    public function import($file): array
    {
        $results = ['success' => 0, 'failed' => 0, 'skipped' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$results) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();

            // Skip header row
            $header = array_shift($rows);

            foreach ($rows as $index => $row) {
                $rowNum = $index + 2;

                try {
                    $name = trim($row[0] ?? '');
                    $address = trim($row[1] ?? '');
                    $latitude = (float) ($row[2] ?? 0);
                    $longitude = (float) ($row[3] ?? 0);
                    $depotName = trim($row[4] ?? '');
                    $contactPerson = trim($row[5] ?? '');
                    $contactPhone = trim($row[6] ?? '');

                    if (empty($name) || empty($address)) {
                        throw new \Exception('Nama dan alamat wajib diisi');
                    }

                    if ($latitude == 0 || $longitude == 0) {
                        throw new \Exception('Latitude dan longitude wajib diisi');
                    }

                    // Skip duplikat
                    if (Store::where('name', $name)->exists()) {
                        $results['skipped']++;
                        continue;
                    }

                    $depot = Depot::where('name', $depotName)->first();
                    if (!$depot) {
                        throw new \Exception("Depo '{$depotName}' tidak ditemukan");
                    }

                    Store::create([
                        'name' => $name,
                        'address' => $address,
                        'latitude' => $latitude,
                        'longitude' => $longitude,
                        'depot_id' => $depot->id,
                        'contact_person' => $contactPerson,
                        'contact_phone' => $contactPhone,
                    ]);

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNum,
                        'store' => $row[0] ?? '',
                        'message' => $e->getMessage(),
                    ];
                    Log::warning("Store import error at row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
```

---

## 7. Frontend Components (React + Inertia)

### 7.1 AppLayout.jsx
```jsx
import { Link, usePage } from '@inertiajs/react';
import Sidebar from './Sidebar';

export default function AppLayout({ children, title }) {
    const { auth } = usePage().props;

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{auth.user.name}</span>
                        <Link
                            href={route('logout')}
                            method="post"
                            className="text-sm text-red-600 hover:text-red-800"
                        >
                            Logout
                        </Link>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
```

### 7.2 Sidebar.jsx
```jsx
import { Link, usePage } from '@inertiajs/react';

const menuItems = [
    { label: 'Dashboard', route: 'dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1' },
    { label: 'Toko', route: 'stores.index', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: 'Stok Harian', route: 'stocks.index', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { label: 'Depo', route: 'depots.index', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
];

export default function Sidebar() {
    const { url } = usePage();

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col">
            <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-bold">OOS Monitor</h2>
            </div>
            <nav className="flex-1 p-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.route}
                        href={route(item.route)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition ${
                            url.startsWith(route(item.route).replace(window.location.origin, ''))
                                ? 'bg-blue-600'
                                : 'hover:bg-gray-800'
                        }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        {item.label}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}
```

### 7.3 MapView.jsx
```jsx
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const statusColors = {
    available: '#10b981',
    low_stock: '#f59e0b',
    oos: '#ef4444',
    no_data: '#9ca3af',
};

export default function MapView({ stores, height = '500px' }) {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current).setView([-6.2, 106.8], 10);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        stores.forEach((store) => {
            const color = statusColors[store.status] || statusColors.no_data;
            const marker = L.circleMarker([store.latitude, store.longitude], {
                radius: 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8,
            }).addTo(mapInstance.current);

            marker.bindPopup(`
                <div class="p-2">
                    <h3 class="font-bold">${store.name}</h3>
                    <p class="text-sm text-gray-600">${store.depot}</p>
                    <p class="text-sm">Status: <span style="color:${color}">${store.status}</span></p>
                    <p class="text-sm">Tersedia: ${store.quantity_available} | OOS: ${store.quantity_oos}</p>
                </div>
            `);
        });

        return () => {
            mapInstance.current?.remove();
            mapInstance.current = null;
        };
    }, [stores]);

    return <div ref={mapRef} style={{ height }} className="rounded-lg z-0" />;
}
```

### 7.4 FileUpload.jsx
```jsx
import { useState, useRef } from 'react';

export default function FileUpload({ onFileSelect, accept = '.csv,.xlsx,.xls', templateUrl }) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const inputRef = useRef(null);

    const handleFile = (file) => {
        setSelectedFile(file);
        onFileSelect(file);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(e.type === 'dragenter' || e.type === 'dragover');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="space-y-4">
            {templateUrl && (
                <a href={templateUrl} className="text-blue-600 hover:underline text-sm">
                    Download Template CSV
                </a>
            )}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    className="hidden"
                />
                <p className="text-gray-600">
                    {selectedFile ? selectedFile.name : 'Drag & drop file di sini atau klik untuk browse'}
                </p>
                <p className="text-xs text-gray-400 mt-2">Format: CSV, XLSX (Maks 10MB)</p>
            </div>
        </div>
    );
}
```

---

## 8. Routes (web.php)

```php
<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\DepotController;
use Illuminate\Support\Facades\Route;

Route::get('login', [LoginController::class, 'create'])->name('login');
Route::post('login', [LoginController::class, 'store']);
Route::post('logout', [LoginController::class, 'destroy'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/', fn () => redirect()->route('dashboard'));
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('stores', StoreController::class);
    Route::get('stores/import', [StoreController::class, 'import'])->name('stores.import');
    Route::post('stores/import', [StoreController::class, 'processImport'])->name('stores.process-import');

    Route::get('stocks', [StockController::class, 'index'])->name('stocks.index');
    Route::get('stocks/upload', [StockController::class, 'upload'])->name('stocks.upload');
    Route::post('stocks/upload', [StockController::class, 'processUpload'])->name('stocks.process-upload');
    Route::get('stocks/{store}', [StockController::class, 'history'])->name('stocks.history');

    Route::resource('depots', DepotController::class);
});
```

---

## 9. Deployment (VPS)

### 9.1 Server Requirements
- PHP 8.3+
- MySQL 8.0+
- Nginx
- Node.js 20+
- Composer
- Supervisor (queue worker jika diperlukan)

### 9.2 Nginx Config
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/monitoring_oos/public;

    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

### 9.3 Deployment Steps
```bash
# Clone repository
git clone git@github.com:your-repo/monitoring_oos.git
cd monitoring_oos

# Install dependencies
composer install --optimize-autoloader --no-dev
npm install && npm run build

# Setup environment
cp .env.example .env
php artisan key:generate

# Configure .env
DB_DATABASE=monitoring_oos
DB_USERNAME=user
DB_PASSWORD=password

# Database setup
php artisan migrate --force
php artisan db:seed  # optional: seed sample data

# Storage link
php artisan storage:link

# Cache optimization
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

## 10. CSV Templates

### 10.1 Template Import Toko (stores_import.csv)
```
name,address,latitude,longitude,depot_name,contact_person,contact_phone
Toko ABC,Jl. Sudirman No. 1,-6.2088,106.8456,Depo Jakarta,Pak Budi,081234567890
Toko DEF,Jl. Gatot Subroto No. 2,-6.2145,106.8523,Depo Jakarta,Ibu Sari,081234567891
```

### 10.2 Template Upload Stok (stock_upload.csv)
```
store_name,date,quantity_available,quantity_oos
Toko ABC,2025-07-20,150,0
Toko DEF,2025-07-20,0,25
```
