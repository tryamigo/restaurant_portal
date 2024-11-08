import { render, screen } from "@testing-library/react";
import RootLayout from "@/app/layout";
import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { Toaster } from "@/components/ui/toaster";
import { usePathname } from "next/navigation";
import "@testing-library/jest-dom";
import React from "react";

// Mock usePathname to test dynamic behavior
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("RootLayout", () => {
  beforeEach(() => {
    // Mock pathname as root by default for tests
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
    expect(screen.getByText("Restaurant Details")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
    expect(screen.getByText("Coupons")).toBeInTheDocument();
  });

  it("applies 'default' variant for active link and 'ghost' for inactive links", () => {
    // Set pathname to `/orders` to simulate active state
    (usePathname as jest.Mock).mockReturnValue("/orders");

    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Active link should have `default` variant
    const activeButton = screen.getByText("Orders");
    expect(activeButton.className).toContain("default");

    // Inactive links should have `ghost` variant
    const inactiveButton = screen.getByText("Restaurant Details");
    expect(inactiveButton.className).toContain("ghost");
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

  it("wraps layout with required providers", () => {
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );

    // Check if Toaster is in the document
    expect(screen.getByTestId("toaster")).toBeInTheDocument();

    // Check for providers in the layout
    expect(SessionProvider).toBeDefined();
    expect(NotificationProvider).toBeDefined();
  });
});
