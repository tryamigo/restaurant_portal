'use client'
import React from 'react'
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
import { Home, ShoppingBag, Store, Tag, LogOut, Search, Plus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatus } from './types';
import { CustomButton } from './CustomButton';

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  statusFilter?: OrderStatus | 'all';
  setStatusFilter?: (status: OrderStatus | 'all') => void;
  onAddItem?: () => void;
}

function Header({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, onAddItem }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const renderHeaderContent = () => {
    const commonClasses = "text-2xl font-bold text-gray-800";
    const searchClasses = "pl-10 w-full max-w-md";
    const containerClasses = "flex justify-between items-center w-full";

    switch (pathname) {
      case '/orders':
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Orders Management</h1>
            <div className="flex items-center space-x-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders by ID or customer name"
                  className={searchClasses}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: OrderStatus | 'all') => setStatusFilter?.(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                  <SelectItem value="On the way">On the Way</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case '/menu':
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Menu Management</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search menu items..."
                  className={searchClasses}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <CustomButton 
                onClick={onAddItem} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </CustomButton>
            </div>
          </div>
        );

      case '/coupons':
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Coupon Management</h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  className={searchClasses}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <CustomButton 
                onClick={onAddItem} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Coupon
              </CustomButton>
            </div>
          </div>
        );

      default:
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Dashboard</h1>
          </div>
        );
    }
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-20 bg-white shadow-sm py-4 px-6 border-b border-gray-200">
      <div className="flex justify-between items-center">
        {renderHeaderContent()}
        
        <div className="flex items-center space-x-4">
          <Notifications />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer w-9 h-9 border-2 border-gray-200">
                <AvatarImage
                  src={session?.user?.image || '/default-avatar.png'}
                  alt="User profile"
                  className="object-cover"
                />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-semibold">{session?.user?.name}</span>
                  <span className="text-xs text-gray-500">{session?.user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/restaurants')}>
                <Store className="mr-2 h-4 w-4 text-gray-600" />
                Restaurant Details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 cursor-pointer"
                onSelect={() => signOut({ callbackUrl: '/sign-in' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default Header;




