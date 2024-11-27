import React from 'react';
import { render, screen, waitFor, fireEvent, within} from '@testing-library/react';
import OrdersPage from '@/app/orders/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock the necessary hooks and modules
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/orders',
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/orders'),
}));

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-spinner">Loading</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the EventSource constructor and static properties
global.EventSource = jest.fn().mockImplementation(function (this: EventSource, url: string | URL, eventSourceInitDict?: EventSourceInit) {
  this.addEventListener = jest.fn();
  this.close = jest.fn();
  Object.defineProperty(this, 'readyState', { value: EventSource.OPEN, writable: false });
}) as unknown as {
  new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
  prototype: EventSource;
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSED: 2;
};

// Define the static properties on the mock
(global.EventSource as any).CONNECTING = 0;
(global.EventSource as any).OPEN = 1;
(global.EventSource as any).CLOSED = 2;

const renderWithThemeProvider = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('OrdersPage Component', () => {
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', token: 'mock-token' },
      },
      status: 'authenticated',
    });

    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockOrders = [
    {
      id: 'order-1234',
      orderTime: '2024-11-25T12:00:00Z',
      userAddress: {
        name: 'John Doe',
        mobile: '+1234567890',
      },
      orderItems: [
        {
          id: 'item-101',
          name: 'Burger',
          quantity: 2,
          price: 10.99,
        },
        {
          id: 'item-102',
          name: 'Fries',
          quantity: 1,
          price: 4.99,
        },
        {
          id: 'item-103',
          name: 'Soda',
          quantity: 1,
          price: 2.99,
        },
      ],
      total: 45.99,
      status: 'pending',
      deliveryCharge: 5.99,
      discount: 10,
      takeFromStore: false,
      rating: 4.5,
      feedback: 'Great service and food, will order again!',
      restaurantAddress: {
        street: '456 Foodie Lane',
        city: 'New York',
        postalCode: '10002',
        country: 'USA',
      },
    },
  ];

  it('renders loading skeletons when fetching orders', async () => {
    renderWithThemeProvider(<OrdersPage />);

    // Check for skeleton loading state
    const skeletons = await screen.findAllByTestId('loading-spinner');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders orders after successful fetch', async () => {
    renderWithThemeProvider(<OrdersPage />);

    // Wait for the API call to resolve and elements to render
    await waitFor(() => {
      const orderId = screen.getByTestId('orderId');
      expect(orderId).toHaveTextContent('order-1234'.slice(0, 8));
    });
  });

  it('filters orders by search term', async () => {
    renderWithThemeProvider(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByTestId('orderId')).toBeInTheDocument();
    });

    // Search for 'John'
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    fireEvent.change(searchInput, { target: { value: 'order-1234'.slice(0, 8) } });

    // Check filtered results
    await waitFor(() => {
      expect(screen.getByTestId('orderId')).toHaveTextContent('order-1234'.slice(0, 8));
      expect(screen.queryByText('order-5678')).toBeNull();
    });
  });

  it('filters orders by status', async () => {
    renderWithThemeProvider(<OrdersPage />);

    // Open status filter dropdown
    const statusTrigger = screen.getByRole('combobox');
    fireEvent.click(statusTrigger);

    // Select 'pendings' status
    const option = screen.getByRole('option', { name: /pending/i });
    fireEvent.click(option);

    await waitFor(() => {
      expect(screen.getByTestId('orderId')).toHaveTextContent('order-1234'.slice(0, 8));
    });
  });

  it('displays "No orders found" when no orders match filter', async () => {
    renderWithThemeProvider(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByTestId('orderId')).toHaveTextContent('order-1234'.slice(0, 8));
    });

    // Open status filter dropdown
    const statusTrigger = screen.getByRole('combobox');
    fireEvent.click(statusTrigger);

    // Select 'delivered' status
    const option = screen.getByRole('option', { name: /delivered/i});
    fireEvent.click(option);

    await waitFor(() => {

      const cell = screen.getByRole('cell', {
        name: /no orders found/i
      });

      expect(within(cell).getByText(/no orders found/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error gracefully', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithThemeProvider(<OrdersPage />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error fetching orders:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });

  it('navigates to order details when view button is clicked', async () => {
    renderWithThemeProvider(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByTestId('orderId')).toHaveTextContent('order-1234'.slice(0, 8));
    });

    const viewButton = screen.getByTestId('view');
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/orders/order-1234');
    });
  });
});
