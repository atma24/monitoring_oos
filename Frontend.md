# 🎨 Frontend Style Guide & Design System (Spike OOS)

Dokumen ini berisi panduan gaya dan aturan desain antarmuka (UI) untuk proyek aplikasi OOS menggunakan **Next.js, TypeScript, dan Tailwind CSS v4**. Pastikan semua halaman dan komponen baru mengikuti panduan di bawah ini agar tampilan tetap konsisten (gaya Spike Admin).

---

## 1. 🛠️ Teknologi Utama
*   **Framework:** Next.js (App Router)
*   **Styling:** Tailwind CSS v4 (`@import "tailwindcss";`)
*   **Icons:** Lucide React (`npm install lucide-react`)
*   **HTTP Client:** Axios

---

## 2. 🎨 Palet Warna (Color Scheme)
Tampilan aplikasi ini menggunakan pendekatan *clean, light, & modern*. Hindari warna-warna gelap yang mendominasi kecuali untuk teks.

*   **Background Utama (Body/Main):** `bg-[#F3F6F9]` (Abu-abu kebiruan, sangat lirih)
*   **Background Kartu/Container:** `bg-white`
*   **Aksen Utama (Primary):** `blue-600` (Gunakan untuk tombol utama, logo, atau grafik)
*   **Aksen Sekunder:** `blue-50` (Gunakan untuk latar *hover* atau latar *icon* biru)

**Warna Status (Feedback/Alerts):**
Selalu gunakan kombinasi latar belakang sangat muda (`-50`) dengan warna ikon/teks tegas (`-500` atau `-600`).
*   🔴 **Danger/Kritis:** `bg-red-50` dengan ikon/teks `text-red-500` atau `text-red-600`.
*   🟡 **Warning/Waspada:** `bg-yellow-50` dengan ikon/teks `text-yellow-500`.
*   🟠 **Issues/Kendala:** `bg-orange-50` dengan ikon/teks `text-orange-500`.
*   🟢 **Success/Aman:** `bg-green-50` dengan ikon/teks `text-green-500`.

---

## 3. ✍️ Tipografi (Teks & Font)
Gunakan *font* *sans-serif* bawaan Tailwind (`font-sans`).

*   **Judul Halaman/Kartu (Heading):** `text-xl` atau `text-2xl`, `font-bold`, `text-gray-800`.
*   **Teks Utama (Body/Value):** `text-base` atau `text-4xl` (untuk angka statistik), `font-bold`, `text-gray-800`.
*   **Sub-judul/Keterangan (Subtitle/Caption):** `text-sm`, `font-medium`, `text-gray-500`.

---

## 4. 📦 Komponen UI Standar

### A. Kartu (Cards/Containers)
Setiap *widget* atau tabel harus dibungkus dalam kartu putih tanpa garis pinggir (*borderless*) dengan ujung sangat membulat.
*   **Class standar:** `bg-white rounded-3xl shadow-sm p-6` (Gunakan `p-8` jika konten sangat luas).

### B. Tombol (Buttons)
*   **Tombol Utama (Primary):**
    ```html
    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2">
        Simpan Data
    </button>
    ```
*   **Kondisi Loading/Disabled:** Tambahkan `opacity-70 cursor-not-allowed`.

### C. Input Form
Input tidak menggunakan garis pinggir luar (*border*), melainkan menggunakan latar belakang abu-abu terang yang berubah menjadi putih saat di-*klik*.
*   **Class standar:** `w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none`

### D. Lencana Status (Badges/Pills)
Digunakan untuk tabel atau status.
*   **Class standar:** `px-3 py-1 rounded-full text-xs font-bold inline-block`
*   *Contoh Kritis:* `<span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold">Kritis</span>`

### E. Ikon (Lucide React)
*   Ukuran standar untuk di dalam input/teks kecil: `w-4 h-4` atau `w-5 h-5`.
*   Ukuran standar untuk *header* kartu atau statistik: `w-6 h-6` atau `w-7 h-7`.
*   Ikon biasanya dibungkus dalam lingkaran berwarna lirih:
    ```jsx
    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-7 h-7 text-red-500"/>
    </div>
    ```

---

## 5. 📏 Tata Letak & Spasi (Layout & Spacing)
*   Gunakan `flex` untuk penyusunan elemen sejajar (seperti *navbar* atau daftar tombol) dengan `gap-4` atau `gap-6`.
*   Gunakan `grid` untuk dasbor statistik (misal: `grid grid-cols-1 md:grid-cols-12 gap-6`).
*   Lebar maksimal area konten (*Main Content Area*): `max-w-7xl mx-auto`.