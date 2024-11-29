import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Address } from './types';
import { AddressSchema } from "@/schema/RestaurantSchema"; // Zod schema

interface AddressFieldsProps {
  address: Address;
  onChange?: (updatedAddress: Address) => void;
  isEditing?: boolean;
  className?: string;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({
  address,
  onChange,
  isEditing = false,
  className = ''
}) => {
  const addressFields = [
    { key: 'streetAddress', label: 'Street Address' },
    { key: 'landmark', label: 'Landmark' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'pincode', label: 'Pincode' },
  ];
  
  const [validationErrors, setValidationErrors] = useState<any>({});

  // Validation function using Zod
  const validate = (address: Address) => {
    try {
      AddressSchema.parse(address); // This will throw an error if invalid
      setValidationErrors({});
    } catch (error: any) {
      const errors: any = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
      }
      setValidationErrors(errors);
    }
  };

  // Handle changes to the address fields during editing
  const handleInputChange = (key: string, value: string) => {
    const updatedAddress = { ...address, [key]: value };
    
    if (onChange) {
      onChange(updatedAddress);
    }

    // Trigger validation after every change
    validate(updatedAddress);
  };

  // Render address fields in edit mode
  if (isEditing) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {addressFields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={address[key as keyof Address] || ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
            />
            {/* Display validation error for the specific field */}
            {validationErrors[key] && (
              <p className="text-sm text-red-500">{validationErrors[key]}</p>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Render address fields in view mode (non-editable)
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-1 ${className}`}>
      {address && addressFields.map(({ key, label }) => (
        <div key={key} className="">
          <Label className='pr-2 font-bold text-md'>{label}:</Label>
          <Badge variant="outline">
            {address[key as keyof Address] || 'N/A'} {/* Display 'N/A' if value is empty */}
          </Badge>
        </div>
      ))}
    </div>
  );
};
