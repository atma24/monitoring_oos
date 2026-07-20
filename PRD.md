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
- Marker toko berwarna berdasarkan status stok:
  - Hijau = Stok tersedia
  - Kuning = Stok rendah (< threshold)
  - Merah = OOS (habis)
- Ringkasan statistik:
  - Total toko
  - Jumlah toko OOS hari ini
  - Jumlah toko stok rendah
  - Persentase ketersediaan
- Filter tanggal untuk melihat data historis

### 2.2 Manajemen Toko
- **List Toko:**
  - Tabel dengan kolom: Nama, Alamat, Depo, Status Stok Terakhir
  - Pencarian berdasarkan nama/alamat
  - Filter berdasarkan depo
- **Detail Toko:**
  - Informasi lengkap toko (nama, alamat, koordinat, kontak)
  - Grafik riwayat stok
  - Data stok terakhir
- **Tambah/Edit Toko:**
  - Form: Nama, Alamat, Latitude, Longitude, Depo (dropdown), Kontak
- **Import Toko:**
  - Upload CSV/XLSX
  - Kolom: name, address, latitude, longitude, depot_name, contact_person, contact_phone
  - Validasi dan preview sebelum import
  - Error handling per baris

### 2.3 Monitoring Stok
- **Tabel Stok Harian:**
  - Tanggal, Nama Toko, Qty Tersedia, Qty OOS, Status
  - Filter tanggal, filter toko, filter status
- **Detail Stok:**
  - Riwayat stok per toko (grafik line chart)
  - Perbandingan stok antar periode

### 2.4 Upload Stok Harian
- **Upload Form:**
  - Drag & drop atau browse file
  - Format: CSV/XLSX
  - Kolom: store_name, date, quantity_available, quantity_oos
  - Download template CSV
- **Validasi:**
  - Cek duplikat (satu toko, satu tanggal)
  - Validasi store_name harus ada di database
  - Preview data sebelum submit
- **Hasil Upload:**
  - Jumlah berhasil
  - Jumlah gagal + detail error

### 2.5 Manajemen Depo
- **List Depo:**
  - Tabel: Nama, Alamat, Jumlah Toko
- **Tambah/Edit Depo:**
  - Form: Nama, Alamat, Latitude, Longitude, Kontak
- **Detail Depo:**
  - Daftar toko di bawah depo
  - Ringkasan stok seluruh toko di depo

---

## 3. Data Models

### 3.1 users
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | |
| email | varchar(255) | unique |
| password | varchar(255) | hashed |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.2 depots
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | unique |
| address | text | |
| latitude | decimal(10,7) | nullable |
| longitude | decimal(10,7) | nullable |
| contact_person | varchar(255) | nullable |
| contact_phone | varchar(50) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.3 stores
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| name | varchar(255) | |
| address | text | |
| latitude | decimal(10,7) | nullable |
| longitude | decimal(10,7) | nullable |
| depot_id | bigint FK | references depots |
| contact_person | varchar(255) | nullable |
| contact_phone | varchar(50) | nullable |
| created_at | timestamp | |
| updated_at | timestamp | |

### 3.4 stock_records
| Field | Type | Note |
|-------|------|------|
| id | bigint PK | auto-increment |
| store_id | bigint FK | references stores |
| date | date | unique per store |
| quantity_available | int | default 0 |
| quantity_oos | int | default 0 |
| status | enum | available/low_stock/oos |
| created_at | timestamp | |
| updated_at | timestamp | |

---

## 4. API Endpoints

### Auth
- `GET /login` - Halaman login
- `POST /login` - Proses login
- `POST /logout` - Proses logout

### Dashboard
- `GET /dashboard` - Dashboard utama dengan peta + statistik

### Stores
- `GET /stores` - List toko
- `GET /stores/create` - Form tambah toko
- `POST /stores` - Simpan toko baru
- `GET /stores/{id}` - Detail toko
- `GET /stores/{id}/edit` - Form edit toko
- `PUT /stores/{id}` - Update toko
- `DELETE /stores/{id}` - Hapus toko
- `GET /stores/import` - Form import toko
- `POST /stores/import` - Proses import toko

### Stock Records
- `GET /stocks` - List data stok harian
- `GET /stocks/upload` - Form upload stok
- `POST /stocks/upload` - Proses upload stok
- `GET /stocks/{store_id}` - Riwayat stok per toko

### Depots
- `GET /depots` - List depo
- `GET /depots/create` - Form tambah depo
- `POST /depots` - Simpan depo baru
- `GET /depots/{id}` - Detail depo
- `GET /depots/{id}/edit` - Form edit depo
- `PUT /depots/{id}` - Update depo
- `DELETE /depots/{id}` - Hapus depo

### Map Data
- `GET /api/stores/geojson` - Data GeoJSON untuk peta (stores + status stok terakhir)

---

## 5. Business Rules

### Status Stok
- **OOS** = quantity_oos > 0 DAN quantity_available = 0
- **Low Stock** = quantity_available > 0 DAN quantity_available < threshold (default 10)
- **Available** = quantity_available >= threshold

### Upload Stok
- Satu baris = satu toko, satu tanggal
- Jika sudah ada data untuk toko + tanggal yang sama, update data lama
- Status otomatis dihitung berdasarkan quantity

### Import Toko
- Jika nama toko sudah ada, skip (skip duplikat)
- Koordinat wajib diisi agar muncul di peta
- Depo harus sudah ada di database

---

## 6. UI/UX Requirements

### Layout
- Sidebar navigasi (kiri)
- Header dengan logo + user info
- Content area (kanan)

### Halaman
1. **Login** - Form email + password
2. **Dashboard** - Peta penuh + statistik overlay
3. **Stores** - Tabel + CRUD
4. **Stocks** - Tabel + Upload
5. **Depots** - Tabel + CRUD

### Responsive
- Desktop: Sidebar tetap
- Mobile: Sidebar collapsible

---

## 7. Non-Functional Requirements

- Load time < 3 detik
- Support minimal 100 toko
- Data stok minimal 30 hari
- File upload maks 10MB
- Browser: Chrome, Firefox, Edge (latest 2 version)
