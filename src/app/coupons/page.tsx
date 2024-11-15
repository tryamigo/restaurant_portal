"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { PlusCircle, Search, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from 'zod';
import {   isBefore,isValid,parse } from 'date-fns';


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

  // Validate discount value against max discount for fixed amount
  if (data.discountType === "FIXED_AMOUNT" && data.discountValue > data.maxDiscount) {
    ctx.addIssue({
      code: 'custom',
      message: "Discount value cannot exceed maximum discount",
      path: ['discountValue']
    });
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
  const [searchCode, setSearchCode] = useState("");
  const [foundCoupon, setFoundCoupon] = useState<Coupon | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (status === "authenticated") {
      fetchCoupons();
    }
  }, [session, status]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchCode) {
        handleFindCouponByCode(searchCode);
      } else {
        setFoundCoupon(null);
      }
    }, 500); // 500ms debounce delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchCode]);

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
        const errors = error.errors.reduce((acc:any, curr) => {
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

  const handleFindCouponByCode = async (code: string) => {
    try {
      const response = await fetch(`/api/restaurants/coupons?code=${code}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to find coupon");

      const data = await response.json();
      if (data.coupon) {
        setFoundCoupon(data.coupon);
        toast({
          title: "Success",
          description: "Coupon found",
        });
      } else {
        setFoundCoupon(null);
        toast({
          title: "Info",
          description: "No coupon found with this code",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setFoundCoupon(null);
      toast({
        title: "Error",
        description: "Failed to find coupon",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div data-testid="loading-spinner" className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Coupons Management</h1>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search coupons..."
                  className="pl-10 w-64 border-white focus:border-white focus:ring focus:ring-white"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                />
              </div>
              <Button
                className="bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 flex items-center"
                onClick={() => setIsAddingCoupon(true)}
              >
                <PlusCircle className="mr-2" />
                Add New Coupon
              </Button>
            </div>
          </div>
        </div>
        <CardContent className="mt-4 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {coupons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                  <motion.div
                    key={coupon.id}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden"
                  >
                    <div className="p-6">
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
                      <h3 className="text-xl font-semibold mb-2">{coupon.title}</h3>
                      <p className="text-gray-600 mb-4">{coupon.description}</p>

                      {/* Additional Coupon Details */}
                      <div className="space-y-2 mb-4">
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
                          <span className="font-semibold">
                            {format(new Date(coupon.startDate), 'dd MMM yyyy')} -
                            {format(new Date(coupon.endDate), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCoupon(coupon.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleUpdateCouponStatus(coupon.id, !coupon.isActive)
                            }
                          >
                            {coupon.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Tag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-xl text-gray-500">No coupons available</p>
                <p className="text-gray-400">Create your first coupon</p>
              </div>
            )}
          </motion.div>

          {/* Found Coupon Section with Enhanced UI */}
          {foundCoupon && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-blue-800">Found Coupon Details</h3>
                  <Badge
                    variant={foundCoupon.isActive ? "default" : "destructive"}
                    className="text-sm"
                  >
                    {foundCoupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-blue-700 mb-4">Basic Information</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Coupon Code:</strong>
                        <span className="ml-2 text-gray-800">{foundCoupon.couponCode}</span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Title:</strong>
                        <span className="ml-2 text-gray-800">{foundCoupon.title}</span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Description:</strong>
                        <span className="ml-2 text-gray-800">{foundCoupon.description}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-blue-700 mb-4">Discount Details</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Discount Type:</strong>
                        <span className="ml-2 text-gray-800">
                          {foundCoupon.discountType === "PERCENTAGE"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Discount Value:</strong>
                        <span className="ml-2 text-gray-800">
                          {foundCoupon.discountType === "PERCENTAGE"
                            ? `${foundCoupon.discountValue}%`
                            : `₹${parseFloat(foundCoupon.discountValue).toFixed(2)}`}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Minimum Order Value:</strong>
                        <span className="ml-2 text-gray-800">
                          ₹{parseFloat(foundCoupon.minOrderValue ?? '0').toFixed(2)}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Maximum Discount:</strong>
                        <span className="ml-2 text-gray-800">
                          ₹{parseFloat(foundCoupon.maxDiscount ?? '0').toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-blue-700 mb-4">Usage Details</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Usage Limit:</strong>
                        <span className="ml-2 text-gray-800">{foundCoupon.usageLimit}</span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Eligible Orders:</strong>
                        <span className="ml-2 text-gray-800">{foundCoupon.eligibleOrders ?? 'N/A'}</span>
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-blue-700 mb-4">Validity</h4>
                    <div className="space-y-2">
                      <p className="text-gray-600">
                        <strong className="text-blue-700">Start Date:</strong>
                        <span className="ml-2 text-gray-800">
                          {format(new Date(foundCoupon.startDate), 'dd MMM yyyy')}
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <strong className="text-blue-700">End Date:</strong>
                        <span className="ml-2 text-gray-800">
                          {format(new Date(foundCoupon.endDate), 'dd MMM yyyy')}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteCoupon(foundCoupon.id)}
                  >
                    Delete Coupon
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleUpdateCouponStatus(foundCoupon.id, !foundCoupon.isActive)
                    }
                  >
                    {foundCoupon.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </div>


      {/* Modal for Adding Coupon */}
      <Dialog open={isAddingCoupon} onOpenChange={setIsAddingCoupon}>
        <DialogContent>
          <DialogTitle>Add New Coupon</DialogTitle>
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
                <p className="text-red-500 text-sm">{validationErrors.discountType }</p>
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
                />
                 {validationErrors.eligibleOrders && (
                <p className="text-red-500 text-sm">{validationErrors.eligibleOrders }</p>
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
                />
                {validationErrors.minOrderValue && (
                <p className="text-red-500 text-sm">{validationErrors.minOrderValue }</p>
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
                />
                {validationErrors.maxDiscount && (
                <p className="text-red-500 text-sm">{validationErrors.maxDiscount }</p>
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
                />
                 {validationErrors.couponCode && (
                <p className="text-red-500 text-sm">{validationErrors.couponCode }</p>
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
                />
                  {validationErrors.usageLimit && (
                <p className="text-red-500 text-sm">{validationErrors.usageLimit }</p>
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
                />
                 {validationErrors.startDate && (
                <p className="text-red-500 text-sm">{validationErrors.startDate }</p>
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
                />
                 {validationErrors.endDate && (
                <p className="text-red-500 text-sm">{validationErrors.endDate }</p>
              )}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={() => {
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
                 className="mr-2">
                Cancel
              </Button>
              <Button type="submit">Add Coupon</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CouponsPage;