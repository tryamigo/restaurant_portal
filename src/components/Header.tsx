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
import { Home, ShoppingBag, Store, Tag, LogOut, Search, Plus, PlusCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderStatus } from './types';
import { CustomButton } from './CustomButton';

// Define prop types
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
    switch (pathname) {
      case '/orders':
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold items-end text">Orders Management</h1>
            <div className="flex space-x-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders by ID or customer name"
                  className="pl-10 w-full customBorder"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: OrderStatus | 'all') => setStatusFilter?.(value)}
              >
                <SelectTrigger className="w-[180px] customBorder">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="on the way">On the Way</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case '/menu':
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold text">Menu Details</h1>
            <div className="flex space-x-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-10 w-64 customBorder"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
            <CustomButton onClick={onAddItem}>
              Add Item
            </CustomButton>
          </div>
          </div>
        );

      case '/coupons':
        return (
          <div className="flex justify-between items-center w-full">
            <h1 className="text-2xl font-bold text">Coupons Management</h1>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  className="pl-10 w-64 customBorder"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <CustomButton onClick={onAddItem} >
                Add New Coupon
              </CustomButton>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center">
            <h2 className="text-2xl font-semibold text">Dashboard</h2>
          </div>
        );
    }
  };

  return (
<header className=" w-[72rem] -ml-[1%] top-0 fixed z-20 bg-white shadow-sm py-4 px-4 flex justify-between items-center overflow-hidden">
{renderHeaderContent()}
      <div className="flex items-center space-x-4">
        <div className='mx-2'>
        <Notifications />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer w-8 h-8">
              <AvatarImage
                src={session?.user?.image || '/default-avatar.png'}
                alt="User  profile"
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
  );
}

export default Header;