"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { CopyIcon, CalendarIcon, InfoIcon, TagIcon } from "lucide-react";
import { Coupon } from "@/components/types";

interface CouponListProps {
  coupons: Coupon[];
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, isActive: boolean) => void;
}

const truncateText = (text: string, maxLength = 20): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export const CouponList: React.FC<CouponListProps> = ({
  coupons,
  onDelete,
  onStatusUpdate,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AnimatePresence>
        {coupons.map((coupon) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Card className="dark:bg-gray-900 dark:border-gray-200 relative">
              <CardHeader
                className={
                  "pb-2 " +
                  (!coupon.isActive ? "relative grayscale opacity-40" : "")
                }
              >
                {!coupon.isActive && (
                  <div className="absolute top-[215px] left-10 inset-0 flex justify-center items-center bg-gray-900/70 backdrop-blur-sm transform rotate-[-45deg]">
                    <div className="flex flex-col items-center animate-pulse">
                      <span className="text-6xl font-bold tracking-wider mb-2">
                        INACTIVE
                      </span>
                      <TagIcon className="h-16 w-16 transform rotate-[135deg]" />
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <Badge
                    variant={coupon.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(coupon.couponCode);
                          }}
                        >
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy coupon code</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-gray-900 border border-gray-200">
                        <p>
                          Click to copy:{" "}
                          <span className="font-medium">
                            {coupon.couponCode}
                          </span>
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <CardTitle className="text-lg mt-2">
                  <TooltipProvider>
                    {coupon.title && coupon.title.length > 20 ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <span>{truncateText(coupon.title || "N/A")}</span>
                        </TooltipTrigger>
                        <TooltipContent className="border-gray-200" side="left">
                          <p>{coupon.title || "N/A"}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <span>{coupon.title || "N/A"}</span>
                    )}
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent
                className={
                  "pb-2 " +
                  (!coupon.isActive ? "relative grayscale opacity-50" : "")
                }
              >
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Code:</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-white bg-gray-200 dark:bg-gray-600 p-1 rounded-lg shadow-sm">
                      {coupon.couponCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Discount Type:
                    </span>
                    <span className="font-medium">{coupon.discountType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium">
                      {coupon.discountType === "FIXED_AMOUNT"
                        ? `₹${parseFloat(coupon.discountValue).toFixed(2)}`
                        : `${coupon.discountValue}%`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Min. Order:</span>
                    <span className="font-medium">
                      ₹{parseFloat(coupon.minOrderValue ?? "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Max. Discount:
                    </span>
                    <span className="font-medium">
                      ₹{parseFloat(coupon.maxDiscount ?? "0").toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Usage Limit:</span>
                    <span className="font-medium">{coupon.usageLimit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Eligibe Orders:
                    </span>
                    <span className="font-medium">
                      {" "}
                      {coupon.eligibleOrders}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(coupon.startDate).toLocaleDateString()} -{" "}
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon">
                        <InfoIcon className="h-4 w-4" />
                        <span className="sr-only">Coupon details</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="end"
                      className="w-[300px] p-0 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg"
                    >
                      <div className="p-4">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400">
                            Description:
                          </h4>
                          <p className="text-sm break-words">
                            {coupon.description || "N/A"}
                          </p>
                        </div>
                        <div></div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={coupon.isActive}
                    onCheckedChange={(checked) =>
                      onStatusUpdate(coupon.id, checked)
                    }
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(coupon.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
