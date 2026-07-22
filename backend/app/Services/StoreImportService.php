<?php

namespace App\Services;

use App\Models\Depot;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreImportService
{
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
                $headerIndex[trim($col)] = $i;
            }

            $colMap = [
                'Customer' => 'sap_id',
                'Name 1' => 'outlet_name',
                'Street' => 'street',
                'City' => 'city',
                'PostalCode' => 'postal_code',
                'depo' => 'depo',
            ];

            foreach ($rows as $i => $row) {
                $rowNum = $i + 2;
                try {
                    $sapId = trim($row[$headerIndex['Customer'] ?? -1] ?? '');
                    if (empty($sapId)) {
                        $results['failed']++;
                        $results['errors'][] = ['row' => $rowNum, 'message' => 'Customer (SAP ID) kosong'];
                        continue;
                    }

                    $depoName = trim($row[$headerIndex['depo'] ?? -1] ?? '');
                    $depoId = null;
                    if (!empty($depoName)) {
                        $depot = Depot::where('name', $depoName)->first();
                        if (!$depot) {
                            $results['failed']++;
                            $results['errors'][] = ['row' => $rowNum, 'message' => "Depo '{$depoName}' tidak ditemukan"];
                            continue;
                        }
                        $depoId = $depot->id;
                    }

                    Store::updateOrCreate(
                        ['sap_id' => $sapId],
                        [
                            'outlet_name' => trim($row[$headerIndex['Name 1'] ?? -1] ?? ''),
                            'street' => trim($row[$headerIndex['Street'] ?? -1] ?? ''),
                            'city' => trim($row[$headerIndex['City'] ?? -1] ?? ''),
                            'postal_code' => trim($row[$headerIndex['PostalCode'] ?? -1] ?? ''),
                            'depo_id' => $depoId,
                        ]
                    );

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = ['row' => $rowNum, 'message' => $e->getMessage()];
                    Log::warning("Store import error row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
