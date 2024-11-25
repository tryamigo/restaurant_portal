// __tests__/CouponsPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponsPage from '@/app/coupons/page';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import { useRouter, usePathname } from 'next/navigation';
import fetchMock from 'jest-fetch-mock';



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

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
  toast: jest.fn(),
}));

// Mock Next.js router
jest.mock('next/navigation', () => {
  const originalModule = jest.requireActual('next/navigation');
  return {
    ...originalModule,
    useRouter: jest.fn(),
    usePathname: jest.fn(),
  };
});


jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },

}));


beforeAll(() => {
  fetchMock.enableMocks();
});

afterEach(() => {
  fetchMock.resetMocks();
});

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
    // Mock the API response
    fetchMock.mockResponseOnce(
      JSON.stringify({
        coupons: [
          { 
            id: '1', 
            title: 'Discount 10%', 
            couponCode: 'DISC10', 
            description: '10% off', 
            startDate: '2024-11-19T00:00:00Z', // valid date string
            endDate: '2024-12-19T00:00:00Z',   // valid date string
            isActive: true 
          },
          { 
            id: '2', 
            title: 'Discount 20%', 
            couponCode: 'DISC20', 
            description: '20% off', 
            startDate: '2024-11-19T00:00:00Z', // valid date string
            endDate: '2024-12-19T00:00:00Z',   // valid date string
            isActive: false 
          },
        ],
      })
    );
  
    // Mock useRouter to return a mock router object
    (useRouter as jest.Mock).mockReturnValue({
      pathname: '/coupons', // Provide a mocked pathname if needed
      query: {}, // Mock any query parameters if used
      push: jest.fn(), // Mock the push function if navigation is used
    });
  
    // Mock usePathname to return a mocked pathname
    (usePathname as jest.Mock).mockReturnValue('/coupons');
  
    render(<CouponsPage />);
  
    // Wait for the coupons to be displayed after fetching data
    await waitFor(() => {
      // Check if the coupon data is rendered correctly
      expect(screen.getByText('Discount 10%')).toBeInTheDocument();
      expect(screen.getByText('10% off')).toBeInTheDocument();
      expect(screen.getByText('Discount 20%')).toBeInTheDocument();
      expect(screen.getByText('20% off')).toBeInTheDocument();
    });

  });

  test('shows add coupon form and submits a new coupon', async () => {
    // Mock initial fetch to simulate empty coupons list
    fetchMock.mockResponseOnce(JSON.stringify({ coupons: [] }));
  
    // Mock coupon creation response with a successful 201 status
    fetchMock.mockResponseOnce(
      JSON.stringify({
        id: "1",
        title: "New Coupon",
        description: "10% off",
        discountType: "PERCENTAGE",
        discountValue: "10",
        minOrderValue: "10",
        maxDiscount: "10",
        couponCode: "NEW10",
        usageLimit: 10,
        eligibleOrders: 10,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      }),
      { status: 201 }
    );
  
    // Render the CouponsPage with mocked session context if necessary
    const { container } = render(<CouponsPage />);
  
    // Wait for initial render and simulate clicking the "Add Coupon" button
    await waitFor(() => {
      const addButton = container.querySelector('.text');
      if (addButton) {
        fireEvent.click(addButton);
      }
    });
  
    // Fill out the form fields
    await waitFor(() => {
      const titleInput = container.querySelector('input[id="title"]');
      if (titleInput) {
        fireEvent.change(titleInput, { target: { value: 'New Coupon' } });
      }
  
      const descriptionInput = container.querySelector('input[id="description"]');
      if (descriptionInput) {
        fireEvent.change(descriptionInput, { target: { value: '10% off' } });
      }
  
      const discountTypeInput = container.querySelector('input[id="discountType"]');
      if (discountTypeInput) {
        fireEvent.change(discountTypeInput, { target: { value: 'PERCENTAGE' } });
      }
  
      const discountValueInput = container.querySelector('input[id="discountValue"]');
      if (discountValueInput) {
        fireEvent.change(discountValueInput, { target: { value: '10' } });
      }
  
      const minOrderValueInput = container.querySelector('input[id="minOrderValue"]');
      if (minOrderValueInput) {
        fireEvent.change(minOrderValueInput, { target: { value: '10' } });
      }
  
      const maxDiscountInput = container.querySelector('input[id="maxDiscount"]');
      if (maxDiscountInput) {
        fireEvent.change(maxDiscountInput, { target: { value: '10' } });
      }
  
      const couponCodeInput = container.querySelector('input[id="couponCode"]');
      if (couponCodeInput) {
        fireEvent.change(couponCodeInput, { target: { value: 'NEW10' } });
      }
  
      const usageLimitInput = container.querySelector('input[id="usageLimit"]');
      if (usageLimitInput) {
        fireEvent.change(usageLimitInput, { target: { value: '10' } });
      }
  
      const eligibleOrdersInput = container.querySelector('input[id="eligibleOrders"]');
      if (eligibleOrdersInput) {
        fireEvent.change(eligibleOrdersInput, { target: { value: '10' } });
      }
  
      const startDateInput = container.querySelector('input[id="startDate"]');
      if (startDateInput) {
        fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      }
  
      const endDateInput = container.querySelector('input[id="endDate"]');
      if (endDateInput) {
        fireEvent.change(endDateInput, { target: { value: '2024-12-31' } });
      }
    });
  
    // Submit the form
    const submitButton = container.querySelector('button[type="submit"]');
    if (submitButton) {
      fireEvent.click(submitButton);
    }
  
    // Wait for the fetch call and verify that it's called with the correct parameters
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/restaurants/coupons',
          {headers: expect.objectContaining({
            Authorization: 'Bearer test-token', // Adjust based on your session handling
        })}
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
  
    const { container } = render(<CouponsPage />);
  
    // Verify initial render
    await waitFor(() => {
      const searchInput = container.querySelector('input[id="search"]');
      expect(searchInput).toBeInTheDocument();
      if(searchInput){
      fireEvent.change(searchInput, { target: { value: 'SEARCH10' } }); // Simulate input
      }
    });
  
    // Verify updated render
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('SEARCH10'))).toBeInTheDocument();
    });
  });
  
  
});