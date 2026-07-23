"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { 
  LayoutDashboard, ShoppingCart, Users, Package, 
  MessageSquare, Calendar, Search, Bell, Moon, 
  Globe, Menu, AlertCircle, TriangleAlert, Truck
} from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Tanggal hardcode untuk testing data dummy-mu
  const today = "2026-07-14"; 

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/dashboard?date=${today}`);
        setStats(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil data dasbor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    // Warna background utama ala Spike Admin
    <div className="flex h-screen bg-[#F3F6F9] font-sans overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white shadow-sm flex flex-col hidden md:flex z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-gray-800">Spike OOS</span>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2">
          <p className="text-xs font-semibold text-gray-400 mb-4 px-2">HOME</p>
          <ul className="space-y-1">
            <li>
              <a href="#" className="flex items-center gap-3 bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-medium">
                <LayoutDashboard className="w-5 h-5" /> Dashboard 1
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition">
                <LayoutDashboard className="w-5 h-5 opacity-50" /> Dashboard 2
              </a>
            </li>
          </ul>

          <p className="text-xs font-semibold text-gray-400 mt-8 mb-4 px-2">APPS</p>
          <ul className="space-y-1">
            {['Contacts', 'Ecommerce', 'Chats', 'Calendar'].map((item, i) => (
              <li key={i}>
                <a href="#" className="flex items-center gap-3 text-gray-600 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-medium transition">
                  {i === 0 && <Users className="w-5 h-5 opacity-50" />}
                  {i === 1 && <ShoppingCart className="w-5 h-5 opacity-50" />}
                  {i === 2 && <MessageSquare className="w-5 h-5 opacity-50" />}
                  {i === 3 && <Calendar className="w-5 h-5 opacity-50" />}
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4">
          <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center font-bold text-blue-700">
              C
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Ceca</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* NAVBAR */}
        <header className="h-20 bg-[#F3F6F9] flex items-center justify-between px-8 z-0">
          <div className="flex items-center gap-4">
            <Menu className="w-6 h-6 text-gray-500 cursor-pointer md:hidden" />
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Try to searching" 
                className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-500 w-64 shadow-sm"
              />
            </div>
            <Globe className="w-5 h-5 text-gray-500 cursor-pointer" />
            <Moon className="w-5 h-5 text-gray-500 cursor-pointer" />
            <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
            <div className="w-9 h-9 bg-blue-600 rounded-full cursor-pointer border-2 border-white shadow-sm"></div>
          </div>
        </header>

        {/* DASHBOARD SCROLL AREA */}
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          
          {loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 animate-pulse font-medium">Memuat data dasbor...</div>
          ) : !stats ? (
            <div className="flex items-center justify-center h-full text-red-500 bg-red-50 p-6 rounded-2xl">
              Gagal terhubung ke Laravel. Pastikan server `php artisan serve` jalan dan CORS sudah diatur.
            </div>
          ) : (
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* KARTU ATAS - GRID */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* WIDGET 1: Kartu Utama (Ala Congratulations Spike) */}
                <div className="md:col-span-8 bg-white rounded-3xl p-8 shadow-sm flex flex-col justify-center relative overflow-hidden">
                  <div className="z-10 w-full md:w-2/3">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Pantauan OOS Hari Ini</h2>
                    <p className="text-gray-500 mb-8">Kamu memiliki total <span className="font-bold text-blue-600">{stats.oos.total} kasus OOS</span> untuk tanggal {stats.summary_date}.</p>
                    
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                          <AlertCircle className="w-7 h-7 text-red-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{stats.oos.red_alert}</p>
                          <p className="text-sm text-gray-500 font-medium">Kritis (RED)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:ml-6">
                        <div className="w-14 h-14 rounded-full bg-yellow-50 flex items-center justify-center">
                          <TriangleAlert className="w-7 h-7 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-800">{stats.oos.yellow_warning}</p>
                          <p className="text-sm text-gray-500 font-medium">Waspada (YELLOW)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Dekorasi Ala Spike */}
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50 rounded-full opacity-50 z-0"></div>
                </div>

                {/* WIDGET 2: Kartu Delivery (Samping Kanan) */}
                <div className="md:col-span-4 bg-white rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Status Delivery</h3>
                    <p className="text-sm text-gray-500">Adop Harian</p>
                  </div>
                  
                  <div className="mt-6 flex items-end justify-between">
                    <div>
                      <p className="text-4xl font-bold text-gray-800">{stats.delivery.total}</p>
                      <p className="text-sm text-gray-500 mt-1 font-medium">Total Pengiriman</p>
                    </div>
                    <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center mb-2">
                      <Truck className="w-7 h-7 text-orange-500" />
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-sm text-gray-500 font-medium">Kendala (Batal/Pending)</span>
                    <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold">
                      {stats.delivery.issues} Kasus
                    </span>
                  </div>
                </div>

              </div>

              {/* KARTU BAWAH - Top Depo */}
              <div className="bg-white rounded-3xl p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Top 5 Depo Perhatian Khusus</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-gray-400 text-sm border-b border-gray-100">
                        <th className="pb-4 font-medium px-4">NAMA DEPO</th>
                        <th className="pb-4 font-medium text-right px-4">TOTAL KASUS OOS</th>
                        <th className="pb-4 font-medium text-center px-4">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.top_depo_oos.map((depo: any, idx: number) => (
                        <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors group">
                          <td className="py-4 px-4 font-semibold text-gray-700">{depo.depo_name}</td>
                          <td className="py-4 px-4 font-bold text-gray-800 text-right">{depo.total_cases}</td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs font-bold group-hover:bg-red-100 transition-colors">
                              Kritis
                            </span>
                          </td>
                        </tr>
                      ))}
                      {stats.top_depo_oos.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-gray-500 font-medium">Tidak ada data OOS untuk depo hari ini.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}