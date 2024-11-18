// components/ui/CustomButton.tsx
import React from 'react';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button 
      {...props}
      className={`flex items-center text customborder font-bold rounded-sm p-2 hover:bg-blue-50  customBorder text-sm ${className}`}
    >
      {children}
    </button>
  );
};