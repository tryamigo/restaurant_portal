import React, { useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Notifications from "@/components/Notifications";
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Store, Tag,LogOut } from 'lucide-react';
import { useSSE } from '@/hooks/useSSE';

const navItems = [
    { href: '/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/menu', label: 'Menu', icon: Home },
    { href: '/coupons', label: 'Coupons', icon: Tag },
  ];

function Header() {
    const { data: session, status } = useSession();
    const pathname = usePathname();
    const router = useRouter();
  return (
   <>
   {/* Header */}
   <header className="bg-white shadow-sm py-3 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
            </h2>
          </div>
          
          {/* Notifications */}
          <div className="flex items-center space-x-4">
            <Notifications />
            
            {/* User Dropdown in Header */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8">
                  <AvatarImage
                    src={session?.user?.image || '/default-avatar.png'}
                    alt="User profile"
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/restaurants')}>
                  <Store className="mr-2 h-4 w-4" />
                  Restaurant Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 cursor-pointer"
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
   
   </>
  )
}

export default Header