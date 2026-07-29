export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'kepala_distribusi' | 'supervisor_distribusi';
  depo_id: number | null;
}

export interface Store {
  id: number;
  sap_id: string;
  outlet_name: string;
  street: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  depo_id: number | null;
  created_at: string;
  updated_at: string;
  depo?: Depo;
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
  depo?: Depo;
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
  po_qty: number | null;
  do_qty: number | null;
  billing_block: string | null;
  driver_name: string | null;
  status: string;
  check_date: string;
  depo_id: number | null;
  store?: Store;
  depo?: Depo;
}

export interface Depo {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  contact_person: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockHistory {
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
  category: string;
  depo_id: number | null;
  uploaded_by: number | null;
  uploaded_at: string;
  store?: Store;
  depo?: Depo;
  uploader?: User;
}

export interface DashboardData {
  summary_date: string;
  oos: { total: number; red_alert: number; yellow_warning: number };
  delivery: { total: number; issues: number };
  top_depo_oos: { depo_name: string; total_cases: number }[];
}
