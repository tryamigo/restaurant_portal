
'use client'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftIcon, Edit, Trash2, X, Plus } from 'lucide-react';
import Link from 'next/link';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from 'next/navigation';
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

    try {

      const statusChanged = editedOrder.status !== order?.status;
      const addressChanged =
        editedOrder.userAddress !== order?.userAddress ||
        editedOrder.userLatitude !== order?.userLatitude ||
        editedOrder.userLongitude !== order?.userLongitude;

      if (statusChanged) {
        const statusResponse = await fetch(`/api/orders?orderId=${id}&updateType=status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({ status: editedOrder.status }),
        });

        if (!statusResponse.ok) throw new Error('Failed to update order status');
      }

      if (addressChanged) {
        const addressResponse = await fetch(`/api/orders?orderId=${id}&updateType=address`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({
            userAddress: editedOrder.userAddress,
            userLatitude: editedOrder.userLatitude,
            userLongitude: editedOrder.userLongitude,
          }),
        });

        if (!addressResponse.ok) throw new Error('Failed to update order address');
      }

      const updatedOrder = await fetchOrderDetails(id);
      setOrder(updatedOrder);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };
  console.log('orders are',order);
  const handleDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${id}`, {
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
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl bg-white shadow rounded-lg space-y-6">
    <div className="flex flex-row justify-between items-center pb-4 border-b">
      <Link href="/" passHref>
          <Button variant="outline">
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Options</Button>
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

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={editedOrder?.customerName || ''}
                disabled // Disable customer name editing
                className="bg-gray-100" // Add visual indication that it's disabled
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
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
            <div className="space-y-2">
              <Label>User Address</Label>
              <Input
                value={editedOrder?.userAddress || ''}
                onChange={(e) => setEditedOrder(prev => ({ ...prev!, userAddress: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                value={editedOrder?.userLatitude || ''}
                onChange={(e) => setEditedOrder(prev => ({ ...prev!, userLatitude: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                value={editedOrder?.userLongitude || ''}
                onChange={(e) => setEditedOrder(prev => ({ ...prev!, userLongitude: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Input
                value={editedOrder?.paymentMethod || ''}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Order Items</h3>
            </div>

            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-left">Quantity</th>
                  <th className="text-left">Description</th>
                  <th className="text-left">Price</th>
                  <th className="text-left">Discount</th>
                  <th className="text-left">Image</th>
                  <th className="text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {editedOrder?.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Input
                        value={item.name || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={item.quantity || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>
                      <Input
                        value={item.description || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={item.price || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>
                      <Input
                        type="number"
                        value={item.discount || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>
                      <Input
                        value={item.imageLink || ''}
                        disabled
                        className="bg-gray-100"
                      />
                    </td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right font-bold">Total:</td>
                  <td className="font-bold">
                    ${Number(editedOrder?.total).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleEditOrder}>Save Changes</Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditedOrder(null);
            }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 ">
          <h2 className="text-3xl font-bold mb-4 ">Order Details:</h2>
          < div className="grid grid-cols-1 md:grid-cols-2 ">
            <div className="space-y-2">
              <Label>Customer Name:</Label>
              <Badge variant="outline">{order?.customerName}</Badge>
            </div>
            <div className="space-y-2">
              <Label>Status:</Label>
              <Badge variant="outline">{order?.status}</Badge>
            </div>

            <div className="space-y-2">
              <Label>Payment Method:</Label>
              <Badge variant="outline">{order?.paymentMethod}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <Label>User Address:</Label>
            <Badge variant="outline">{order?.userAddress}</Badge>
          </div>
          <div className="space-y-2">
            <Label>Latitude:</Label>
            <Badge variant="outline">{order?.userLatitude}</Badge>
          </div>
          <div className="space-y-2">
            <Label>Longitude:</Label>
            <Badge variant="outline">{order?.userLongitude}</Badge>
          </div>
          <div className="space-y-4 bg-white p-4 rounded shadow mt-6">
            <h3 className="font-medium">Order Items:</h3>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-left">Quantity</th>
                  <th className="text-left">Description</th>
                  <th className="text-left">Price</th>
                  <th className="text-left">Discount</th>
                  <th className="text-left">Image</th>
                  <th className="text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order?.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.description}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>{item.discount ? `${item.discount}%` : 'N/A'}</td>
                    <td>
                      {item.imageLink ? (
                        <img src={item.imageLink} alt={item.name} className="w-16 h-16 object-cover" />
                      ) : (
                        'No Image'
                      )}
                    </td>
                    <td>${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={6} className="text-right font-bold">Total:</td>
                  <td className="font-bold">${Number(order?.total).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

          </div>
         
        </div>
        
      )}
    </div>
  );
};

export default OrderDetails;