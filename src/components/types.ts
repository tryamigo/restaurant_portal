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
  restaurantId: string; // Changed from restaurantName
  status: OrderStatus;
  total: number;
  mobile:string; 
  date: Date;
  userAddress: string; // Changed from deliveryAddress
  userLatitude: number; // Added
  userLongitude: number; // Added
  paymentMethod: string;
  items: OrderItem[];
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
  ratings?: number; // Add any other fields you need
  discounts?: number; // If applicable
  imageLink?: string; // If applicable
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
  // currentOrder?: {
  //   id: string;
  //   restaurantName: string;
  //   customerName: string;
  //   deliveryAddress: Address;
  // };
}

export interface User {
  id: string;
  mobile: string;
}