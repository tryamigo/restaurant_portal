import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { signIn, signIn as originalSignIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import OTPLoginContent from '@/app/sign-in/page'; // Adjust the path as necessary

// Mock dependencies
jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    ...originalModule,
    signIn: jest.fn(originalSignIn),
    useSession: jest.fn(),
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue('/'),
  }),
}));

// Mock components and icons
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ ...props }: any) => <input {...props} />,
}));

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader">Loading...</div>,
  ShieldCheck: () => <div>ShieldCheck</div>,
  AlertCircle: () => <div>AlertCircle</div>,
}));

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  return {
    ...originalModule,
    signIn: jest.fn(),
    useSession: jest.fn(),
  };
});

beforeAll(() => {
  global.fetch = jest.fn();
});


describe('OTPLoginContent Component', () => {
  let mockRouter: any;

  beforeEach(() => {
    jest.clearAllMocks(); // Reset all mocks before each test

    // Mock session and router
    mockRouter = {
      push: jest.fn(),
    };
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  const renderComponent = () => render(<OTPLoginContent />);

  it('renders the initial login form', () => {
    renderComponent();

    // Check for mobile input field
    expect(screen.getByPlaceholderText('Enter 10-digit mobile number')).toBeInTheDocument();

    // Check for Send OTP button
    expect(screen.getByText('Send OTP')).toBeInTheDocument();
  });

  it('shows error message for invalid mobile number', async () => {
    renderComponent();

    // Enter an invalid mobile number and attempt to send OTP
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '1234' } });
    fireEvent.click(screen.getByText('Send OTP'));

    // Check for validation error message
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid 10-digit mobile number')).toBeInTheDocument();
    });
  });

  it('sends OTP successfully for valid mobile number', async () => {
    // Mock successful OTP request response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'OTP sent successfully' }),
    });

    renderComponent();

    // Enter valid mobile number and send OTP
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '+919205062357' } });
    fireEvent.click(screen.getByText('Send OTP'));

    // Wait for OTP input prompt to appear
    await waitFor(() => {
      expect(screen.getByText('Enter 6-digit OTP')).toBeInTheDocument();
    });
  });

  it('handles network error during OTP request', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    renderComponent();

    // Enter valid mobile number and send OTP
    fireEvent.change(screen.getByPlaceholderText('Enter 10-digit mobile number'), { target: { value: '+919876543210' } });
    fireEvent.click(screen.getByText('Send OTP'));

    // Check for network error message
    await waitFor(() => {
      expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument();
    });
  });

  test('Multiple OTP Requests for the Same Number', async () => {
    // Mock API response for OTP request
    const mockResponse = { message: 'OTP sent successfully' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    render(<OTPLoginContent />);

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    // Wait for OTP request to be processed
    await waitFor(() => expect(screen.getByText('Sending...')).toBeInTheDocument());
    
    // Click again to request OTP
    fireEvent.click(sendOtpButton);
    
    // Verify that only the latest OTP is valid (Mocking rate-limiting)
    await waitFor(() => expect(screen.queryByText('Sending...')).toBeNull());
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('Invalid Mobile Number Format', async () => {
    render(<OTPLoginContent />);

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    fireEvent.change(mobileInput, { target: { value: '987654' } }); // Invalid mobile number
    fireEvent.click(sendOtpButton);

    const errorMessage = await screen.findByText('Please enter a valid 10-digit mobile number');
    expect(errorMessage).toBeInTheDocument();
  });

  test('Unregistered Mobile Number', async () => {
    // Mock API response for unregistered mobile number
    const mockResponse = { error: 'Mobile number not registered' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue(mockResponse),
    });

    render(<OTPLoginContent />);

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    const errorMessage = await screen.findByText('Mobile number not registered');
    expect(errorMessage).toBeInTheDocument();
  });

  test('Successful OTP Login', async () => {
    // Mock successful OTP login
    const mockSignInResponse = { ok: true };
    (signIn as jest.Mock).mockResolvedValue(mockSignInResponse);

    render(<OTPLoginContent />);

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });

    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    // Wait for OTP input to appear
    await waitFor(() => screen.getByText('Enter 6-digit OTP'));

    // Mock OTP entry
    const otpInputs = screen.getAllByRole('textbox');
    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    fireEvent.change(otpInputs[1], { target: { value: '2' } });
    fireEvent.change(otpInputs[2], { target: { value: '3' } });
    fireEvent.change(otpInputs[3], { target: { value: '4' } });
    fireEvent.change(otpInputs[4], { target: { value: '5' } });
    fireEvent.change(otpInputs[5], { target: { value: '6' } });

    const loginButton = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(loginButton);

await waitFor(() => {
  expect(signIn).toHaveBeenCalledWith(
    'credentials',
    expect.objectContaining({
      mobile: '+919876543210',
      otp: '123456',
    })
  );
});

  });

  test("displays an error for invalid OTP", async () => {
    // Set up the mock for an invalid OTP response
    (signIn as jest.Mock).mockResolvedValueOnce({ error: "Invalid OTP" });
  
    renderComponent();
  
    // Enter a valid mobile number and request OTP
    fireEvent.change(screen.getByPlaceholderText("Enter 10-digit mobile number"), {
      target: { value: "+919876543210" },
    });
    fireEvent.click(screen.getByText("Send OTP"));
  
    // Wait for OTP input to appear
    await waitFor(() => screen.getByText('Enter 6-digit OTP'));
  
    // Select OTP input fields (change the selector to better match your implementation)
    const otpInputs = screen.getAllByRole("input"); // Assuming each OTP input field has role="input"
    
    // Enter invalid OTP (simulating user input in each of the OTP fields)
    otpInputs.forEach((input, index) => {
      fireEvent.change(input, { target: { value: (index + 1).toString() } });
    });
  
    // Submit OTP
    fireEvent.click(screen.getByText('Login'));
  
    // Verify that an error message appears
    await waitFor(() => {
      expect(screen.getByText("Invalid OTP")).toBeInTheDocument();
    });
  });

  test('Successful OTP Authentication and Access Token Retrieval', async () => {
    // Step 1: Mock the OTP request response
    const mockOtpResponse = { message: 'OTP sent successfully' };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockOtpResponse),
    });
  
    // Step 2: Mock the successful signIn response (authentication)
    const mockSignInResponse = { ok: true, accessToken: 'sampleAccessToken123' };
    (signIn as jest.Mock).mockResolvedValueOnce(mockSignInResponse);
  
    // Step 3: Render the OTPLoginContent component
    render(<OTPLoginContent />);
  
    // Step 4: Enter a valid mobile number and click "Send OTP"
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
  
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);
  
    // Step 5: Verify that the OTP request is being processed
    await waitFor(() => expect(screen.getByText('Sending...')).toBeInTheDocument());
  
    // Step 6: Wait for OTP input fields to appear
    await waitFor(() => screen.getByText('Enter 6-digit OTP'));
  
    // Step 7: Enter the OTP in the input fields
    const otpInputs = screen.getAllByRole('textbox');
    fireEvent.change(otpInputs[0], { target: { value: '1' } });
    fireEvent.change(otpInputs[1], { target: { value: '2' } });
    fireEvent.change(otpInputs[2], { target: { value: '3' } });
    fireEvent.change(otpInputs[3], { target: { value: '4' } });
    fireEvent.change(otpInputs[4], { target: { value: '5' } });
    fireEvent.change(otpInputs[5], { target: { value: '6' } });
  
    // Step 8: Click the "Login" button to authenticate
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
  
    // Step 9: Verify that signIn is called with the correct mobile number and OTP
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          mobile: '+919876543210',  // Correct mobile number
          otp: '123456',           // Correct OTP entered
        })
      );
    });
  
    // Step 10: Verify that the authentication was successful and access token was retrieved
    await waitFor(() => {
      expect(mockSignInResponse.accessToken).toBe('sampleAccessToken123');
    });
  });

  test('Multiple Attempts with Wrong OTP', async () => {
    // Mock signIn to simulate failed OTP attempts
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'Invalid OTP' }).mockResolvedValueOnce({ error: 'Invalid OTP' }).mockResolvedValueOnce({ error: 'Invalid OTP' });
  
    renderComponent();
  
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
    
    // Enter valid mobile number and request OTP
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);
    
    await waitFor(() => screen.getByText('Enter 6-digit OTP'));
    
    const otpInputs = screen.getAllByRole('textbox');
    fireEvent.change(otpInputs[0], { target: { value: '111111' } });
    fireEvent.click(screen.getByText('Login'));
  
    // First invalid attempt
    await waitFor(() => expect(screen.getByText('Invalid OTP')).toBeInTheDocument());
  
    // Second invalid attempt
    fireEvent.change(otpInputs[0], { target: { value: '222222' } });
    fireEvent.click(screen.getByText('Login'));
  
    await waitFor(() => expect(screen.getByText('Invalid OTP')).toBeInTheDocument());
  
    // Third invalid attempt
    fireEvent.change(otpInputs[0], { target: { value: '333333' } });
    fireEvent.click(screen.getByText('Login'));
  
    await waitFor(() => expect(screen.getByText('Invalid OTP')).toBeInTheDocument());
  
    // After 3 attempts, the user should be locked
    await waitFor(() => {
      expect(screen.getByText('Maximum attempts reached. Please request a new OTP.')).toBeInTheDocument();
    });
  });

  test('Simultaneous OTP Requests from Multiple Devices', async () => {
    // Mock multiple OTP requests with only the latest being valid
    const mockOtpResponse = { message: 'OTP sent successfully' };
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: jest.fn().mockResolvedValue(mockOtpResponse) });
    
    render(<OTPLoginContent />);
  
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
  
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);
  
    // First OTP request
    await waitFor(() => screen.getByText('Sending...'));
    
    // Second OTP request from another device (mocked)
    fireEvent.click(sendOtpButton);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  
    // Verify only the latest OTP request is valid
    await waitFor(() => expect(screen.queryByText('Sending...')).toBeNull());
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText('Enter 6-digit OTP')).toBeInTheDocument();
  });

  test('Use of Same OTP After Successful Login', async () => {
    // Mock successful OTP login
    const mockSignInResponse = { ok: true };
    (signIn as jest.Mock).mockResolvedValueOnce(mockSignInResponse);
    
    renderComponent();
  
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /Send OTP/i });
  
    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);
  
    await waitFor(() => screen.getByText('Enter 6-digit OTP'));
  
    const otpInputs = screen.getAllByRole('textbox');
    fireEvent.change(otpInputs[0], { target: { value: '123456' } });
    fireEvent.change(otpInputs[1], { target: { value: '123456' } });
    fireEvent.change(otpInputs[2], { target: { value: '123456' } });
    fireEvent.change(otpInputs[3], { target: { value: '123456' } });
    fireEvent.change(otpInputs[4], { target: { value: '123456' } });
    fireEvent.change(otpInputs[5], { target: { value: '123456' } });
  
    fireEvent.click(screen.getByText('Login'));
  
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        'credentials',
        expect.objectContaining({
          mobile: '+919876543210',
          otp: '123456',
        })
      );
    });
  
    // Now trying to reuse the same OTP
    (signIn as jest.Mock).mockResolvedValueOnce({ error: 'OTP already used. Please request a new OTP.' });
    
    // Entering previously used OTP
    fireEvent.change(otpInputs[0], { target: { value: '123456' } });
    fireEvent.change(otpInputs[1], { target: { value: '123456' } });
    fireEvent.change(otpInputs[2], { target: { value: '123456' } });
    fireEvent.change(otpInputs[3], { target: { value: '123456' } });
    fireEvent.change(otpInputs[4], { target: { value: '123456' } });
    fireEvent.change(otpInputs[5], { target: { value: '123456' } });
  
    fireEvent.click(screen.getByText('Login'));
  
    await waitFor(() => {
      expect(screen.getByText('OTP already used. Please request a new OTP.')).toBeInTheDocument();
    });
  });

  });

  //Duplicate OTP Entry
  test('should ignore further OTP entries once the first is submitted', async () => {
    const validOtp = '123456';
    render(<OTPLoginContent />);
    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const sendOtpButton = screen.getByRole('button', { name: /send otp/i });

    fireEvent.change(mobileInput, { target: { value: '+919876543210' } });
    fireEvent.click(sendOtpButton);

    await waitFor(() => expect(screen.getByText(/sending.../i)).toBeInTheDocument());

    const otpInput = screen.getByLabelText(/enter 6-digit otp/i);
    fireEvent.change(otpInput, { target: { value: validOtp } });

    // Simulate submitting the OTP
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => expect(screen.getByText(/logging in.../i)).toBeInTheDocument());

    // Simulate entering the same OTP again
    fireEvent.change(otpInput, { target: { value: validOtp } });

    // Verify the OTP submission only happens once
    expect(signIn).toHaveBeenCalledTimes(1);
  });
