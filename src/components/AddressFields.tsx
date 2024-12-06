import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Address } from "./types";
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
  className = "",
}) => {
  const addressFields = [
    { key: "streetAddress", label: "Street Address" },
    { key: "landmark", label: "Landmark" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "pincode", label: "Pincode" },
  ];

  const [validationErrors, setValidationErrors] = useState<any>({});

  // Validate address using Zod schema
  const validate = (address: Address) => {
    try {
      AddressSchema.parse(address);
      setValidationErrors({});
    } catch (error: any) {
      const errors: any = {};
      error.errors?.forEach((err: any) => {
        errors[err.path[0]] = err.message;
      });
      setValidationErrors(errors);
    }
  };

  // Handle input change and validation
  const handleInputChange = (key: string, value: string) => {
    const updatedAddress = { ...address, [key]: value };
    onChange?.(updatedAddress);  // Trigger onChange callback

    validate(updatedAddress); // Trigger validation
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {addressFields.map(({ key, label }) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={key}>{label}</Label>

          {isEditing ? (
            <Input
              id={key}
              value={address[key as keyof Address] || ""}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className="w-full dark:bg-slate-700 dark:text-white"
            />
          ) : (
            <Badge variant="outline">
              {address[key as keyof Address] || "N/A"}
            </Badge>
          )}

          {/* Display validation error for the specific field */}
          {validationErrors[key] && (
            <p className="text-sm text-red-500">{validationErrors[key]}</p>
          )}
        </div>
      ))}
    </div>
  );
};
