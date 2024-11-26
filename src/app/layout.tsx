"use client";

import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import React from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Tag, Moon, Sun } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/contexts/ThemeContext";

const navItems = [
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/menu", label: "Menu", icon: Home },
  { href: "/coupons", label: "Coupons", icon: Tag },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const pathname = usePathname();

  // Don't render layout for signin page
  if (pathname === "/sign-in" || status === "loading") {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-800">
      {/* Desktop Sidebar */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="hidden md:block w-64 bg-white shadow-lg border-r border-gray-200 dark:bg-gray-900 dark:border-gray-700"
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">
            Restaurant Portal
          </h1>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href={item.href} passHref>
                  <Button
                    variant="ghost"
                    className={`
                      w-full 
                      justify-start 
                      hover:bg-blue-50 
                      hover:text-blue-600 
                      dark:hover:bg-gray-700 
                      dark:hover:text-white
                      ${
                        pathname === item.href ||
                        (pathname === "/" && item.href === "/orders")
                          ? "bg-blue-50 text-blue-600 dark:bg-gray-700 dark:text-white"
                          : "text-gray-700 dark:text-gray-300"
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
                            ? "text-blue-600 dark:text-white"
                            : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                    />
                    {item.label}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-auto p-4 bg-gray-100 md:p-6 dark:bg-gray-800"
      >
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 dark:bg-gray-900">
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <SessionProvider>
          <ThemeProvider>
            <Toaster />
            <LayoutContent>{children}</LayoutContent>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
