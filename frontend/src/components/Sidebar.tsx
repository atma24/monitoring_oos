'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Store, Package, Truck, Warehouse,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Store, label: 'Stores', href: '/stores' },
  { icon: Package, label: 'Stocks', href: '/stocks' },
  { icon: Truck, label: 'Delivery', href: '/delivery' },
  { icon: Warehouse, label: 'Depo', href: '/depo' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-sm flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Package className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-gray-800">Spike OOS</span>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? '' : 'opacity-50'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
