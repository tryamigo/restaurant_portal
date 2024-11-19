"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Coupon } from "@/components/types";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from 'zod';
import { isBefore, isValid, parse } from 'date-fns';
import Header from "@/components/Header";
import { CustomButton } from "@/components/CustomButton";


// Coupon Schema Validation
const CouponSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.number()
    .min(0, "Discount value cannot be negative")
    .max(100, "Discount value cannot exceed 100%"),
  minOrderValue: z.number().min(0, "Minimum order value cannot be negative"),
  maxDiscount: z.number().min(0, "Maximum discount cannot be negative"),
  couponCode: z.string()
    .min(3, "Coupon code must be at least 3 characters")
    .max(20, "Coupon code is too long")
    .regex(/^[A-Z0-9]+$/, "Coupon code can only contain uppercase letters and numbers"),
  usageLimit: z.number().min(0, "Usage limit cannot be negative"),
  eligibleOrders: z.number().min(0, "Eligible orders cannot be negative"),
  startDate: z.date(),
  endDate: z.date(),
}).superRefine((data, ctx) => {
  // Validate that end date is not before start date
  if (isBefore(data.endDate, data.startDate)) {
    ctx.addIssue({
      code: 'custom',
      message: "End date cannot be before start date",
      path: ['endDate']
    });
  }


  // Validate discount value based on discount type
  if (data.discountType === "FIXED_AMOUNT") {
    if (data.discountValue > data.maxDiscount) {
      ctx.addIssue({
        code: 'custom',
        message: "Discount value cannot exceed maximum discount",
        path: ['discountValue']
      });
    }
  } else if (data.discountType === "PERCENTAGE") {
    if (data.discountValue > 100) {
      ctx.addIssue({
        code: 'custom',
        message: "Discount value cannot exceed 100%",
        path: ['discountValue']
      });
    }
  }

  // Validate minimum order value against maximum discount
  if (data.minOrderValue > data.maxDiscount) {
    ctx.addIssue({
      code: 'custom',
      message: "Minimum order value cannot be greater than maximum discount",
      path: ['minOrderValue']
    });
  }
});

const CouponsPage = () => {
  const { data: session, status } = useSession();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    title: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscount: "",
    couponCode: "",
    usageLimit: 0,
    eligibleOrders: 0,
    startDate: "",
    endDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCoupon,setFilteredCoupon]=useState<Coupon[]>([])
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (status === "authenticated") {
      fetchCoupons();
    }
  }, [session, status]);


  const validateCoupon = async () => {
    try {
      // Validate date format first
      const parseDate = (dateString: string) => {
        // Validate date format (YYYY-MM-DD)
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());

        if (!isValid(parsedDate)) {
          throw new Error('Invalid date format. Use YYYY-MM-DD');
        }

        return parsedDate;
      };

      // Convert string inputs to appropriate types
      const couponData = {
        ...newCoupon,
        discountValue: parseFloat(newCoupon.discountValue),
        minOrderValue: parseFloat(newCoupon.minOrderValue || '0'),
        maxDiscount: parseFloat(newCoupon.maxDiscount || '0'),
        usageLimit: Number(newCoupon.usageLimit),
        eligibleOrders: Number(newCoupon.eligibleOrders),
        startDate: parseDate(newCoupon.startDate),
        endDate: parseDate(newCoupon.endDate),
      };

      // Validate using Zod schema
      await CouponSchema.parseAsync(couponData);

      // Clear any previous validation errors
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Transform Zod errors into a more usable format
        const errors = error.errors.reduce((acc: any, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});

        setValidationErrors(errors);
      } else if (error instanceof Error) {
        // Handle other errors (like date parsing)
        setValidationErrors({
          general: error.message
        });
      }
      return false;
    }
  };
  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/restaurants/coupons", {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const data = await response.json();
      setCoupons(data.coupons);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validateCoupon();

    // Validate coupon before submission
    if (isValid) {

      try {
        const response = await fetch("/api/restaurants/coupons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify({
            ...newCoupon,
            restaurantId: session?.user.id,
          }),
        });

        if (!response.ok) throw new Error("Failed to add coupon");

        toast({
          title: "Success",
          description: "Coupon added successfully",
        });

        fetchCoupons();
      } catch (error) {
        console.error("Error:", error);
        toast({
          title: "Error",
          description: "Failed to add coupon",
          variant: "destructive",
        });
      } finally {
        setNewCoupon({
          title: "",
          description: "",
          discountType: "PERCENTAGE",
          discountValue: "",
          minOrderValue: "",
          maxDiscount: "",
          couponCode: "",
          usageLimit: 0,
          eligibleOrders: 0,
          startDate: "",
          endDate: "",
        });
        setIsAddingCoupon(false);
      }
    }
  };
  const handleDeleteCoupon = async (id: string) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to delete coupon");

      toast({
        title: "Success",
        description: "Coupon deleted successfully",
      });

      fetchCoupons();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    filterCoupon();
  }, [coupons, searchTerm]);

  const filterCoupon = () => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.couponCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredCoupon(filtered);
  };
  const handleUpdateCouponStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) throw new Error("Failed to update coupon status");

      toast({
        title: "Success",
        description: `Coupon ${isActive ? "activated" : "deactivated"} successfully`,
      });

      fetchCoupons();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div data-testid="loading-spinner" className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#007AFF]"></div>
      </div>
    );
  }


