import type { Store, StockRecord, Depo, DashboardData } from '../types'

const regions = ['R1', 'R2', 'R3', 'R4', 'R5']
const categories: Array<Store['category']> = ['RED', 'YELLOW', 'GREEN', 'NO_DATA']
const oosValues: Array<Store['oos']> = ['YES', 'NO']
const brands = ['AQUA', 'VIT', 'PRIMA', 'NESCAFE', 'MILO']
const suppliers = ['9000 ID JAKARTA DC', '9000 ID YOGYAKARTA DC TIV', '9000 ID SURABAYA DC', '9000 ID BANDUNG DC']
const accounts = ['IDM', 'Non-IDM', 'General Trade']

const indoStores = [
  { name: 'BOROBUDUR 2', outlet: 'F0L1' },
  { name: 'PAKEM 2-SLEMAN', outlet: 'F14Q' },
  { name: 'JOGJA CITY MALL', outlet: 'G2H3' },
  { name: 'AMPLAS MARKET', outlet: 'M4N5' },
  { name: 'MEDAN PLAZA', outlet: 'P6Q7' },
  { name: 'SURABAYA TOWN SQUARE', outlet: 'R8S9' },
  { name: 'BANDUNG INDAH PLAZA', outlet: 'T1U2' },
  { name: 'MAKASSAR MALL', outlet: 'V3W4' },
  { name: 'SEMARANG CIAMIS', outlet: 'X5Y6' },
  { name: 'PALEMBANG SQUARE', outlet: 'Z7A8' },
  { name: 'BALI GALERIA', outlet: 'B9C1' },
  { name: 'LOMBOK EPICENTRUM', outlet: 'D2E3' },
  { name: 'PONTIANAK MEGA MALL', outlet: 'F4G5' },
  { name: 'MANADO TOWN SQUARE', outlet: 'H6I7' },
  { name: 'BATAM CENTER', outlet: 'J8K9' },
  { name: 'PEKANBARU SUDIRMAN', outlet: 'L1M2' },
  { name: 'BANJARMASIN DUTA MALL', outlet: 'N3O4' },
  { name: 'ACEH MALL', outlet: 'P5Q6' },
  { name: 'JAYAPURA ABEPURA', outlet: 'R7S8' },
  { name: 'AMBON PLAZA', outlet: 'T9U1' },
]

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals))
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)]
}

function generateSapId(): string {
  return String(rand(100_000_000, 999_999_999))
}

function generateDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

function randomCoord(base: number, range: number): number {
  return parseFloat((base + (Math.random() - 0.5) * range).toFixed(6))
}

