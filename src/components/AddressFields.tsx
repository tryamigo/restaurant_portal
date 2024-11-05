import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Address } from './types';

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
    {key:'latitude',label:'latitude'},
    {key:'longitude',label:'longitude'}
  ];

  if (isEditing) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
        {addressFields.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={key}>{label}</Label>
            <Input
              id={key}
              value={address[key as keyof Address] || ''}
              onChange={(e) => {
                if (onChange) {
                  onChange({
                    ...address,
                    [key]: e.target.value
                  });
                }
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-1 ${className}`}>
      {address && addressFields.map(({ key, label }) => (
        <div key={key} className="">
          <Label className='pr-2 font-sans'>{label}:</Label>
          <Badge variant="outline">
            {address[key as keyof Address]}
          </Badge>
        </div>
      ))}
    </div>
  );
};