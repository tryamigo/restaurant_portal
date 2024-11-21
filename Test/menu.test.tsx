import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  prettyDOM,
} from "@testing-library/react";
import MenuDetails from "@/app/menu/page";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import fetchMock from "jest-fetch-mock";

fetchMock.enableMocks();

// Mock the EventSource constructor and static properties
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

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("@/hooks/use-toast", () => ({
  toast: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    pathname: "/menu", // Return correct pathname
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => "/menu"), // Mock usePathname to return /menu
}));

describe("MenuDetails Component", () => {
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

  it("renders loading skeleton initially", () => {
    render(<MenuDetails />);
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  it("renders menu items after fetching", async () => {
    // Mock the API response to include "Pizza" data
    const mockResponse = [
      {
        name: "Pizza",
        description: "Delicious cheese pizza",
        price: 12,
        ratings: 4,
        discounts: 10,
        imageLink: "https://example.com/pizza.jpg",
        vegOrNonVeg: "Vegetarian",
        cuisine: "Italian",
      },
    ];

    // Fix the fetch response to return the above mock data
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

    // Render the component
    const { container } = render(<MenuDetails />);

    console.log(prettyDOM(container));

    // Wait for the component to render and verify that the data appears correctly
    await waitFor(() => {
      // Verify that the "Pizza" name appears in the rendered component (you can modify based on your component)
      const itemName = screen.getByText("Pizza");
      expect(itemName).toBeInTheDocument();

      // You can also verify other properties
      const itemDescription = screen.getByText("Delicious cheese pizza");
      expect(itemDescription).toBeInTheDocument();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/restaurants/?id=1&menu=true", // Absolute URL for testing
      {
        headers: {
          Authorization: "Bearer test-token", // Authorization header
        },
      }
    );
  });

  it("handles fetch errors gracefully", async () => {
    // Simulate an error response (e.g., fetch fails or returns a 500 status)
    fetchMock.mockRejectOnce(new Error("API Error"));

    // Render the component
    render(<MenuDetails />);

    // Verify that the component handles the error gracefully (e.g., showing an error message)
    await waitFor(() => {
      const errorMessage = screen.getByText(/API Error/i);
      expect(errorMessage).toBeInTheDocument();
    });

  });


  // it("adds a new menu item", async () => {
  //   // Render the component
  //   render(<MenuDetails />);
  
  //   // Wait for the "Add Item" button to be in the DOM
  //   await waitFor(() => {
  //     expect(screen.getByTestId("add-item-button")).toBeInTheDocument();
  //   });
  
  //   // Click the "Add Item" button in the Header
  //   fireEvent.click(screen.getByTestId("add-item-button"));
  
  //   // Fill out the form fields and assert the values after changing
  //   fireEvent.change(screen.getByLabelText(/item name/i), {
  //     target: { value: "Pasta" },
  //   });
  //   expect(screen.getByLabelText(/item name/i).value).toBe("Pasta");
  
  //   fireEvent.change(screen.getByLabelText(/description/i), {
  //     target: { value: "Yummy pasta" },
  //   });
  //   expect(screen.getByLabelText(/description/i).value).toBe("Yummy pasta");
  
  //   fireEvent.change(screen.getByLabelText(/price/i), {
  //     target: { value: "899" },
  //   });
  //   expect(screen.getByLabelText(/price/i).value).toBe("899");
  
  //   fireEvent.change(screen.getByPlaceholderText(/0\-5/i), {
  //     target: { value: "4" },
  //   });
  //   expect(screen.getByPlaceholderText(/0\-5/i).value).toBe("4");
  
  //   fireEvent.change(screen.getByLabelText(/discount \(%\)/i), {
  //     target: { value: "15" },
  //   });
  //   expect(screen.getByLabelText(/discount \(%\)/i).value).toBe("15");
  
  //   fireEvent.click(screen.getByRole("combobox"));
  //   fireEvent.click(screen.getByText('Vegetarian'));
  
  //   fireEvent.change(screen.getByLabelText(/cuisine/i), {
  //     target: { value: "Coffee" },
  //   });
  //   expect(screen.getByLabelText(/cuisine/i).value).toBe("Coffee");
  
  //   // Submit the form
  //   fireEvent.click(screen.getByRole('button', { name: /add item/i }));
  
  //   // Assert the new item appears in the DOM
  //   await waitFor(() => {
  //     expect(screen.getByRole('cell', { name: /Pasta/i })).toBeInTheDocument();
  //   });
  
  // it("displays 'No menu items found' when search term does not match", async () => {
  //   render(<MenuDetails />);

  //  await waitFor(() => {
  //   fireEvent.change(screen.getByPlaceholderText(/search menu items/i), {
  //     target: { value: "Nonexistent Item" },
  //   });
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByText("No menu items found")).toBeInTheDocument();
  //   });
  // });

  // it("validates input fields", async () => {
  //   render(<MenuDetails />);

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
