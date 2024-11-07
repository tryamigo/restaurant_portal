'use client';
import React, { useState, useEffect } from 'react';
import {  MenuItem, Restaurant } from '@/components/types';
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
import { ArrowLeftIcon, Edit, Plus, Save, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const RestaurantDetails: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({ name: '', description: '', price: 0, ratings: 0, discounts: 0, imageLink: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [editedRestaurant, setEditedRestaurant] = useState<Restaurant | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'restaurant' | 'menuItem'>('restaurant');
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
  const router = useRouter()
  useEffect(() => {
    if (status === 'authenticated') {
      fetchRestaurantDetails();
      fetchMenu()
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


  const fetchMenu = async (): Promise<MenuItem[]> => {
    const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true`, {
      headers: {
        Authorization: `Bearer ${session?.user.token}`,
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    return await response.json();
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

  const handleDelete = async () => {
    if (deleteType === 'restaurant') {
      await handleDeleteRestaurant();
    } else if (deleteType === 'menuItem' && menuItemToDelete) {
      await handleDeleteItem(menuItemToDelete);
    }
    setIsDeleteDialogOpen(false);
  };

  const openDeleteDialog = (type: 'restaurant' | 'menuItem', itemId?: string) => {
    setDeleteType(type);
    if (itemId) setMenuItemToDelete(itemId);
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

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete menu item');
      const updatedMenu = menu.filter(item => item.id !== itemId);
      setMenu(updatedMenu);
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
     <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center justify-center h-10 px-4 text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus: ring-offset-2 transition duration-150 ease-in-out font-bold">
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
              className="text-red-600"
              onClick={() => openDeleteDialog('restaurant')}
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
              Delete {deleteType === 'restaurant' ? 'Restaurant' : 'Menu Item'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this {deleteType === 'restaurant' ? 'restaurant' : 'menu item'}?
            This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEditing ? (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-xl font-semibold mb-4">Edit Restaurant Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editedRestaurant?.name || ''}
                onChange={(e) => setEditedRestaurant(prev => ({ ...prev!, name: e.target.value }))}
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
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={handleEditRestaurant}>Save Changes</Button>
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setEditedRestaurant(null);
            }}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="mb-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Details</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressFields
                address={restaurant.address}
                isEditing={false}
              />
              <p>Phone: {restaurant.phoneNumber}</p>
              <p>Opening Hours: {restaurant.openingHours}</p>
            </CardContent>
          </Card>
        </div>
      )}

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
            {menu.map((item) => (
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
                        className=" text-white rounded-md shadow-sm transition duration-200 flex items-center justify-center w-full"
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
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.description}</td>
                    <td className="py-2">${Number(item.price).toFixed(2)}</td>
                    <td className="py-2">{item.ratings}</td>
                    <td className="py-2">{item.discounts}</td>
                    <td className="py-2">
                      <img src={item.imageLink} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    </td>
                    <td className="py-2">
                      <Button onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></Button>
                    </td>
                    <td className="py-2">
                      <Button
                        onClick={() => openDeleteDialog('menuItem', item.id)}
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

        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Add New Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={newItem.name || ''} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={newItem.description || ''} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" value={newItem.price || ''} onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="ratings">Ratings</Label>
              <Input id="ratings" type="number" value={newItem.ratings || ''} onChange={(e) => setNewItem({ ...newItem, ratings: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="discounts">Discounts</Label>
              <Input id="discounts" type="number" value={newItem.discounts || ''} onChange={(e) => setNewItem({ ...newItem, discounts: parseFloat(e.target.value) })} />
            </div>
            <div>
              <Label htmlFor="imageLink">Image</Label>
              <Input id="imageLink" value={newItem.imageLink || ''} onChange={(e) => setNewItem({ ...newItem, imageLink: e.target.value })} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddItem}><Plus className="h-4 w-4 mr -2" /> Add Item</Button >
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default RestaurantDetails;