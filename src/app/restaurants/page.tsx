'use client';
import React, {useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Restaurant } from '@/components/types';
import { AddressFields } from '@/components/AddressFields';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CustomButton } from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import { MapPin, Phone, Clock, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useRestaurant from "@/hooks/useRestaurant";

const RestaurantDetails: React.FC = () => {
  const { restaurant, isLoading, error, updateRestaurant } = useRestaurant();
  const [isEditing, setIsEditing] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState<Restaurant | null>(
    null
  );

  const handleEditRestaurant = async () => {
    if (isEditing && editedRestaurant) {
      await updateRestaurant(editedRestaurant);
      setIsEditing(false);
    } else {
      setEditedRestaurant(restaurant);
      setIsEditing(true);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-4xl"
        data-testid="loading-spinner"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-24 w-full" />
          ))}
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4"
      >
        <Card>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!restaurant) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-4"
      >
        <Card>
          <CardContent>
            <p>No restaurant details found.</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <Header
        restaurantActions={{
          onEditRestaurant: handleEditRestaurant,
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 pt-[5rem] md:pt-2 md:px-0"
      >
        <Card className="shadow-lg border-none">
          <CardContent className="p-4 md:p-6">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Input fields with responsive layout */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={editedRestaurant?.name || ""}
                        onChange={(e) =>
                          setEditedRestaurant((prev) => ({
                            ...prev!,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        value={editedRestaurant?.phoneNumber || ""}
                        onChange={(e) =>
                          setEditedRestaurant((prev) => ({
                            ...prev!,
                            phoneNumber: e.target.value,
                          }))
                        }
                        readOnly={true}
                        className="w-full bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingHours">Opening Hours</Label>
                      <Input
                        id="openingHours"
                        value={editedRestaurant?.openingHours || ""}
                        onChange={(e) =>
                          setEditedRestaurant((prev) => ({
                            ...prev!,
                            openingHours: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gstin">GSTIN</Label>
                      <Input
                        id="gstin"
                        value={editedRestaurant?.gstin || ""}
                        onChange={(e) =>
                          setEditedRestaurant((prev) => ({
                            ...prev!,
                            gstin: e.target.value,
                          }))
                        }
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                    <Label htmlFor="fssai">FSSAI</Label>
                    <Input
                      id="fssai"
                      value={editedRestaurant?.FSSAI || ""}
                      onChange={(e) =>
                        setEditedRestaurant((prev) => ({
                          ...prev!,
                          FSSAI: e.target.value,
                        }))
                      }
                      className="w-full"
                    />
                    </div>
                    <div className="md:col-span-2">
                      <AddressFields
                        address={
                          editedRestaurant?.address || {
                            streetAddress: "",
                            city: "",
                            state: "",
                            pincode: "",
                            landmark: "",
                          }
                        }
                        onChange={(updatedAddress) => {
                          setEditedRestaurant((prev) => ({
                            ...prev!,
                            address: updatedAddress,
                          }));
                        }}
                        isEditing={true}
                      />

                      <div className="flex flex-col md:flex-row gap-2 mt-4">
                        <CustomButton
                          onClick={handleEditRestaurant}
                          className="flex items-center justify-center gap-2 w-full md:w-auto"
                        >
                          Save Changes
                        </CustomButton>
                        <Button
                          onClick={() => {
                            setIsEditing(false);
                            setEditedRestaurant(null);
                          }}
                          className="w-full md:w-auto"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="restaurant-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl font-bold">
                        {restaurant.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-sm">
                        GSTIN: {restaurant.gstin}
                      </Badge>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{restaurant.phoneNumber}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{restaurant.openingHours}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>FSSAI: {restaurant.FSSAI}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start space-x-2">
                            <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                              <p>{restaurant.address.streetAddress}</p>
                              <p>
                                {restaurant.address.city},{" "}
                                {restaurant.address.state}{" "}
                                {restaurant.address.pincode}
                              </p>
                              {restaurant.address.landmark && (
                                <p className="text-sm text-muted-foreground">
                                  Near {restaurant.address.landmark}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default RestaurantDetails;
