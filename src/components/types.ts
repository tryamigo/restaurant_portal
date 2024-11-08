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

export interface orderAddress {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  mobile: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  ratings: number;
  description: string; 
  imageLink: string; 
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  total: number;
  orderTime: Date;
  deliveryTime?: Date;
  rating?: number;
  feedback?: string;
  deliveryCharge: number;
  discount: number;
  takeFromStore: boolean;
  orderItems: OrderItem[];
  userAddress?: orderAddress;
  restaurantAddress?: orderAddress;
  messages?: Message[];
}
export interface Restaurant {
  id: string;
  name: string;
  address: Address;
  phoneNumber: string;
  openingHours: string;
  gstin: string;
  FSSAI: string;
  rating: number;
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
