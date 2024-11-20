import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Coupon } from "@/components/types";
import { CouponSchema, initialObject } from "@/schema/CouponSchema";
import { z } from 'zod';
import { parse, isValid } from 'date-fns';
import { useSession } from 'next-auth/react';


export const useCouponOperations = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState(initialObject);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const {data:session}=useSession()

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
      setFilteredCoupons(data.coupons);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoupon = async () => {
    try {
      const parseDate = (dateString: string) => {
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        if (!isValid(parsedDate)) {
          throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        return parsedDate;
      };

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

      await CouponSchema.parseAsync(couponData);
      setValidationErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc: any, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setValidationErrors({
          general: error.message
        });
      }
      return false;
    }
  };

  const handleAddCoupon = async (restaurantId?: string) => {
    try {
      const response = await fetch("/api/restaurants/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify({
          ...newCoupon,
          restaurantId,
        }),
      });

      if (!response.ok) throw new Error("Failed to add coupon");

      toast({
        title: "Success",
        description: "Coupon added successfully",
      });

      fetchCoupons();
      setNewCoupon(initialObject);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add coupon",
        variant: "destructive",
      });
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
      toast({
        title: "Error",
        description: "Failed to update coupon status",
        variant: "destructive",
      });
    }
  };

  const filterCoupons = (searchTerm: string) => {
    const filtered = coupons.filter(item =>
      item.couponCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCoupons(filtered);
  };

  return {
    coupons,
    filteredCoupons,
    isLoading,
    newCoupon,
    validationErrors,
    setNewCoupon,
    setValidationErrors,
    fetchCoupons,
    validateCoupon,
    handleAddCoupon,
    handleDeleteCoupon,
    handleUpdateCouponStatus,
    filterCoupons
  };
};