<?php

namespace App\Services;

use App\Models\DeliveryStatus;
use App\Models\Store;
use Exception;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;
use Carbon\Carbon;

class DeliveryStatusImportService
{
    /**
     * Mengeksekusi proses import Excel untuk data Delivery Status (Adop)
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

        // 2. Ambil header dan ubah jadi huruf kecil semua
        $header = array_map('strtolower', array_map('trim', $rows[0]));

        // 3. Pastikan kolom kunci ada di file Excel (contoh: 'site id' atau 'cust id')
        // Berdasarkan file Excel kamu, kolom site ID adalah 'site id'
        $requiredColumns = ['site id'];
        foreach ($requiredColumns as $col) {
            if (!array_search($col, $header) && !in_array($col, $header)) {
                // Cari alternatif pencocokan jika spasi/format berbeda
                $found = false;
                foreach ($header as $h) {
                    if (str_contains($h, 'site id') || str_contains($h, 'sap_id')) {
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    throw new Exception("Format Excel salah! Kolom penanda toko ('Site ID') tidak ditemukan.");
                }
            }
        }

        // 4. Map index kolom
        $colIndex = array_flip($header);

        // 5. Iterasi baris data Excel
        foreach ($rows as $index => $row) {
            if ($index === 0) continue; // Skip header

            // Ambil Site ID (bisa diconvert jadi string)
            $siteId = $this->getValueByKeys($row, $colIndex, ['site id', 'site_id', 'sap_id']);
            $checkDateRaw = $this->getValueByKeys($row, $colIndex, ['rec_date', 'check_date', 'do date']);

            if (!$siteId) continue;

            // 6. Cari Toko di database berdasarkan sap_id / site_id
            $store = Store::where('sap_id', $siteId)->first();
            
            // Jika toko tidak ditemukan lewat sap_id, coba cari lewat kode lain atau lewati
            $storeId = $store ? $store->id : null;
            $depoId = $store ? $store->depo_id : null;

            // 7. Format tanggal
            $checkDate = $this->formatDate($checkDateRaw) ?? Carbon::now()->format('Y-m-d');
            $origDelivDate = $this->formatDate($this->getValueByKeys($row, $colIndex, ['orig. deliv. date', 'orig_deliv_date']));

            // 8. Simpan ke database dengan updateOrCreate
            DeliveryStatus::updateOrCreate(
                [
                    'store_id'   => $storeId,
                    'check_date' => $checkDate,
                    'po_number'  => $this->getValueByKeys($row, $colIndex, ['po number', 'po_number']),
                ],
                [
                    'sap_id'          => $siteId,
                    'site_name'       => $this->getValueByKeys($row, $colIndex, ['site name', 'site_name']),
                    'cust_name'       => $this->getValueByKeys($row, $colIndex, ['cust name', 'cust_name']),
                    'sales_type'      => $this->getValueByKeys($row, $colIndex, ['sales type', 'sales_type']),
                    'so_number'       => $this->getValueByKeys($row, $colIndex, ['so number', 'so_number']),
                    'product_id'      => $this->getValueByKeys($row, $colIndex, ['product id', 'product_id']),
                    'product_name'    => $this->getValueByKeys($row, $colIndex, ['product name', 'product_name']),
                    'orig_deliv_date' => $origDelivDate,
                    'po_qty'          => intval($this->getValueByKeys($row, $colIndex, ['po qty', 'po_qty']) ?? 0),
                    'do_qty'          => intval($this->getValueByKeys($row, $colIndex, ['do qty', 'do_qty']) ?? 0),
                    'billing_block'   => $this->getValueByKeys($row, $colIndex, ['billing block', 'billing_block']),
                    'driver_name'     => $this->getValueByKeys($row, $colIndex, ['driver name', 'driver_name']),
                    'status'          => $this->getValueByKeys($row, $colIndex, ['reschedule', 'status']) ?? 'ACTIVE',
                    'depo_id'         => $depoId,
                ]
            );
        }
    }

    /**
     * Helper fleksibel untuk mencari nilai kolom dengan beberapa opsi penamaan
     */
    private function getValueByKeys($row, $colIndex, array $possibleKeys)
    {
        foreach ($possibleKeys as $key) {
            $lowerKey = strtolower($key);
            if (isset($colIndex[$lowerKey])) {
                return $row[$colIndex[$lowerKey]];
            }
        }
        
        // Pencarian parsial jika key persis tidak ketemu
        foreach ($colIndex as $colName => $index) {
            foreach ($possibleKeys as $key) {
                if (str_contains($colName, strtolower($key))) {
                    return $row[$index];
                }
            }
        }

        return null;
    }

    /**
     * Helper untuk format tanggal
     */
    private function formatDate($value)
    {
        if (!$value) return null;
        
        try {
            if (is_numeric($value)) {
                return Carbon::instance(Date::excelToDateTimeObject($value))->format('Y-m-d');
            }
            return Carbon::parse($value)->format('Y-m-d');
        } catch (Exception $e) {
            return null;
        }
    }
}