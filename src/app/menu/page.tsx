"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItemRow } from "@/components/MenuItemRow";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuManagement } from "@/hooks/useMenuOperations";
import { MenuItem } from "@/components/types";
import { initialObject } from "@/schema/MenuItemSchema";
import Header from "@/components/Header";
import AddEditItemDialog from "@/components/AddEditItemDialog";
import DeleteConfirmationDialog from "@/components/DeleteConfirmationDialog";
import DescriptionDialog from "@/components/DescriptionDialog";
import { ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

const MenuDetails: React.FC = () => {
  const {
    validationErrors,
    filteredMenu,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    categoryFilter,
    setCategoryFilter,
    imageFile,
    setImageFile,
    validateInput,
  } = useMenuManagement();

  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [currentEditItem, setCurrentEditItem] = useState<MenuItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<MenuItem, "id">>(initialObject);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Adjust the number of items per page

  const totalPages = Math.ceil(filteredMenu.length / itemsPerPage);

  // Handle pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredMenu.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEditItem = (item: MenuItem) => {
    setCurrentEditItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      price: Number(item.price),
      ratings: Number(item.ratings),
      discounts: Number(item.discounts),
      vegOrNonVeg: item.vegOrNonVeg,
      cuisine: item.cuisine,
    });
    setFormMode("edit");
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
      if (formMode === "add") {
        await addMenuItem(newItem);
      } else if (currentEditItem) {
        await updateMenuItem({ ...currentEditItem, ...newItem });
      }
      setNewItem(initialObject);
      setIsAddItemDialogOpen(false);
      setCurrentEditItem(null);
      setFormMode("add");
    } catch (error) {
      console.error("Error submitting item:", error);
    }
  };

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

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  return (
    <>
      <Header
        onAddItem={() => {
          setIsAddItemDialogOpen(true);
          setCurrentEditItem(null);
          setNewItem(initialObject);
          setFormMode("add");
        }}
        searchTerm={searchTerm}
        setSearchTerm={handleSearchChange}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-6 md:py-12 pt-[12rem]"
      >
        <div className="bg-white shadow-lg rounded-xl overflow-hidden overflow-x-auto dark:bg-gray-800 dark:shadow-none">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                {[
                  "Image",
                  "Item",
                  "Price",
                  "Cuisines",
                  "Category",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <AnimatePresence>
                {isLoading ? (
                  Array(7)
                    .fill(0)
                    .map((_, index) => (
                      <tr key={index}>
                        {Array(6)
                          .fill(0)
                          .map((_, colIndex) => (
                            <td key={colIndex} className="px-6 py-4">
                              <Skeleton className="h-8 w-full" />
                            </td>
                          ))}
                      </tr>
                    ))
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-gray-500 dark:bg-slate-800"
                    >
                      <div className="flex flex-col items-center justify-center space-y-4 h-full">
                        <ListOrdered className="w-16 h-16 text-gray-300" />
                        <p className="text-xl">
                          {searchTerm
                            ? "No menu items found"
                            : "No menu items available"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      setSelectedImage={setSelectedImage}
                      selectedImage={selectedImage}
                      onEdit={handleEditItem}
                      onDelete={(id) => {
                        setMenuItemToDelete(id);
                        setIsDeleteDialogOpen(true);
                      }}
                      onClick={() => {
                        setCurrentEditItem(item);
                        setIsDescriptionDialogOpen(true);
                      }}
                    />
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
          {/* Pagination Controls */}
          {filteredMenu.length > itemsPerPage && (
            <div className="flex justify-center mt-4 mb-3">
              <Button
                className="px-4 py-2 mx-2 bg-gray-500 rounded hover:dark:bg-gray-700"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
              >
                Previous
              </Button>
              <span className="px-4 py-2 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                className="px-4 py-2 mx-2 bg-gray-500 rounded hover:dark:bg-gray-700"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <AddEditItemDialog
          isOpen={isAddItemDialogOpen}
          onClose={() => setIsAddItemDialogOpen(false)}
          formMode={formMode}
          newItem={newItem}
          setNewItem={setNewItem}
          validationErrors={validationErrors}
          handleSubmit={handleSubmitItem}
          setImageFile={setImageFile}
          validateInput={validateInput}
        />

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirmDelete={handleDeleteItem}
        />

        {currentEditItem && (
          <DescriptionDialog
            isOpen={isDescriptionDialogOpen}
            onClose={() => setIsDescriptionDialogOpen(false)} // Close dialog on button click
            item={currentEditItem}
          />
        )}
      </motion.div>
    </>
  );
};

export default MenuDetails;
