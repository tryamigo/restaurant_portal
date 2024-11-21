import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogFooter,
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomButton } from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { MenuItem } from "@/components/types";
import { initialObject } from "@/schema/MenuItemSchema";
import { VisuallyHidden } from '@reach/visually-hidden';

interface AddEditItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  formMode: 'add' | 'edit';
  newItem: Omit<MenuItem, "id">;
  setNewItem: (item: Omit<MenuItem, "id">) => void;
  validationErrors: { [key: string]: string };
  handleSubmit: () => void;
  setValidationErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setImageFile: React.Dispatch<React.SetStateAction<string>>;
}

const AddEditItemDialog: React.FC<AddEditItemDialogProps> = ({
  isOpen,
  onClose,
  formMode,
  newItem,
  setNewItem,
  validationErrors,
  setValidationErrors,
  handleSubmit,
  setImageFile
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
          <VisuallyHidden>
          <DialogTitle>My Dialog Title</DialogTitle>
          </VisuallyHidden>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
            <DialogHeader className="text">
              {formMode === 'add' ? 'Add New Menu Item' : 'Edit Menu Item'}
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Existing fields */}
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
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
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
                {validationErrors.description && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                )}
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
                  onChange={(e) => setNewItem({ ...newItem, price: Number(parseFloat(e.target.value).toFixed(2)) })}
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
                {validationErrors.price && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.price}</p>
                )}
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
                  onChange={(e) => setNewItem({
                    ...newItem,
                    ratings: Number(parseFloat(e.target.value).toFixed(2)),
                  })}
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
                {validationErrors.ratings && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.ratings}</p>
                )}
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
                  onChange={(e) => setNewItem({
                    ...newItem,
                    discounts: Number(parseFloat(e.target.value).toFixed(2)),
                  })}
                  className="w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
                />
                {validationErrors.discounts && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.discounts}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vegOrNonVeg">Veg/Non-Veg</Label>
                <Select
                  value={newItem.vegOrNonVeg}
                  onValueChange={(value) => setNewItem({ ...newItem, vegOrNonVeg: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Veg/Non-Veg" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Veg">Vegetarian</SelectItem>
                    <SelectItem value="Non-Veg">Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuisine">Cuisine</Label>
                <Input
                  id="cuisine"
                  placeholder="Enter cuisine type"
                  value={newItem.cuisine || ''}
                  onChange={(e) => setNewItem({ ...newItem, cuisine: e.target.value })}
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
              <CustomButton className="justify-center mt-2 md:mt-0" onClick={handleSubmit}>
                {formMode === 'add' ? 'Add Item' : 'Update Item'}
              </CustomButton>
              <Button
                onClick={() => {
                  setNewItem(initialObject);
                  setValidationErrors({})
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