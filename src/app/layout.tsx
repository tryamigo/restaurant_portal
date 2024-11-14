'use client'
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Tag, LogOut, Store } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import NotificationList from '@/components/NotificationList';
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import Notifications from "@/components/Notifications";

const navItems = [
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/coupons', label: 'Coupons', icon: Tag },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  console.log(session?.user.token)
    // useSocketNotifications();
  // Don't render layout for signin page
  if (pathname === '/sign-in' || status === 'loading') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white shadow-lg border-r border-gray-200"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Restaurant Portal</h1>

          {/* User Profile */}
          <div className="flex flex-col items-center mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src={session?.user?.image || '/default-avatar.png'}
                    alt="User  profile"
                  />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="ml-4 p-2">
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

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={item.href} passHref>
                  <Button
                    variant={pathname === item.href || (pathname === '/' && item.href === '/orders') ? "default" : "ghost"}
                    className="w-full justify-start  hover:bg-gray-200 hover:text-black"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex-1 overflow-auto relative p-4"
      >
        <div className="mb-4">
          {/* <NotificationList /> */}
            <Notifications/>
        </div>

        <motion.main
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-4"
        >
          <AnimatePresence mode="wait">
            {children}
          </AnimatePresence>
        </motion.main>
      </motion.div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NotificationProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
            <Toaster />
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}