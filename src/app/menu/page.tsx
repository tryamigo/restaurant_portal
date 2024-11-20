'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { MenuItemRow } from "@/components/MenuItemRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuManagement } from '@/hooks/useMenuOperations';
import { MenuItem } from '@/components/types';
import { initialObject } from '@/schema/MenuItemSchema';
import Header from '@/components/Header';
import AddEditItemDialog from '@/components/AddEditItemDialog';
import DeleteConfirmationDialog from '@/components/DeleteConfirmationDialog';
import { Search } from 'lucide-react';

const MenuDetails: React.FC = () => {
  const {
    filteredMenu,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    imageFile,
    setImageFile,
  } = useMenuManagement();

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [currentEditItem, setCurrentEditItem] = useState<MenuItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>(initialObject);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleEditItem = (item: MenuItem) => {
    setCurrentEditItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: Number(item.price),
      ratings: Number(item.ratings),
      discounts: Number(item.discounts),
      vegOrNonVeg: item.vegOrNonVeg,
      cuisine: item.cuisine
    });
    setFormMode('edit');
    setIsAddItemDialogOpen(true);
  };

  const handleDeleteItem = async () => {
    if (!menuItemToDelete) return;
    try {
      await deleteMenuItem(menuItemToDelete);
      setIsDeleteDialogOpen(false);
      setMenuItemToDelete(null);
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  const handleSubmitItem = async () => {
    try {
      if (formMode === 'add') {
        await addMenuItem(newItem);
      } else if (currentEditItem) {
        await updateMenuItem({ ...currentEditItem, ...newItem });
      }
      setNewItem(initialObject);
      setIsAddItemDialogOpen(false);
      setCurrentEditItem(null);
      setFormMode('add');
    } catch (error) {
      console.error("Error submitting item:", error);
      // Handle validation errors if needed
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto p-6 max-w-4xl"
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
        <div className="text-red-500">{error}</div>
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
        className="container mx-auto px-4 py-6 md:py-12 pt-[12rem]"
      >
        <div className="bg-white shadow-lg rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {["Item", "Description", "Price", "Ratings", "Discounts", "Image", "Cuisines", "Category", "Actions"].map(header => (
                  <th key={header} className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                ) : filteredMenu.length === 0 ? (
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
                ) : (
                filteredMenu.map(item => (
                  <MenuItemRow
                    key={item.id}
                    item={item}
                    setSelectedImage={setSelectedImage}
                    selectedImage={selectedImage}
                    onEdit={handleEditItem}
                    onDelete={id => {
                      setMenuItemToDelete(id);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        <AddEditItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setIsAddItemDialogOpen(false)}
          formMode={formMode}
          newItem={newItem}
          setNewItem={setNewItem}
          validationErrors={validationErrors}
          handleSubmit={handleSubmitItem}
          setValidationErrors={setValidationErrors}
          setImageFile={setImageFile}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteItem}
 />
      </motion.div>
    </>
  );
};

export default MenuDetails;