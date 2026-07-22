<?php

namespace App\Services;

use App\Models\StockRecord;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StockImportService
{
    private array $columnMap = [
        'stockdate' => 'stockdate',
        'og_urgent_date' => 'og_urgent_date',
        'account' => 'account',
        'outlet_name' => 'outlet_name',
        'sap_id' => 'sap_id',
        'source' => 'source',
        'region' => 'region',
        'supplier' => 'supplier',
        'jwk' => 'jwk',
        'DSI' => 'dsi',
        'Category' => 'category',
    ];

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
                $col = trim($col);
                if (isset($this->columnMap[$col])) {
                    $headerIndex[$this->columnMap[$col]] = $i;
                }
            }

            foreach ($rows as $i => $row) {
                $rowNum = $i + 2;
                try {
                    $sapId = trim($row[$headerIndex['sap_id']] ?? '');
                    $date = $row[$headerIndex['stockdate']] ?? null;

                    if (empty($sapId) || empty($date)) {
                        throw new \Exception('sap_id dan stockdate wajib diisi');
                    }

                    $stockdate = \Carbon\Carbon::createFromFormat('d/m/Y', $date)->format('Y-m-d');

                    $store = Store::where('sap_id', $sapId)->first();
                    if (!$store) {
                        throw new \Exception("Store dengan sap_id '{$sapId}' tidak ditemukan. Upload daftar toko terlebih dahulu.");
                    }

                    $ogUrgentDate = null;
                    if (!empty($row[$headerIndex['og_urgent_date']] ?? '')) {
                        $ogUrgentDate = \Carbon\Carbon::createFromFormat('d/m/Y', $row[$headerIndex['og_urgent_date']])->format('Y-m-d');
                    }

                    $dsi = (float) str_replace(',', '.', $row[$headerIndex['dsi']] ?? 0);
                    $category = strtoupper(trim($row[$headerIndex['category']] ?? ''));

                    StockRecord::updateOrCreate(
                        [
                            'store_id' => $store->id,
                            'stockdate' => $stockdate,
                        ],
                        [
                            'sap_id' => $sapId,
                            'og_urgent_date' => $ogUrgentDate,
                            'account' => trim($row[$headerIndex['account']] ?? ''),
                            'outlet_name' => trim($row[$headerIndex['outlet_name']] ?? ''),
                            'source' => trim($row[$headerIndex['source']] ?? ''),
                            'region' => trim($row[$headerIndex['region']] ?? ''),
                            'supplier' => trim($row[$headerIndex['supplier']] ?? ''),
                            'jwk' => trim($row[$headerIndex['jwk']] ?? ''),
                            'dsi' => $dsi,
                            'category' => $category,
                            'depo_id' => $store->depo_id,
                        ]
                    );

                    $results['success']++;
                } catch (\Exception $e) {
                    $results['failed']++;
                    $results['errors'][] = [
                        'row' => $rowNum,
                        'message' => $e->getMessage(),
                    ];
                    Log::warning("Stock import error row {$rowNum}: " . $e->getMessage());
                }
            }
        });

        return $results;
    }
}
