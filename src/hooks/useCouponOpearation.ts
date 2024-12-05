import { useCallback, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Coupon, CouponStatus } from "@/components/types";
import { CouponSchema, initialObject } from "@/schema/CouponSchema";
import { z } from "zod";
import { parse, isValid } from "date-fns";
import { useSession } from "next-auth/react";

export const useCouponOperations = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [coupuonstatusFilter, setCoupuonstatusFilter] = useState<
    CouponStatus | "all"
  >("all");
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newCoupon, setNewCoupon] = useState(initialObject);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();

  const validateInput = (name: string, value: string) => {
    try {
      // Parse value based on field type
      let parsedValue: any = value;

      if (
        [
          "discountValue",
          "minOrderValue",
          "maxDiscount",
          "usageLimit",
          "eligibleOrders",
        ].includes(name)
      ) {
        parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
          throw new Error(`Invalid number for ${name}: ${value}`);
        }
      } else if (["startDate", "endDate"].includes(name)) {
        parsedValue = new Date(value);
        if (isNaN(parsedValue.getTime())) {
          throw new Error(`Invalid date for ${name}: ${value}`);
        }
      }

      // Pick specific field for validation
      const fieldSchema = z.object({
        [name]: (CouponSchema._def.schema as z.ZodObject<any>).shape[name],
      });
      fieldSchema.parse({ [name]: parsedValue });

      // If validation passes, clear the error for the field
      setValidationErrors((prevErrors: Record<string, string>) => {
        const updatedErrors = { ...prevErrors, [name]: "" };
        return updatedErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errMessages = error.errors.map((err) => err.message).join(", ");
        console.error(`Validation error for ${name}: ${errMessages}`);

        // Update state with the error messages
        setValidationErrors((prevErrors: Record<string, string>) => {
          const updatedErrors = { ...prevErrors, [name]: errMessages };
          console.log("Validation failed. Updated errors:", updatedErrors);
          return updatedErrors;
        });
      } else {
        // Handle other unexpected errors
        console.error("Unexpected validation error:", error);
      }
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
      setFilteredCoupons(data.coupons);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Coupons",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateCoupon = async () => {
    try {
      const parseDate = (dateString: string) => {
        const parsedDate = parse(dateString, "yyyy-MM-dd", new Date());
        if (!isValid(parsedDate)) {
          throw new Error("Invalid date format. Use YYYY-MM-DD");
        }
        return parsedDate;
      };

      const couponData = {
        ...newCoupon,
        discountValue: parseFloat(newCoupon.discountValue),
        minOrderValue: parseFloat(newCoupon.minOrderValue || "0"),
        maxDiscount: parseFloat(newCoupon.maxDiscount || "0"),
        usageLimit: Number(newCoupon.usageLimit),
        eligibleOrders: Number(newCoupon.eligibleOrders),
        startDate: parseDate(newCoupon.startDate),
        endDate: parseDate(newCoupon.endDate),
      };

      await CouponSchema.parseAsync(couponData);
      setValidationErrors({}); // Clear validation errors if valid
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc: any, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setValidationErrors(errors);
      } else if (error instanceof Error) {
        setValidationErrors({ general: error.message });
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
        description: `Coupon ${
          isActive ? "activated" : "deactivated"
        } successfully`,
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

  const filterCoupons = useCallback(
    (searchTerm: string) => {
      const filtered = coupons.filter((item) => {
        const matchesSearchTerm =
          item.couponCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          coupuonstatusFilter === "all" ||
          (coupuonstatusFilter === "active" && item.isActive) ||
          (coupuonstatusFilter === "inactive" && !item.isActive);

        return matchesSearchTerm && matchesStatus;
      });

      setFilteredCoupons(filtered);
    },
    [searchTerm, coupuonstatusFilter, coupons]
  );

  useEffect(() => {
    filterCoupons(searchTerm);
  }, [filterCoupons]);

  return {
    coupons,
    filterCoupons,
    isLoading,
    newCoupon,
    validationErrors,
    setNewCoupon,
    setValidationErrors,
    coupuonstatusFilter,
    setCoupuonstatusFilter,
    fetchCoupons,
    validateCoupon,
    handleAddCoupon,
    handleDeleteCoupon,
    filteredCoupons,
    handleUpdateCouponStatus,
    validateInput,
  };
};
