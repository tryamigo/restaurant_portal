'use client'
import { Order } from '@/components/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useNotifications } from '@/contexts/NotificationContext';
import { format } from 'date-fns';
import { EyeIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

function OrdersPage() {

    const [orders, setOrders] = useState<Order[]>([]);
    const { data: session, status } = useSession();
    const { notifications } = useNotifications();

    useEffect(() => {
        if (status === 'authenticated') {
            fetchOrders();
        }
    }, [session, status, notifications]);
    const fetchOrders = async () => {
        try {
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
        }
    };

    const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'pending': return 'default';
            case 'preparing': return 'secondary';
            case 'on the way': return 'outline';
            case 'delivered': return 'default';
            default: return 'default';
        }
    };
    return (
        <Card className="shadow-lg">
            <CardHeader className="bg-primary text-white">
                <CardTitle className="text-2xl">Recent Orders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">No.</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.customerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">${Number(order.total).toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={getStatusColor(order.status)} className="text-xs">
                                            {order.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                        {order.date && !isNaN(new Date(order.date).getTime())
                                            ? format(new Date(order.date), 'PPp')
                                            : 'Invalid Date'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <Link href={`/orders/${order.id}`} passHref>
                                            <Button variant="ghost" size="sm">
                                                <EyeIcon className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    )
}

export default OrdersPage