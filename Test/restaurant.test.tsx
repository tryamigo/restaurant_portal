import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RestaurantDetails from '@/app/restaurants/page'; 
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';

// Mock the necessary hooks and modules
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useParams: jest.fn(() => ({ id: '1' })),
}));

// Mock any external components or libraries that might cause rendering issues
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: () => <div data-testid="loading-spinner">Loading</div>
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  },
  AnimatePresence: ({ children }: any) => children
}));

describe('RestaurantDetails Component', () => {
  let mockRouter: { push: jest.Mock };

  beforeEach(() => {
    // Setup session mock
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', token: 'mock-token' },
      },
      status: 'authenticated',
    });

    // Setup router mock
    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Reset fetch mock
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
    rating: 4.5,
    address: { 
      streetAddress: '123 Street', 
      city: 'City', 
      state: 'State', 
      pincode: '12345',
      landmark: 'Near Park',
      latitude: '12.345',
      longitude: '78.910'
    },
    menu: [
      { 
        id: 'item1', 
        name: 'Burger', 
        description: 'Tasty burger', 
        price: 10, 
        ratings: 4.2, 
        discounts: 5,
        imageLink: 'http://example.com/burger.jpg' 
      },
      { 
        id: 'item2', 
        name: 'Pizza', 
        description: 'Delicious pizza', 
        price: 15, 
        ratings: 4.5, 
        discounts: 10,
        imageLink: 'http://example.com/pizza.jpg' 
      }
    ]
  };


  test('fetches and displays restaurant details', async () => {
    // Mock successful fetch for restaurant details
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData,
      })
      // Mock menu fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData.menu,
      });

    render(<RestaurantDetails />);

    // Wait for restaurant details to load
    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 - 22:00/i)).toBeInTheDocument();
      expect(screen.getByText(/GSTIN123/i)).toBeInTheDocument();
      expect(screen.getByText(/FSSAI456/i)).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    // Mock failed fetch
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Failed to fetch restaurant' }),
      });

    render(<RestaurantDetails />);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load restaurant details/i)).toBeInTheDocument();
    });
  });


  test('adds a new menu item', async () => {
    // Mock fetch for initial data and menu item addition
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockRestaurantData.menu,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'new-item',
          name: 'New Menu Item',
          price: 20,
          description: 'New item description',
        }),
      });

    render(<RestaurantDetails />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
    });

    // Fill in new item details
    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'New Menu Item' } });
    fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'New item description' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: '20' } });

    // Submit new item
    fireEvent.click(screen.getByText(/add item/i));

    // Verify item addition
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/restaurants'),
        expect.objectContaining({
          method: 'POST', headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer mock-token'),
          }),
        })
      );
    });
  });

});