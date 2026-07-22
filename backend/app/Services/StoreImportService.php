<?php

namespace App\Services;

use App\Models\Depo;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StoreImportService
{
    public function import($file): array
    {
        $results = ['success' => 0, 'failed' => 0, 'errors' => []];
        $storeData = [];

        $spreadsheet = IOFactory::load($file->getPathname());
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray();

        $header = array_shift($rows);
        $headerIndex = [];
        foreach ($header as $i => $col) {
            $headerIndex[trim($col)] = $i;
        }

        Log::info('Store import headers', ['headers' => array_keys($headerIndex)]);

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
                    $depo = Depo::where('name', $depoName)->first();
                    if (!$depo) {
                        $results['failed']++;
                        $results['errors'][] = ['row' => $rowNum, 'message' => "Depo '{$depoName}' tidak ditemukan"];
                        continue;
                    }
                    $depoId = $depo->id;
                }

                $storeData[] = [
                    'sap_id' => $sapId,
                    'outlet_name' => trim($row[$headerIndex['Name 1'] ?? -1] ?? ''),
                    'street' => trim($row[$headerIndex['Street'] ?? -1] ?? ''),
                    'city' => trim($row[$headerIndex['City'] ?? -1] ?? ''),
                    'postal_code' => trim($row[$headerIndex['PostalCode'] ?? -1] ?? ''),
                    'depo_id' => $depoId,
                ];

                $results['success']++;
            } catch (\Exception $e) {
                $results['failed']++;
                $results['errors'][] = ['row' => $rowNum, 'message' => $e->getMessage()];
                Log::warning("Store import parse error row {$rowNum}: " . $e->getMessage());
            }
        }

        foreach ($storeData as &$data) {
            $addressParts = array_filter([$data['street'], $data['city'], $data['postal_code'], 'Indonesia']);
            if (empty($addressParts)) continue;

            $q = implode(', ', $addressParts);
            try {
                $response = Http::withHeaders([
                    'User-Agent' => 'OOSMonitor/1.0',
                ])->timeout(5)->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $q,
                    'format' => 'json',
                    'limit' => 1,
                ]);
                if ($response->successful()) {
                    $geo = $response->json();
                    if (!empty($geo[0])) {
                        $data['latitude'] = (float) $geo[0]['lat'];
                        $data['longitude'] = (float) $geo[0]['lon'];
                    }
                }
            } catch (\Exception $e) {
                Log::warning("Geocode failed for {$q}: " . $e->getMessage());
            }
            usleep(500000);
        }

        DB::transaction(function () use ($storeData, &$results) {
            foreach ($storeData as $data) {
                try {
                    Store::updateOrCreate(
                        ['sap_id' => $data['sap_id']],
                        $data
                    );
                } catch (\Exception $e) {
                    Log::warning("Store insert error {$data['sap_id']}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
