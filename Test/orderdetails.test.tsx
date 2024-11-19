import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import OrderDetails from '@/app/orders/[id]/page';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
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

// Mock dropdown and dialog components
jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <button>{children}</button>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogDescription: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

describe('OrderDetails', () => {
  const mockOrder = {
    id: 'order123',
    orderTime: '2023-06-15T10:30:00Z',
    status: 'pending',
    total: 50.00,
    deliveryCharge: 5.00,
    discount: 2.00,
    takeFromStore: false,
    rating: 4.5,
    feedback: 'Great service!',
    userAddress: {
      name: 'John Doe',
      mobile: '1234567890',
      address: '123 Test St',
      latitude: 40.7128,
      longitude: -74.0060,
    },
    restaurantAddress: {
      name: 'Test Restaurant',
      address: '456 Restaurant St',
      mobile: '0987654321',
      latitude: 40.7129,
      longitude: -74.0061,
    },
    orderItems: [
      {
        id: 'item1',
        name: 'Pizza',
        quantity: 2,
        description: 'Cheese Pizza',
        price: 10.00,
        imageLink: 'https://example.com/pizza.jpg',
      },
    ],
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default mocks
    (useParams as jest.Mock).mockReturnValue({ id: 'order123' });
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'test-token' } },
      status: 'authenticated',
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrder),
    });
  });

  it('renders loading skeletons initially', async () => {
    render(<OrderDetails />);

    // Check for skeleton loading state
    const skeletons = await screen.findAllByTestId('skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders order details after successful fetch', async () => {
    render(<OrderDetails />);

    // Wait for order details to be rendered
    await waitFor(() => {
      expect(screen.getByText('order123')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });


  it('opens delete confirmation dialog', async () => {
    render(<OrderDetails />);

    // Wait for order details to be rendered
    await waitFor(() => {
      expect(screen.getByText('order123')).toBeInTheDocument();
    });

    // Find and click Options button
    const optionsButton = screen.getByText('Options');
    fireEvent.click(optionsButton);

    // Find and click Delete Order item
    const deleteItems = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteItems[0]);

    // Check if delete confirmation dialog is visible
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });



  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    // Spy on console.error to prevent error logging in test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<OrderDetails />);

    // Wait for potential error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching order details:', expect.any(Error));
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });
});