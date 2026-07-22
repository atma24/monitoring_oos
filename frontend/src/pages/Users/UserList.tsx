import { useState, useEffect } from 'react'
import MainCard from '../../components/MainCard'
import client from '../../api/client'
import type { UserListItem, Depo } from '../../types'
import { Trash2 } from 'lucide-react'

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  kepala_distribusi: 'Kep. Distribusi',
  supervisor_distribusi: 'Sup. Distribusi',
}

const roleColors: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-800',
  kepala_distribusi: 'bg-blue-100 text-blue-800',
  supervisor_distribusi: 'bg-gray-100 text-gray-800',
}

export default function UserList() {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('supervisor_distribusi')
  const [depos, setDepos] = useState<Depo[]>([])
  const [depoId, setDepoId] = useState('')
  const [error, setError] = useState('')

  const loadUsers = () => {
    setLoading(true)
    client.get('/users')
      .then(({ data }) => setUsers(data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
    client.get('/depo').then(({ data }) => setDepos(data.data ?? data)).catch(() => {})
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload: Record<string, unknown> = { name, email, password, role }
      if (role === 'supervisor_distribusi' && depoId) payload.depo_id = Number(depoId)
      await client.post('/users', payload)
      setName('')
      setEmail('')
      setPassword('')
      setRole('supervisor_distribusi')
      setDepoId('')
      setShowForm(false)
      loadUsers()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal membuat user')
    }
  }

  const handleDelete = async (user: UserListItem) => {
    if (!confirm(`Hapus user "${user.name}"?`)) return
    try {
      await client.delete(`/users/${user.id}`)
      loadUsers()
    } catch {}
  }

  return (
    <div className="max-w-3xl space-y-6">
      <MainCard title="Manajemen User">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#8996a4]">Total {users.length} user</p>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Batal' : 'Tambah User'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-6 p-4 border border-[#f1f1f1] space-y-3">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-[#262626] mb-1">Nama</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required
                  className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#262626] mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#262626] mb-1">Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#262626] mb-1">Role</label>
                <select value={role} onChange={(e) => { setRole(e.target.value); setDepoId('') }}
                  className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]">
                  <option value="admin">Admin</option>
                  <option value="kepala_distribusi">Kepala Distribusi</option>
                  <option value="supervisor_distribusi">Supervisor Distribusi</option>
                </select>
              </div>
              {role === 'supervisor_distribusi' && (
                <div>
                  <label className="block text-sm font-medium text-[#262626] mb-1">Depo</label>
                  <select value={depoId} onChange={(e) => setDepoId(e.target.value)} required
                    className="w-full border border-[#f1f1f1] rounded-none px-3 py-2 text-sm focus:outline-none focus:border-[#04a9f5]">
                    <option value="">Pilih Depo</option>
                    {depos.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary">Simpan</button>
          </form>
        )}

        {loading ? (
          <p className="text-[#8996a4]">Loading...</p>
        ) : (
          <table className="pc-table w-full text-sm">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Depo</th>
                <th>Dibuat</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-[#262626] font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[u.role] || ''}`}>
                      {roleLabels[u.role] || u.role}
                    </span>
                  </td>
                  <td className="text-xs">{u.depo?.name ?? '-'}</td>
                  <td className="text-[#8996a4] text-xs">{u.created_at?.slice(0, 10)}</td>
                  <td>
                    <button onClick={() => handleDelete(u)} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </MainCard>
    </div>
  )
}
