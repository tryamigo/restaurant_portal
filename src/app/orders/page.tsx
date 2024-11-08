'use client'
import { Order, OrderStatus } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';
import { 
  EyeIcon, 
  MapPin, 
  Star, 
  ArrowDownUp, 
  Filter, 
  Search 
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import NotificationList from '@/components/NotificationList';
import { Skeleton } from '@/components/ui/skeleton';

function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const { data: session, status } = useSession();
    const { notifications } = useNotifications();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [session, status, notifications]);

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

    const getStatusColor = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'pending': return 'default';
            case 'preparing': return 'secondary';
            case 'on the way': return 'outline';
            case 'delivered': return 'default';
            default: return 'default';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <NotificationList/>
            
            <Card className="shadow-lg border-none">
                <CardHeader className="bg-black text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Orders Management</CardTitle>
                        <div className="flex space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input 
                                    placeholder="Search orders..." 
                                    className="pl-10 w-64 border-white focus:border-white focus:ring focus:ring-white"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select 
                                value={statusFilter} 
                                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
                            >
                                <SelectTrigger className="w-[180px] border-gray-300 focus:border-gray-500 focus:ring focus:ring-gray-200">
                                    <SelectValue placeholder="Filter by Status">
                                        {statusFilter === 'all' ? 'All Status' : statusFilter}
                                    </SelectValue>
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
                </CardHeader>
                <CardContent className="p-4">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left flex items-center">
                                        Order ID 
                                        <ArrowDownUp className="ml-2 h-4 w-4 text-gray-500" />
                                    </th>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Order Details</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Payment</th>
                                    <th className="px-4 py-3 text-left">Delivery</th>
                                    <th className="px-4 py-3 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {loading ? (
                                        Array(5).fill(0).map((_, index) => (
                                            <tr key={index}>
                                                {Array(7).fill(0).map((_, colIndex) => (
                                                    <td key={colIndex} className="px-4 py-4">
                                                        <Skeleton className="h-8 w-full" />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-8 text-gray-500">
                                                No orders found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <motion.tr 
                                                key={order.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.3 }}
                                                className="hover:bg-gray-50" >
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">{order.id.slice(0, 8)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {format(new Date(order.orderTime), 'PPp')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="font-medium">
                                                        {order.userAddress?.name || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.userAddress?.mobile || 'No contact'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger>
                                                                <div className="text-sm">
                                                                    {order.orderItems.length} items
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="p-2">
                                                                    {order.orderItems.map(item => (
                                                                        <div key={item.id} className="text-xs">
                                                                            {item.quantity}x {item.name}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                    <div className="text-xs text-gray-500">
                                                        Total: ${Number(order.total).toFixed(2)}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Badge variant={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="text-sm">
                                                        <div>Subtotal: ${Number(order.total - order.deliveryCharge + order.discount).toFixed(2)}</div>
                                                        <div className ="text-xs text-gray-500">
                                                            Delivery: ${Number(order.deliveryCharge).toFixed(2)}
                                                        </div>
                                                        {order.discount > 0 && (
                                                            <div className="text-xs text-green-500">
                                                                Discount: -${Number(order.discount).toFixed(2)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-1">
                                                        {order.takeFromStore ? (
                                                            <Badge variant="secondary">Pickup</Badge>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin className="h-4 w-4" />
                                                                <span className="text-xs">Delivery</span>
                                                            </div>
                                                        )}
                                                        {order.rating && (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-4 w-4 text-yellow-500" />
                                                                <span className="text-xs">{order.rating.toFixed(1)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <Link href={`/orders/${order.id}`} passHref>
                                                        <Button variant="ghost" size="sm">
                                                            <EyeIcon className="mr-2 h-4 w-4" />
                                                            View
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default OrdersPage;