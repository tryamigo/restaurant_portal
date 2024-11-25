import React from 'react';
import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import "@testing-library/jest-dom";

// Mock external dependencies
jest.mock('@/app/globals.css', () => ({}));
jest.mock('@/components/NotificationList', () => () => <div data-testid="notification-list"></div>);
jest.mock('@/components/ui/toaster', () => ({
  Toaster: () => <div data-testid="toaster">Mocked Toaster</div>
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

// Mock providers and hooks
jest.mock("next-auth/react", () => ({
  SessionProvider: jest.fn(({ children }) => children),
  useSession: jest.fn(() => ({
    data: {
      user: {
        name: 'Test User',
        email: 'test@example.com',
        image: '/test-avatar.png'
      }
    },
    status: 'authenticated'
  }))
}));

jest.mock("@/contexts/NotificationContext", () => ({
  NotificationProvider: jest.fn(({ children }) => children),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Home: () => <div>Home Icon</div>,
  ShoppingBag: () => <div>ShoppingBag Icon</div>,
  Tag: () => <div>Tag Icon</div>,
  LogOut: () => <div>LogOut Icon</div>,
}));

describe("RootLayout", () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Default mock for pathname
    (usePathname as jest.Mock).mockReturnValue("/");
  });

  it("renders the layout with title and navigation links", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check for title
    expect(screen.getByText("Restaurant Portal")).toBeInTheDocument();

    // Check for navigation links
    expect(screen.getByText("Menu")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Coupons")).toBeInTheDocument();
  });

  it("renders the children inside the main content area", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check if child content is rendered
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });
});