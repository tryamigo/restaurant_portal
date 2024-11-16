import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useSSE() {
  const [events, setEvents] = useState<any[]>([]);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only establish SSE connection if user is authenticated
    if (status === 'authenticated' && session?.user?.id) {
      const eventSource = new EventSource(
        `http://localhost:3001/sse/events?restaurantId=${session.user.id}`
      );

      eventSource.onmessage = (event) => {
        const newEvent = JSON.parse(event.data);
        setEvents((prevEvents) => [...prevEvents, newEvent]);
      };

      eventSource.onerror = () => {
        console.error("SSE connection error");
        eventSource.close();
      };

      // Clean up on unmount or when session changes
      return () => {
        eventSource.close();
      };
    }
  }, [session, status]); // Re-run when session or authentication status changes

  return { events, setEvents };
}