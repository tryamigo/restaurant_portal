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

  it('renders correctly in non-editing mode', () => {
    render(<AddressFields address={mockAddress} isEditing={false} />);

    // Check if all address fields are rendered as badges
    Object.keys(mockAddress).forEach((key) => {
      const label = screen.getByText(new RegExp(`${key}:`, 'i'));
      expect(label).toBeInTheDocument();

      const value = mockAddress[key as keyof Address];
      if (value) {  // Ensure value is not undefined
        const badge = screen.getByText(value);
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('badge');  // Ensure Badge component is used
      }
    });
  });

  it('renders correctly in editing mode', () => {
    render(<AddressFields address={mockAddress} isEditing={true} onChange={mockOnChange} />);

    // Check if all address fields are rendered as inputs
    Object.keys(mockAddress).forEach((key) => {
      const value = mockAddress[key as keyof Address];
      if (value) {  // Ensure value is not undefined
        const label = screen.getByLabelText(new RegExp(`${key}`, 'i'));
        expect(label).toBeInTheDocument();
        const input = screen.getByDisplayValue(value);
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('type', 'text');
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
});
