'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Plus, Edit3, Trash2, X } from 'lucide-react';
import type { User, Depo } from '@/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  kepala_depo: 'Kepala Depo',
  kepala_distribusi: 'Kepala Distribusi',
  supervisor_distribusi: 'Supervisor Distribusi',
};

const ROLE_BADGES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  kepala_depo: 'bg-orange-100 text-orange-700',
  kepala_distribusi: 'bg-blue-100 text-blue-700',
  supervisor_distribusi: 'bg-green-100 text-green-700',
};

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'kepala_depo', label: 'Kepala Depo' },
  { value: 'kepala_distribusi', label: 'Kepala Distribusi' },
  { value: 'supervisor_distribusi', label: 'Supervisor Distribusi' },
];

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [depos, setDepos] = useState<Depo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'supervisor_distribusi',
    depo_id: '',
  });

  useEffect(() => {
    if (!loading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const reload = async () => {
    try {
      const [usersRes, depoRes] = await Promise.all([
        api.get('/users'),
        api.get('/depo'),
      ]);
      setUsers(usersRes.data.data || []);
      setDepos(depoRes.data.data || []);
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
    setForm({ name: '', email: '', password: '', role: 'supervisor_distribusi', depo_id: '' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      depo_id: u.depo_id?.toString() || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.depo_id) return;
    if (!editing && !form.password.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/users/${editing.id}`, form);
      } else {
        await api.post('/users', form);
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
    if (!confirm(`Hapus user "${name}"?`)) return;
    try {
      await api.delete(`/users/${id}`);
      reload();
    } catch {
      // ignore
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto space-y-6 pt-8">

        <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Manajemen User</h2>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-all text-sm"
          >
            <Plus className="w-5 h-5" />
            Tambah User
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500 animate-pulse font-medium">Memuat data user...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama</th>
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Depo</th>
                    <th className="text-right px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: User) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-[#F3F6F9] transition-colors group">
                      <td className="px-6 py-4 font-bold text-gray-800">{u.name}</td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${ROLE_BADGES[u.role] || 'bg-gray-100 text-gray-600'}`}>
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.depo?.name || '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(u)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(u.id, u.name)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Belum ada user.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-xl mx-4 transform transition-all" onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">{editing ? 'Edit User' : 'Tambah User'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800"
                  placeholder="Nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800"
                  placeholder="user@email.com"
                  type="email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Password {editing ? '(kosongkan jika tidak diubah)' : '*'}
                </label>
                <input
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800"
                  placeholder={editing ? 'Biarkan kosong jika tidak diubah' : 'Min. 8 karakter'}
                  type="password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role *</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Depo *</label>
                <select
                  value={form.depo_id}
                  onChange={(e) => setForm({ ...form, depo_id: e.target.value })}
                  className="w-full bg-gray-50 border-transparent rounded-xl py-3 px-4 text-sm focus:border-blue-500 focus:bg-white focus:ring-0 transition-all outline-none text-gray-800"
                >
                  <option value="">Pilih depo...</option>
                  {depos.map((d: Depo) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="py-2.5 px-6 rounded-xl text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.email.trim() || (!editing && !form.password.trim()) || !form.depo_id}
                className="py-2.5 px-6 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center min-w-[140px]"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Menyimpan...
                  </span>
                ) : editing ? 'Simpan Perubahan' : 'Tambah User'}
              </button>
            </div>

          </div>
        </div>
      )}
    </AppShell>
  );
}
