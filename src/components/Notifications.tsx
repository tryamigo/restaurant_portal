// components/Notifications.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSSE } from '../hooks/useSSE';
import { ShoppingBag, Check, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from 'next/link';

interface NotificationItem {
  id: string;
  type: string;
  order: {
    id: string;
    userId: string;
    restaurantId: string;
    status: string;
    total: number;
    deliveryCharge: number;
    discount: number;
    orderTime: string;
    userAddress: {
      name: string;
      mobile: string;
      address: string;
    };
    restaurantAddress: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
    items?: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  };
  timestamp: Date;
  read: boolean;
}

export default function Notifications() {
    const { events, setEvents } = useSSE();
 
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const savedNotifications = localStorage.getItem('notifications');
      return savedNotifications ? JSON.parse(savedNotifications) : [];
    } catch (error) {
      console.error("Error parsing saved notifications:", error);
      return [];
    } 
  });
  const [isOpen, setIsOpen] = useState(false);

  const playNotificationSound = useCallback(() => {
    if (typeof window !== 'undefined' && window.Audio) {
      try {
        const audio = new Audio('/sounds/notification-sound.mp3');
        audio.play().catch(error => {
          console.error("Error playing notification sound:", error);
        });
      } catch (error) {
        console.error("Error creating audio element:", error);
      }
    }
  }, []);

  // Update localStorage whenever notifications change
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('notifications', JSON.stringify(notifications));
      } catch (error) {
        console.error("Error saving notifications to localStorage:", error);
      }
    }
  }, [notifications]);

  // Process new events and add to notifications
  useEffect(() => {
    if (events && events.length > 0) {
      const newNotifications: NotificationItem[] = events.map(event => ({
        ...event,
        id: event.order.id, // Use order ID as unique identifier
        read: false,
        timestamp: new Date()
      }));

      // Filter out duplicates
      const uniqueNewNotifications = newNotifications.filter(
        newNotif => !notifications.some(existingNotif => 
          existingNotif.id === newNotif.id && 
          existingNotif.type === newNotif.type
        )
      );

      // Add new notifications to the existing list
      if (uniqueNewNotifications.length > 0) {
        playNotificationSound();

        setNotifications(prev => [
          ...uniqueNewNotifications,
          ...prev
        ]);
      }
    }
  }, [events]); // Remove notifications dependency to avoid stale closure

  // Memoized unread notifications count
  const unreadCount = useMemo(() => {
    return notifications.filter(notif => !notif.read).length;
  }, [notifications]);

  // Handle individual notification click
  const handleNotificationClick = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true } 
          : notif
      )
    );
    setIsOpen(false);
  };

 // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setIsOpen(false);
  };

  // Remove a specific notification
  const removeNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
     setEvents((prev)=>prev.filter(pre => pre.order.id !==notificationId))
  };

  // Remove all read notifications
  const clearReadNotifications = () => {
    setNotifications(prev => 
      prev.filter(notif => !notif.read)
    );
    setEvents([]);
  };

  const renderNotificationItem = (notification: NotificationItem) => {
    return (
      <div 
        key={notification.id} 
        className={`
          border-b last:border-b-0  
          ${!notification.read ? 'bg-blue-50' : 'bg-white'}
          hover:bg-gray-100 
          transition duration-200
        `}
      >
        <Link 
          href={`/orders/${notification.order.id}`} 
          className="block p-2"
          onClick={() => handleNotificationClick(notification.id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-grow">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">
                  Order #{notification.order.id}
                </span>
                <Badge 
                  variant={notification.order.status === 'pending' ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {notification.order.status}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Total: ${notification.order.total.toFixed(2)}
                <span className="ml-2">
                  {new Date(notification.order.orderTime).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center ml-2">
              {!notification.read && (
                <span className="h-2 w-2 bg-blue-500 rounded-full mr-2" />
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={(e) => {
                  e.preventDefault();
                  removeNotification(notification.id);
                }}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
        <Button variant="ghost" size="icon" className="relative" onClick={() => setIsOpen(!isOpen)}>
          <ShoppingBag className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 mr-2">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <h4 className="text-sm font-medium mr-2">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} New
              </Badge> )}
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4 mr-1" /> Mark all read
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearReadNotifications}
              disabled={notifications.filter(n => n.read).length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Clear read
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-2 space-y-2">
            {notifications.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">
                No new notifications
              </div>
            ) : (
              notifications.map(renderNotificationItem)
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}