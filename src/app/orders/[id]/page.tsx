'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftIcon,
  Edit,
  Trash2,
  DollarSign,
  ReceiptText,
  CreditCard,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderItem, OrderStatus } from '@/components/types';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const OrderDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const { data: session, status } = useSession()

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders?id=${id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch order details');
      const data = await response.json();
      return data;
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

    const updateData = {
      status: editedOrder.status,
    };

    try {
      const response = await fetch(`/api/orders?orderId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) throw new Error('Failed to update order');

      const updatedOrder = await fetchOrderDetails(id);
      setOrder(updatedOrder);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };
  console.log(order)

  const calculateTotalBeforeDiscount = (items: OrderItem[]) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (!order) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-6 max-w-4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </motion.div>
  );

  const totalBeforeDiscount = order?.orderItems ? calculateTotalBeforeDiscount(order.orderItems) : 0;
  const discountAmount = order?.discount || 0;
  const payableAmount = totalBeforeDiscount - discountAmount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto "
    >
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-black text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Order Details</CardTitle>
            <div className="flex space-x-4">
              <Link href="/orders" passHref>
                <Button variant="outline" size="sm" className="text-black border-white hover:bg-white hover:text-black">
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back to Orders
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className='flex flex-row justify-between'>
            <div className="bg-white p-4 rounded-lg ">
              <Label className="text-sm font-medium text-gray-600">Order ID</Label>
              <div className="font-bold w-full py-1.5 text-center">
                {order?.id}
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg mr-10">
              <Label className="text-sm font-medium text-gray-600">Order Date</Label>
              <div className="w-full py-1.5 text-center font-bold">
                {format(new Date(order?.orderTime || ''), 'PPp')}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Quantity</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Description</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Price</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Image</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order?.orderItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3">${(typeof item.price === 'number' ? item.price : 0).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {item.imageLink ? (
                        <Image
                          src={item.imageLink || ''}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td className="px-4 py-3">${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-left">
                    <div className="flex flex-col space-y-2 bg-white shadow-sm rounded-lg p-4 border border-gray-100 w-full">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-600 font-bold">Subtotal:</span>
                        </div>
                        <span className="font-semibold text-gray-800 mr-11">${totalBeforeDiscount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Tag className="h-5 w-5 text-gray-500" />
                          <span className="text-gray-600 font-bold">Discount:</span>
                        </div>
                        <span className="font-semibold text-red-600 mr-12">-${discountAmount.toFixed(2)}</span>
                      </div>

                      <hr className="border-dashed border-gray-200 my-2" />

                      <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-6 w-6 text-green-600" />
                          <span className="text-lg font-bold text-green-800">Total Payable:</span>
                        </div>
                        <span className="text-lg font-bold text-green-700 mr-6">${payableAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

         <AnimatePresence mode="wait">
  {isEditing ? (
    <motion.div
      key="edit-form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4 m-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
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
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Label className="text-sm font-medium text-gray-600">Delivery Type</Label>
          <Badge variant={order?.takeFromStore ? "secondary" : "default"} className="w-full py-1.5 text-center">
            {order?.takeFromStore ? "Pickup" : "Delivery"}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleEditOrder}>Save Changes</Button>
        <Button
          variant="outline"
          onClick={() => {
            setIsEditing(false);
            setEditedOrder(null);
          }}
        >
          Cancel
        </Button>
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="order-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium text-gray-600">Status</Label>
            <button 
              onClick={() => {
                setIsEditing(true);
                setEditedOrder(order);
              }}
              className="text-black hover:text-gray-700 font-semibold text-sm transition duration-200"
            >
              Edit
            </button>
          </div>
          <Badge
            variant="outline"
            className={`w-full py-1.5 text-center ${order?.status === 'delivered' ? 'bg-green-50 text-green-700' :
              order?.status === 'preparing' ? 'bg-blue-50 text-blue-700' :
              order?.status === 'on the way' ? 'bg-yellow-50 text-yellow-700' :
              'bg-gray-50 text-gray-700'
            }`}
          >
            {order?.status}
          </Badge>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <Label className="text-sm font-medium text-gray-600">Delivery Type</Label>
          <Badge variant={order?.takeFromStore ? "secondary" : "default"} className="w-full py-1.5 text-center">
            {order?.takeFromStore ? "Pickup" : "Delivery"}
          </Badge>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OrderDetails;