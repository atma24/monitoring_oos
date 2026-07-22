export interface Store {
  id: number;
  sap_id: string;
  outlet_name: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  category: 'RED' | 'YELLOW' | 'GREEN' | 'NO_DATA';
  dsi: number;
  latest_delivery: 'DELIVERED' | 'UNDELIVERED' | null;
  depo_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface StockRecord {
  id: number;
  store_id: number;
  sap_id: string;
  stockdate: string;
  og_urgent_date: string | null;
  account: string | null;
  outlet_name: string;
  source: string | null;
  region: string | null;
  supplier: string | null;
  jwk: string | null;
  dsi: number;
  category: 'RED' | 'YELLOW' | 'GREEN';
  depo_id: number | null;
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
  site_name: string | null;
  cust_name: string | null;
  sales_type: string | null;
  po_number: string | null;
  so_number: string | null;
  product_id: string | null;
  product_name: string | null;
  orig_deliv_date: string | null;
  po_qty: number;
  do_qty: number;
  billing_block: string | null;
  driver_name: string | null;
  status: 'DELIVERED' | 'UNDELIVERED';
  check_date: string;
  depo_id: number | null;
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
