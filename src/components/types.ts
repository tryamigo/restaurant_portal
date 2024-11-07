// src/components/admin/types.ts
export type OrderStatus = 'pending' | 'preparing' | 'on the way' | 'delivered';

export interface Address {
id?: string;
restaurantId?: string;
streetAddress: string;
latitude?: string;
longitude?: string;
landmark: string;
city: string;
state: string;
pincode: string;

}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  ratings: number;
  discount: number;
  description: string; 
  imageLink: string; 
}

export interface Order {
  id: string;
  customerName: string;
  restaurantId: string; 
  status: OrderStatus;
  total: number;
  mobile:string; 
  date: Date;
  userAddress: string; 
  userLatitude: number;
  userLongitude: number; 
  paymentMethod: string;
  orderItems: OrderItem[];
}

export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  phoneNumber: string;
  openingHours: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  ratings?: number; 
  discounts?: number; 
  imageLink?: string; 
}
export type deliveryStatus = 'available' | 'on delivery' | 'offline';

export interface DeliveryAgent {
  id: string;
  name: string;
  status:deliveryStatus
  completedDeliveries: number;
  phoneNumber: string;
  email: string;
  joinDate: Date;
  rating: number;
  licenseNumber?: string;
  aadharNumber?: string; 
  address:Address

}

export interface User {
  id: string;
  mobile: string;
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  couponCode: string;
  usageLimit?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
