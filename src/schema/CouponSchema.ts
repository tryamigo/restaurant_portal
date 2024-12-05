import { z } from 'zod';
import { isBefore} from 'date-fns';

// Coupon Schema Validation
export const CouponSchema = z.object({
    title: z.string().max(60, "Title is too long"),
    description: z.string().max(150, "Description is too long").optional(),
    discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
    discountValue: z.number().min(0, "Discount value cannot be negative"),
    minOrderValue: z.number().min(0, "Minimum order value cannot be negative"),
    maxDiscount: z.number().min(0, "Maximum discount cannot be negative"),
    couponCode: z.string()
      .min(5, "Coupon code must be at least 5 characters")
      .max(10, "Coupon code is too long")
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

  });
  


export const initialObject={
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
  }