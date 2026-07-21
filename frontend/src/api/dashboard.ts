import client from './client'
import type { DashboardData } from '../types'

export async function fetchDashboard() {
  const { data } = await client.get<DashboardData>('/dashboard')
  return data
}
