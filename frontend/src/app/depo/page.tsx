'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import api from '@/lib/axios';
import { Plus, Edit3, Trash2, Eye, X } from 'lucide-react';
import type { Depo } from '@/types';

export default function DepoPage() {
  const [depos, setDepos] = useState<Depo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Depo | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({ 
    id: '', 
    name: '', 
    address: '', 
    city: '', 
    postal_code: '', 
    latitude: '', 
    longitude: '', 
    contact_person: '', 
    contact_phone: '' 
  });

  const reload = async () => {
    try {
      const res = await api.get('/depo');
      setDepos(res.data.data || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const init = async () => {
      await reload();
      setLoading(false);
    };
    init();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ 
      id: '', 
      name: '', 
      address: '', 
      city: '', 
      postal_code: '', 
      latitude: '', 
      longitude: '', 
      contact_person: '', 
      contact_phone: '' 
    });
    setShowModal(true);
  };

  const openEdit = (d: Depo) => {
    setEditing(d);
    setForm({
      id: d.id?.toString() || '',
      name: d.name, 
      address: d.address || '', 
      city: d.city || '',
      postal_code: d.postal_code || '', 
      latitude: d.latitude?.toString() || '', 
      longitude: d.longitude?.toString() || '',
      contact_person: d.contact_person || '', 
      contact_phone: d.contact_phone || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.id.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/depo/${editing.id}`, form);
      } else {
        await api.post('/depo', form);
      }
      setShowModal(false);
      setEditing(null);
      reload();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus depo "${name}"?`)) return;
    try {
      await api.delete(`/depo/${id}`);
      reload();
    } catch {
      // ignore
    }
  };

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pt-8">
        
        {/* Toolbar */}
        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Daftar Depo</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah Depo
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 animate-pulse font-medium">Memuat data depo...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID/Kode</th>
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Depo</th>
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kota</th>
                    <th className="text-right px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {depos.map((d: Depo) => (
                    <tr key={d.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors group">
                      <td className="px-6 py-4 font-semibold text-gray-600">{d.id || '-'}</td>
                      <td className="px-6 py-4 font-bold text-gray-800">{d.name}</td>
                      <td className="px-6 py-4 text-gray-600">{d.city || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/depo/${d.id}`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Detail">
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button onClick={() => openEdit(d)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(d.id, d.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {depos.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-medium">Belum ada depo.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl mx-4 transform transition-all" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Edit Depo' : 'Tambah Depo'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              
              {/* Kolom ID Depo & Nama */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode / ID Depo *</label>
                  <input 
                    value={form.id} 
                    onChange={(e) => setForm({ ...form, id: e.target.value })} 
                    disabled={!!editing}
                    className={`w-full py-3 px-4 text-sm rounded-xl outline-none transition-all ${
                      editing 
                        ? 'bg-gray-100 border-transparent text-gray-500 cursor-not-allowed' 
                        : 'bg-gray-50 border-transparent focus:border-blue-500 focus:bg-white focus:ring-0 text-gray-800'
                    }`} 
                    placeholder="Misal: 9030" 
                  />
                  {editing && (
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium leading-tight">
                      * ID tidak dapat diubah setelah data dibuat.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Depo *</label>
                  <input 
                    value={form.name} 
                    onChange={(e) => setForm({ ...form, name: e.target.value })} 
                    className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" 
                    placeholder="Nama depo" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 mt-2">Alamat</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="Alamat lengkap" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kota</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="Kota" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kode Pos</label>
                  <input value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="Kode pos" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Latitude</label>
                  <input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="-6.2088" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Longitude</label>
                  <input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="106.8456" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Kontak Person</label>
                  <input value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="Nama kontak" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">No. Telepon</label>
                  <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800" placeholder="No. telepon" />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="py-2.5 px-6 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button 
                onClick={handleSave} 
                disabled={saving || !form.name.trim() || (!editing && !form.id.trim())} 
                className="py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center min-w-[140px]"
              >
                {saving ? (
                   <span className="flex items-center gap-2">
                     <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                     Menyimpan...
                   </span>
                ) : editing ? 'Simpan Perubahan' : 'Tambah Depo'}
              </button>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}