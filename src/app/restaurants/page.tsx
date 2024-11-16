'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Restaurant } from '@/components/types';
import { AddressFields } from '@/components/AddressFields';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
    MoreHorizontal,
    Edit,
    Plus,
    Save,
    Trash2,
    X,
    ArrowLeftIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

const RestaurantDetails: React.FC = () => {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', description: '', price: 0, ratings: 0, discounts: 0, imageLink: '' });
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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="shadow-lg border-none">
                <CardHeader className="text ">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Restaurant Details</CardTitle>
                        <div className="flex space-x-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button className="background text-white hover:bg-[#0056b3] transition-colors duration-300 flex items-center"
                                        size="sm" >
                                        Options
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => {
                                        setIsEditing(true);
                                        setEditedRestaurant(restaurant);
                                    }}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit Restaurant
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-700"
                                        onClick={() => openDeleteDialog()}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Restaurant
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                                <DialogFooter>
                                    <Button variant="destructive" onClick={handleDeleteRestaurant}>
                                        Delete
                                    </Button>
                                    <Button onClick={() => setIsDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
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
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editedRestaurant?.name || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, name: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="phoneNumber">Phone Number</Label>
                                        <Input
                                            id="phoneNumber"
                                            value={editedRestaurant?.phoneNumber || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, phoneNumber: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="openingHours">Opening Hours</Label>
                                        <Input
                                            id="openingHours"
                                            value={editedRestaurant?.openingHours || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, openingHours: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="gstin">GSTIN</Label>
                                        <Input
                                            id="gstin"
                                            value={editedRestaurant?.gstin || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, gstin: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="FSSAI">FSSAI</Label>
                                        <Input
                                            id="FSSAI"
                                            value={editedRestaurant?.FSSAI || ''}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, FSSAI: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="rating">Rating</Label>
                                        <Input
                                            id="rating"
                                            type="number"
                                            value={editedRestaurant?.rating || 0}
                                            onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, rating: parseFloat(e.target.value) }))}
                                        />
                                    </div>
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
                                <div className="flex gap-2 mt-4">
                                    <Button className="background text-white hover:bg-[#0056b3] transition-colors duration-300 flex items-center"
                                        onClick={handleEditRestaurant}>Save Changes</Button>
                                    <Button onClick={() => {
                                        setIsEditing(false);
                                        setEditedRestaurant(null);
                                    }}>Cancel</Button>
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
    );
};

export default RestaurantDetails;
