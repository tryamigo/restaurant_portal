import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RestaurantDetails from '@/app/restaurants/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

// Mock the necessary hooks and modules
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    pathname: '/restaurants',
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/restaurants'),
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
  // Mimic the behavior of EventSource instance
  this.addEventListener = jest.fn();
  this.close = jest.fn();
  Object.defineProperty(this, 'readyState', { value: EventSource.OPEN, writable: false });  // Default to OPEN state
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

describe('RestaurantDetails Component', () => {
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

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockRestaurantData = {
    id: '1',
    name: 'Test Restaurant',
    phoneNumber: '1234567890',
    openingHours: '10:00 - 22:00',
    gstin: 'GSTIN123',
    FSSAI: 'FSSAI456',
    address: {
      streetAddress: '123 Street',
      city: 'City',
      state: 'State',
      pincode: '12345',
      landmark: 'Near Park',
    },
  };

  test('fetches and displays restaurant details', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData,
      });

    renderWithThemeProvider(<RestaurantDetails />);

    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 - 22:00/i)).toBeInTheDocument();
      expect(screen.getByText(/GSTIN123/i)).toBeInTheDocument();
      expect(screen.getByText(/FSSAI456/i)).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Failed to fetch restaurant' }),
      });

    renderWithThemeProvider(<RestaurantDetails />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load restaurant details/i)).toBeInTheDocument();
    });
  });

  test('edit button toggles form for editing restaurant details and saves changes', async () => {
    // Mock fetch to return restaurant data
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ...mockRestaurantData,
          name: 'adarsh',
        }),
      });

    renderWithThemeProvider(<RestaurantDetails />);

    // Wait for initial details to load
    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
    });

    // Click the edit button to show the form
    const editButton = screen.getByRole('button', { name: /edit restaurant/i });
    fireEvent.click(editButton);

    // Verify form elements are displayed with initial values
    expect(screen.getByLabelText(/name/i)).toHaveValue('Test Restaurant');

    // Simulate input change
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'adarsh' } });

    // Simulate clicking the save changes button
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    // Verify that the updated name appears after saving
    await waitFor(() => {
      expect(screen.getByText(/adarsh/i)).toBeInTheDocument();
    });
  });
  

  test('cancel button stops editing and reverts changes', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData,
      });

    renderWithThemeProvider(<RestaurantDetails />);

    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
    });

    // Click edit button to show form
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    // Modify field value
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Restaurant' } });

    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Verify that the changes have been reverted
    expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
  });
});
