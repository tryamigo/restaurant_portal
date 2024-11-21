import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuDetails from "@/app/menu/page";
import "@testing-library/jest-dom";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import fetchMock from "jest-fetch-mock";

// Mock the EventSource constructor and static properties
global.EventSource = jest.fn().mockImplementation(function (this: EventSource, url: string | URL, eventSourceInitDict?: EventSourceInit) {
  this.addEventListener = jest.fn();
  this.close = jest.fn();
  Object.defineProperty(this, "readyState", { value: EventSource.OPEN, writable: false });
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
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJpYXQiOjE3MzIxMDg3MzMsImV4cCI6MzMyODk3MDg3MzN9.jd50r7DPvDraQpC6WvjAdiNsvMJseECuYGbjIs_AywI",
        },
      },
      status: "authenticated",
    });
    (toast as jest.Mock).mockReturnValue(jest.fn());
  });


  // it("renders loading skeleton initially", () => {
  //   render(<MenuDetails />);
  //   expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  // });


  it("renders menu items after fetching", async () => {
    render(<MenuDetails />);
    await waitFor(() => {
      expect(screen.getByRole('cell', {
        name: /adarsh/i
      })).toBeInTheDocument(); 
    });
  });

  // it("adds a new menu item", async () => {

  //   render(<MenuDetails />);
    
  //    // Click the "Add Item" button in the Header
  //    await waitFor(() => {
  //    fireEvent.click(screen.getByTestId("add-item-button"));
  //    });
 
  //    // Fill out the form fields
  //    fireEvent.change(screen.getByLabelText(/item name/i), {
  //      target: { value: "Pasta" },
  //    });
  //    fireEvent.change(screen.getByLabelText(/description/i), {
  //      target: { value: "Yummy pasta" },
  //    });
  //    fireEvent.change(screen.getByLabelText(/price/i), {
  //      target: { value: "899" },
  //    });
  //    fireEvent.change(screen.getByPlaceholderText(/0\-5/i), {
  //      target: { value: "4" },
  //    });
  //    fireEvent.change(screen.getByLabelText(/discount \(%\)/i), {
  //      target: { value: "15" },
  //    });
 
  //    fireEvent.click(screen.getByRole("combobox"));
  //    fireEvent.click(screen.getByText('Vegetarian'));

  //    fireEvent.change(screen.getByLabelText(/cuisine/i), {
  //      target: { value: "Coffee" },
  //    });
 
  //    // Submit the form
  //    fireEvent.click(screen.getByRole('button', {
  //     name: /add item/i
  //   }));
 
  //    // Assert the new item appears in the DOM
  //    await waitFor(() => {
  //     expect(screen.getByRole('cell', {
  //       name: /pasta/i
  //     })).toBeInTheDocument(); 
  //   });
  //  });

  it("displays 'No menu items found' when search term does not match", async () => {
    render(<MenuDetails />);

   await waitFor(() => {
    fireEvent.change(screen.getByPlaceholderText(/search menu items/i), {
      target: { value: "Nonexistent Item" },
    });
    });

    await waitFor(() => {
      expect(screen.getByText("No menu items found")).toBeInTheDocument();
    });
  });

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
