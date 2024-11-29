import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomButton } from "@/components/CustomButton";
import { Coupon } from "@/components/types";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface CouponListProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, isActive: boolean) => void;
}

const truncateTextdesc = (text: string, maxLength = 25): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const truncateTexttitle = (text: string, maxLength = 30): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const CouponList: React.FC<CouponListProps> = ({
  coupons,
  onDelete,
  onStatusUpdate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {coupons.map((coupon) => (
        <motion.div
          key={coupon.id}
          whileHover={{ scale: 1.05 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-4 md:p-6 dark:text-white">
            {/* Status Badge and Coupon Code */}
            <div className="flex justify-between items-center mb-4">
              <Badge
                variant={coupon.isActive ? "default" : "destructive"}
                className="text-xs"
              >
                {coupon.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm font-medium text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg shadow-sm">
                {coupon.couponCode}
              </span>
            </div>

            {/* Coupon Title */}
            <div className="flex justify-between">
              {coupon.title && coupon.title.length > 30 ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <h3 className="text-lg md:text-xl font-semibold mb-2">
                        {truncateTexttitle(coupon.title)}
                      </h3>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{coupon.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <h3 className="text-lg md:text-xl font-semibold mb-2">
                  {coupon.title || "N/A"}
                </h3>
              )}
            </div>

            {/* Coupon Details */}
            <div className="space-y-2 mb-4 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Description:
                </span>
                {coupon.description && coupon.description.length > 25 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="font-semibold truncate">
                          {truncateTextdesc(coupon.description)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{coupon.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <span className="font-semibold">
                    {coupon.description || "N/A"}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Discount Type:
                </span>
                <span className="font-semibold">
                  {coupon.discountType === "FIXED_AMOUNT"
                    ? "Fixed Amount"
                    : "Percentage"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Discount Value:
                </span>
                <span className="font-semibold">
                  {coupon.discountType === "FIXED_AMOUNT"
                    ? `₹${parseFloat(coupon.discountValue).toFixed(2)}`
                    : `${coupon.discountValue}%`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Minimum Order Value:
                </span>
                <span className="font-semibold">
                  ₹{parseFloat(coupon.minOrderValue ?? "0").toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Maximum Discount:
                </span>
                <span className="font-semibold">
                  ₹{parseFloat(coupon.maxDiscount ?? "0").toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Usage Limit:
                </span>
                <span className="font-semibold">{coupon.usageLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Eligible Orders:
                </span>
                <span className="font-semibold">
                  {coupon.eligibleOrders ?? "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  Validity:
                </span>
                <span className="font-semibold text-right">
                  {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                  {new Date(coupon.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-2">
              <Button
                className="w-full md:w-auto"
                variant="destructive"
                onClick={() => onDelete(coupon.id)}
              >
                Delete
              </Button>
              <CustomButton
                className="w-full md:w-auto items-center justify-center"
                onClick={() => onStatusUpdate(coupon.id, !coupon.isActive)}
              >
                {coupon.isActive ? "Deactivate" : "Activate"}
              </CustomButton>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
