// __tests__/CouponsPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponsPage from '@/app/coupons/page';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import fetchMock from 'jest-fetch-mock';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));
jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
}));

fetchMock.enableMocks();

describe('CouponsPage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { 
        user: { 
          token: 'test-token', 
          id: 'user-id' 
        } 
      },
      status: 'authenticated',
    });
    (toast as jest.Mock).mockReturnValue(jest.fn());
  });

  test('renders loading spinner initially', async () => {
    render(<CouponsPage />);
    
    // Look for the loading element with a more specific selector
    const loadingElement = screen.getByTestId('loading-spinner');
    expect(loadingElement).toBeInTheDocument();
  });

  test('fetches and displays coupons', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        coupons: [
          { 
            id: '1', 
            title: 'Discount 10%', 
            couponCode: 'DISC10', 
            description: '10% off', 
            isActive: true 
          },
          { 
            id: '2', 
            title: 'Discount 20%', 
            couponCode: 'DISC20', 
            description: '20% off', 
            isActive: false 
          },
        ],
      })
    );

    render(<CouponsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Discount 10%')).toBeInTheDocument();
      expect(screen.getByText('10% off')).toBeInTheDocument();
      expect(screen.getByText('Discount 20%')).toBeInTheDocument();
      expect(screen.getByText('20% off')).toBeInTheDocument();
    });
  });

  test('shows add coupon form and submits a new coupon', async () => {
    // Mock initial fetch
    fetchMock.mockResponseOnce(JSON.stringify({ coupons: [] }));
    
    // Mock coupon creation response
    fetchMock.mockResponseOnce(
      JSON.stringify({ 
        id: '3', 
        title: 'New Coupon', 
        couponCode: 'NEW10' 
      }), 
      { status: 201 }
    );

    render(<CouponsPage />);

    // Wait for initial render
    await waitFor(() => {
      const addButton = screen.getByText(/Add New Coupon/i);
      fireEvent.click(addButton);
    });

    // Fill out the form
    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Coupon' } });

    const discountValueInput = screen.getByLabelText(/Discount Value/i);
    fireEvent.change(discountValueInput, { target: { value: '15' } });

    const couponCodeInput = screen.getByLabelText(/Coupon Code/i);
    fireEvent.change(couponCodeInput, { target: { value: 'NEW10' } });

    const startDateInput = screen.getByLabelText(/Start Date/i);
    fireEvent.change(startDateInput, { target: { value: '2023-01-01' } });

    const endDateInput = screen.getByLabelText(/End Date/i);
    fireEvent.change(endDateInput, { target: { value: '2023-12-31' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Add Coupon/i });
    fireEvent.click(submitButton);

    // Wait for API call and verify
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/restaurants/coupons',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('New Coupon'),
        })
      );
    });
  });

  test('searches for a coupon by code and displays result', async () => {
    // Mock initial fetch
    fetchMock.mockResponseOnce(JSON.stringify({ coupons: [] }));
    
    // Mock search response
    fetchMock.mockResponseOnce(
      JSON.stringify({ 
        coupon: { 
          id: '1', 
          title: 'Found Coupon', 
          couponCode: 'SEARCH10', 
          description: '10% off', 
          isActive: true 
        } 
      })
    );

    render(<CouponsPage />);

    // Wait for initial render
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/Search coupons/i);
      fireEvent.change(searchInput, { target: { value: 'SEARCH10' } });
    });

    // Wait for search results
    await waitFor(() => {
      expect(screen.getByText('SEARCH10')).toBeInTheDocument();
    });
  });
});