// // hooks/useSocketNotifications.ts
// 'use client';
// import { useEffect } from 'react';
// import io from 'socket.io-client';
// import { useSession } from 'next-auth/react';
// import { useToast } from '@/hooks/use-toast';
// import { useNotifications } from '@/contexts/NotificationContext';

// export const useSocketNotifications = () => {
//   const { data: session } = useSession();
//   const { toast } = useToast();
//   const { addNotification } = useNotifications(); // Use the addNotification method from context

//   useEffect(() => {
//     // Only proceed if user is authenticated
//     if (!session?.user?.id) return;

//     // Connect to Socket Server
//     const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || 'http://localhost:3001');

//     // Authenticate with user ID
//     socket.emit('authenticate', session.user.id);

//     // Listen for new orders
//     socket.on('newOrder', (order) => {
//       // Create notification
//       const newNotification = {
//         id: order.id,
//         type: 'NEW_ORDER',
//         message: `New order #${order.id} from ${order.userAddress?.name}`,
//         order: order,
//         timestamp: new Date().toISOString(),
//       };

//       // Add to notifications context
//       addNotification(newNotification);

//       // Show toast notification
//       toast({
//         title: "New Order Received!",
//         description: newNotification.message,
//         duration: 5000,
//       });

//       // Play notification sound
//       try {
//         const audio = new Audio('/sounds/notification-sound.mp3');
//         audio.play();
//       } catch (error) {
//         console.error('Error playing notification sound:', error);
//       }
//     });

//     // Cleanup on component unmount
//     return () => {
//       socket.disconnect();
//     };
//   }, [session?.user?.id, addNotification, toast]);
// };