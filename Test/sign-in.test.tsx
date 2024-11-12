// Test/sign-in.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import { signIn, useSession } from "next-auth/react"; // We'll mock this as well
import OTPLogin from "../src/app/restaurants/page"; // Adjust import according to your path
import React from 'react';


// Mock the necessary functions
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  useSession: jest.fn(), // Mock useSession hook
}));

global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: jest.fn().mockResolvedValue({ message: "OTP sent successfully" }),
});

describe("OTPLogin", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Provide mock implementation of useSession
    // Mock session data and status (mock user not logged in for example)
    (useSession as jest.Mock).mockReturnValue({
      data: null, // No user logged in
      status: "unauthenticated",
    });
  });

  it("should render OTP login form", () => {
    render(<OTPLogin />);

    // Check if the OTP input fields are present
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OTP/i)).toBeInTheDocument();
  });

  it("should send OTP and show OTP input", async () => {
    render(<OTPLogin />);

    // Find and interact with the phone number input
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneNumberInput, { target: { value: "1234567890" } });

    // Wait for the OTP ;

    // Find and click the 'Send OTP' button
    const sendOtpButton = screen.getByText(/Send OTP/i);
    fireEvent.click(sendOtpButton);

    // Now simulate entering OTP and logging in
    const otpInput = screen.getByLabelText(/OTP/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });

    const submitButton = screen.getByText(/Submit/i);
    fireEvent.click(submitButton);

    // Ensure the signIn function was called
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(screen.getByLabelText(/OTP/i)).toBeInTheDocument();
    });
  });

  it("should handle OTP login", async () => {
    render(<OTPLogin />);

    // Find and interact with the phone number input
    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneNumberInput, { target: { value: "1234567890" } })
      expect(signIn).toHaveBeenCalledWith("credentials", {
        username: "1234567890",
        password: "123456",
      });
    });
  });

  it("should display error if OTP request fails", async () => {
    // Mock a failed fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: jest.fn().mockResolvedValue({ message: "OTP request failed" }),
    });

    render(<OTPLogin />);

    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneNumberInput, { target: { value: "1234567890" } });

    const sendOtpButton = screen.getByText(/Send OTP/i);
    fireEvent.click(sendOtpButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/OTP request failed/i)).toBeInTheDocument();
    });
  });

  it("should handle unexpected errors gracefully", async () => {
    // Mock an unexpected error scenario (e.g., network issue)
    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Network Error"));

    render(<OTPLogin />);

    const phoneNumberInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneNumberInput, { target: { value: "1234567890" } });

    const sendOtpButton = screen.getByText(/Send OTP/i);
    fireEvent.click(sendOtpButton);

    // Check if the error message for network issue is shown
    await waitFor(() => {
      expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
    });
  });
