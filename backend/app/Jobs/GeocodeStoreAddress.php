<?php

namespace App\Jobs;

use App\Models\Store;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeocodeStoreAddress implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Store $store) {}

    public function handle(): void
    {
        $apiKey = env('GEOAPIFY_API_KEY');
        
        if (!$apiKey) {
            Log::error("API Key kosong untuk {$this->store->outlet_name}");
            return;
        }

        try {
            Log::info("Mencari koordinat: {$this->store->outlet_name}");
            
            $lat = null;
            $lon = null;

            // LEVEL 1: Nama Toko + Jalan + Kota + Kode Pos
            $level1 = strtolower(implode(', ', array_filter([$this->store->outlet_name, $this->store->street, $this->store->city, $this->store->postal_code, 'indonesia'])));
            $data = $this->fetchGeoapify($level1, $apiKey);

            if (!empty($data)) {
                $lat = $data['lat'];
                $lon = $data['lon'];
            } else {
                // LEVEL 2: Jalan + Kota + Kode Pos
                $level2 = strtolower(implode(', ', array_filter([$this->store->street, $this->store->city, $this->store->postal_code, 'indonesia'])));
                $data = $this->fetchGeoapify($level2, $apiKey);
                
                if (!empty($data)) {
                    $lat = $data['lat'];
                    $lon = $data['lon'];
                } else if (!empty($this->store->city)) {
                    // LEVEL 3: Kota Saja
                    $level3 = strtolower($this->store->city . ', indonesia');
                    $data = $this->fetchGeoapify($level3, $apiKey);
                    
                    if (!empty($data)) {
                        $lat = $data['lat'];
                        $lon = $data['lon'];
                    }
                }
            }

            if ($lat !== null && $lon !== null) {
                // GUNAKAN forceFill agar tidak diblokir oleh aturan Model $fillable
                $this->store->forceFill([
                    'latitude' => $lat,
                    'longitude' => $lon,
                ])->save();
                
                Log::info("✅ SUKSES TERSIMPAN: {$this->store->outlet_name} -> Lat: $lat, Lon: $lon");
            } else {
                Log::warning("❌ GAGAL (Data tidak ditemukan di API): {$this->store->outlet_name}");
            }

        } catch (\Exception $e) {
            Log::error("🔥 ERROR SISTEM untuk {$this->store->outlet_name}: " . $e->getMessage());
        }

        usleep(500000); 
    }

    private function fetchGeoapify(string $query, string $apiKey)
    {
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
            // LOG ERROR DARI API GEOAPIFY (Agar tidak siluman lagi)
            Log::error("API ERROR [Status {$response->status()}]: " . $response->body());
        }
        
        return null;
    }
}