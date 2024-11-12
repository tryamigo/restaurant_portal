import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import OTPLogin from '@/app/sign-in/page';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('/'),
  }),
}));

// Mock components and icons
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
  ShieldCheck: () => <div>ShieldCheck</div>,
  AlertCircle: () => <div>AlertCircle</div>,
}));

describe('OTPLogin', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Setup default mocks
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "unauthenticated",
    });

    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  const renderComponent = () => {
    return render(<OTPLogin />);
  };

  it('renders the initial login form', () => {
    renderComponent();

    // Check for mobile input
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    expect(mobileInput).toBeInTheDocument();

    // Check for Send OTP button
    const sendOtpButton = screen.getByText('Send OTP');
    expect(sendOtpButton).toBeInTheDocument();
  });

  it('validates mobile number before sending OTP', async () => {
    renderComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByText('Send OTP');

    // Invalid mobile number
    fireEvent.change(mobileInput, { target: { value: '1234' } });
    fireEvent.click(sendOtpButton);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit mobile number')).toBeInTheDocument();
    });
  });

  it('sends OTP successfully', async () => {
    // Mock successful OTP request
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByText('Send OTP');

    // Enter valid mobile number
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    // Wait for OTP inputs to appear
    await waitFor(() => {
      expect(screen.getByText('Enter 6-digit OTP')).toBeInTheDocument();
    });
  });

  it('handles login error', async () => {
    // Mock OTP send
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'OTP sent successfully' }),
    });

    // Mock login error
    (signIn as jest.Mock).mockResolvedValueOnce({
      ok: false,
      error: 'Invalid OTP',
    });

    renderComponent();

    // Send OTP
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(screen.getByText('Send OTP'));

    // Wait for OTP inputs
    await waitFor(() => {
      expect(screen.getByText('Enter 6-digit OTP')).toBeInTheDocument();
    });

    // Enter OTP
    const otpInputs = screen.getAllByRole('textbox');
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: String(index + 1) } });
    });

    // Click Login
    fireEvent.click(screen.getByText('Login'));

    // Verify error is displayed
    await waitFor(() => {
      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
    });
  });

  it('handles network error when sending OTP', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByText('Send OTP');

    // Enter valid mobile number
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    // Verify error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  it('redirects to callback URL when authenticated', async () => {
    // Mock authenticated session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { name: 'Test User' } },
      status: 'authenticated',
    });

    renderComponent();

    // Verify router.push was called
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });
});
