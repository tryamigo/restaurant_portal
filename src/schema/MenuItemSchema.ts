import { z } from 'zod';

export const MenuItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters long" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  ratings: z.number().min(0, { message: "Ratings must be between 0 and 5" }).max(5, { message: "Ratings must be between 0 and 5" }),
  discounts: z.number().min(0, { message: "Discount must be between 0 and 100" }).max(100, { message: "Discount must be between 0 and 100" }),
  vegOrNonVeg: z.string().optional(),
  cuisine: z.string().optional(),
  imageLink: z.string().optional()
});

  export const initialObject={
  name: "",
  description: "",
  price: 0,
  ratings: 0,
  discounts: 0,
  vegOrNonVeg: undefined, 
  cuisine: undefined,      
  imageLink: undefined     
};
