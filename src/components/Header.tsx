"use client";
import React, { useState } from "react";
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
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Home,
  ShoppingBag,
  Store,
  Tag,
  LogOut,
  Search,
  Plus,
  Menu,
  X,
  Edit,
  Moon,
  Sun,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "./types";
import { CustomButton } from "./CustomButton";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const navItems = [
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: Home },
  { href: "/coupons", label: "Coupons", icon: Tag },
];

interface HeaderProps {
  searchTerm?: string;
  setSearchTerm?: (term: string) => void;
  statusFilter?: OrderStatus | "all";
  setStatusFilter?: (status: OrderStatus | "all") => void;
  onAddItem?: () => void;
  restaurantActions?: {
    onEditRestaurant?: () => void;
  };
}

function Header({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onAddItem,
  restaurantActions,
}: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme(); // Use context

  const renderHeaderContent = () => {
    const commonClasses = "text-xl md:text-2xl font-bold text w-1/3";
    const containerClasses =
      "flex flex-col gap-4 md:flex-row md:justify-between md:items-center w-full";

    switch (pathname) {
      case "/restaurants":
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Restaurant Details</h1>
            <div className="flex space-x-4">
            <Button onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
              <CustomButton
                onClick={restaurantActions?.onEditRestaurant}
                className="flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Edit className="h-4 w-4" />
                Edit Restaurant
              </CustomButton>
            </div>
          </div>
        );
      case "/orders":
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Orders Management</h1>
            <div className="flex flex-col md:flex-row gap-3 w-full md:items-center">
              <Button onClick={toggleTheme}>
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
              <div className="relative flex-grow dark:bg-gray-700 rounded-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(value: OrderStatus | "all") =>
                  setStatusFilter?.(value)
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter Status" />
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

      case "/menu":
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Menu Management</h1>
            <div className="flex flex-col md:flex-row gap-3 w-full md:items-center">
              <Button onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
              <div className="relative flex-grow dark:bg-gray-700 rounded-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search menu items"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <CustomButton
                onClick={onAddItem}
                className="flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </CustomButton>
            </div>
          </div>
        );

      case "/coupons":
        return (
          <div className={containerClasses}>
            <h1 className={commonClasses}>Coupon Management</h1>
            <div className="flex flex-col md:flex-row gap-3 w-full md:items-center">
              <Button onClick={toggleTheme} aria-label="Toggle Theme">
                {theme === "light" ? <Moon /> : <Sun />}
              </Button>
              <div className="relative flex-grow dark:bg-gray-700 rounded-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search coupons"
                  className="pl-10 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm?.(e.target.value)}
                />
              </div>
              <CustomButton
                onClick={onAddItem}
                className="flex items-center justify-center gap-2 w-full md:w-auto"
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 z-50 bg-white shadow-sm py-3 px-4 md:px-6 border-b border-gray-200 dark:bg-gray-950 dark:shadow-none ">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {renderHeaderContent()}

        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" onClick={toggleMobileMenu} className="p-2">
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Notifications and User Menu */}
          <div className="flex items-center gap-3">
            <Notifications />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8 md:w-9 md:h-9 border-2 border-gray-200">
                  <AvatarImage
                    src={session?.user?.image || "/default-avatar.png"}
                    alt="User profile"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-sm md:text-base">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col font-semibold">
                    {session?.user?.name}
                    <span className="text-xs text-gray-500">
                      {session?.user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => router.push("/restaurants")}
                  className="cursor-pointer hover:dark:bg-gray-800"
                >
                  <Store className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                  Restaurant Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 cursor-pointer hover:dark:bg-gray-800"
                  onSelect={() => signOut({ callbackUrl: "/sign-in" })}
                >
                  <LogOut className="mr-2 h-4 w-40" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 md:hidden bg-white w-full h-full overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl text font-bold">Restaurant Portal</h1>
                <Button
                  variant="ghost"
                  onClick={toggleMobileMenu}
                  className="p-2"
                >
                  <X className="text" />
                </Button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={toggleMobileMenu}
                  >
                    <Button
                      variant="ghost"
                      className={`
                        w-full 
                        justify-start 
                        hover:bg-blue-50 
                        hover:text-blue-600 
                        ${
                          pathname === item.href ||
                          (pathname === "/" && item.href === "/orders")
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-700"
                        }
                        transition-colors 
                        duration-200 
                        ease-in-out
                      `}
                    >
                      <item.icon
                        className={`
                        mr-2 
                        h-4 
                        w-4 
                        ${
                          pathname === item.href ||
                          (pathname === "/" && item.href === "/orders")
                            ? "text-blue-600"
                            : "text-gray-500"
                        }
                      `}
                      />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
