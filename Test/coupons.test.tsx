// __tests__/CouponsPage.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CouponsPage from '@/app/coupons/page';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';
import fetchMock from 'jest-fetch-mock';

jest.mock('next-auth/react');
jest.mock('@/hooks/use-toast');
fetchMock.enableMocks();

describe('CouponsPage', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: 'test-token', id: 'user-id' } },
      status: 'authenticated',
    });
    (toast as jest.Mock).mockReturnValue(jest.fn());
  });

  test('renders loading spinner initially', async () => {
    render(<CouponsPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  test('fetches and displays coupons', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({
        coupons: [
          { id: '1', title: 'Discount 10%', couponCode: 'DISC10', description: '10% off', isActive: true },
          { id: '2', title: 'Discount 20%', couponCode: 'DISC20', description: '20% off', isActive: false },
        ],
      })
    );

    render(<CouponsPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    expect(screen.getByText('Discount 10%')).toBeInTheDocument();
    expect(screen.getByText('10% off')).toBeInTheDocument();
    expect(screen.getByText('Discount 20%')).toBeInTheDocument();
    expect(screen.getByText('20% off')).toBeInTheDocument();
  });

  test('shows add coupon form and submits a new coupon', async () => {
    render(<CouponsPage />);
    const addButton = screen.getByRole('button', { name: /Add New Coupon/i });
    fireEvent.click(addButton);

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'New Coupon' } });

    const discountValueInput = screen.getByLabelText(/Discount Value/i);
    fireEvent.change(discountValueInput, { target: { value: '15' } });

    fetchMock.mockResponseOnce(JSON.stringify({ id: '3', title: 'New Coupon' }), { status: 201 });

    const submitButton = screen.getByRole('button', { name: /Add Coupon/i });
    fireEvent.click(submitButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/restaurants/coupons',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(expect.objectContaining({ title: 'New Coupon' })),
      })
    ));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
  });

  test('searches for a coupon by code and displays result', async () => {
    fetchMock.mockResponseOnce(
      JSON.stringify({ coupon: { id: '1', title: 'Found Coupon', couponCode: 'SEARCH10', description: '10% off', isActive: true } })
    );

    render(<CouponsPage />);
    const searchInput = screen.getByPlaceholderText(/Enter coupon code to find/i);
    fireEvent.change(searchInput, { target: { value: 'SEARCH10' } });

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/restaurants/coupons?code=SEARCH10',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      })
    ));

    expect(screen.getByText('Found Coupon')).toBeInTheDocument();
    expect(screen.getByText('10% off')).toBeInTheDocument();
  });

  test('deletes a coupon', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ coupons: [{ id: '1', title: 'Coupon to Delete', couponCode: 'DELETE10', isActive: true }] }));
    fetchMock.mockResponseOnce('', { status: 200 });

    render(<CouponsPage />);
    await waitFor(() => screen.getByText('Coupon to Delete'));

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/restaurants/coupons?id=1',
      expect.objectContaining({
        method: 'DELETE',
      })
    ));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
  });

  test('updates coupon status', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ coupons: [{ id: '1', title: 'Toggle Coupon', couponCode: 'TOGGLE10', isActive: true }] }));
    fetchMock.mockResponseOnce('', { status: 200 });

    render(<CouponsPage />);
    await waitFor(() => screen.getByText('Toggle Coupon'));

    const statusButton = screen.getByRole('button', { name: /Deactivate/i });
    fireEvent.click(statusButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      '/api/restaurants/coupons?id=1',
      expect.objectContaining({
        method: 'PUT',
        body: JSON.stringify({ isActive: false }),
      })
    ));
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'Success' }));
  });
});
