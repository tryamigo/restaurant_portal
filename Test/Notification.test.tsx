import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { useSession } from "next-auth/react";
import { setupServer} from "msw/node";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

// Mock next-auth session
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock useToast hook
jest.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));


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
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
};

describe("NotificationProvider", () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "123", token: "test-token" } },
    });
    localStorage.clear();
  });

  it("loads notifications from localStorage on mount", () => {
    const storedNotifications = [
      { id: "1", type: "NEW_ORDER", message: "Test notification", timestamp: "2024-01-01T00:00:00Z", order: {} },
    ];
    localStorage.setItem("activeNotifications", JSON.stringify(storedNotifications));

    renderWithNotificationProvider(<NotificationConsumer />);

    expect(screen.getByText("Test notification")).toBeInTheDocument();
  });

  it("dismisses a notification and updates localStorage", () => {
    renderWithNotificationProvider(<NotificationConsumer />);

    // Add a notification directly for testing dismiss
    localStorage.setItem(
      "activeNotifications",
      JSON.stringify([{ id: "2", type: "NEW_ORDER", message: "Dismiss me", timestamp: "2024-01-01T00:00:00Z", order: {} }])
    );

    userEvent.click(screen.getByText("Dismiss"));

    // Check if notification was removed and localStorage updated
    expect(screen.queryByText("Dismiss me")).not.toBeInTheDocument();
    expect(localStorage.getItem("dismissedNotifications")).toContain("2");
  });

  it("fetches new orders and adds notifications", async () => {
    renderWithNotificationProvider(<NotificationConsumer />);

    // Wait for fetch to be called
    await waitFor(() => {
      expect(screen.getByText(/New order #1 from John Doe/)).toBeInTheDocument();
    });
  });

  it("does not add a notification if it is already dismissed", async () => {
    localStorage.setItem("dismissedNotifications", JSON.stringify(["1"]));

    renderWithNotificationProvider(<NotificationConsumer />);

    await waitFor(() => {
      expect(screen.queryByText(/New order #1 from John Doe/)).not.toBeInTheDocument();
    });
  });

  it("calls the toast function when a new notification is added", async () => {
    const { toast } = require("@/hooks/use-toast")();

    renderWithNotificationProvider(<NotificationConsumer />);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "New Order Received!",
        description: "New order #1 from John Doe",
        duration: 5000,
      });
    });
  });

  it("fetches new orders on a 30-second interval", async () => {
    jest.useFakeTimers();
    renderWithNotificationProvider(<NotificationConsumer />);

    // Advance timers by 30 seconds
    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(screen.getByText(/New order #1 from John Doe/)).toBeInTheDocument();
    });

    jest.useRealTimers();
  });
});
