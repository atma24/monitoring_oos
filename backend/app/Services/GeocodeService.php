<?php

namespace App\Services;

use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodeService
{
    public function geocodeStore(Store $store): array
    {
        $apiKey = env('GEOAPIFY_API_KEY');
        
        if (!$apiKey) {
            Log::error("API Key kosong untuk {$store->outlet_name}");
            return ['status' => 'error', 'message' => 'API Key tidak dikonfigurasi.'];
        }

        try {
            $lat = null;
            $lon = null;
            $cleanName = $store->outlet_name;

            // Hapus kode dalam kurung siku di akhir (contoh: "[PRGI]") karena API sering bingung
            $cleanName = preg_replace('/\[.*?\]/', '', $cleanName);

            // Deteksi pola: KODE - KODE ACAK - NAMA LOKASI (contoh: IDM - FZJC - CANDI GEBANG)
            if (preg_match('/^(IDM|SAT|MIDI)\s*-\s*[A-Z0-9\s]+\s*-\s*(.*)/i', $cleanName, $matches)) {
                $kodeBrand = strtoupper($matches[1]);
                $namaTokoAsli = trim($matches[2]); // Mengambil nama jalan/daerahnya saja
                
                $brands = [
                    'IDM'  => 'Indomaret',
                    'SAT'  => 'Alfamart',
                    'MIDI' => 'Alfamidi'
                ];
                
                // Menggabungkan Brand Asli + Nama Lokasi
                $cleanName = $brands[$kodeBrand] . ' ' . $namaTokoAsli;
            } 
            // Jika polanya cuma 1 strip (contoh: IDM - CANDI GEBANG)
            elseif (preg_match('/^(IDM|SAT|MIDI)\s*-\s*(.*)/i', $cleanName, $matches)) {
                $kodeBrand = strtoupper($matches[1]);
                $namaTokoAsli = trim($matches[2]);
                
                $brands = [
                    'IDM'  => 'Indomaret',
                    'SAT'  => 'Alfamart',
                    'MIDI' => 'Alfamidi'
                ];
                
                $cleanName = $brands[$kodeBrand] . ' ' . $namaTokoAsli;
            }

            // Ganti nama retail lain yang sering rancu
            $cleanName = str_ireplace('LION SUPERINDO', 'Superindo', $cleanName);
            $cleanName = str_ireplace('CIRCLE K.', 'Circle K', $cleanName);
            
            // Bersihkan sisa spasi ganda
            $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));

            // ==========================================
            // 🌍 2. PROSES PENCARIAN GEOCODING
            // ==========================================

            // LEVEL 1: Nama Toko Bersih + Kota + Kode Pos
            $level1 = strtolower(implode(', ', array_filter([$cleanName, $store->city, $store->postal_code, 'indonesia'])));
            $data = $this->fetchGeoapify($level1, $apiKey);

            if (!empty($data)) {
                $lat = $data['lat'];
                $lon = $data['lon'];
            } else {
                // LEVEL 2: Nama Toko Bersih + Kota (Tanpa Kode Pos)
                $level2 = strtolower(implode(', ', array_filter([$cleanName, $store->city, 'indonesia'])));
                $data = $this->fetchGeoapify($level2, $apiKey);
                
                if (!empty($data)) {
                    $lat = $data['lat'];
                    $lon = $data['lon'];
                } else {
                    // LEVEL 3: Jalan + Kota + Kode Pos (Jika nama toko gagal total)
                    $level3 = strtolower(implode(', ', array_filter([$store->street, $store->city, $store->postal_code, 'indonesia'])));
                    $data = $this->fetchGeoapify($level3, $apiKey);
                    
                    if (!empty($data)) {
                        $lat = $data['lat'];
                        $lon = $data['lon'];
                    }
                }
            }

            // SIMPAN DATA
            if ($lat !== null && $lon !== null) {
                $store->forceFill([
                    'latitude' => $lat,
                    'longitude' => $lon,
                ])->save();
                
                return ['status' => 'success', 'lat' => $lat, 'lon' => $lon, 'name' => $cleanName];
            } else {
                return ['status' => 'failed', 'message' => 'Lokasi tidak ditemukan.', 'name' => $cleanName];
            }

        } catch (\Exception $e) {
            Log::error("ERROR SISTEM {$store->outlet_name}: " . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage(), 'name' => $store->outlet_name];
        }
    }

    private function fetchGeoapify(string $query, string $apiKey)
    {
        // ... (Kode fetchGeoapify persis sama seperti di Job sebelumnya) ...
        $response = Http::withoutVerifying()
            ->withOptions([
                CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4, 
            ])
            ->withHeaders([
                'User-Agent' => 'OOSMonitor/1.0', 
            ])
            ->timeout(15)
            ->get('https://api.geoapify.com/v1/geocode/search', [
                'text' => $query,
                'apiKey' => $apiKey,
                'limit' => 1,
            ]);

        if ($response->successful()) {
            $features = $response->json('features');
            if (!empty($features[0]['properties'])) {
                return [
                    'lat' => $features[0]['properties']['lat'],
                    'lon' => $features[0]['properties']['lon'],
                ];
            }
        } else {
            Log::error("API ERROR [Status {$response->status()}]: " . $response->body());
        }
        
        return null;
    }
}