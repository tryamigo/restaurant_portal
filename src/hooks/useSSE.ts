import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useSSE() {
  const [events, setEvents] = useState<any[]>([]);
  const {data:session} = useSession()
  console.log(events)
  useEffect(() => {
    // Ensure the restaurantId is passed into the URL for SSE
    const eventSource = new EventSource(`http://localhost:3001/sse/events?restaurantId=${session?.user.id}`);

    eventSource.onmessage = (event) => {
      const newEvent = JSON.parse(event.data);
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    };

    eventSource.onerror = () => {
      console.error("SSE connection error");
      eventSource.close();
    };

    // Clean up on unmount
    return () => {
      eventSource.close();
    };
  }, []);  // Re-run the effect if restaurantId changes

  return { events, setEvents };}