export function generateStores(count = 20): Store[] {
  const stores: Store[] = []
  for (let i = 0; i < count; i++) {
    const s = indoStores[i % indoStores.length]
    const region = pick(regions)
    const category = pick(categories)
    const oos = pick(oosValues)
    stores.push({
      id: i + 1,
      sap_id: generateSapId(),
      outlet_id: s.outlet,
      outlet_name: `${s.name}(${s.outlet})`,
      account: pick(accounts),
      region,
      source: 'Depo',
      supplier: pick(suppliers),
      category,
      stock: category === 'RED' ? rand(0, 5) : rand(10, 50),
      oos,
      dsi: category === 'RED' ? randFloat(0, 3) : category === 'YELLOW' ? randFloat(3, 14) : randFloat(14, 40),
      latest_delivery: pick(['DELIVERED', 'UNDELIVERED', null] as any),
      created_at: new Date(Date.now() - rand(30, 365) * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
  return stores
}

export function generateStockHistory(storeId: number, days = 30): StockRecord[] {
  const records: StockRecord[] = []
  for (let i = 0; i < days; i++) {
    const date = generateDate(i)
    const stock = rand(0, 50)
    const sellout = rand(0, 20)
    const dsi = stock === 0 ? 0 : randFloat(0, 30)
    const oos = stock === 0 ? 'YES' : 'NO'
    const category = oos === 'YES' ? 'RED' : dsi < 5 ? 'RED' : dsi < 14 ? 'YELLOW' : 'GREEN'
    records.push({
      id: storeId * 1000 + i,
      store_id: storeId,
      sap_id: String(storeId * 10000000),
      stockdate: date,
      brand: pick(brands),
      stock,
      stockc: stock,
      sellout,
      dsi,
      category,
      jwk: pick(['Senin', 'Selasa', 'Rabu', 'Kamis', "Jumat-Genap", 'Sabtu']),
      oos,
      og_urgent: category === 'RED' ? rand(0, 10) : 0,
      og_total: rand(5, 20),
    })
  }
  return records
}

export function generateDepo(): Depo[] {
  return [
    { id: 1, name: 'Depo Yogyakarta', address: 'Jl. Magelang KM 5, Sleman', contact_person: 'Budi', contact_phone: '081234567890', created_at: '2025-01-15T00:00:00.000Z', updated_at: '2026-06-20T00:00:00.000Z' },
    { id: 2, name: 'Depo Surabaya', address: 'Jl. Raya Gedangan 12, Sidoarjo', contact_person: 'Siti', contact_phone: '081234567891', created_at: '2025-02-20T00:00:00.000Z', updated_at: '2026-05-15T00:00:00.000Z' },
    { id: 3, name: 'Depo Bandung', address: 'Jl. Soekarno-Hatta 45, Bandung', contact_person: 'Ahmad', contact_phone: '081234567892', created_at: '2025-03-10T00:00:00.000Z', updated_at: '2026-04-10T00:00:00.000Z' },
    { id: 4, name: 'Depo Jakarta', address: 'Jl. Gaya Motor Raya, Jakarta Utara', contact_person: 'Dewi', contact_phone: '081234567893', created_at: '2025-04-05T00:00:00.000Z', updated_at: '2026-03-25T00:00:00.000Z' },
    { id: 5, name: 'Depo Medan', address: 'Jl. Sisingamangaraja 88, Medan', contact_person: 'Rudi', contact_phone: '081234567894', created_at: '2025-05-01T00:00:00.000Z', updated_at: '2026-02-20T00:00:00.000Z' },
  ]
}

export function generateDashboardData(): DashboardData {
  const stores = generateStores(20)
  const stats = {
    total_stores: 156,
    oos_count: stores.filter((s) => s.oos === 'YES').length,
    red_count: stores.filter((s) => s.category === 'RED').length,
    yellow_count: stores.filter((s) => s.category === 'YELLOW').length,
    green_count: stores.filter((s) => s.category === 'GREEN').length,
  }
  return { stats, stores, selected_date: new Date().toISOString().split('T')[0] }
}

export function getMapPoints(stores: Store[]) {
  const baseLat = -7.7956
  const baseLng = 110.3695
  return stores.map((s) => ({
    id: s.id,
    name: s.outlet_name,
    lat: randomCoord(baseLat, 0.15),
    lng: randomCoord(baseLng, 0.15),
    category: s.category,
    oos: s.oos,
  }))
}

// ------------------ Mock API with simulated delay ------------------

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

let storesData = generateStores(20)
let stockHistoryCache: Record<number, StockRecord[]> = {}

export const mockApi = {
  async getDashboard(): Promise<DashboardData> {
    await delay()
    return generateDashboardData()
  },

  async getStores(params?: { search?: string; region?: string; page?: number }): Promise<{ data: Store[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    await delay()
    let filtered = [...storesData]
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter((s) => s.outlet_name.toLowerCase().includes(q) || s.sap_id.includes(q) || s.outlet_id.toLowerCase().includes(q))
    }
    if (params?.region) {
      filtered = filtered.filter((s) => s.region === params.region)
    }
    const perPage = 10
    const page = params?.page || 1
    const total = filtered.length
    const lastPage = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const paged = filtered.slice(start, start + perPage)
    return { data: paged, meta: { current_page: page, last_page: lastPage, per_page: perPage, total } }
  },

  async getStore(id: number): Promise<{ data: Store; stock_history: StockRecord[] }> {
    await delay()
    const store = storesData.find((s) => s.id === id)
    if (!store) throw new Error('Store not found')
    if (!stockHistoryCache[id]) {
      stockHistoryCache[id] = generateStockHistory(id, 30)
    }
    return { data: store, stock_history: stockHistoryCache[id] }
  },

  async getStocks(params?: { stockdate?: string; category?: string; oos?: string; page?: number }): Promise<{ data: StockRecord[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    await delay()
    let records: StockRecord[] = []
    for (let i = 1; i <= 20; i++) {
      if (!stockHistoryCache[i]) {
        stockHistoryCache[i] = generateStockHistory(i, 1)
      }
      records.push(stockHistoryCache[i][0])
    }
    if (params?.category) {
      records = records.filter((r) => r.category === params.category)
    }
    if (params?.oos) {
      records = records.filter((r) => r.oos === params.oos)
    }
    if (params?.stockdate) {
      records = records.filter((r) => r.stockdate === params.stockdate)
    }
    const perPage = 10
    const page = params?.page || 1
    const total = records.length
    const lastPage = Math.ceil(total / perPage)
    const start = (page - 1) * perPage
    const paged = records.slice(start, start + perPage)
    return { data: paged, meta: { current_page: page, last_page: lastPage, per_page: perPage, total } }
  },

  async getStockHistory(storeId: number): Promise<{ data: StockRecord[]; store: Store }> {
    await delay()
    const store = storesData.find((s) => s.id === storeId)!
    if (!stockHistoryCache[storeId]) {
      stockHistoryCache[storeId] = generateStockHistory(storeId, 90)
    }
    return { data: stockHistoryCache[storeId], store }
  },

  async uploadStock(_file: File): Promise<{ message: string; data: { success: number; failed: number; errors: { row: number; message: string }[] } }> {
    await delay(1000)
    return {
      message: 'Upload selesai. Berhasil: 98, Gagal: 2',
      data: { success: 98, failed: 2, errors: [{ row: 5, message: 'SAP ID kosong' }, { row: 12, message: 'Tanggal tidak valid' }] },
    }
  },

  async getDepo(): Promise<{ data: Depo[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }> {
    await delay()
    const data = generateDepo()
    return { data, meta: { current_page: 1, last_page: 1, per_page: 10, total: data.length } }
  },

  async getDepoById(_id: number): Promise<{ data: Depo }> {
    await delay()
    const depo = generateDepo().find((d) => d.id === _id)
    if (!depo) throw new Error('Depo not found')
    return { data: depo }
  },

  async createDepo(input: Partial<Depo>): Promise<{ data: Depo; message: string }> {
    await delay(500)
    const depo: Depo = { id: Date.now(), ...input } as Depo
    return { data: depo, message: 'Depo berhasil ditambahkan' }
  },

  async updateDepo(id: number, input: Partial<Depo>): Promise<{ data: Depo; message: string }> {
    await delay(500)
    const depo = generateDepo().find((d) => d.id === id)!
    return { data: { ...depo, ...input }, message: 'Depo berhasil diupdate' }
  },

  async deleteDepo(_id: number): Promise<{ message: string }> {
    await delay(500)
    return { message: 'Depo berhasil dihapus' }
  },

  async uploadDelivery(_file: File): Promise<{ message: string; data: { delivered: number; undelivered: number; errors: { cust_id: string; message: string }[] } }> {
    await delay(1000)
    return {
      message: 'Upload selesai. Terkirim: 85, Belum Terkirim: 15',
      data: { delivered: 85, undelivered: 15, errors: [] },
    }
  },

  async login(email: string, _password: string): Promise<{ token: string; user: { id: number; name: string; email: string } }> {
    await delay(500)
    return {
      token: 'mock-token-123',
      user: { id: 1, name: 'Admin OOS', email },
    }
  },
}
