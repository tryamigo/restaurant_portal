import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddressFields } from '@/components/AddressFields';
import { Address } from '@/components/types';

describe('AddressFields', () => {
  const mockAddress: Address = {
    streetAddress: '123 Main St',
    landmark: 'Near Park',
    city: 'Sample City',
    state: 'State',
    pincode: '123456',
    latitude: '12.34',
    longitude: '56.78',
  };

  const mockOnChange = jest.fn();


  it('renders correctly in editing mode', () => {
    render(<AddressFields address={mockAddress} isEditing={true} onChange={mockOnChange} />);

    const addressFields = [
      'streetAddress', 'landmark', 'city', 'state', 
      'pincode', 'latitude', 'longitude'
    ];

    addressFields.forEach((key) => {
      const value = mockAddress[key as keyof Address];
      if (value) {
        // Find input by value and check its properties
        const input = screen.getByDisplayValue(value);
        expect(input).toBeInTheDocument();
        
        // More robust type checking
        expect(input.tagName.toLowerCase()).toBe('input');
        
        // Since the Input component might not set type directly
        // We'll check for input element instead
        expect(input).toBeInstanceOf(HTMLInputElement);
      }
    });
  });

  it('calls onChange when an input is edited', () => {
    render(<AddressFields address={mockAddress} isEditing={true} onChange={mockOnChange} />);

    // Simulate changing the "streetAddress" field
    const input = screen.getByDisplayValue(mockAddress.streetAddress);
    fireEvent.change(input, { target: { value: '456 New St' } });

    // Verify onChange callback is triggered with updated address data
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockAddress,
      streetAddress: '456 New St',
    });
  });

  // Debugging test to print out component details
  it('prints component details for debugging', () => {
    const { container } = render(
      <AddressFields 
        address={mockAddress} 
        isEditing={false} 
      />
    );

    // Print out the entire rendered component
    console.log(container.innerHTML);
  });

  // Additional test for className prop
  it('applies custom className', () => {
    const testClassName = 'custom-address-class';
    const { container } = render(
      <AddressFields 
        address={mockAddress} 
        isEditing={false} 
        className={testClassName}
      />
    );

    const rootElement = container.firstChild;
    expect(rootElement as HTMLElement).toHaveClass(testClassName);
  });
});