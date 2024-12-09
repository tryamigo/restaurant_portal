"use client";
import React, { useEffect, useState } from "react";
import { Order, OrderStatus } from "@/components/types";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useSSE } from "@/hooks/useSSE";
import Header from "@/components/Header";
import OrderRow from "@/components/OrderRow";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Main OrdersPage component
function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const { data: session, status } = useSession();
  const { events } = useSSE();
  const router = useRouter();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Number of items per page

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [session, status, events]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders", {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userAddress?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Handle pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12 md:py-12 pt-[12rem]"
      >
        <div className="bg-white shadow-lg rounded-xl overflow-hidden dark:bg-gray-800 dark:shadow-none">
          <div className="hidden md:block overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  {[
                    "Order ID",
                    "Customer",
                    "Status",
                    "Order Details",
                    "Payment",
                    "Order Flow",
                    // "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {loading ? (
                    Array(7)
                      .fill(0)
                      .map((_, index) => (
                        <tr key={index}>
                          {Array(6)
                            .fill(0)
                            .map((_, colIndex) => (
                              <td key={colIndex} className="px-6 py-4">
                                <Skeleton className="h-8 w-full" />
                              </td>
                            ))}
                        </tr>
                      ))
                  ) : currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-12 text-gray-500 dark:bg-gray-800"
                      >
                        <div className="flex flex-col items-center justify-center space-y-4 h-full">
                          <ShoppingBag className="w-16 h-16 text-gray-300" />
                          <div className="flex flex-col items-center space-y-4">
                            <p className="text-xl">No orders found</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onView={(id) => router.push(`/orders/${id}`)}
                      />
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {/* Mobile Card View */}
          <div className="md:hidden">
            <AnimatePresence>
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="p-4 border-b">
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ))
              ) : currentItems.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center space-y-4">
                    <p className="text-xl">No orders found</p>
                  </div>
                </div>
              ) : (
                currentItems.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onView={(id) => router.push(`/orders/${id}`)}
                    isMobile
                  />
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Pagination Controls */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex justify-center mt-4 mb-3">
              <Button
                className="px-4 py-2 mx-2 bg-gray-500 rounded hover:dark:bg-gray-700"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                className="px-4 py-2 mx-2 bg-gray-500 rounded hover:dark:bg-gray-700"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

export default OrdersPage;
