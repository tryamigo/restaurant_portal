// zodSchemas.ts
import { z } from "zod";

// Improved Address Schema with more comprehensive validation
export const AddressSchema = z.object({
  streetAddress: z
    .string()
    .min(1, "Street address is required")
    .max(70, "Street address must be between 1 and 70 characters"), // Increased length for street address
  city: z
    .string()
    .min(1, "City is required")
    .max(40, "City must be between 1 and 40 characters"), // Increased max length for cities
  state: z
    .string()
    .min(1, "State is required")
    .max(40, "State must be between 1 and 40 characters"), // Increased max length for states
  pincode: z
    .string()
    .min(6, "Pincode must be exactly 6 characters")
    .max(6, "Pincode must be exactly 6 characters")
    .regex(/^\d{6}$/, "Pincode must be a valid 6-digit number"), // Added regex for valid 6-digit pincode
  landmark: z
    .string()
    .max(50, "Landmark must be up to 50 characters") // Increased max length for landmarks
    .optional(),
});

// Improved Restaurant Schema with better validation and error messages
export const RestaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(70, "Restaurant name must be between 1 and 70 characters"), // Increased max length for restaurant name
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be no more than 15 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Phone number must be valid with optional country code"), // Regex for valid phone number
  openingHours: z
    .string()
    .min(1, "Opening hours are required")
    .max(20, "Opening hours must be between 1 and 20 characters"), // Increased max length for opening hours
  gstin: z
    .string()
    .min(15, "GSTIN must be exactly 15 characters")
    .max(15, "GSTIN must be exactly 15 characters")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{3}$/, "GSTIN must be a valid format"), // Regex for valid GSTIN format
  FSSAI: z
    .string()
    .min(14, "FSSAI must be exactly 14 characters")
    .max(14, "FSSAI must be exactly 14 characters")
    .regex(/^\d{14}$/, "FSSAI must be a valid 14-digit number"), // Regex for valid FSSAI format
  address: AddressSchema,
});
