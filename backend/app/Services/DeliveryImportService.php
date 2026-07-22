<?php

namespace App\Services;

use App\Models\DeliveryStatus;
use App\Models\Store;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PhpOffice\PhpSpreadsheet\IOFactory;

class DeliveryImportService
{
    public function import($file): array
    {
        $result = ['delivered' => 0, 'undelivered' => 0, 'errors' => []];

        DB::transaction(function () use ($file, &$result) {
            $spreadsheet = IOFactory::load($file->getPathname());
            $sheet = $spreadsheet->getActiveSheet();
            $rows = $sheet->toArray();
            $header = $rows[0];

            $colIdx = [
                'site_name' => array_search('Site Name', $header),
                'cust_id' => array_search('Cust ID', $header),
                'cust_name' => array_search('Cust Name', $header),
                'sales_type' => array_search('Sales Type', $header),
                'po_number' => array_search('PO Number', $header),
                'so_number' => array_search('SO Number', $header),
                'product_id' => array_search('Product ID', $header),
                'product_name' => array_search('Product Name', $header),
                'orig_deliv_date' => array_search('Orig. Deliv. Date', $header),
                'po_qty' => array_search('PO Qty', $header),
                'do_qty' => array_search('DO Qty', $header),
                'billing_block' => array_search('Billing Block', $header),
                'driver_name' => array_search('Driver Name', $header),
            ];

            if ($colIdx['cust_id'] === false || $colIdx['product_name'] === false || $colIdx['billing_block'] === false) {
                throw new \Exception('Kolom Cust ID, Product Name, atau Billing Block tidak ditemukan');
            }

            $checkDate = now()->toDateString();
            $galonCustIds = [];

            foreach ($rows as $r => $row) {
                if ($r === 0) continue;
                $prod = strtoupper(trim($row[$colIdx['product_name']] ?? ''));
                if (!str_contains($prod, 'GALLON')) continue;

                $custId = trim($row[$colIdx['cust_id']] ?? '');
                if (!isset($galonCustIds[$custId])) {
                    $galonCustIds[$custId] = [
                        'hasZ3' => false,
                        'row' => $row,
                    ];
                }
                if (strtoupper(trim($row[$colIdx['billing_block']] ?? '')) === 'Z3') {
                    $galonCustIds[$custId]['hasZ3'] = true;
                }
            }

            foreach ($galonCustIds as $custId => $data) {
                try {
                    $store = Store::where('sap_id', $custId)->first();
                    if (!$store) {
                        $result['errors'][] = ['cust_id' => $custId, 'message' => "Store dengan sap_id '{$custId}' tidak ditemukan"];
                        continue;
                    }

                    $status = $data['hasZ3'] ? 'UNDELIVERED' : 'DELIVERED';
                    $row = $data['row'];

                    $origDelivDate = null;
                    if (!empty($row[$colIdx['orig_deliv_date']] ?? '')) {
                        try {
                            $origDelivDate = \Carbon\Carbon::createFromFormat('d/m/Y', $row[$colIdx['orig_deliv_date']])->format('Y-m-d');
                        } catch (\Exception $e) {
                            $origDelivDate = $row[$colIdx['orig_deliv_date']] ?? null;
                        }
                    }

                    DeliveryStatus::updateOrCreate(
                        ['store_id' => $store->id, 'check_date' => $checkDate],
                        [
                            'sap_id' => $custId,
                            'site_name' => trim($row[$colIdx['site_name']] ?? ''),
                            'cust_name' => trim($row[$colIdx['cust_name']] ?? ''),
                            'sales_type' => trim($row[$colIdx['sales_type']] ?? ''),
                            'po_number' => trim($row[$colIdx['po_number']] ?? ''),
                            'so_number' => trim($row[$colIdx['so_number']] ?? ''),
                            'product_id' => trim($row[$colIdx['product_id']] ?? ''),
                            'product_name' => trim($row[$colIdx['product_name']] ?? ''),
                            'orig_deliv_date' => $origDelivDate,
                            'po_qty' => (int) ($row[$colIdx['po_qty']] ?? 0),
                            'do_qty' => (int) ($row[$colIdx['do_qty']] ?? 0),
                            'billing_block' => trim($row[$colIdx['billing_block']] ?? ''),
                            'driver_name' => trim($row[$colIdx['driver_name']] ?? ''),
                            'status' => $status,
                            'depo_id' => $store->depo_id,
                        ]
                    );

                    if ($status === 'DELIVERED') $result['delivered']++;
                    else $result['undelivered']++;
                } catch (\Exception $e) {
                    $result['errors'][] = ['cust_id' => $custId, 'message' => $e->getMessage()];
                    Log::warning("Delivery import error for {$custId}: " . $e->getMessage());
                }
            }
        });

        return $result;
    }
}
