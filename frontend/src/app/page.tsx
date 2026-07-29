'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  return (
    <div className="h-screen bg-[#F3F6F9] flex items-center justify-center">
      <div className="animate-pulse text-gray-500 font-medium">Loading...</div>
    </div>
  );
}
