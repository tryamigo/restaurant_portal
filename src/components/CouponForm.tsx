import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Coupon } from "@/components/types";
import { CustomButton } from "./CustomButton";

interface CouponFormProps {
  onSubmit: (e: React.FormEvent) => void;
  newCoupon: Coupon;
  setNewCoupon: React.Dispatch<React.SetStateAction<Coupon>>;
  validationErrors: { [key: string]: string };
  onCancel: () => void;
  validateInput: (name: string, value: string) => void;
}

// Mapping for custom labels
const LABEL_MAPPING: { [key: string]: string } = {
  title: "Coupon Title",
  description: "Coupon Description",
  discountType: "Discount Type",
  discountValue: "Discount Value",
  minOrderValue: "Minimum Order Value",
  maxDiscount: "Maximum Discount",
  couponCode: "Coupon Code",
  usageLimit: "Usage Limit",
  eligibleOrders: "Eligible Orders",
  startDate: "Start Date",
  endDate: "End Date",
};

// Function to format label
const formatLabel = (key: string): string => {
  if (LABEL_MAPPING[key]) return LABEL_MAPPING[key];
  return key
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim();
};

export const CouponForm: React.FC<CouponFormProps> = ({
  onSubmit,
  newCoupon,
  setNewCoupon,
  validationErrors,
  onCancel,
  validateInput,
}) => {
  // Exclude discountType from automatic rendering
  const renderFields = Object.entries(newCoupon).filter(
    ([key]) => key !== "discountType"
  );

  const handleChange = (name: string, value: string) => {
    setNewCoupon({ ...newCoupon, [name]: value });
    validateInput(name, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Discount Type Select */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select
            value={newCoupon.discountType}
            onValueChange={(value) => {
              setNewCoupon({
                ...newCoupon,
                discountType: value as "PERCENTAGE" | "FIXED_AMOUNT",
              });
              validateInput("discountType", value); // Validate the select value
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discount type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentage</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
          {validationErrors.discountType && (
            <p className="text-red-500 text-sm">
              {validationErrors.discountType}
            </p>
          )}
        </div>

        {renderFields.map(([key, value]) => {
          const getInputType = () => {
            if (key === "maxDiscount") return "number";
            if (key.toLowerCase().includes("date")) return "date";
            if (
              key.toLowerCase().includes("limit") ||
              key.toLowerCase().includes("orders")
            )
              return "number";
            if (key.toLowerCase().includes("value")) return "number";
            return "text";
          };

          // Check if the current field is "description"
          const isDescriptionField = key === "description";

          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{formatLabel(key)}</Label>
              <Input
                id={key}
                type={getInputType()}
                value={value || ""}
                onChange={(e) => handleChange(key, e.target.value)} // Use the handleChange function
                className="w-full dark:bg-slate-700 dark:text-white"
                step={getInputType() === "number" ? "0.01" : undefined}
                // Conditionally remove the required attribute for the description field
                {...(!isDescriptionField && { required: true })}
              />
              {validationErrors[key] && (
                <p className="text-red-500 text-sm">{validationErrors[key]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
        <Button
          type="button"
          variant="default"
          onClick={onCancel}
          className="w-full md:w-auto"
        >
          Cancel
        </Button>
        <CustomButton
          type="submit"
          className="w-full justify-center md:w-auto text"
        >
          Add Coupon
        </CustomButton>
      </div>
    </form>
  );
};
