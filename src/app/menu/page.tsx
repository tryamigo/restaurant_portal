"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, Restaurant } from "@/components/types";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

const MenuDetails: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>({
    name: "",
    description: "",
    price: 0,
    ratings: 0,
    discounts: 0,
    imageLink: "",
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchMenu();
    }
  }, [session, status]);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true`,
        {
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );
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

  const handleAddItem = async () => {
    if (newItem.name && newItem.description && newItem.price > 0) {
      try {
        const response = await fetch(
          `/api/restaurants/?id=${session?.user.id}&menu=true`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.user.token}`,
            },
            body: JSON.stringify(newItem),
          }
        );

        if (response.ok) {
          const addedItem = await response.json();
          setMenu([...menu, addedItem]);
          setNewItem({
            name: "",
            description: "",
            price: 0,
            discounts: 0,
            imageLink: "",
          });
          setIsAddItemDialogOpen(false); // Close dialog after adding
        } else {
          console.error("Failed to add menu item");
        }
      } catch (error) {
        console.error("Error adding menu item:", error);
      }
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
  };

  const handleEditChange = (
    itemId: string,
    field: keyof MenuItem,
    value: string | number
  ) => {
    setMenu((prevMenu) =>
      prevMenu.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };
  const handleSaveEdit = async () => {
    if (!editingItemId) return;

    try {
      const itemToUpdate = menu.find((item) => item.id === editingItemId);
      if (!itemToUpdate) throw new Error("Item not found");

      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${editingItemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(itemToUpdate),
        }
      );

      if (!response.ok) throw new Error("Failed to update menu item");
      const updatedItem = await response.json();
      const updatedMenu = menu.map((item) =>
        item.id === editingItemId ? updatedItem : item
      );
      setMenu(updatedMenu);
      setEditingItemId(null);
    } catch (error) {
      console.error("Error updating menu item:", error);
    }
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
      className="container mx-auto px-4 py-8"
    >
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Menu Details</h1>
            <Button
              onClick={() => setIsAddItemDialogOpen(true)}
              className="bg-white/10 text-white hover:bg-white/20 transition-colors duration-300 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

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
              ) : menu?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center space-y-4">
                      <Package className="w-16 h-16 text-gray-300" />
                      <p className="text-xl">No menu items found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                menu?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    {editingItemId === item.id ? (
                      // Editing Mode
                      <>
                        <td className="px-6 py-4">
                          <Input
                            value={item.name || ""}
                            onChange={(e) =>
                              handleEditChange(item.id, "name", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={item.description || ""}
                            onChange={(e) =>
                              handleEditChange(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={item.price || ""}
                            onChange={(e) =>
                              handleEditChange(
                                item.id,
                                "price",
                                e.target.value ? parseFloat(e.target.value) : 0
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={item.ratings || ""}
                            onChange={(e) =>
                              handleEditChange(
                                item.id,
                                "ratings",
                                e.target.value ? parseFloat(e.target.value) : 0
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            type="number"
                            value={item.discounts || ""}
                            onChange={(e) =>
                              handleEditChange(
                                item.id,
                                "discounts",
                                e.target.value ? parseFloat(e.target.value) : 0
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4">
                          <Input
                            value={item.imageLink || ""}
                            onChange={(e) =>
                              handleEditChange(
                                item.id,
                                "imageLink",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="px-6 py-4 flex space-x-2">
                          <Button
                            onClick={handleSaveEdit}
                            className="text-white "
                          >
                            <Save className="h-4 w-4 mr-2" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            variant="destructive"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="px-6 py-4">{item.name}</td>
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
                          <Button
                            onClick={() => handleEditItem(item)}
                            variant="ghost"
                            size="lg"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(item.id)}
                            variant="destructive"
                            size="lg"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent className="sm: max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Menu Item</DialogTitle>
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
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
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
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
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
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: parseFloat(e.target.value) })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
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
                value={newItem.ratings}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    ratings: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
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
                value={newItem.discounts}
                onChange={(e) =>
                  setNewItem({
                    ...newItem,
                    discounts: parseFloat(e.target.value),
                  })
                }
                className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
              />
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
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddItem}
              className=""
            >
              Add Item
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsAddItemDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {" "}
        <DialogContent>
          {" "}
          <DialogHeader>
            {" "}
            <DialogTitle> Delete Menu Item </DialogTitle>{" "}
          </DialogHeader>{" "}
          <DialogDescription>
            {" "}
            Are you sure you want to delete this menu item? This action cannot
            be undone.{" "}
          </DialogDescription>{" "}
          <DialogFooter>
            {" "}
            <Button variant="destructive" onClick={handleDeleteItem}>
              {" "}
              Delete{" "}
            </Button>{" "}
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              {" "}
              Cancel{" "}
            </Button>{" "}
          </DialogFooter>{" "}
        </DialogContent>{" "}
      </Dialog>
    </motion.div>
  );
};

export default MenuDetails;
