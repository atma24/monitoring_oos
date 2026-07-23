<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockRecord;
use App\Models\DeliveryStatus;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Mengambil ringkasan statistik untuk halaman utama
     */
    public function index(Request $request)
    {
        // 1. Tentukan tanggal (Default: hari ini, tapi bisa filter dari kalender UI nanti)
        $date = $request->query('date', Carbon::today()->toDateString());

        // 2. Tarik Statistik OOS (Preventif)
        $totalOOS = StockRecord::whereDate('stockdate', $date)->count();
        $oosRed = StockRecord::whereDate('stockdate', $date)->where('category', 'RED')->count();
        $oosYellow = StockRecord::whereDate('stockdate', $date)->where('category', 'YELLOW')->count();

        // 3. Tarik Statistik Delivery (Adop)
        $totalDelivery = DeliveryStatus::whereDate('check_date', $date)->count();
        // Asumsi: Status selain 'ACTIVE' (misal: 'Reschedule', 'Batal') dihitung bermasalah
        $deliveryIssues = DeliveryStatus::whereDate('check_date', $date)
            ->where('status', '!=', 'ACTIVE')
            ->count();

        // 4. Analisis Top 5 Depo dengan kasus OOS terbanyak hari ini
        $topDepoOos = StockRecord::with('depo')
            ->select('depo_id', DB::raw('count(*) as total'))
            ->whereDate('stockdate', $date)
            ->groupBy('depo_id')
            ->orderByDesc('total')
            ->limit(5)
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Data statistik dashboard berhasil diambil',
            'data' => [
                'summary_date' => $date,
                'oos' => [
                    'total' => $totalOOS,
                    'red_alert' => $oosRed,
                    'yellow_warning' => $oosYellow,
                ],
                'delivery' => [
                    'total' => $totalDelivery,
                    'issues' => $deliveryIssues,
                ],
                'top_depo_oos' => $topDepoOos->map(function ($item) {
                    return [
                        'depo_name' => $item->depo ? $item->depo->name : 'Depo Tidak Ditemukan',
                        'total_cases' => $item->total
                    ];
                })
            ]
        ], 200);
    }
}