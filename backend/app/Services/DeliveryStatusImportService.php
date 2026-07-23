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
    public function import($file)
    {
        $spreadsheet = IOFactory::load($file->getPathname());
        $worksheet = $spreadsheet->getActiveSheet();
        $rows = $worksheet->toArray();

        if (count($rows) < 2) {
            throw new Exception("File Excel kosong atau tidak memiliki data.");
        }

        $header = array_map('strtolower', array_map('trim', $rows[0]));

        // --- REVISI 1: Kita wajibkan kolom 'cust id' sebagai pencocok ---
        $requiredColumns = ['cust id'];
        foreach ($requiredColumns as $col) {
            if (!array_search($col, $header) && !in_array($col, $header)) {
                $found = false;
                foreach ($header as $h) {
                    if (str_contains($h, 'cust id') || str_contains($h, 'sap_id')) {
                        $found = true;
                        break;
                    }
                }
                if (!$found) {
                    throw new Exception("Format Excel salah! Kolom penanda toko ('Cust ID') tidak ditemukan.");
                }
            }
        }

        $colIndex = array_flip($header);

        foreach ($rows as $index => $row) {
            if ($index === 0) continue; 

            // --- REVISI 2: Ambil SAP ID dari kolom 'Cust ID' ---
            $sapId = $this->getValueByKeys($row, $colIndex, ['cust id', 'cust_id', 'sap_id']);
            $checkDateRaw = $this->getValueByKeys($row, $colIndex, ['rec_date', 'check_date', 'do date']);

            if (!$sapId) continue; 

            // Cari Toko di database
            $store = Store::where('sap_id', $sapId)->first();
            
            // --- REVISI 3: Pelindung Anti-Error ---
            // Jika toko tidak ada di tabel master, skip baris ini agar tidak error 'store_id null'
            if (!$store) continue; 

            $storeId = $store->id;
            $depoId = $store->depo_id;

            $checkDate = $this->formatDate($checkDateRaw) ?? Carbon::now()->format('Y-m-d');
            $origDelivDate = $this->formatDate($this->getValueByKeys($row, $colIndex, ['orig. deliv. date', 'orig_deliv_date']));

            // 8. Simpan ke database dengan updateOrCreate
            DeliveryStatus::updateOrCreate(
                [
                    // PENCARIAN HANYA BERDASARKAN 2 KOLOM INI (Sesuai aturan Unique DB)
                    'store_id'   => $storeId,
                    'check_date' => $checkDate,
                ],
                [
                    // po_number DIPINDAH KE BAWAH SINI
                    'po_number'       => $this->getValueByKeys($row, $colIndex, ['po number', 'po_number']),
                    'sap_id'          => $sapId,
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

    private function getValueByKeys($row, $colIndex, array $possibleKeys)
    {
        foreach ($possibleKeys as $key) {
            $lowerKey = strtolower($key);
            if (isset($colIndex[$lowerKey])) {
                return $row[$colIndex[$lowerKey]];
            }
        }
        
        foreach ($colIndex as $colName => $index) {
            foreach ($possibleKeys as $key) {
                if (str_contains($colName, strtolower($key))) {
                    return $row[$index];
                }
            }
        }

        return null;
    }

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