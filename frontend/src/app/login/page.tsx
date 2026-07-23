"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Package, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/api/login", {
        email: email,
        password: password,
      });

      // Misal struktur respons Laravel: { data: { token: "1|xxx...", user: {...} } }
      // Sesuaikan 'response.data.data.token' dengan bentuk JSON dari AuthController kamu
      const token = response.data.data?.token || response.data.token || response.data.access_token;
      
      if (token) {
        // Simpan token ke brankas browser (localStorage)
        localStorage.setItem("token", token);
        // Lempar kembali ke halaman utama (Dashboard)
        router.push("/");
      } else {
        setError("Token tidak ditemukan dari server.");
      }
      
    } catch (err: any) {
      // Tangkap pesan error dari Laravel (misal: "Email atau Password salah")
      setError(err.response?.data?.message || "Terjadi kesalahan saat mencoba login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6F9] flex items-center justify-center p-4 font-sans">
      
      <div className="bg-white w-full max-w-md rounded-3xl shadow-sm p-8 relative overflow-hidden">
        {/* Dekorasi Sudut */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-blue-50 rounded-full opacity-50"></div>
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="bg-blue-600 p-3 rounded-xl mb-4 shadow-sm">
            <Package className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Selamat Datang</h1>
          <p className="text-sm text-gray-500 mt-1">Masuk ke Dasbor Spike OOS</p>
        </div>

        {/* Notifikasi Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          
          {/* Input Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Input Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
              <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-700">Lupa sandi?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-xl text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Tombol Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all mt-4 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Memeriksa kredensial..." : "Masuk ke Dasbor"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>

        </form>
      </div>
      
    </div>
  );
}