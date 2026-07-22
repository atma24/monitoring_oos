export interface Store {
  id: number;
  sap_id: string;
  outlet_id: string;
  outlet_name: string;
  account: string | null;
  region: string | null;
  source: string | null;
  supplier: string | null;
  category: 'RED' | 'YELLOW' | 'GREEN' | 'NO_DATA';
  stock: number;
  oos: 'YES' | 'NO';
  dsi: number;
  latest_delivery: 'DELIVERED' | 'UNDELIVERED' | null;
  created_at: string;
  updated_at: string;
}

export interface StockRecord {
  id: number;
  store_id: number;
  sap_id: string;
  stockdate: string;
  brand: string | null;
  stock: number;
  stockc: number;
  sellout: number;
  dsi: number;
  category: 'RED' | 'YELLOW' | 'GREEN';
  jwk: string | null;
  oos: 'YES' | 'NO';
  og_urgent: number;
  og_total: number;
  store?: Store;
}

export interface Depo {
  id: number;
  name: string;
  address: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryStatus {
  id: number;
  store_id: number;
  sap_id: string;
  status: 'DELIVERED' | 'UNDELIVERED';
  check_date: string;
  store?: Store;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DashboardData {
  stats: {
    total_stores: number;
    oos_count: number;
    red_count: number;
    yellow_count: number;
    green_count: number;
  };
  stores: Store[];
  selected_date: string;
}

export type UserRole = 'admin' | 'kepala_distribusi' | 'supervisor_distribusi'

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UserListItem {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  depo_id: number | null;
  depo: Depo | null;
  created_at: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
