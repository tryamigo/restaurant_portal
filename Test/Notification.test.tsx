import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { useSession } from "next-auth/react";
import "@testing-library/jest-dom";

// Mock next-auth session
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock useToast hook
const mockToast = jest.fn();
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock fetch
global.fetch = jest.fn();

// Custom hook wrapper for testing context values
const renderWithNotificationProvider = (ui: React.ReactElement) => {
  return render(<NotificationProvider>{ui}</NotificationProvider>);
};

// Mocked NotificationConsumer component to access context
const NotificationConsumer = () => {
  const { notifications, dismissNotification } = useNotifications();
  return (
    <div>
      {notifications.map((notification) => (
        <div key={notification.id} data-testid="notification">
          {notification.message}
          <button onClick={() => dismissNotification(notification.id)}>
            Dismiss Notification
          </button>
        </div>
      ))}
    </div>
  );
};

describe("NotificationProvider", () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Setup mock session
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "123", token: "test-token" } },
    });
    
    // Clear localStorage
    localStorage.clear();

    // Mock fetch to return a sample notification
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        notifications: [
          {
            id: "1",
            type: "NEW_ORDER",
            message: "New order #1 from John Doe",
            timestamp: new Date().toISOString(),
            order: {}
          }
        ]
      })
    });
  });

  it("loads notifications from localStorage on mount", () => {
    const storedNotifications = [
      { id: "1", type: "NEW_ORDER", message: "Test notification", timestamp: "2024-01-01T00:00:00Z", order: {} },
    ];
    localStorage.setItem("activeNotifications", JSON.stringify(storedNotifications));

    renderWithNotificationProvider(<NotificationConsumer />);

    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  it("dismisses a notification and updates localStorage", async () => {
    // Prepare the initial state
    const storedNotifications = [
      { id: "2", type: "NEW_ORDER", message: "Dismiss me", timestamp: "2024-01-01T00:00:00Z", order: {} }
    ];
    localStorage.setItem("activeNotifications", JSON.stringify(storedNotifications));

    renderWithNotificationProvider(<NotificationConsumer />);

    // Wait for the notification to be rendered
    await waitFor(() => {
      expect(screen.getByText("Dismiss me")).toBeInTheDocument();
    });

    // Click the dismiss button
    const dismissButton = screen.getByText("Dismiss Notification");
    await userEvent.click(dismissButton);

    // Check if notification was removed
    await waitFor(() => {
      expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
    });

    // Check localStorage
    const dismissedNotifications = JSON.parse(
      localStorage.getItem("dismissedNotifications") || "[]"
    );
    expect(dismissedNotifications).toContain("2");
  });

 

  it("does not add a notification if it is already dismissed", async () => {
    // Pre-dismiss the notification
    localStorage.setItem("dismissedNotifications", JSON.stringify(["1"]));

    renderWithNotificationProvider(<NotificationConsumer />);

    // Wait and ensure the notification is not rendered
    await waitFor(() => {
      expect(screen.queryByText(/New order/)).not.toBeInTheDocument();
    });
  });

});