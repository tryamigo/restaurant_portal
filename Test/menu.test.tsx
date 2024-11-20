import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuDetails from "@/app/menu/page";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import fetchMock from "jest-fetch-mock";

// Mock the EventSource constructor and static properties
global.EventSource = jest.fn().mockImplementation(function (this: EventSource, url: string | URL, eventSourceInitDict?: EventSourceInit) {
  // Mimic the behavior of EventSource instance
  this.addEventListener = jest.fn();
  this.close = jest.fn();
  Object.defineProperty(this, 'readyState', { value: EventSource.OPEN, writable: false });  // Default to OPEN state
}) as unknown as {
  new (url: string | URL, eventSourceInitDict?: EventSourceInit): EventSource;
  prototype: EventSource;
  readonly CONNECTING: 0;
  readonly OPEN: 1;
  readonly CLOSED: 2;
};

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

// Mock Next.js router
jest.mock("next/navigation", () => {
  const originalModule = jest.requireActual("next/navigation");
  return {
    ...originalModule,
    useRouter: jest.fn(),
    usePathname: jest.fn(),
  };
});

describe("MenuDetails Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: "1",
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE3MzIxMDg3MzMsImV4cCI6MzMyODk3MDg3MzN9.jd50r7DPvDraQpC6WvjAdiNsvMJseECuYGbjIs_AywI",
        },
      },
      status: "authenticated",
    });
    (toast as jest.Mock).mockReturnValue(jest.fn());

    // Mock the API response for fetching menu items
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          item: "Pizza",
          description: "Delicious pizza",
          price: 12.99,
          ratings: 4.5,
          discount: 10,
        },
      ])
    );
  });

  const renderComponent = () => {
    render(<MenuDetails />);
  };

  it("renders loading skeleton initially", () => {
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renders menu items after fetching", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("itemname")).toBeInTheDocument(); 
    });
  });

  it("displays 'No menu items found' when search term does not match", async () => {
    renderComponent();

    await waitFor(() => expect(screen.getByText("Pizza")).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Nonexistent Item" },
    });

    await waitFor(() => {
      expect(screen.getByText("No menu items found")).toBeInTheDocument();
    });
  });

  // it("adds a new menu item", async () => {
  //   renderComponent();

  //   fireEvent.click(screen.getByText("Add Item"));

  //   fireEvent.change(screen.getByLabelText("Name"), {
  //     target: { value: "Pasta" },
  //   });
  //   fireEvent.change(screen.getByLabelText("Description"), {
  //     target: { value: "Yummy pasta" },
  //   });
  //   fireEvent.change(screen.getByLabelText("Price"), {
  //     target: { value: "8.99" }, // Ensure price is a string if needed by the component
  //   });
  //   fireEvent.change(screen.getByLabelText("Ratings"), {
  //     target: { value: "4.2" },
  //   });
  //   fireEvent.change(screen.getByLabelText("Discount"), {
  //     target: { value: "15" },
  //   });

  //   fireEvent.click(screen.getByText("Save"));

  //   await waitFor(() => {
  //     expect(screen.getByText("Pasta")).toBeInTheDocument();
  //   });
  // });

  // it("validates input fields", async () => {
  //   renderComponent();

  //   fireEvent.click(screen.getByText("Add Item"));
  //   fireEvent.click(screen.getByText("Save"));

  //   await waitFor(() => {
  //     expect(screen.getByText("Name must be at least 2 characters long")).toBeInTheDocument();
  //     expect(screen.getByText("Description must be at least 5 characters long")).toBeInTheDocument();
  //     expect(screen.getByText("Price must be a positive number")).toBeInTheDocument();
  //   });
  // });

  // it("edits a menu item", async () => {
  //   renderComponent();

  //   await waitFor(() => expect(screen.getByText("Pizza")).toBeInTheDocument());
  //   fireEvent.click(screen.getByText("Edit"));

  //   fireEvent.change(screen.getByLabelText("Name"), {
  //     target: { value: "Updated Pizza" },
  //   });
  //   fireEvent.click(screen.getByText("Save"));

  //   await waitFor(() => {
  //     expect(screen.getByText("Updated Pizza")).toBeInTheDocument();
  //   });
  // });

  // it("deletes a menu item", async () => {
  //   renderComponent();

  //   await waitFor(() => expect(screen.getByText("Pizza")).toBeInTheDocument());
  //   fireEvent.click(screen.getByText("Delete"));
  //   fireEvent.click(screen.getByText("Confirm"));

  //   await waitFor(() => {
  //     expect(screen.queryByText("Pizza")).not.toBeInTheDocument();
  //   });
  // });
});
