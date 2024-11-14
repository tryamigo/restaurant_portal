// components/Notifications.tsx
import { useSSE } from '../hooks/useSSE';

export default function Notifications() {
  const events = useSSE();

  return (
    <div>
      <h2>Notifications</h2>
      <ul>
        {events.map((event, index) => (
          <li key={index}>
            {event.type === 'NEW_ORDER' && (
              <div>
                <p>New order received!</p>
                <p>Order ID: {event.order.id}</p>
                <p>Restaurant ID: {event.order.restaurantId}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
