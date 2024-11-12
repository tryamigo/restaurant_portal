'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, Restaurant } from '@/components/types';
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
import {
    MoreHorizontal,
    Edit,
    Plus,
    Save,
    Trash2,
    X,
    ArrowLeftIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

const RestaurantDetails: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', description: '', price: 0, ratings: 0, discounts: 0, imageLink: '' });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
    useEffect(() => {
        if (status === 'authenticated') {
            fetchMenu()
        }
    }, [session, status]);


    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true`, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch menu');
            }
            const data = await response.json();
            setMenu(data);
        } catch (error) {
            console.error('Error updating restaurant:', error);
        }
        finally {
            setIsLoading(false);
        }
    };

    const openDeleteDialog = (itemId?: string) => {
        if (itemId) setMenuItemToDelete(itemId);
        setIsDeleteDialogOpen(true);
    };

    const handleAddItem = async () => {
        if (newItem.name && newItem.description && newItem.price > 0) {
            try {
                const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session?.user.token}`,
                    },
                    body: JSON.stringify(newItem),
                });

                if (response.ok) {
                    const addedItem = await response.json();
                    setMenu([...menu, addedItem]);
                    setNewItem({ name: '', description: '', price: 0, discounts: 0, imageLink: '' });
                } else {
                    console.error('Failed to add menu item');
                }
            } catch (error) {
                console.error('Error adding menu item:', error);
            }
        }
    };

    const handleEditItem = (item: MenuItem) => {
        setEditingItemId(item.id);
    };

    const handleEditChange = (itemId: string, field: keyof MenuItem, value: string | number) => {
        setMenu(prevMenu =>
            prevMenu.map(item =>
                item.id === itemId ? { ...item, [field]: value } : item
            )
        );
    };
    const handleSaveEdit = async () => {
        if (!editingItemId) return;

        try {
            const itemToUpdate = menu.find(item => item.id === editingItemId);
            if (!itemToUpdate) throw new Error('Item not found');

            const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${editingItemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.user.token}`,
                },
                body: JSON.stringify(itemToUpdate),
            });

            if (!response.ok) throw new Error('Failed to update menu item');
            const updatedItem = await response.json();
            const updatedMenu = menu.map(item =>
                item.id === editingItemId ? updatedItem : item
            );
            setMenu(updatedMenu);
            setEditingItemId(null);
        } catch (error) {
            console.error('Error updating menu item:', error);
        }
    };

    const handleDeleteItem = async () => {
        if (!menuItemToDelete) return;
        try {
            const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${menuItemToDelete}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                }
            });
            if (!response.ok) throw new Error('Failed to delete menu item');
            const updatedMenu = menu.filter(item => item.id !== menuItemToDelete);
            setMenu(updatedMenu);
            setIsDeleteDialogOpen(false);
            setMenuItemToDelete(null);
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
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

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="shadow-lg border-none">
                <CardHeader className="bg-black text-white">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold">Menu Details</CardTitle>
                        <div className="flex space-x-4">
                        </div>
                        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Delete Menu Item
                                    </DialogTitle>
                                </DialogHeader>
                                <DialogDescription>
                                    Are you sure you want to delete this menu item?
                                    This action cannot be undone.
                                </DialogDescription>
                                <DialogFooter>
                                    <Button variant="destructive" onClick={handleDeleteItem}>
                                        Delete
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent className="p-6">

                    <div className="bg-white p-4 rounded shadow mt-6">
                        <h2 className="text-xl font-semibold mb-2">Menu</h2>
                        <table className="w-full">
                            <thead>
                                <tr>
                                    <th className="text-left">Item</th>
                                    <th className="text-left">Description</th>
                                    <th className="text-left">Price</th>
                                    <th className="text-left">Ratings</th>
                                    <th className="text-left">Discounts</th>
                                    <th className="text-left">Images</th>
                                    <th className="text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {menu?.map((item) => (
                                    <tr key={item.id} className="border-b">
                                        {editingItemId === item.id ? (
                                            <>
                                                <td className="py-2">
                                                    <Input
                                                        value={item.name || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'name', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <Input
                                                        value={item.description || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'description', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <Input
                                                        type="number"
                                                        value={item.price || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'price', e.target.value ? parseFloat(e.target.value) : 0)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <Input
                                                        type="number"
                                                        value={item.ratings || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'ratings', e.target.value ? parseFloat(e.target.value) : 0)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <Input
                                                        type="number"
                                                        value={item.discounts || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'discounts', e.target.value ? parseFloat(e.target.value) : 0)}
                                                    />
                                                </td>
                                                <td className="py-2">
                                                    <Input
                                                        value={item.imageLink || ''}
                                                        onChange={(e) => handleEditChange(item.id, 'imageLink', e.target.value)}
                                                    />
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Button
                                                        onClick={handleSaveEdit}
                                                        className="text-white rounded-md shadow-sm transition duration-200 flex items-center justify-center w-full"
                                                    >
                                                        <Save className="h-4 w-4 mr-1" />
                                                    </Button>
                                                </td>
                                                <td className="py-2 px-2">
                                                    <Button
                                                        onClick={handleCancelEdit}
                                                        variant="destructive"
                                                        className="bg-red-500 hover:bg-red-600 text-white rounded-md shadow-sm transition duration-200 flex items-center justify-center w-full"
                                                    >
                                                        <X className="h-4 w-4 mr-1" />
                                                    </Button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className=" py-2">{item.name}</td>
                                                <td className="py-2">{item.description}</td>
                                                <td className="py-2">${Number(item.price).toFixed(2)}</td>
                                                <td className="py-2">{item.ratings}</td>
                                                <td className="py-2">{item.discounts}</td>
                                                <td className="py-2">
                                                    <Image
                                                        src={item.imageLink||''}
                                                        alt={item.name}
                                                        width={64}
                                                        height={64}
                                                        className="w-16 h-16 object-cover rounded"
                                                    />  
                                                     </td>
                                                <td className="py-2">
                                                    <Button onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
                                                </td>
                                                <td className="py-2">
                                                    <Button
                                                        onClick={() => openDeleteDialog(item.id)}
                                                        variant="destructive"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="bg-white shadow-md rounded-lg p-6  mx-auto mt-2">
                            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Add New Item</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">
                                        Item Name
                                    </Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter item name"
                                        value={newItem.name || ''}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">
                                        Description
                                    </Label>
                                    <Input
                                        id="description"
                                        placeholder="Item description"
                                        value={newItem.description || ''}
                                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-700">
                                        Price
                                    </Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="0.00"
                                        value={newItem.price || ''}
                                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="ratings" className="block mb-2 text-sm font-medium text-gray-700">
                                        Ratings
                                    </Label>
                                    <Input
                                        id="ratings"
                                        type="number"
                                        placeholder="0-5"
                                        min="0"
                                        max="5"
                                        value={newItem.ratings || ''}
                                        onChange={(e) => setNewItem({ ...newItem, ratings: parseFloat(e.target.value) })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="discounts" className="block mb-2 text-sm font-medium text-gray-700">
                                        Discount (%)
                                    </Label>
                                    <Input
                                        id="discounts"
                                        type="number"
                                        placeholder="0-100"
                                        min="0"
                                        max="100"
                                        value={newItem.discounts || ''}
                                        onChange={(e) => setNewItem({ ...newItem, discounts: parseFloat(e.target.value) })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="imageLink" className="block mb-2 text-sm font-medium text-gray-700">
                                        Image URL
                                    </Label>
                                    <Input
                                        id="imageLink"
                                        placeholder="https://example.com/image.jpg"
                                        value={newItem.imageLink || ''}
                                        onChange={(e) => setNewItem({ ...newItem, imageLink: e.target.value })}
                                        className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                                    />
                                </div>
                                <div className="md:col-span-3 flex justify-end mt-4">
                                    <Button
                                        onClick={handleAddItem}
                                        className=" text-white transition-colors duration-300"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Item
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default RestaurantDetails;




