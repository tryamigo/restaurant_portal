'use client'
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { Home, ShoppingBag, Tag, LogOut, Store, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
const navItems = [
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/menu', label: 'Menu', icon: Home },
  { href: '/coupons', label: 'Coupons', icon: Tag },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Don't render layout for signin page
  if (pathname === '/sign-in' || status === 'loading') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-64 bg-white shadow-lg border-r border-gray-200"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold text mb-6">Restaurant Portal</h1>

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
                    className="w-full justify-start background text-white hover:bg-gray-200 hover:text-black"
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
      <div className="flex-1 flex flex-col overflow-hidden">
        
          <Header/>
        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-auto p-4 bg-gray-100"
        >
          <div className="bg-white rounded-lg shadow-md p-4">
            <AnimatePresence mode="wait">
              {children}
            </AnimatePresence>
          </div>
        </motion.main>
      </div>
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
            <LayoutContent>
              {children}
            </LayoutContent>
            <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}