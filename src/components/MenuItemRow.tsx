import React from 'react';
import Image from 'next/image';
import { MenuItem } from "@/components/types";
import { Edit, Trash2, Package } from "lucide-react";
import { CustomButton } from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from './ui/dialog';

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onImageView?: (imageLink: string) => void;
  setSelectedImage:React.Dispatch<React.SetStateAction<string | null>>
  selectedImage:string|null
}

export const MenuItemRow: React.FC<MenuItemRowProps> = React.memo(({
  item, 
  onEdit, 
  onDelete,
  onImageView,
  setSelectedImage,
  selectedImage
}) => {
  return (
    <tr key={item.id} className="hover:bg-gray-50">
        <td className="px-6 py-4 relative">
      {item.imageLink ? (
        <>
          <Image
            src={item.imageLink}
            alt={item.name}
            width={50}
            height={50}
            className="object-cover rounded-md cursor-pointer"
            onClick={() => setSelectedImage(item.imageLink||'')}
          />

          {/* Modal for full image view */}
          {selectedImage && (
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
              <DialogContent className="w-full">
                <div className="flex justify-center items-center">
                  <Image
                    src={selectedImage}
                    alt="Full Image"
                    width={400}
                    height={400}
                    className="max-h-[70vh] object-contain"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      ) : (
        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-md">
          <Package className="w-6 h-6 text-gray-400" />
        </div>
      )}
    </td>
    <td className="px-6 py-4">{item.name}</td>
    <td className="px-6 py-4">{item.description}</td>
    <td className="px-6 py-4">
      ₹{Number(item.price).toFixed(2)}
    </td>
    <td className="px-6 py-4">{item.ratings}</td>
    <td className="px-6 py-4">{item.discounts}%</td>
    <td className="px-6 py-4">{item.cuisine}</td>
    <td className="px-6 py-4">{item.vegOrNonVeg}</td>
    <td className="px-6 py-6 flex space-x-5">
      <Edit
        onClick={()=>onEdit(item)}
        cursor={"pointer"}
        data-testid="edit-item"
      >
      </Edit>
      <Trash2
        onClick={() => onDelete(item.id as string)}
        cursor={"pointer"}
        data-testid="delete-item"
      >
      </Trash2>
    </td>
  </tr>
  );
});
