'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Label } from "@/components/ui/label";
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Order, OrderItem, OrderStatus } from '@/components/types';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import Header from '@/components/Header';
import { CustomButton } from '@/components/CustomButton';

const StatusIcon = {
  pending: <Clock className="text-yellow-500" />,
  preparing: <Package className="text-blue-500" />,
  'on the way': <Truck className="text-orange-500" />,
  delivered: <CheckCircle2 className="text-green-500" />
};

const OrderDetails: React.FC = () => {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: session, status } = useSession();

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrderDetails(id).then(setOrder);
    }
  }, [id, session, status]);

  const handleEditOrder = async () => {
    if (!editedOrder) return;

    try {
      const response = await fetch(`/api/orders?orderId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({ status: editedOrder.status }),
      });

      if (!response.ok) throw new Error('Failed to update order');

      const updatedOrder = await fetchOrderDetails(id);
      setOrder(updatedOrder);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const calculateOrderTotals = (items: OrderItem[]) => {
    const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const discount = order?.discount || 0;
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  if (!order) return (
    <div className="container mx-auto max-w-4xl p-4 md:p-6 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="h-24 md:h-32 w-full" />
        ))}
      </div>
    </div>
  );

  const { subtotal, discount, total } = calculateOrderTotals(order.orderItems);

  return (
    <>
     <Header/>
   
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-6xl px-4 pt-24 md:py-5 pb-6 "
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className='mb-4 md:mb-0'>
          <h1 className="text-2xl md:text-3xl font-bold">Order #{order.id}</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Placed on {format(new Date(order.orderTime), 'MMMM dd, yyyy at hh:mm a')}
          </p>
        </div>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <Link href="/orders" className="w-full md:w-auto">
            <CustomButton className="w-full">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to Orders
            </CustomButton>
          </Link>
          <CustomButton 
            onClick={() => setIsEditDialogOpen(true)}
            className="w-full md:w-auto"
          >
            Update Status
          </CustomButton>
        </div>
      </div>

      {/* Order Status */}
      <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            {StatusIcon[order.status as keyof typeof StatusIcon]}
            <div>
              <h2 className="text-lg md:text-xl font-semibold capitalize">{order.status}</h2>
              <p className="text-xs md:text-sm text-gray-500">Current order status</p>
            </div>
          </div>
          <div className='flex items-center'>
            <Badge
              variant="outline"
              className={`
                capitalize text-xs md:text-sm
                ${order.status === 'Delivered' ? 'text-green-600 border-green-600' :
                  order.status === 'Preparing' ? 'text-blue-600 border-blue-600' :
                    order.status === 'On the way' ? 'text-orange-600 border-orange-600' :
                      'text-gray-600 border-gray-600'
                }`}
            >
              {order.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Order Items - Mobile Responsive Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 border-b">
              {order.orderItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap flex items-center space-x-4">
                    {item.imageLink && (
                      <Image
                        src={item.imageLink}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="rounded-md object-cover"
                      />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{item.price ? Number(item.price).toFixed(2) : 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-bold">Subtotal:</td>
                <td className="px-6 py-3 text-right">₹{subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-bold text-green-600">Discount:</td>
                <td className="px-6 py-3 text-right text-green-600">-₹{discount.toFixed(2)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-3 text-right font-bold">Total Payable:</td>
                <td className="px-6 py-3 text-right font-bold">₹{total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b p-4">
              <div className="flex items-center space-x-4">
                {item.imageLink && (
                  <Image
                    src={item.imageLink}
                    alt={item.name}
                    width={48}
                    height={48}
                    className="rounded-md object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span>{item.quantity}</span>
                <span>₹{item.price ? Number(item.price).toFixed(2) : 'N/A'}</span>
                <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
          <div className="flex justify-between font-bold p-4">
            <span>Subtotal:</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-green-600 p-4">
            <span>Discount:</span>
            <span>-₹{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold p-4">
            <span>Total Payable:</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text'>Edit Order Status</DialogTitle>
            <DialogDescription>
              Update the status of this order.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Order Status</Label>
            <Select
              value={editedOrder?.status}
              onValueChange={(value: OrderStatus) =>
                setEditedOrder(prev => ({ ...prev!, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="on the way">On the way</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </DialogClose>
            <CustomButton
              onClick={handleEditOrder}>Save Changes</CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
    </>
  );
};

export default OrderDetails;