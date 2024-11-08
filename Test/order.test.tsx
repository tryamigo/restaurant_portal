import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrdersPage from '@/app/orders/page';  // Adjust the path as needed
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/NotificationContext';
import '@testing-library/jest-dom';

jest.mock('next-auth/react');
jest.mock('@/contexts/NotificationContext', () => ({
  useNotifications: jest.fn(),
}));

// Mock data
const mockOrders = [
  {
    id: '1',
    customerName: 'John Doe',
    total: 20.99,
    status: 'pending',
    date: '2024-11-01T10:00:00Z',
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    total: 35.50,
    status: 'delivered',
    date: '2024-11-02T12:30:00Z',
  },
];

describe('OrdersPage', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mock-token' } },
      status: 'authenticated',
    });

    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockOrders),
      })
    ) as jest.Mock;
  });

  it('renders the orders table correctly', async () => {
    render(<OrdersPage />);

    // Wait for fetch to resolve and orders to be rendered
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Use waitFor on all assertions to ensure data is loaded
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('$20.99')).toBeInTheDocument();
      expect(screen.getByText('$35.50')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('delivered')).toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Failed to fetch orders'))) as jest.Mock;

    render(<OrdersPage />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Ensure no data is displayed when fetch fails
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});
