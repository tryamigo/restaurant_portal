'use client'
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Tag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: '/restaurants', label: 'Restaurant Details', icon: Home },
  { href: '/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/coupons', label: 'Coupons', icon: Tag },
];
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const pathname = usePathname();
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <NotificationProvider>
            <div className="flex h-screen bg-gray-100">
              <div className="w-64 bg-white shadow-md">
                <div className="p-4">
                  <h1 className="text-2xl font-bold mb-4">Restaurant Portal</h1>
                  <nav>
                    {navItems.map((item) => (
                      <Link key={item.href} href={item.href} passHref>
                        <Button
                          variant={pathname === item.href ? "default" : "ghost"}
                          className="w-full justify-start mb-2"
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.label}
                        </Button>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <main className="p-6">
                  {children}
                </main>
              </div>
            </div>
            <Toaster />
          </NotificationProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
