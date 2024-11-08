import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RestaurantDetails from '@/app/restaurants/page'; 
import { useSession } from 'next-auth/react';
import '@testing-library/jest-dom';

// Mock `useSession` hook
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('RestaurantDetails Component', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { id: '1', token: 'mock-token' },
      },
      status: 'authenticated',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    render(<RestaurantDetails />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('fetches and displays restaurant details', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Test Restaurant',
        phoneNumber: '1234567890',
        openingHours: '10:00 - 22:00',
        address: { streetAddress: '123 Street', city: 'City', state: 'State', pincode: '12345' },
      }),
    });

    render(<RestaurantDetails />);

    await waitFor(() => {
      expect(screen.getByText(/test restaurant/i)).toBeInTheDocument();
      expect(screen.getByText(/1234567890/i)).toBeInTheDocument();
      expect(screen.getByText(/10:00 - 22:00/i)).toBeInTheDocument();
    });
  });

  test('displays error message on fetch failure', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Failed to fetch' }),
    });

    render(<RestaurantDetails />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load restaurant details/i)).toBeInTheDocument();
    });
  });

  test('opens edit dialog and updates restaurant', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Test Restaurant',
          phoneNumber: '1234567890',
          openingHours: '10:00 - 22:00',
          address: { streetAddress: '123 Street', city: 'City', state: 'State', pincode: '12345' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<RestaurantDetails />);

    // Open edit dialog
    fireEvent.click(screen.getByText(/edit restaurant/i));

    // Edit fields
    const nameInput = screen.getByLabelText(/name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Restaurant' } });

    fireEvent.click(screen.getByText(/save changes/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/restaurants/?id=1',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });
  });

  test('adds a new menu item', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Test Restaurant',
          phoneNumber: '1234567890',
          openingHours: '10:00 - 22:00',
          address: { streetAddress: '123 Street', city: 'City', state: 'State', pincode: '12345' },
        }),
      })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ name: 'New Item', price: 20 }) });

    render(<RestaurantDetails />);

    fireEvent.change(screen.getByLabelText(/item name/i), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByLabelText(/price/i), { target: { value: 20 } });

    fireEvent.click(screen.getByText(/add item/i));

    await waitFor(() => {
      expect(screen.getByText(/new item/i)).toBeInTheDocument();
    });
  });

  test('deletes a menu item', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Test Restaurant',
          phoneNumber: '1234567890',
          openingHours: '10:00 - 22:00',
          address: { streetAddress: '123 Street', city: 'City', state: 'State', pincode: '12345' },
        }),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<RestaurantDetails />);

    fireEvent.click(screen.getByText(/delete/i));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/restaurants/?id=1&menu=true&menuItemId=1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });
});
