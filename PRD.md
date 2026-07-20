# PRD - OOS Monitoring System

## 1. Overview

Sistem monitoring Out of Stock (OOS) untuk memantau ketersediaan stok di seluruh toko. Sistem menyediakan dashboard interaktif dengan peta, manajemen toko, upload data stok harian, dan manajemen depo.

### Tech Stack
- **Backend:** Laravel 13.x + PHP 8.3+
- **Frontend:** Inertia.js + React
- **Database:** MySQL
- **Maps:** Leaflet.js (OpenStreetMap)
- **CSS:** Tailwind CSS 4.x

---

## 2. Fitur Utama

### 2.1 Dashboard
- Peta interaktif (Leaflet.js) menampilkan semua toko
- Marker toko berwarna berdasarkan category (RED/YELLOW/GREEN)
- Ringkasan statistik:
  - Total toko
  - Jumlah toko OOS
  - Jumlah toko RED/YELLOW/GREEN
- Filter tanggal

### 2.2 Manajemen Toko
- **List Toko:**
  - Tabel: SAP ID, Nama Toko, Outlet ID, Region, Supplier
  - Pencarian & filter
- **Detail Toko:**
  - Info toko + riwayat stok (grafik)
  - DSI trend

### 2.3 Monitoring Stok
- **Tabel Stok Harian:**
  - Kolom: Tanggal, SAP ID, Nama Toko, Brand, Stock, Sellout, DSI, Category, JWK, OOS
  - Filter tanggal, toko, category, OOS
  - Sorting kolom

### 2.4 Upload Stok Harian
- Drag & drop file CSV/XLSX
- Download template
- **Kolom di-upload:**
  - `sap_id`, `outlet_id`, `outlet_name`, `account`, `region`, `source`, `supplier`
  - `brand`, `stockdate`, `stock`, `stockc`, `sellout`, `DSI`, `Category`, `jwk`, `oos`
  - `og_urgent`, `og_total`
- Validasi: duplicate cek sap_id + date + brand
- Preview & error handling per baris

### 2.5 Manajemen Depo
- List depo, tambah/edit/hapus
- Detail: daftar toko di bawah depo

### 2.6 Upload Data Delivery
- Upload file Excel delivery (`data adop delivery.xlsx`)
- Filter otomatis produk galon (`5 GALLON AQUA LOCAL`, `5 GALLON VIT LOCAL`)
- Deteksi Billing Block = Z3 → status UNDELIVERED (Belum Terkirim)
- Output: jumlah toko terkirim vs belum terkirim
- Upload berkala (sama seperti stok)

---

## 3. Data Models

### 3.1 stores
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| sap_id | varchar(50) | unique, dari upload |
| outlet_id | varchar(20) | kode outlet |
| outlet_name | varchar(255) | nama toko |
| account | varchar(50) | tipe akun (IDM) |
| region | varchar(20) | wilayah |
| source | varchar(50) | sumber |
| supplier | varchar(255) | supplier |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.2 depots
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | unique |
| address | text | |
| contact_person | varchar(255) | |
| contact_phone | varchar(50) | |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.3 stock_records
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| store_id | bigint FK | references stores |
| sap_id | varchar(50) | denormalized |
| stockdate | date | tanggal stok |
| brand | varchar(100) | merek |
| stock | int | stok saat ini |
| stockc | int | stock current |
| sellout | int | sellout |
| dsi | decimal(10,2) | Days Sales Inventory |
| category | enum(RED,YELLOW,GREEN) | dari DSI |
| jwk | varchar(50) | Jadwal Wajib Kirim |
| oos | enum(YES,NO) | status OOS |
| og_urgent | int | OG Urgent |
| og_total | int | Total OG |
| created_at | timestamp | |
| updated_at | timestamp | |
| UNIQUE | (store_id, stockdate, brand) | |

### 3.4 delivery_status
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| store_id | bigint FK | references stores |
| sap_id | varchar(50) | denormalized |
| status | enum(DELIVERED,UNDELIVERED) | UNDELIVERED = Z3 galon |
| check_date | date | tanggal upload |
| created_at | timestamp | |
| updated_at | timestamp | |
| UNIQUE | (store_id, check_date) | 1 record per toko per upload |

---

## 4. API Endpoints

### Auth
- `GET /login` - Halaman login
- `POST /login` - Proses login
- `POST /logout` - Proses logout

### Dashboard
- `GET /dashboard` - Dashboard peta + statistik

### Stores
- `GET /stores` - List toko
- `GET /stores/{id}` - Detail toko

### Stocks
- `GET /stocks` - List stok harian
- `GET /stocks/upload` - Form upload
- `POST /stocks/upload` - Proses upload
- `GET /stocks/{store}` - Riwayat stok per toko

### Depots
- `GET /depots` - List depo
- `GET /depots/create` - Form tambah
- `POST /depots` - Simpan
- `GET /depots/{id}` - Detail
- `GET /depots/{id}/edit` - Form edit
- `PUT /depots/{id}` - Update
- `DELETE /depots/{id}` - Hapus

### Delivery
- `GET /delivery/upload` - Form upload delivery
- `POST /delivery/upload` - Proses upload delivery

### Map
- `GET /api/stores/geojson` - Data untuk peta

---

## 5. Business Rules

### DSI & Category
- **DSI** = Days Sales Inventory (rata-rata stockdate0-10, sudah ada dari upload)
- **RED** = OOS YES atau DSI rendah
- **YELLOW** = DSI sedang
- **GREEN** = DSI aman

### Upload Stok
- Satu baris = satu toko + satu tanggal + satu brand
- Jika data sudah ada (sap_id + date + brand), update
- Jika sap_id belum ada di DB, auto-create store baru

### Stores
- `sap_id` unique
- Data store dibuat otomatis dari upload stok

### Upload Delivery
- Filter otomatis produk yang mengandung "GALLON" (galon)
- Group by Cust ID → cocokkan dengan sap_id di stores
- Jika ada Billing Block = Z3 → status UNDELIVERED (Belum Terkirim)
- Jika tidak ada Z3 → status DELIVERED (Terkirim)
- check_date = tanggal upload file
- Data delivery per toko: 1 record per (store_id, check_date)

---

## 6. UI/UX Requirements

### Halaman
1. **Login** - Email + password
2. **Dashboard** - Peta + statistik + jumlah toko Belum Terkirim
3. **Stores** - Tabel + detail (termasuk status pengiriman)
4. **Stocks** - Tabel + upload
5. **Delivery** - Upload file delivery
6. **Depots** - CRUD

### Non-Functional
- Load time < 3 detik
- Support 1000+ toko
- Upload file max 10MB
