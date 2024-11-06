// contexts/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface OrderNotification {
  id: string;
  type: string;
  message: string;
  order: any;
  timestamp: string;
}

interface NotificationContextType {
  notifications: OrderNotification[];
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  dismissNotification: () => {},
});

// Track dismissed notifications
const getDismissedNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem('dismissedNotifications');
  return new Set(stored ? JSON.parse(stored) : []);
};

// Store active notifications
const getStoredNotifications = (): OrderNotification[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('activeNotifications');
  return stored ? JSON.parse(stored) : [];
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>(getStoredNotifications());
  const dismissedNotifications = useRef<Set<string>>(getDismissedNotifications());
  const { data: session } = useSession();
  const { toast } = useToast();
  const lastCheckedRef = useRef<string>(new Date().toISOString());

  // Update localStorage whenever notifications change
  useEffect(() => {
    localStorage.setItem('activeNotifications', JSON.stringify(notifications));
  }, [notifications]);

  const dismissNotification = (id: string) => {
    dismissedNotifications.current.add(id);
    localStorage.setItem('dismissedNotifications', 
      JSON.stringify([...Array.from(dismissedNotifications.current)])
    );
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (order: any) => {
    // Skip if notification was previously dismissed
    if (dismissedNotifications.current.has(order.id)) {
      return;
    }

    // Skip if notification already exists
    if (notifications.some(n => n.id === order.id)) {
      return;
    }

    const newNotification: OrderNotification = {
      id: order.id,
      type: 'NEW_ORDER',
      message: `New order #${order.id} from ${order.userAddress?.name}`,
      order: order,
      timestamp: new Date().toISOString(),
    };

    setNotifications(prev => [...prev, newNotification]);

    // Show toast notification
    toast({
      title: "New Order Received!",
      description: newNotification.message,
      duration: 5000,
    });

    // Play sound
    const audio = new Audio('/sounds/notification-sound.mp3');
    audio.play().catch(console.error);
  };

  const checkNewOrders = async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch(
        `/api/orders/restaurant/${session.user.id}/new?lastChecked=${lastCheckedRef.current}`,
        {
          headers: {
            'Authorization': `Bearer ${session.user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newOrders = await response.json();

      if (newOrders && newOrders.length > 0) {
        newOrders.forEach((order: any) => {
          addNotification(order);
        });

        // Update last checked time
        lastCheckedRef.current = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

    // Initial check for new orders
    checkNewOrders();

    // Set up polling interval
    const interval = setInterval(checkNewOrders, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
    };
  }, [session?.user?.id]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      dismissNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);