return (
    <>
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddItem={() => setIsAddingCoupon(true)}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 md:py-12 pt-[12rem] "
      >
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <CardContent className="mt-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filteredCoupon?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredCoupon?.map((coupon) => (
                    <motion.div
                      key={coupon.id}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden"
                    >
                      <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-4">
                          <Badge
                            variant={coupon.isActive ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {coupon.couponCode}
                          </span>
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold mb-2">{coupon.title}</h3>
                        <p className="text-sm md:text-base text-gray-600 mb-4">{coupon.description}</p>

                        {/* Additional Coupon Details */}
                        <div className="space-y-2 mb-4 text-sm md:text-base">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount Type:</span>
                            <span className="font-semibold">
                              {coupon.discountType === "FIXED_AMOUNT" ? "Fixed Amount" : "Percentage"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount Value:</span>
                            <span className="font-semibold">
                              {coupon.discountType === "FIXED_AMOUNT"
                                ? `₹${parseFloat(coupon.discountValue).toFixed(2)}`
                                : `${coupon.discountValue}%`}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Minimum Order Value:</span>
                            <span className="font-semibold">₹{parseFloat(coupon.minOrderValue ?? '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Maximum Discount:</span>
                            <span className="font-semibold">₹{parseFloat(coupon.maxDiscount ?? '0').toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Usage Limit:</span>
                            <span className="font-semibold">{coupon.usageLimit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Eligible Orders:</span>
                            <span className="font-semibold">{coupon.eligibleOrders ?? 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Validity:</span>
                            <span className="font-semibold text-right">
                              {format(new Date(coupon.startDate), 'dd MMM yyyy')} -
                              {format(new Date(coupon.endDate), 'dd MMM yyyy')}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 md:space-x-2">
                          <Button
                            className="w-full md:w-auto"
                            variant="destructive"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            Delete
                          </Button>
                          <CustomButton
                            className="w-full md:w-auto items-center justify-center"
                            onClick={() =>
                              handleUpdateCouponStatus(coupon.id, !coupon.isActive)
                            }
                          >
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </CustomButton>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Tag className="mx-auto h-12 md:h-16 w-12 md:w-16 text-gray-300 mb-4" />
                  <p className="text-lg md:text-xl text-gray-500">No coupons available</p>
                  <p className="text-sm md:text-base text-gray-400">Create your first coupon</p>
                </div>
              )}
            </motion.div>
          </CardContent>
        </div>

        {/* Modal for Adding Coupon */}
        <Dialog open={isAddingCoupon} onOpenChange={setIsAddingCoupon}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogTitle className="text-lg text text-center md:text-xl">Add New Coupon</DialogTitle>
            <form onSubmit={handleAddCoupon} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newCoupon.title || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, title: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.title && (
                    <p className="text-red-500 text-sm">{validationErrors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newCoupon.description || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        description: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.description && (
                    <p className="text-red-500 text-sm">{validationErrors.description}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setNewCoupon({
                        ...newCoupon,
                        discountType: value as "PERCENTAGE" | "FIXED_AMOUNT",
                      })
                    }
                    required
                  >
                    {validationErrors.discountType && (
                      <p className="text-red-500 text-sm">{validationErrors.discountType}</p>
                    )}
                    <SelectTrigger>
                      <SelectValue placeholder="Select discount type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Discount Value</Label>
                  <Input
                    type="number"
                    id="discountValue"
                    value={newCoupon.discountValue || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        discountValue: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.discountValue && (
                    <p className="text-red-500 text-sm">
                      {validationErrors.discountValue}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="eligibleOrders">Eligible Orders</Label>
                  <Input
                    type="number"
                    id="eligibleOrders"
                    value={newCoupon.eligibleOrders || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        eligibleOrders: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.eligibleOrders && (
                    <p className="text-red-500 text-sm">{validationErrors.eligibleOrders}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Minimum Order Value</Label>
                  <Input
                    type="number"
                    id="minOrderValue"
                    value={newCoupon.minOrderValue || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        minOrderValue: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.minOrderValue && (
                    <p className="text-red-500 text-sm">{validationErrors.minOrderValue}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxDiscount">Maximum Discount</Label>
                  <Input
                    type="number"
                    id="maxDiscount"
                    value={newCoupon.maxDiscount || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        maxDiscount: e.target.value,
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.maxDiscount && (
                    <p className="text-red-500 text-sm">{validationErrors.maxDiscount}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="couponCode">Coupon Code</Label>
                  <Input
                    id="couponCode"
                    value={newCoupon.couponCode || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, couponCode: e.target.value })
                    }
                    className="w-full"
                  />
                  {validationErrors.couponCode && (
                    <p className="text-red-500 text-sm">{validationErrors.couponCode}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    type="number"
                    id="usageLimit"
                    value={newCoupon.usageLimit || ""}
                    onChange={(e) =>
                      setNewCoupon({
                        ...newCoupon,
                        usageLimit: Number(e.target.value),
                      })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.usageLimit && (
                    <p className="text-red-500 text-sm">{validationErrors.usageLimit}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    type="date"
                    id="startDate"
                    value={newCoupon.startDate || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, startDate: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.startDate && (
                    <p className="text-red-500 text-sm">{validationErrors.startDate}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    type="date"
                    id="endDate"
                    value={newCoupon.endDate || ""}
                    onChange={(e) =>
                      setNewCoupon({ ...newCoupon, endDate: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                  {validationErrors.endDate && (
                    <p className="text-red-500 text-sm">{validationErrors.endDate}</p>
                  )}
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2">
                <Button 
                  type="button" 
                  onClick={() => {
                    setNewCoupon({
                      title: "",
                      description: "",
                      discountType: "PERCENTAGE",
                      discountValue: "",
                      minOrderValue: "",
                      maxDiscount: "",
                      couponCode: "",
                      usageLimit: 0,
                      eligibleOrders: 0,
                      startDate: "",
                      endDate: "",
                    });
                    setIsAddingCoupon(false)
                    setValidationErrors({})
                  }}
                  className="w-full md:w-auto"
                >
                  Cancel
                </Button>
                <CustomButton 
                  type="submit" 
                  className="w-full justify-center md:w-auto"
                >
                  Add Coupon
                </CustomButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  );
};

export default CouponsPage;



