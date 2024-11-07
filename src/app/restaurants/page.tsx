'use client';
import React, { useState, useEffect } from 'react';
import {  Restaurant } from '@/components/types';
import { AddressFields } from '@/components/AddressFields';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const RestaurantDetails: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRestaurantDetails();
    }
  }, [session, status]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(`/api/restaurants?id=${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      setRestaurant(data);
    } catch (err) {
      console.error('Error fetching restaurant details:', err);
      setError('Failed to load restaurant details. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent>
            <p>No restaurant details found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="container mx-auto p-4 space-y-6 mt-2">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-white">
          <CardTitle className="text-2xl">Restaurant Details</CardTitle>
        </CardHeader>
       
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <AddressFields
                address={restaurant.address}
                isEditing={false}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
              <p className="text-gray-700">Phone: {restaurant.phoneNumber}</p>
              <p className="text-gray-700">Opening Hours: {restaurant.openingHours}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      
    </div>
    </>
  );
};

export default RestaurantDetails;