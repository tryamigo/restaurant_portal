'use client';
import React, { useState, useEffect } from 'react';
import { Order, Restaurant } from '@/components/types';
import { AddressFields } from '@/components/AddressFields';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EyeIcon, BellIcon } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationList from '@/components/NotificationList';

const RestaurantDetails: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const { notifications } = useNotifications();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRestaurantDetails();
      fetchOrders();
    }
  }, [session, status, notifications]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/restaurants?id=${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      setRestaurant(data);
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError('Failed to load restaurant details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p>No restaurant details found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
       <NotificationList />
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-white">
          <CardTitle className="text-2xl">Restaurant Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <AddressFields
                address={restaurant.address}
                isEditing={false}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
              <p className="text-gray-700">Phone: {restaurant.phoneNumber}</p>
              <p className="text-gray-700">Opening Hours: {restaurant.openingHours}</p>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default RestaurantDetails;