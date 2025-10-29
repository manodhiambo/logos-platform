'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold text-primary">
            LOGOS ✝️
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-slate-700 hover:text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/communities" className="text-slate-700 hover:text-primary">
              Communities
            </Link>
            <Link href="/dashboard/prayers" className="text-slate-700 hover:text-primary">
              Prayers
            </Link>
            <Link href="/dashboard/bible" className="text-slate-700 hover:text-primary">
              Bible
            </Link>
            <Link href="/dashboard/devotionals" className="text-slate-700 hover:text-primary">
              Devotionals
            </Link>
            <Link href="/dashboard/ai-assistant" className="text-slate-700 hover:text-primary">
              AI Assistant
            </Link>
            
            {/* Admin Link - Only visible to admins */}
            {user?.role === 'admin' && (
              <Link href="/admin" className="text-red-600 hover:text-red-700 font-semibold">
                🛡️ Admin
              </Link>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="outline" onClick={logout} size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
