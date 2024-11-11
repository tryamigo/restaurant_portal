'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeftIcon, 
  Edit, 
  Trash2, 
} from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
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
import { Order, OrderStatus } from '@/components/types';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const OrderDetails: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
      rating: editedOrder.rating,
      feedback: editedOrder.feedback,
      userAddress: editedOrder.userAddress
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

  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders/?orderId=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to delete order');

      setIsDeleteDialogOpen(false);
      router.push('/orders');
    } catch (error) {
      console.error('Error deleting order:', error);
    }
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-black border-white hover:bg-white hover:text-black">
                    Options
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => {
                    setIsEditing(true);
                    setEditedOrder(order);
                  }}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Order
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
  
        <CardContent className="p-4">
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Order</DialogTitle>
              </DialogHeader>
              <DialogDescription>
                Are you sure you want to delete this order? This action cannot be undone.
              </DialogDescription>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDeleteOrder}>
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                              <img src={item.imageLink} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                            ) : (
                              'No Image'
                            )}
                          </td>
                          <td className="px-4 py-3">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t">
                        <td colSpan={5} className="px-4 py-3 text-right font-bold">Total:</td>
                        <td className="px-4 py-3 font-bold">${Number(order?.total).toFixed(2)}</td>
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
                className="space-y-4"
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
  
                  {!editedOrder?.takeFromStore && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editedOrder?.userAddress?.name || ''}
                          onChange={(e) => setEditedOrder(prev => ({
                            ...prev!,
                            userAddress: { ...prev!.userAddress!, name: e.target.value }
                          }))}
                        />
                      </div>
  
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          value={editedOrder?.userAddress?.address || ''}
                          onChange={(e) => setEditedOrder(prev => ({
                            ...prev!,
                            userAddress: { ...prev!.userAddress!, address: e.target.value }
                          }))}
                        />
                      </div>
  
                      <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile</Label>
                        <Input
                          id="mobile"
                          value={editedOrder?.userAddress?.mobile || ''}
                          onChange={(e) => setEditedOrder(prev => ({
                            ...prev!,
                            userAddress: { ...prev!.userAddress!, mobile: e.target.value }
                          }))}
                        />
                      </div>
  
                      <div className="space-y-2">
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                          id="latitude"
                          type="number"
                          value={editedOrder?.userAddress?.latitude || 0}
                          onChange={(e) => setEditedOrder(prev => ({
                            ...prev!,
                            userAddress: { ...prev!.userAddress!, latitude: parseFloat(e.target.value) }
                          }))}
                        />
                      </div>
  
                      <div className="space-y-2">
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                          id="longitude"
                          type="number"
                          value={editedOrder?.userAddress?.longitude || 0}
                          onChange={(e) => setEditedOrder(prev => ({
                            ...prev!,
                            userAddress: { ...prev!.userAddress!, longitude: parseFloat(e.target.value) }
                          }))}
                        />
                      </div>
                    </>
                  )}
  
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <Input
                      type="number"
                      value={editedOrder?.rating || ''}
                      onChange={(e) => setEditedOrder(prev => ({
                        ...prev!,
                        rating: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
  
                  <div className="space-y-2">
                    <Label>Feedback</Label>
                    <Input
                      value={editedOrder?.feedback || ''}
                      onChange={(e) => setEditedOrder(prev => ({
                        ...prev!,
                        feedback: e.target.value
                      }))}
                    />
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
                    <Label className="text-sm font-medium text-gray-600">Order ID</Label>
                    <Badge variant="outline" className="w-full py-1.5 text-center">
                      {order?.id}
                    </Badge>
                  </div> <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="text-sm font-medium text-gray-600">Order Date</Label>
                    <Badge variant="outline" className="w-full py-1.5 text-center">
                      {format(new Date(order?.orderTime || ''), 'PPp')}
                    </Badge>
                  </div>
  
  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <Badge 
                      variant="outline" 
                      className={`w-full py-1.5 text-center ${
                        order?.status === 'delivered' ? 'bg-green-50 text-green-700' :
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

                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <Label className="text-sm font-medium text-gray-600">Discount</Label>
                    <Badge variant="outline" className="w-full py-1.5 text-center">${order?.discount.toFixed(2)}</Badge>
                  </div>
  
                  {order?.rating && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Label className="text-sm font-medium text-gray-600">Rating</Label>
                      <Badge variant="outline" className="w-full py-1.5 text-center">{order.rating.toFixed(1)}</Badge>
                    </div>
                  )}
  
                  {order?.feedback && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <Label className="text-sm font-medium text-gray-600">Feedback</Label>
                      <Badge variant="outline" className="w-full py-1.5 text-center">{order.feedback}</Badge>
                    </div>
                  )}

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