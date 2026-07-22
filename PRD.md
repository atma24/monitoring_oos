# PRD - OOS Monitoring System

## 1. Overview

Sistem monitoring Out of Stock (OOS) untuk memantau ketersediaan stok di seluruh toko. Sistem menyediakan dashboard interaktif dengan peta, manajemen toko, upload data stok harian, dan manajemen depo.

### Tech Stack
- **Backend:** Laravel 11.x + PHP 8.3+ (folder `backend/`)
- **Frontend:** Vite + React + TypeScript (folder `frontend/`)
- **Database:** MySQL / SQLite (development)
- **Maps:** Leaflet.js (OpenStreetMap)
- **CSS:** Tailwind CSS 4.x
- **API:** REST JSON

### Repository Structure (Monorepo)
```
monitoring_oos/
├── backend/          # Laravel API (PHP)
│   ├── app/
│   ├── config/
│   ├── routes/api.php
│   └── public/build/   # Built frontend assets
├── frontend/         # Vite + React + TypeScript
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## 2. Fitur Utama

### 2.1 Dashboard
- Peta interaktif (Leaflet.js) menampilkan semua toko
- Marker toko berwarna berdasarkan category (RED/YELLOW/GREEN)
- Ringkasan statistik:
  - Total toko
  - Jumlah toko RED/YELLOW/GREEN

### 2.2 Manajemen Toko
- **List Toko:**
  - Tabel: SAP ID, Nama Toko, Kota, Alamat, Category
  - Pencarian & filter berdasarkan nama/kota
- **Detail Toko:**
  - Info toko (alamat) + riwayat stok
  - DSI trend
- **Upload Toko:**
  - Upload file Excel daftar toko
  - Kolom: Customer, Name 1, Street, City, PostalCode
  - Geocode otomatis via Nominatim (OpenStreetMap)

### 2.3 Monitoring Stok
- **Tabel Stok Harian (Preventif):**
  - Kolom: Tanggal, SAP ID, Toko, Region, DSI, Category, OG Urgent
  - Filter tanggal, category

### 2.4 Upload Stok (Preventif)
- Drag & drop file XLSX
- **Kolom di-upload:**
  - `stockdate`, `og_urgent_date`, `account`, `outlet_name`, `sap_id`
  - `source`, `region`, `supplier`, `jwk`, `DSI`, `Category`
- Duplicate cek: sap_id + date
- Auto lookup store → ambil depo_id

### 2.5 Manajemen Depo
- List depo, tambah/edit/hapus
- Detail: daftar toko di bawah depo

### 2.6 Upload Data Delivery (Adop)
- Upload file Excel delivery (`data adop delivery.xlsx`)
- Filter otomatis produk galon (`5 GALLON AQUA LOCAL`, `5 GALLON VIT LOCAL`)
- Deteksi Billing Block = Z3 → status UNDELIVERED
- Menyimpan semua kolom raw dari adop
- Output: jumlah toko terkirim vs belum terkirim

### 2.7 RBAC (Role Based Access Control)
- **Admin** — full access + manage user
- **Kepala Distribusi** — full access (no user management)
- **Supervisor Distribusi** — read-only, data terfilter berdasarkan `depo_id`

---

## 3. Data Models

### 3.1 users
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | |
| email | varchar(255) | unique |
| password | varchar(255) | hashed |
| role | enum(admin,kepala_distribusi,supervisor_distribusi) | |
| depo_id | bigint FK null | references depo |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.2 depo
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | unique |
| address | text | |
| city | varchar(255) | |
| postal_code | varchar(20) | |
| latitude | decimal(10,7) | dari geocode |
| longitude | decimal(10,7) | dari geocode |
| contact_person | varchar(255) | |
| contact_phone | varchar(50) | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.3 stores (Daftar Toko)
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| sap_id | varchar(50) | unique, dari kolom Customer |
| outlet_name | varchar(255) | dari kolom Name 1 |
| street | varchar(255) | |
| city | varchar(255) | |
| postal_code | varchar(20) | |
| latitude | decimal(10,7) | dari geocode otomatis |
| longitude | decimal(10,7) | dari geocode otomatis |
| depo_id | bigint FK null | references depo |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.4 stock_records (Preventif)
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| store_id | bigint FK | references stores |
| sap_id | varchar(50) | denormalized |
| stockdate | date | tanggal stok |
| og_urgent_date | date | OG urgent date |
| account | varchar(50) | |
| outlet_name | varchar(255) | |
| source | varchar(50) | |
| region | varchar(20) | |
| supplier | varchar(255) | |
| jwk | varchar(50) | Jadwal Wajib Kirim |
| dsi | decimal(10,2) | Days Sales Inventory (pre-calculated) |
| category | varchar(10) | RED / YELLOW / GREEN |
| depo_id | bigint FK null | references depo (denormalized) |
| created_at | timestamp | |
| updated_at | timestamp | |
| UNIQUE | (store_id, stockdate) | |

### 3.5 delivery_status (Adop)
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| store_id | bigint FK | references stores |
| sap_id | varchar(50) | Cust ID |
| site_name | varchar(255) | |
| cust_name | varchar(255) | |
| sales_type | varchar(50) | |
| po_number | varchar(100) | |
| so_number | varchar(100) | |
| product_id | varchar(50) | |
| product_name | varchar(255) | |
| orig_deliv_date | date | |
| po_qty | int | |
| do_qty | int | |
| billing_block | varchar(20) | Z3 = belum terkirim |
| driver_name | varchar(255) | |
| status | varchar(20) | DELIVERED / UNDELIVERED |
| check_date | date | tanggal upload |
| depo_id | bigint FK null | references depo (denormalized) |
| created_at | timestamp | |
| updated_at | timestamp | |
| UNIQUE | (store_id, check_date) | |

---

## 4. API Endpoints

Semua endpoint berada di `routes/api.php`. Frontend React memanggil endpoint ini via Axios dengan base `/api`.

### Auth
- `GET /api/user` — Ambil data user login
- `POST /api/login` — Login (return token + user)
- `POST /api/logout` — Logout (revoke token)

### Dashboard
- `GET /api/dashboard` — Data dashboard (statistik + GeoJSON stores)

### Users (Admin only)
- `GET /api/users` — List users
- `POST /api/users` — Tambah user
- `PUT /api/users/{id}` — Update user
- `DELETE /api/users/{id}` — Hapus user

### Stores
- `GET /api/stores` — List toko (paginate + filter by name/city/depo)
- `GET /api/stores/geojson` — GeoJSON untuk peta (filter by depo)
- `GET /api/stores/{id}` — Detail toko + riwayat stok
- `POST /api/stores/upload` — Upload file XLSX toko (dari SAP)
- `GET /api/template/store` — Download template toko

### Stocks (Preventif)
- `GET /api/stocks` — List stok (paginate + filter by date/category/depo)
- `POST /api/stocks/upload` — Upload file XLSX preventif
- `GET /api/template/stocks` — Download template stok

### Delivery (Adop)
- `GET /api/delivery` — List delivery (paginate + filter by date/depo)
- `POST /api/delivery/upload` — Upload file XLSX adop delivery

### Depo
- `GET /api/depo` — List depo
- `POST /api/depo` — Tambah depo
- `GET /api/depo/{id}` — Detail depo
- `PUT /api/depo/{id}` — Update depo
- `DELETE /api/depo/{id}` — Hapus depo

---

## 5. Business Rules

### DSI & Category
- DSI sudah pre-calculated dari file upload preventif
- **RED** = DSI ≤ 5
- **YELLOW** = DSI 6–15
- **GREEN** = DSI ≥ 16

### Upload Toko (SAP)
- Upload file dari SAP: kolom Customer (sap_id), Name 1 (outlet_name), Street, City, PostalCode
- Geocode otomatis via Nominatim (OpenStreetMap) berdasarkan City
- Insert/update berdasarkan sap_id

### Upload Stok (Preventif)
- Satu baris = satu toko + satu tanggal
- Kolom: stockdate, og_urgent_date, account, outlet_name, sap_id, source, region, supplier, jwk, DSI, Category
- Jika sap_id + stockdate sudah ada → update
- Jika sap_id tidak ditemukan → skip (toko harus di-upload dulu)
- depo_id diambil dari store terkait

### Upload Delivery (Adop)
- Filter otomatis produk yang mengandung "GALLON" (galon)
- Group by Cust ID → cocokkan dengan sap_id di stores
- Billing Block = Z3 → UNDELIVERED, selain itu → DELIVERED
- check_date = tanggal upload
- Menyimpan semua kolom adop (site_name, cust_name, po_number, etc.)
- depo_id diambil dari store terkait

### RBAC & Tenant Scoping
- **Supervisor Distribusi** hanya bisa melihat data depo-nya sendiri
- Filter dilakukan via global scope trait `FiltersByDepo` di model
- Admin & Kepala Distribusi bisa melihat semua
- Endpoint dibatasi via middleware `role:admin,kepala_distribusi,supervisor_distribusi`

---

## 6. UI/UX Requirements

### Halaman
1. **Login** - Email + password
2. **Dashboard** - Peta (Leaflet) + statistik toko RED/YELLOW/GREEN + info depo
3. **Stores** - Tabel toko + upload + template + detail toko
4. **Stocks** - Tabel stok preventif + upload + template
5. **Delivery** - Tabel delivery adop + upload
6. **Depo** - CRUD
7. **Users** - CRUD (admin only)

### Non-Functional
- Load time < 3 detik
- Support 1000+ toko
- Upload file max 10MB
