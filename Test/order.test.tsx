import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import OrdersPage from '@/app/orders/page';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock components
jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
    <div data-variant={variant}>{children}</div>
  ),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="skeleton">Loading</div>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('OrdersPage', () => {
  const mockOrders = [
    {
      id: 'order1',
      orderTime: '2023-06-15T10:30:00Z',
      userAddress: { name: 'John Doe', mobile: '1234567890' },
      orderItems: [
        { id: 'item1', name: 'Pizza', quantity: 2 },
        { id: 'item2', name: 'Burger', quantity: 1 },
      ],
      status: 'pending',
      total: 50,
      deliveryCharge: 5,
      discount: 0,
      takeFromStore: false,
      rating: 4.5,
    },
    {
      id: 'order2',
      orderTime: '2023-06-16T11:45:00Z',
      userAddress: { name: 'Jane Smith', mobile: '0987654321' },
      orderItems: [
        { id: 'item3', name: 'Salad', quantity: 1 },
      ],
      status: 'delivered',
      total: 30,
      deliveryCharge: 3,
      discount: 2,
      takeFromStore: true,
      rating: null,
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default session mock
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'test-token' } },
      status: 'authenticated',
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
  });

  it('renders loading skeletons when fetching orders', async () => {
    render(<OrdersPage />);

    // Check for skeleton loading state
    const skeletons = await screen.findAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders orders after successful fetch', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('filters orders by search term', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Search for John
    const searchInput = screen.getByPlaceholderText('Search orders...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    // Check filtered results
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('filters orders by status', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open status filter dropdown
    const statusTrigger = screen.getByText('All Status');
    fireEvent.click(statusTrigger);

    // Select 'pending' status
    const pendingOption = screen.getByText('Pending');
    fireEvent.click(pendingOption);

    // Check filtered results
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  it('displays "No orders found" when no orders match filter', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Search for a term that won't match
    const searchInput = screen.getByPlaceholderText('Search orders...');
    fireEvent.change(searchInput, { target: { value: 'NonExistentOrder' } });

    // Check for "No orders found" message
    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    // Spy on console.error to prevent error logging in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<OrdersPage />);

    // Wait for potential error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching orders:', expect.any(Error));
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it('navigates to order details when view button is clicked', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click view button for first order
    const viewButtons = screen.getAllByText('View');
    expect(viewButtons.length).toBeGreaterThan(0);

    const firstViewButton = viewButtons[0];
    fireEvent.click(firstViewButton);

    // Check link href
    const link = firstViewButton.closest('a');
    expect(link).toHaveAttribute('href', '/orders/order1');
  });
});