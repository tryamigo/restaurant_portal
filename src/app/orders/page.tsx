'use client'
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  EyeIcon, 
  MapPin, 
  Star, 
  Search,
  Package,
  Clock,
  TruckIcon,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useSSE } from '@/hooks/useSSE';

// Status Icons Mapping
const STATUS_ICONS = {
  pending: <Clock className="text-yellow-500 w-5 h-5" />,
  preparing: <Package className="text-blue-500 w-5 h-5" />,
  'on the way': <TruckIcon className="text-orange-500 w-5 h-5" />,
  delivered: <CheckCircle className="text-green-500 w-5 h-5" />
};

function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const { data: session, status } = useSession();
    const {events,setEvents} = useSSE()
    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [session, status,events]);

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


const getStatusColor = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
        case 'pending': return 'default';
        case 'preparing': return 'secondary';
        case 'on the way': return 'outline';
        case 'delivered': return 'default';
        default: return 'default';
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
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
        >            
            <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                <div className=" text-white p-6">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl text  font-bold">Orders Management</h1>
                        <div className="flex space-x-4">
                            <div className="relative flex-grow max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <Input 
                                    placeholder="Search orders by ID or customer name" 
                                    className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-white focus:ring focus:ring-white/30"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Select 
                                value={statusFilter} 
                                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
                            >
                                <SelectTrigger className="w-[180px] background  border-white/20 text-white">
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
                </div>
                <div className="overflow-x-auto">
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
                                            <div className="flex flex-col items-center space-y-4">
                                                <Search className="w-16 h-16 text-gray-300" />
                                                <p className="text-xl">No orders found</p>
                                            </div>
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
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium">{order.id.slice(0, 8)}</div>
                                                <div className="text-xs text-gray-500">
                                                    {format(new Date(order.orderTime), 'PPp')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium">
                                                    {order.userAddress?.name || 'N/A'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.userAddress?.mobile || 'No contact'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4">
                                                <Badge variant={getStatusColor(order.status)}>
                                                    {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
                                                    {order.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div>Subtotal: ${Number(order.total - order.deliveryCharge + order.discount).toFixed(2)}</div>
                                                    <div className="text-xs text-gray-500">
                                                        Delivery: ${Number(order.deliveryCharge).toFixed(2)}
                                                    </div>
                                                    {order.discount > 0 && (
                                                        <div className="text-xs text-green-500">
                                                            Discount: -${Number(order.discount).toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
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
                                            <td className="px-6 py-4">
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
            </div>
        </motion.div>
    );
}

export default OrdersPage;




