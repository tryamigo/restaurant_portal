"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, Restaurant } from "@/components/types";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  Edit,
  Plus,
  Save,
  Trash2,
  X,
  ArrowLeftIcon,
  Package,
  Search,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import Header from "@/components/Header";
import { CustomButton } from "@/components/CustomButton";
const MenuItemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  description: z.string().min(5, { message: "Description must be at least 5 characters long" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  ratings: z.number().min(0, { message: "Ratings must be between 0 and 5" }).max(5, { message: "Ratings must be between 0 and 5" }),
  discounts: z.number().min(0, { message: "Discount must be between 0 and 100" }).max(100, { message: "Discount must be between 0 and 100" }),
  imageLink: z.string().url({ message: "Invalid image URL" }).optional().or(z.literal('')),
});

const MenuDetails: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    ratings: 0,
    discounts: 0,
    imageLink: "",
  });
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentEditItem, setCurrentEditItem] = useState<MenuItem | null>(null);
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMenu();
    }
  }, [session, status]);

  useEffect(() => {
    filterMenu();
  }, [menu, searchTerm]);

  const filterMenu = () => {
    let filtered = menu;

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMenu(filtered);
  };

  const fetchMenu = async () => {
    console.log("Your user id", session?.user.id);
    console.log("Your Toke id", session?.user.token);
    setIsLoading(true);
    try {
      // Construct absolute URL
      const apiUrl = `http://localhost:3001/restaurants/?id=${session?.user.id}&menu=true`;
  
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        }
      });


  
      if (!response.ok) {
        throw new Error("Failed to fetch menu");
      }
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      console.error("Error updating restaurant:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  const openDeleteDialog = (itemId?: string) => {
    if (itemId) setMenuItemToDelete(itemId);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitItem = async () => {
    try {
      // Validate the item
      const validatedItem = MenuItemSchema.parse(newItem);

      // Clear previous validation errors
      setValidationErrors({});

      if (formMode === 'add') {
        // Add new item logic
        const response = await fetch(
          `/api/restaurants/?id=${session?.user.id}&menu=true`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
            body: JSON.stringify(validatedItem),
          }
        );

        if (response.ok) {
          const addedItem = await response.json();
          setMenu([...menu, addedItem]);
        } else {
          console.error("Failed to add menu item");
        }
      } else {
        // Edit existing item logic
        if (!currentEditItem) return;
        const response = await fetch(
          `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${currentEditItem.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
            body: JSON.stringify({ ...currentEditItem, ...validatedItem }),
          }
        );

        if (response.ok) {
          const updatedItem = await response.json();
          setMenu(menu.map(item =>
            item.id === currentEditItem.id ? updatedItem : item
          ));
        } else {
          console.error("Failed to update menu item");
        }
      }

      // Reset form and close dialog
      setNewItem({
        name: "",
        description: "",
        price: 0,
        ratings: 0,
        discounts: 0,
        imageLink: "",
      });
      setIsAddItemDialogOpen(false);
      setCurrentEditItem(null);
      setFormMode('add');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {} as { [key: string]: string });
        setValidationErrors(errors);
      }
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setCurrentEditItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: Number(item.price),
      ratings: Number(item.ratings),
      discounts: Number(item.discounts),
      imageLink: item.imageLink || '',
    });
    setFormMode('edit');
    setIsAddItemDialogOpen(true);
  };
  const handleDeleteItem = async () => {
    if (!menuItemToDelete) return;
    try {
      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${menuItemToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to delete menu item");
      const updatedMenu = menu.filter((item) => item.id !== menuItemToDelete);
      setMenu(updatedMenu);
      setIsDeleteDialogOpen(false);
      setMenuItemToDelete(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };
  const handleDialogClose = () => {
    setIsAddItemDialogOpen(false);
    setNewItem({
      name: "",
      description: "",
      price: 0,
      ratings: 0,
      discounts: 0,
      imageLink: "",
    });
    setValidationErrors({});
    setFormMode('add');
    setCurrentEditItem(null);
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
    <>
       <Header 
                onAddItem={() => setIsAddItemDialogOpen(true)}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />
   
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12"
    >
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
   
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {[
                  "Item",
                  "Description",
                  "Price",
                  "Ratings",
                  "Discounts",
                  "Image",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      {Array(7)
                        .fill(0)
                        .map((_, colIndex) => (
                          <td key={colIndex} className="px-6 py-4">
                            <Skeleton className="h-8 w-full" />
                          </td>
                        ))}
                    </tr>
                  ))
              ) : filteredMenu?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center space-y-4">
                    <Search className="w-16 h-16 text-gray-300" />
                        <p className="text-xl">
                          {searchTerm ? "No menu items found" : "No menu items available"}
                        </p>
                    </div>
                  </td>
                </tr>
              ) :
                (
                  filteredMenu?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4" data-testid="itemname" >{item.name}</td>
                      <td className="px-6 py-4">{item.description}</td>
                      <td className="px-6 py-4">
                        ₹{Number(item.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">{item.ratings}</td>
                      <td className="px-6 py-4">{item.discounts}%</td>
                      <td className="px-6 py-4">
                        <Image
                          src={item.imageLink || ""}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-6 py-4 flex space-x-2">
                        <CustomButton
                          onClick={() => handleEditItem(item)}
                          className="w-20"                          
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </CustomButton>
                        <Button
                          onClick={() => openDeleteDialog(item.id)}
                          variant="destructive"
                          size="lg"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleDialogClose();
        }
        setIsAddItemDialogOpen(open);
      }}
      >
        <DialogContent className="sm: max-w-lg">
          <DialogHeader className="text">
            {formMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label
                htmlFor="name"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Item Name
              </Label>
              <Input
                id="name"
                placeholder="Enter item name"
                value={newItem.name || ''}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Description
              </Label>
              <Input
                id="description"
                placeholder="Item description"
                value={newItem.description || ''}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.description && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="price"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Price
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={newItem.price||''}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: Number(parseFloat(e.target.value).toFixed(2)) })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.price && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="ratings"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Ratings
              </Label>
              <Input
                id="ratings"
                type="number"
                placeholder="0-5"
                min="0"
                max="5"
                value={newItem.ratings||''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    ratings: Number(parseFloat(e.target.value).toFixed(2)),
                  })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.ratings && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.ratings}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="discounts"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Discount (%)
              </Label>
              <Input
                id="discounts"
                type="number"
                placeholder="0-100"
                min="0"
                max="100"
                value={newItem.discounts||''}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    discounts: Number(parseFloat(e.target.value).toFixed(2)),
                  })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.discounts && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.discounts}</p>
              )}
            </div>
            <div>
              <Label
                htmlFor="imageLink"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Image URL
              </Label>
              <Input
                id="imageLink"
                placeholder="https://example.com/image.jpg"
                value={newItem.imageLink}
                onChange={(e) =>
                  setNewItem({ ...newItem, imageLink: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
              {validationErrors.imageLink && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.imageLink}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <CustomButton
              onClick={handleSubmitItem}
            >
              {formMode === 'add' ? 'Add Item' : 'Update Item'}
            </CustomButton>
            <Button
              onClick={() => {
                setNewItem({
                  name: "",
                  description: "",
                  price: 0,
                  ratings: 0,
                  discounts: 0,
                  imageLink: "",
                });
                setValidationErrors({})
                setIsAddItemDialogOpen(false)}}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle> Delete Menu Item </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this menu item? This action cannot
            be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
            <CustomButton
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
    </>
  );
};

export default MenuDetails;
