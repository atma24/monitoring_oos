import {
  Store, AlertTriangle, AlertCircle, Clock, CheckCircle, XCircle,
  Package, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  icon: 'store' | 'alert-triangle' | 'alert-circle' | 'clock' | 'check-circle' | 'x-circle' | 'package' | 'bar-chart'
  label: string
  value: string | number
}

const iconMap: Record<StatCardProps['icon'], LucideIcon> = {
  'store': Store,
  'alert-triangle': AlertTriangle,
  'alert-circle': AlertCircle,
  'clock': Clock,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
  'package': Package,
  'bar-chart': BarChart3,
}

const iconBgMap: Record<StatCardProps['icon'], string> = {
  'store': 'bg-blue-100 text-blue-500',
  'alert-triangle': 'bg-red-100 text-red-500',
  'alert-circle': 'bg-red-100 text-red-500',
  'clock': 'bg-yellow-100 text-yellow-500',
  'check-circle': 'bg-green-100 text-green-500',
  'x-circle': 'bg-orange-100 text-orange-500',
  'package': 'bg-blue-100 text-blue-500',
  'bar-chart': 'bg-purple-100 text-purple-500',
}

export default function StatCard({ icon, label, value }: StatCardProps) {
  const Icon = iconMap[icon]

  return (
    <div className="bg-white rounded-none shadow-[0_1px_20px_0_rgba(69,90,100,0.08)] p-[25px] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgMap[icon]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#262626]">{value}</p>
      </div>
    </div>
  )
}
