import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomButton } from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { MenuItem } from "@/components/types";
import { initialObject } from "@/schema/MenuItemSchema";
import { Textarea } from "@/components/ui/textarea";

interface AddEditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: "add" | "edit";
  newItem: Omit<MenuItem, "id">;
  setNewItem: (item: Omit<MenuItem, "id">) => void;
  validationErrors: { [key: string]: string };
  handleSubmit: () => void;
  setImageFile: React.Dispatch<React.SetStateAction<string>>;
  validateInput: (name: string, value: string) => void;
}

const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
  isOpen,
  onClose,
  formMode,
  newItem,
  setNewItem,
  validationErrors,
  handleSubmit,
  setImageFile,
  validateInput,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
        aria-describedby={undefined}
      >
        <DialogTitle className="text-lg text-center md:text-xl text md:justify-start">
          {formMode === "add" ? "Add New Menu Item" : "Edit Menu Item"}
        </DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing fields */}
          <div>
            <Label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
            >
              Item Name
            </Label>
            <Input
              id="name"
              required
              placeholder="Enter item name"
              value={newItem.name || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({ ...newItem, name: value });
                validateInput("name", value);
              }}
              className="w-full dark:bg-slate-700 dark:text-white"
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="description"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
            >
              Description
            </Label>
            <Textarea
              id="description"
              required
              placeholder="Item description"
              value={newItem.description || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({ ...newItem, description: value });
                validateInput("description", value);
              }}
              className="w-full dark:bg-slate-700 dark:text-white"
            />
            {validationErrors.description && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.description}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="price"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
            >
              Price
            </Label>
            <Input
              id="price"
              required
              type="number"
              placeholder="0.00"
              value={newItem.price || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({
                  ...newItem,
                  price: Number(parseFloat(value).toFixed(2)),
                });
                validateInput("price", value);
              }}
              className="w-full dark:bg-slate-700 dark:text-white"
            />
            {validationErrors.price && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.price}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="ratings"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
            >
              Ratings
            </Label>
            <Input
              id="ratings"
              required
              type="number"
              placeholder="0-5"
              min="0"
              max="5"
              value={newItem.ratings || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({
                  ...newItem,
                  ratings: Math.round(Number(value)), // Use Math.round to store the rating as an integer
                });
                validateInput("ratings", value);
              }}
              className="w-full dark:bg-slate-700 dark:text-white"
            />

            {validationErrors.ratings && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.ratings}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="discounts"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-white"
            >
              Discount (%)
            </Label>
            <Input
              id="discounts"
              required
              type="number"
              placeholder="0-100"
              min="0"
              max="100"
              value={newItem.discounts || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({
                  ...newItem,
                  discounts: Number(parseFloat(value).toFixed(2)),
                });
                validateInput("discounts", value);
              }}
              className="w-full dark:bg-slate-700 dark:text-white"
            />
            {validationErrors.discounts && (
              <p className="text-red-500 text-sm mt-1">
                {validationErrors.discounts}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="vegOrNonVeg" className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">Veg/Non-Veg</Label>
            <Select
              value={newItem.vegOrNonVeg}
              onValueChange={(value) => {
                setNewItem({ ...newItem, vegOrNonVeg: value });
                validateInput("vegOrNonVeg", value);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Veg/Non-Veg"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Veg">Vegetarian</SelectItem>
                <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="cuisine" className="block mb-2 text-sm font-medium text-gray-700 dark:text-white">Cuisine</Label>
            <Input
              id="cuisine"
              className="w-full dark:bg-slate-700 dark:text-white"
              placeholder="Enter cuisine type"
              value={newItem.cuisine || ""}
              onChange={(e) => {
                const value = e.target.value;
                setNewItem({ ...newItem, cuisine: value });
                validateInput("cuisine", value);
              }}
            />
          </div>

          {/* Image Upload takes full width */}
          <div className="md:col-span-2">
            <ImageUpload
              onImageUpload={(file: any) => {
                // Ensure file is not null and is a File object
                if (file) {
                  setImageFile(file);
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <CustomButton
            className="justify-center mt-2 md:mt-0"
            onClick={handleSubmit}
          >
            {formMode === "add" ? "Add Item" : "Update Item"}
          </CustomButton>
          <Button
            onClick={() => {
              setNewItem(initialObject);
              onClose();
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddEditItemDialog;
