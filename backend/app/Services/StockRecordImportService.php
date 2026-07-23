<?php

namespace App\Services;

use App\Models\StockRecord;
use App\Models\Store;
use Exception;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class StockRecordImportService
{
    /**
     * Mengeksekusi proses import Excel untuk data OOS (Preventif)
     */
    public function import($file)
    {
        // 1. Load file Excel-nya
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (count($rows) < 2) {
            throw new Exception("File Excel kosong atau tidak memiliki data.");
        }

        // 2. Ambil header (baris pertama) dan ubah jadi huruf kecil semua biar kebal salah ketik besar/kecil
        $header = array_map('strtolower', array_map('trim', $rows[0]));

        // 3. Pastikan kolom wajib ada di file Excel-nya
        $requiredColumns = ['sap_id', 'stockdate'];
        foreach ($requiredColumns as $col) {
            if (!in_array($col, $header)) {
                throw new Exception("Format Excel salah! Kolom '{$col}' tidak ditemukan di baris pertama.");
            }
        }

        // 4. Map index kolom supaya gampang dipanggil
        $colIndex = array_flip($header);

        // 5. Mulai iterasi data (dari baris ke-2 sampai habis)
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Skip baris pertama (header)

            $sapId = $row[$colIndex['sap_id']] ?? null;
            $stockDateRaw = $row[$colIndex['stockdate']] ?? null;

            if (!$sapId || !$stockDateRaw) continue; // Skip kalau data utamanya kosong

            // 6. Cari Toko di database berdasarkan sap_id
            $store = Store::where('sap_id', $sapId)->first();
            
            if (!$store) continue; // Skip baris ini jika tokonya belum terdaftar di database

            // 7. Bersihkan format tanggal (Antisipasi format Serial Number dari Excel)
            $stockDate = $this->formatDate($stockDateRaw);
            $ogUrgentDate = isset($colIndex['og_urgent_date']) 
                            ? $this->formatDate($row[$colIndex['og_urgent_date']]) 
                            : null;

            // 8. Simpan ke database (Pakai updateOrCreate supaya kalau diupload 2x di hari yang sama, datanya cuma di-update, bukan duplikat)
            // 8. Simpan ke database (Pakai updateOrCreate supaya kalau diupload 2x di hari yang sama, datanya cuma di-update)
            StockRecord::updateOrCreate(
                [
                    'store_id'  => $store->id,
                    'stockdate' => $stockDate,
                ],
                [
                    'sap_id'         => $sapId,
                    'og_urgent_date' => $ogUrgentDate,
                    'account'        => $this->getValue($row, $colIndex, 'account'),
                    'outlet_name'    => $this->getValue($row, $colIndex, 'outlet_name'),
                    'source'         => $this->getValue($row, $colIndex, 'source'),
                    'region'         => $this->getValue($row, $colIndex, 'region'),
                    'supplier'       => $this->getValue($row, $colIndex, 'supplier'),
                    'jwk'            => $this->getValue($row, $colIndex, 'jwk'),
                    
                    // --- PERBAIKAN DI DUA BARIS INI ---
                    // Jika DSI kosong atau bukan angka, paksa jadi 0
                    'dsi'            => is_numeric($this->getValue($row, $colIndex, 'dsi')) 
                                        ? $this->getValue($row, $colIndex, 'dsi') 
                                        : 0,
                    
                    // Jika Category kosong, beri label default '-' agar tidak error
                    'category'       => $this->getValue($row, $colIndex, 'category') ?: '-',
                    
                    'depo_id'        => $store->depo_id, 
                ]
            );
        }
    }

    /**
     * Helper untuk menarik data dari array kolom jika ada
     */
    private function getValue($row, $colIndex, $columnName)
    {
        return isset($colIndex[$columnName]) ? $row[$colIndex[$columnName]] : null;
    }

    /**
     * Helper untuk membersihkan format tanggal dari Excel
     */
    private function formatDate($value)
    {
        if (!$value) return null;
        
        try {
            // Jika Excel mengirim format angka (Serial Date)
            if (is_numeric($value)) {
                return Carbon::instance(Date::excelToDateTimeObject($value))->format('Y-m-d');
            }
            // Jika string teks biasa
            return Carbon::parse($value)->format('Y-m-d');
        } catch (Exception $e) {
            return null; // Kalau formatnya terlalu hancur, jadikan null saja daripada error
        }
    }
}