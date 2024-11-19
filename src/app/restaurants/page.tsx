'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Restaurant } from '@/components/types';
import { AddressFields } from '@/components/AddressFields';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/Header';

const RestaurantDetails: React.FC = () => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [editedRestaurant, setEditedRestaurant] = useState<Restaurant | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter()
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

    const handleEditRestaurant = async () => {
        if (!editedRestaurant) return;

        try {
            const response = await fetch(`/api/restaurants/?id=${session?.user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user.token}`,
                },
                body: JSON.stringify(editedRestaurant),
            });

            if (!response.ok) throw new Error('Failed to update restaurant');

            const updatedRestaurant = await response.json();
            setRestaurant(updatedRestaurant);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating restaurant:', error);
        }
    };

    const openDeleteDialog = () => {
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteRestaurant = async () => {
        try {
            const response = await fetch(`/api/restaurants/?id=${session?.user.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${session?.user.token}` }
            });

            if (!response.ok) throw new Error('Failed to delete restaurant');

            setIsDeleteDialogOpen(false);
            router.push('/restaurants');
        } catch (error) {
            console.error('Error deleting restaurant:', error);
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
          onDeleteRestaurant: openDeleteDialog
        }} />
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 pt-[5rem] md:pt-2 md:px-0"
        >
            <Card className="shadow-lg border-none">
                <CardHeader className="text">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Delete Restaurant
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                    Are you sure you want to delete this restaurant?
                                    This action cannot be undone.
                                </DialogDescription>
                                <DialogFooter className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                                    <Button 
                                        variant="destructive" 
                                        onClick={handleDeleteRestaurant}
                                        className="w-full md:w-auto"
                                    >
                                        Delete
                                    </Button>
                                    <Button 
                                        onClick={() => setIsDeleteDialogOpen(false)}
                                        className="w-full md:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
    
                <CardContent className="p-4 md:p-6">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.div
                                key="edit-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Input fields with responsive layout */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editedRestaurant?.name || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, name: e.target.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={editedRestaurant?.phoneNumber || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="openingHours">Opening Hours</Label>
                                        <Input
                                            id="openingHours"
                                            value={editedRestaurant?.openingHours || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, openingHours: e.target.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="gstin">GSTIN</Label>
                                        <Input
                                            id="gstin"
                                            value={editedRestaurant?.gstin || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, gstin: e.target.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="FSSAI">FSSAI</Label>
                                        <Input
                                            id="FSSAI"
                                            value={editedRestaurant?.FSSAI || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, FSSAI: e.target.value }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="rating">Rating</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            value={editedRestaurant?.rating || 0}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, rating: parseFloat(e.target.value) }))}
                                            className="w-full"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <AddressFields
                                            address={editedRestaurant?.address || {
                                                streetAddress: '', city: '', state: '', pincode: '', landmark: '', latitude: '', longitude: ''
                                            }}
                                            onChange={(updatedAddress) => {
                                                setEditedRestaurant(prev => ({ ...prev!, address: updatedAddress }));
                                            }}
                                            isEditing={true}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2 mt-4">
                                    <Button 
                                        className="background text-white hover:bg-[#0056b3] transition-colors duration-300 flex items-center w-full md:w-auto"
                                        onClick={handleEditRestaurant}
                                    >
                                        Save Changes
                                    </Button>
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
                            </motion.div>
                        ) : (
                            <motion.div
                                key="restaurant-details"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <div className="mb-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Restaurant Information</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p><strong>Name:</strong> {restaurant.name}</p>
                                            <p><strong>Phone:</strong> {restaurant.phoneNumber}</p>
                                            <p><strong>Opening Hours:</strong> {restaurant.openingHours}</p>
                                            <p><strong>GSTIN:</strong> {restaurant.gstin}</p>
                                            <p><strong>FSSAI:</strong> {restaurant.FSSAI}</p>
                                            <p><strong>Rating:</strong> {restaurant.rating}</p>
                                            <AddressFields
                                                address={restaurant.address}
                                                isEditing={false}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
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
