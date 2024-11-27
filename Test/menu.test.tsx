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
import  {ThemeProvider}  from "../src/contexts/ThemeContext";

interface MenuItem {
  name: string;
  description: string;
  price: number;
  ratings: number;
  discounts: number;
  imageLink?: string;
  vegOrNonVeg: string;
  cuisine: string;
}

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


const renderWithThemeProvider = (component: React.ReactNode) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

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
    renderWithThemeProvider(<MenuDetails />);
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
    const { container } = renderWithThemeProvider(<MenuDetails />);

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
    renderWithThemeProvider(<MenuDetails />);

    // Verify that the component handles the error gracefully (e.g., showing an error message)
    await waitFor(() => {
      const errorMessage = screen.getByText(/API Error/i);
      expect(errorMessage).toBeInTheDocument();
    });

  });


  it("adds a new menu item", async () => {
    const mockResponse: MenuItem[] = [];
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });
  
    renderWithThemeProvider(<MenuDetails />);
  
    await waitFor(() => {
      expect(screen.getByTestId("add-item-button")).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByTestId("add-item-button"));
  
    fireEvent.change(screen.getByLabelText(/item name/i), {
      target: { value: "Pasta" },
    });
    fireEvent.change(screen.getByLabelText(/description/i), {
      target: { value: "Yummy pasta" },
    });
    fireEvent.change(screen.getByLabelText(/price/i), {
      target: { value: "899" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0-5/i), {
      target: { value: "4" },
    });
    fireEvent.change(screen.getByLabelText(/discount \(%\)/i), {
      target: { value: "15" },
    });
    const vegOrNonVeg = screen.getByRole("combobox");
    fireEvent.click(vegOrNonVeg);
    fireEvent.click(screen.getByText("Vegetarian"));
    fireEvent.change(screen.getByLabelText(/cuisine/i), {
      target: { value: "Coffee" },
    });
  
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          name: "Pasta",
          description: "Yummy pasta",
          price: 899,
          ratings: 4,
          discounts: 15,
          vegOrNonVeg: "Vegetarian",
          cuisine: "Coffee",
        },
      ]),
      { status: 200 }
    );
  
    fireEvent.click(screen.getByRole("button", { name: /add item/i }));
  
    await waitFor(() => {
      screen.debug(); // Debug the DOM if needed
      expect(screen.getByRole('cell', {
        name: /₹899\.00/i
      })).toBeInTheDocument();
    });
  });
  

  
  it("displays 'No menu items found' when search term does not match", async () => {
    // Mock the fetch response for menu items
        const mockResponse = [
      {
        name: "Pasta",
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
    renderWithThemeProvider(<MenuDetails />);

    // Wait for the search input to appear
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText(/search menu items/i)
      ).toBeInTheDocument();
    });

    // Search for a nonexistent item
    fireEvent.change(screen.getByPlaceholderText(/search menu items/i), {
      target: { value: "Nonexistent Item" },
    });

    // Assert "No menu items found" appears in the DOM
    await waitFor(() => {
      expect(screen.getByText(/no menu items found/i)).toBeInTheDocument();
    });
  });

  it("validates input fields", async () => {
    
      // Mock the fetch response for menu items
    const mockResponse = [
      {
        name: "Pasta",
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
    renderWithThemeProvider(<MenuDetails />);

    await waitFor(() => {
      expect(screen.getByTestId("add-item-button")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('button', {
      name: /add item/i
    }));

    await waitFor(() => {
      expect(screen.getByText("Name must be at least 2 characters long")).toBeInTheDocument();
      expect(screen.getByText("Description must be at least 5 characters long")).toBeInTheDocument();
      expect(screen.getByText("Price must be a positive number")).toBeInTheDocument();
    });
  });

  it("edits a menu item", async () => {
    
    // Mock initial menu items
    const mockResponse = [
      {
        id: 1,
        name: "Pizza",
        description: "Delicious cheese pizza",
        price: 12,
        ratings: 4,
        discounts: 10,
        vegOrNonVeg: "Vegetarian",
        cuisine: "Italian",
      },
    ];

    // Mock GET response for menu items
    fetchMock.mockResponseOnce(JSON.stringify(mockResponse), { status: 200 });

    // Render the MenuDetails component
    renderWithThemeProvider(<MenuDetails />);

    // Wait for the item "Pizza" to be displayed
    await waitFor(() => {
      expect(screen.getByText("Pizza")).toBeInTheDocument();
    });

    // Mock PUT response for editing the menu item
    fetchMock.mockResponseOnce(
      JSON.stringify({
        id: 1,
        name: "Updated Pizza",
        description: "Delicious cheese pizza",
        price: 12,
        ratings: 4,
        discounts: 10,
        vegOrNonVeg: "Vegetarian",
        cuisine: "Italian",
      }),
      { status: 200 }
    );

    // Click the Edit button (use a more reliable selector like `data-testid`)
    fireEvent.click(screen.getByTestId("edit-item")); 

    // Update the "Name" field
    fireEvent.change(screen.getByRole('textbox', {
      name: /item name/i
    }), {
      target: { value: "Updated Pizza" },
    });

    // Click the Save button
    fireEvent.click(screen.getByRole('button', {
      name: /update item/i
    }));

    // Wait for the updated item to be displayed
    await waitFor(() => {
      expect(screen.getByText("Updated Pizza")).toBeInTheDocument();
    });
  });


  it("deletes a menu item", async () => {
    // Mock initial menu items
    const mockMenuItems = [
      {
        id: 1,
        name: "Pizza",
        description: "Delicious cheese pizza",
        price: 12,
        ratings: 4,
        discounts: 10,
        vegOrNonVeg: "Vegetarian",
        cuisine: "Italian",
      },
    ];

    // Mock GET response to fetch menu items
    fetchMock.mockResponseOnce(JSON.stringify(mockMenuItems), { status: 200 });

    // Render the MenuDetails component
    renderWithThemeProvider(<MenuDetails />);

    // Wait for the "Pizza" menu item to be displayed
    await waitFor(() => {
      expect(screen.getByText("Pizza")).toBeInTheDocument();
    });

    // Click the "Delete" button for the specific item (use reliable `data-testid`)
    fireEvent.click(screen.getByTestId("delete-item")); // Ensure delete buttons have `data-testid="delete-button-<id>"`

    // Confirm deletion in the confirmation dialog
    fireEvent.click(screen.getByRole('button', {
      name: /delete/i
    })); // Assuming "Confirm" button has text "Confirm"

    // Wait for the item to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText("Pizza")).not.toBeInTheDocument();
    });
  });

});
