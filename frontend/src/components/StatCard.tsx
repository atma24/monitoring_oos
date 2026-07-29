import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  iconBg?: string;
  iconColor?: string;
}

export default function StatCard({ icon, label, value, iconBg = 'bg-blue-50', iconColor = 'text-blue-600' }: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm flex items-center gap-4">
      <div className={`w-14 h-14 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <div className={`w-7 h-7 ${iconColor}`}>{icon}</div>
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
