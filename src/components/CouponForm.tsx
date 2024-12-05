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
import { Textarea } from "./ui/textarea";

interface CouponFormProps {
  onSubmit: (e: React.FormEvent) => void;
  newCoupon: Coupon;
  setNewCoupon: React.Dispatch<React.SetStateAction<Coupon>>;
  validationErrors: { [key: string]: string };
  onCancel: () => void;
  validateInput: (name: string, value: string) => void;
}

export const CouponForm: React.FC<CouponFormProps> = ({
  onSubmit,
  newCoupon,
  setNewCoupon,
  validationErrors,
  onCancel,
  validateInput,
}) => {
  const handleChange = (name: string, value: string) => {
    setNewCoupon({ ...newCoupon, [name]: value });
    validateInput(name, value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Discount Type */}
        <div className="md:col-span-2">
          <Label
            htmlFor="discountType"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Discount Type
          </Label>
          <Select
            value={newCoupon.discountType}
            onValueChange={(value) => {
              setNewCoupon({
                ...newCoupon,
                discountType: value as "PERCENTAGE" | "FIXED_AMOUNT",
              });
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
        </div>

        {/* Coupon Title */}
        <div>
          <Label
            htmlFor="title"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Coupon Title
          </Label>
          <Input
            id="title"
            type="text"
            value={newCoupon.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Enter coupon title"
            required
          />
          {validationErrors.title && (
            <p className="text-red-500 text-sm">{validationErrors.title}</p>
          )}
        </div>

        {/* Coupon Description */}
        <div>
          <Label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Coupon Description
          </Label>
          <Textarea
            id="description"
            placeholder="Item description"
            value={newCoupon.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            required
          />
          {validationErrors.description && (
            <p className="text-red-500 text-sm">
              {validationErrors.description}
            </p>
          )}
        </div>

        {/* Coupon Code */}
        <div>
          <Label
            htmlFor="couponCode"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Coupon Code
          </Label>
          <Input
            id="couponCode"
            type="text"
            value={newCoupon.couponCode || ""}
            onChange={(e) => handleChange("couponCode", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Enter coupon code"
            required
          />
          {validationErrors.couponCode && (
            <p className="text-red-500 text-sm">
              {validationErrors.couponCode}
            </p>
          )}
        </div>

        {/* Minimum Order Value */}
        <div>
          <Label
            htmlFor="minOrderValue"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Minimum Order Value
          </Label>
          <Input
            id="minOrderValue"
            type="number"
            value={newCoupon.minOrderValue || ""}
            onChange={(e) => handleChange("minOrderValue", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            step="0.01"
            placeholder="Enter minimum order value"
            required
          />
          {validationErrors.minOrderValue && (
            <p className="text-red-500 text-sm">
              {validationErrors.minOrderValue}
            </p>
          )}
        </div>

        {/* Maximum Discount */}
        <div>
          <Label
            htmlFor="maxDiscount"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Maximum Discount
          </Label>
          <Input
            id="maxDiscount"
            type="number"
            value={newCoupon.maxDiscount || ""}
            onChange={(e) => handleChange("maxDiscount", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            step="0.01"
            placeholder="Enter maximum discount"
            required
          />
          {validationErrors.maxDiscount && (
            <p className="text-red-500 text-sm">
              {validationErrors.maxDiscount}
            </p>
          )}
          {newCoupon.minOrderValue &&
            newCoupon.maxDiscount &&
            parseFloat(newCoupon.maxDiscount) >
              parseFloat(newCoupon.minOrderValue) && (
              <p className="text-red-500 text-sm">
                Maximum discount should not exceed Minimum order value.
              </p>
            )}
        </div>

        {/* Discount Value */}
        <div>
          <Label
            htmlFor="discountValue"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Discount Value
          </Label>
          <Input
            id="discountValue"
            type="number"
            value={newCoupon.discountValue || ""}
            onChange={(e) => handleChange("discountValue", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            step="0.01"
            placeholder="Enter discount value"
            required
          />
          {newCoupon.discountType === "FIXED_AMOUNT" ? (
            <>
              {validationErrors.discountValue && (
                <p className="text-red-500 text-sm">
                  {validationErrors.discountValue}
                </p>
              )}
              {newCoupon.maxDiscount &&
              parseFloat(newCoupon.discountValue || "0") >
                parseFloat(newCoupon.maxDiscount || "0") ? (
                <p className="text-red-500 text-sm">
                  Discount value should not exceed maximum discount.
                </p>
              ) : null}
            </>
          ) : null}

          {newCoupon.discountType === "PERCENTAGE" ? (
            <>
              {validationErrors.discountValue && (
                <p className="text-red-500 text-sm">
                  {validationErrors.discountValue}
                </p>
              )}
              {parseFloat(newCoupon.discountValue || "0") > 100 && (
                <p className="text-red-500 text-sm">
                  Discount value should not exceed 100%.
                </p>
              )}
            </>
          ) : null}
        </div>

        {/* Usage Limit */}
        <div>
          <Label
            htmlFor="usageLimit"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Usage Limit
          </Label>
          <Input
            id="usageLimit"
            type="number"
            value={newCoupon.usageLimit || ""}
            onChange={(e) => handleChange("usageLimit", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Enter usage limit"
            required
          />
          {validationErrors.usageLimit && (
            <p className="text-red-500 text-sm">
              {validationErrors.usageLimit}
            </p>
          )}
        </div>

        {/* Eligible Orders */}
        <div>
          <Label
            htmlFor="eligibleOrders"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Eligible Orders
          </Label>
          <Input
            id="eligibleOrders"
            type="number"
            value={newCoupon.eligibleOrders || ""}
            onChange={(e) => handleChange("eligibleOrders", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Enter eligible orders"
            required
          />
          {validationErrors.eligibleOrders && (
            <p className="text-red-500 text-sm">
              {validationErrors.eligibleOrders}
            </p>
          )}
        </div>

        {/* Start Date */}
        <div>
          <Label
            htmlFor="startDate"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={newCoupon.startDate || ""}
            onChange={(e) => handleChange("startDate", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Select start date"
            required
          />
          {validationErrors.startDate && (
            <p className="text-red-500 text-sm">{validationErrors.startDate}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <Label
            htmlFor="endDate"
            className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
          >
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={newCoupon.endDate || ""}
            onChange={(e) => handleChange("endDate", e.target.value)}
            className="w-full dark:bg-slate-700 dark:text-white"
            placeholder="Select end date"
            required
          />
          {validationErrors.endDate && (
            <p className="text-red-500 text-sm">{validationErrors.endDate}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-x-4 md:space-y-0">
        <CustomButton onClick={onCancel}>Cancel</CustomButton>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};
