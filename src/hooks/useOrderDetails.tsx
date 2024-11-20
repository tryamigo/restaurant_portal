// hooks/useOrderDetails.ts
import { useState, useEffect } from 'react';
import { Order, OrderItem, OrderStatus } from '@/components/types';
import { useSession } from 'next-auth/react';

export const useOrderDetails = (id: string) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [editedOrder, setEditedOrder] = useState<Order | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { data: session, status } = useSession();

  const fetchOrderDetails = async (orderId: string) => {
    if (!session) return null;

    try {
      const response = await fetch(`/api/orders?id=${orderId}`, {
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        }
      });

      if (!response.ok) throw new Error('Failed to fetch order details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  const updateOrderStatus = async () => {
    if (!editedOrder || !session) return;

    try {
      const response = await fetch(`/api/orders?orderId=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.token}`,
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

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrderDetails(id).then(setOrder);
    }
  }, [id, session, status]);

  return {
    order,
    editedOrder,
    isEditDialogOpen,
    setEditedOrder,
    setIsEditDialogOpen,
    updateOrderStatus,
    calculateOrderTotals
  };
};