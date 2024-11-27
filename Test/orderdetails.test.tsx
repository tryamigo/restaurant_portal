// Add this at the top of your test file
import { TextEncoder, TextDecoder } from 'util';

// Type-cast to avoid type issues with TextDecoder
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import OrderDetails from "@/app/orders/[id]/page";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import fetchMock from "jest-fetch-mock";
import { BrowserRouter, Routes, Route } from "react-router-dom";

fetchMock.enableMocks();

// Mock necessary hooks and dependencies
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

describe("OrderDetails Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "1",
          token: "test-token",
        },
      },
      status: "authenticated",
    });
    (toast as jest.Mock).mockReturnValue(jest.fn());
  });

  test("renders loading state when order data is not available", async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    // Check if skeleton loaders are present
    expect(screen.getAllByText(/loading/i)).toHaveLength(4);
  });

  test("renders order details when order data is available", async () => {
    // Mock the data returned from `useOrderDetails`
    const mockOrder = {
      id: "123",
      orderTime: new Date().toISOString(),
      status: "pending",
      orderItems: [{ id: "item1", name: "Item 1", price: 10, quantity: 2 }],
    };

    jest.spyOn(require('@/hooks/useOrderDetails'), 'useOrderDetails').mockImplementation(() => ({
      order: mockOrder,
      editedOrder: mockOrder,
      isEditDialogOpen: false,
      setEditedOrder: jest.fn(),
      setIsEditDialogOpen: jest.fn(),
      updateOrderStatus: jest.fn(),
      calculateOrderTotals: jest.fn(() => ({
        subtotal: 20,
        discount: 0,
        total: 20,
      })),
    }));

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    // Check if order ID and order time are rendered
    expect(screen.getByText(/Order #123/i)).toBeInTheDocument();
    expect(screen.getByText(/Placed on/i)).toBeInTheDocument();
  });

  test("opens and interacts with the edit status dialog", async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    // Check that the 'Update Status' button is present
    const updateButton = screen.getByText(/Update Status/i);
    expect(updateButton).toBeInTheDocument();

    // Simulate a click to open the dialog
    fireEvent.click(updateButton);

    // Verify dialog is open and contains the status select dropdown
    expect(screen.getByText(/Edit Order Status/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Status/i)).toBeInTheDocument();
  });

  test("changes the order status when a status is selected", async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Update Status/i));
    
    const select = screen.getByPlaceholderText(/Select status/i);
    fireEvent.change(select, { target: { value: 'preparing' } });

    // Check that the selected value is 'preparing'
    expect(screen.getByDisplayValue('preparing')).toBeInTheDocument();
  });

  test("triggers updateOrderStatus function when Save Changes button is clicked", async () => {
    const mockUpdateOrderStatus = jest.fn();

    jest.spyOn(require('@/hooks/useOrderDetails'), 'useOrderDetails').mockImplementation(() => ({
      order: { id: "123" },
      editedOrder: { status: "pending" },
      isEditDialogOpen: false,
      setEditedOrder: jest.fn(),
      setIsEditDialogOpen: jest.fn(),
      updateOrderStatus: mockUpdateOrderStatus,
      calculateOrderTotals: jest.fn(() => ({ subtotal: 20, discount: 0, total: 20 })),
    }));

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    fireEvent.click(screen.getByText(/Update Status/i));
    fireEvent.click(screen.getByText(/Save Changes/i));

    // Verify the function was called
    expect(mockUpdateOrderStatus).toHaveBeenCalled();
  });

  test("navigates back to orders when 'Back to Orders' button is clicked", async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Routes>
      </BrowserRouter>
    );

    const backButton = screen.getByText(/Back to Orders/i);
    expect(backButton).toBeInTheDocument();

    // Verify that clicking the back button navigates to /orders
    fireEvent.click(backButton);
    expect(window.location.pathname).toBe("/orders");
  });
});
