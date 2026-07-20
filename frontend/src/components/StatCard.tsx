interface StatCardProps {
  icon: string
  label: string
  value: string | number
}

const iconBgMap: Record<string, string> = {
  '🏪': 'bg-blue-100 text-blue-500',
  '❗': 'bg-red-100 text-red-500',
  '🔴': 'bg-red-100 text-red-500',
  '🟡': 'bg-yellow-100 text-yellow-500',
  '🟢': 'bg-green-100 text-green-500',
  '🚫': 'bg-orange-100 text-orange-500',
  '📦': 'bg-blue-100 text-blue-500',
  '📊': 'bg-purple-100 text-purple-500',
}

export default function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-none shadow-[0_1px_20px_0_rgba(69,90,100,0.08)] p-[25px] flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${iconBgMap[icon] || 'bg-blue-100 text-blue-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-2xl font-bold text-[#262626]">{value}</p>
      </div>
    </div>
  )
}
