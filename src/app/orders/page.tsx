// app/orders/page.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useSSE } from '@/hooks/useSSE';
import Header from '@/components/Header';
import OrderRow from '@/components/OrderRow';
import { useRouter } from 'next/navigation';
import { ListOrdered } from 'lucide-react';

// Main OrdersPage component
function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const { data: session, status } = useSession();
    const { events } = useSSE();
    const router = useRouter()
    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [session, status, events]);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/orders', {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };
    const filterOrders = () => {
        let filtered = orders;

        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.userAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

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
                className="container mx-auto px-4 py-12 md:py-12 pt-[11rem]"
            >
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    {[
                                        "Order ID",
                                        "Customer",
                                        "Order Details",
                                        "Status",
                                        "Payment",
                                        "Delivery",
                                        "Actions"
                                    ].map((header) => (
                                        <th
                                            key={header}
                                            className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {loading ? (
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                {Array(7).fill(0).map((_, colIndex) => (
                                                    <td key={colIndex} className="px-6 py-4">
                                                        <Skeleton className="h-8 w-full" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-gray-500">
                                            <div className="flex flex-col items-center justify-center space-y-4 h-full">
                                                <ListOrdered className="w-16 h-16 text-gray-300" />
                                                <div className="flex flex-col items-center space-y-4">
                                                    <p className="text-xl">No orders found</p>
                                                </div>
                                            </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <OrderRow key={order.id} order={order} onView={(id) => router.push(`/orders/${id}`)} />
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
                                Array(5).fill(0).map((_, index) => (
                                    <div key={index} className="p-4 border-b">
                                        <Skeleton className="h-32 w-full" />
                                    </div>
                                ))
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <div className="flex flex-col items-center space-y-4">
                                        <p className="text-xl">No orders found</p>
                                    </div>
                                </div>
                            ) : (
                                filteredOrders.map((order) => (
                                    <OrderRow key={order.id} order={order} onView={(id) => router.push(`/orders/${id}`)} isMobile />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </>
    );
}

export default OrdersPage;
