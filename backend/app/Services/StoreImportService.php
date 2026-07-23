<?php

namespace App\Services;

use App\Models\Store;
use App\Jobs\GeocodeStoreAddress;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreImportService
{
    public function import($file, $depoId = null): array
    {
        $result = ['success' => 0, 'failed' => 0, 'errors' => []];

        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();
        $header = array_shift($rows);

        // Cari index kolom secara fleksibel
        $colIdx = [
            'Customer' => array_search('Customer', $header),
            'Name 1' => array_search('Name 1', $header),
            'Street' => array_search('Street', $header),
            'City' => array_search('City', $header),
            'PostalCode' => array_search('PostalCode', $header),
        ];

        if ($colIdx['Customer'] === false) {
            throw new \Exception("Format Excel salah! Kolom 'Customer' tidak ditemukan di baris pertama.");
        }

        DB::transaction(function () use ($rows, $colIdx, &$result, $depoId) {
            foreach ($rows as $i => $row) {
                $rowNum = $i + 2; 
                
                $sapId = trim($row[$colIdx['Customer']] ?? '');
                
                // Abaikan baris kosong yang nyangkut di Excel
                if (empty($sapId) || strtolower($sapId) === 'nan') continue;

                try {
                    // 1. Simpan data mentah ke database tanpa koordinat
                    $store = Store::updateOrCreate(
                        ['sap_id' => $sapId],
                        [
                            'outlet_name' => trim($row[$colIdx['Name 1']] ?? '-'),
                            'street' => trim($row[$colIdx['Street']] ?? ''),
                            'city' => trim($row[$colIdx['City']] ?? ''),
                            'postal_code' => trim($row[$colIdx['PostalCode']] ?? ''),
                            'depo_id' => $depoId, 
                        ]
                    );

                    // 2. Suruh pekerja latar belakang mencari koordinat titik petanya nanti
                    GeocodeStoreAddress::dispatch($store);

                    $result['success']++;
                } catch (\Exception $e) {
                    $result['failed']++;
                    $result['errors'][] = ['row' => $rowNum, 'message' => $e->getMessage()];
                    Log::error("Store import error baris {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $result;
    }
}