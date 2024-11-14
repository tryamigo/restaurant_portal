// contexts/NotificationContext.tsx
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface OrderNotification {
  id: string;
  type: string;
  message: string;
  order: any;
  timestamp: string;
}

interface NotificationContextType {
  notifications: OrderNotification[];
  addNotification: (notification: OrderNotification) => void;
  dismissNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  dismissNotification: () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  const addNotification = (newNotification: OrderNotification) => {
    setNotifications(prev => {
      // Prevent duplicate notifications
      if (prev.some(n => n.id === newNotification.id)) {
        return prev;
      }
      return [newNotification, ...prev];
    });
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      dismissNotification 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

