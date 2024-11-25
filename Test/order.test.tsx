import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import OrdersPage from "@/app/orders/page";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

global.EventSource = jest
  .fn()
  .mockImplementation(function (
    this: EventSource,
    url: string | URL,
    eventSourceInitDict?: EventSourceInit
  ) {
    this.addEventListener = jest.fn();
    this.close = jest.fn();
    Object.defineProperty(this, "readyState", {
      value: EventSource.OPEN,
      writable: false,
    });
  }) as unknown as {
  new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
  prototype: EventSource;
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSED: 2;
};

// Mock dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    pathname: "/orders", // Return correct pathname
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => "/orders"), // Mock usePathname to return /menu
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock components
jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => <div data-variant={variant}>{children}</div>,
}));

jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton">Loading</div>,
}));

// Mock framer-motion
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    tr: ({ children, ...props }: any) => <tr {...props}>{children}</tr>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe("OrdersPage", () => {
  const mockOrders = [
    {
      id: "order-1234",
      orderTime: "2024-11-25T12:00:00Z",
      userAddress: {
        name: "John Doe",
        mobile: "+1234567890",
      },
      orderItems: [
        {
          id: "item-101",
          name: "Burger",
          quantity: 2,
          price: 10.99,
        },
        {
          id: "item-102",
          name: "Fries",
          quantity: 1,
          price: 4.99,
        },
        {
          id: "item-103",
          name: "Soda",
          quantity: 1,
          price: 2.99,
        },
      ],
      total: 45.99,
      status: "DELIVERED",
      deliveryCharge: 5.99,
      discount: 10,
      takeFromStore: false,
      rating: 4.5,
      feedback: "Great service and food, will order again!",
      restaurantAddress: {
        street: "456 Foodie Lane",
        city: "New York",
        postalCode: "10002",
        country: "USA",
      },
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup default session mock
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { token: "test-token" } },
      status: "authenticated",
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
  });

  it("renders loading skeletons when fetching orders", async () => {
    render(<OrdersPage />);

    // Check for skeleton loading state
    const skeletons = await screen.findAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders orders after successful fetch", async () => {
    render(<OrdersPage />);

    // Wait for the API call to resolve and elements to render
    await waitFor(() => {
      // Look for the order ID and orderTime formatted as expected
      const value = "order-1234".slice(0, 8);
      expect(screen.getByTestId("orderId")).toHaveTextContent(value);
    });
  });

  it("filters orders by search term", async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("orderId")).toBeInTheDocument();
    });

    // Search for John
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    fireEvent.change(searchInput, {
      target: { value: "order-1234".slice(0, 8) },
    });

    // Check filtered results
    await waitFor(() => {
      expect(screen.getByTestId("orderId")).toHaveTextContent(
        "order-1234".slice(0, 8)
      );
      expect(screen.getByTestId("orderId")).not.toHaveTextContent("order-5678");
    });
  });

  it("filters orders by status", async () => {
    render(<OrdersPage />);

    // Open status filter dropdown
    const statusTrigger = screen.getByRole("combobox");
    fireEvent.click(statusTrigger);

    // Select 'delivered' status
    const Option = screen.getByRole("combobox", { name: /delivered/i });
    fireEvent.click(Option);

    await waitFor(() => {
      expect(screen.getByTestId("orderId")).toHaveTextContent(
        "order-1234".slice(0, 8)
      );
    });
  });

  it('displays "No orders found" when no orders match filter', async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("orderId")).toHaveTextContent(
        "order-1234".slice(0, 8)
      );
    });

    // Open status filter dropdown
    const statusTrigger = screen.getByRole("combobox");
    fireEvent.click(statusTrigger);

    // Select 'pending' status
    const Option = screen.getByText("Pending");
    fireEvent.click(Option);

    // Check filtered results
    await waitFor(() => {
      const cell = screen.getByRole("cell", {
        name: /no orders found/i,
      });
      expect(within(cell).getByText(/no orders found/i));
    });
  });

  it("handles fetch error gracefully", async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn().mockRejectedValue(new Error("Fetch failed"));

    // Spy on console.error to prevent error logging in test output
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(<OrdersPage />);

    // Wait for potential error handling
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Error fetching orders:",
        expect.any(Error)
      );
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it("navigates to order details when view button is clicked", async () => {
    render(<OrdersPage />);

    // Wait for orders to be rendered
    await waitFor(() => {
      expect(screen.getByTestId("orderId")).toHaveTextContent(
        "order-1234".slice(0, 8)
      );
    });

    // Find and click view button for first order
    const row = screen.getAllByRole('row', {
      name: /order-12/i
    });
  
    const viewButton = within(row[0]).getByRole('button', {
      name: /view/i
    });

    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: /update status/i
        })
      )
    });
  });
});
