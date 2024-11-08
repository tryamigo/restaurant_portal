import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderDetails from '@/app/orders/[id]/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React from 'react';

// Mock the necessary hooks and modules
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('OrderDetails Component', () => {
  let mockPush: jest.Mock;
  const mockOrder = {
    id: '1',
    customerName: 'John Doe',
    status: 'pending',
    userAddress: '123 Main St',
    userLatitude: '40.7128',
    userLongitude: '-74.0060',
    paymentMethod: 'Credit Card',
    orderItems: [
      { id: 'item1', name: 'Product 1', quantity: 2, description: 'Item 1', price: 10, discount: 0, imageLink: '' },
      { id: 'item2', name: 'Product 2', quantity: 1, description: 'Item 2', price: 20, discount: 0, imageLink: '' },
    ],
    total: 40,
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'mockToken' } },
      status: 'authenticated',
    });
    mockPush = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<OrderDetails />);
    expect(screen.getByRole('status')).toHaveClass('animate-spin');
  });

  test('fetches and displays order details', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    render(<OrderDetails />);

    await waitFor(() => expect(screen.getByText('Order Details:')).toBeInTheDocument());
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('Total: $40')).toBeInTheDocument(); // Check if total amount is rendered correctly
  });

  test('opens and closes edit dialog', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockOrder,
    });

    render(<OrderDetails />);

    await waitFor(() => screen.getByText('Options'));

    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('Edit Order'));

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  test('deletes order and navigates away', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockOrder,
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<OrderDetails />);

    await waitFor(() => screen.getByText('Options'));
    fireEvent.click(screen.getByText('Options'));
    fireEvent.click(screen.getByText('Delete Order'));

    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/orders'));
  });

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: false,
      });

    console.error = jest.fn(); // Suppress error logging for cleaner test output

    render(<OrderDetails />);

    await waitFor(() => expect(screen.queryByText('Order Details:')).not.toBeInTheDocument());
    expect(console.error).toHaveBeenCalledWith(expect.any(String));
  });
});
