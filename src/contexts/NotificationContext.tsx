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

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const dismissedNotifications = useRef<Set<string>>(new Set());
  const { data: session } = useSession();
  const { toast } = useToast();
  const lastCheckedRef = useRef<string>(new Date().toISOString());

  // Load notifications and dismissed notifications from localStorage on the client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedNotifications = localStorage.getItem('activeNotifications');
      setNotifications(storedNotifications ? JSON.parse(storedNotifications) : []);

      const storedDismissed = localStorage.getItem('dismissedNotifications');
      dismissedNotifications.current = new Set(storedDismissed ? JSON.parse(storedDismissed) : []);
    }
  }, []);

  // Update localStorage whenever notifications change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeNotifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  const dismissNotification = (id: string) => {
    dismissedNotifications.current.add(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'dismissedNotifications',
        JSON.stringify(Array.from(dismissedNotifications.current))
      );
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = (order: any) => {
    if (dismissedNotifications.current.has(order.id) || notifications.some(n => n.id === order.id)) {
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

    toast({
      title: "New Order Received!",
      description: newNotification.message,
      duration: 5000,
    });

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

        lastCheckedRef.current = new Date().toISOString();
      }
    } catch (error) {
      console.error('Error checking for new orders:', error);
    }
  };

  useEffect(() => {
    if (!session?.user?.id) return;

     checkNewOrders();

    const interval = setInterval(checkNewOrders, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  return (
    <NotificationContext.Provider value={{ notifications, dismissNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
