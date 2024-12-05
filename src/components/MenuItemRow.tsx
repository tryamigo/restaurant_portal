import React from "react";
import Image from "next/image";
import { MenuItem } from "@/components/types";
import { Edit, Trash2, Package } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MenuItemRowProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onImageView?: (imageLink: string) => void;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  selectedImage: string | null;
  onClick: () => void;
}

export const MenuItemRow: React.FC<MenuItemRowProps> = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    onImageView,
    setSelectedImage,
    selectedImage,
    onClick,
  }) => {
    return (
      <tr key={item.id} className="hover:bg-gray-50 hover:dark:bg-gray-800"
  >
      <td className="px-6 py-4 relative">
        {item.imageLink ? (
          <>
            <Image
              src={item.imageLink}
              alt={item.name}
              width={50}
              height={50}
              className="object-cover rounded-md cursor-pointer"
              onClick={() => setSelectedImage(item.imageLink || "")}
            />
    
            {/* Modal for full image view */}
            {selectedImage && (
              <Dialog
                open={!!selectedImage}
                onOpenChange={() => setSelectedImage(null)}
              >
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
      <td className="px-6 py-4 relative cursor-pointer" onClick={onClick}>
        {item.name.length > 15 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="truncate max-w-[70px]">{item.name}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div>{item.name}</div>
        )}
      </td>
      <td className="px-6 py-4 cursor-pointer" onClick={onClick}>₹{Number(item.price).toFixed(2)}</td>
      <td className="px-6 py-4 relative cursor-pointer" onClick={onClick}>
        { (item.cuisine ?? "").length > 15 ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="truncate max-w-[70px]">{item.cuisine}</div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.cuisine}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div>{item.cuisine}</div>
        )}
      </td>
      <td className="px-6 py-4 cursor-pointer" onClick={onClick}>{item.vegOrNonVeg}</td>
      <td className="px-6 py-6 flex space-x-5">
        <Edit
          className="mt-[1px]"
          onClick={() => onEdit(item)}
          cursor="pointer"
        />
        <Trash2
          onClick={() => onDelete(item.id as string)}
          cursor="pointer"
        />
      </td>
    </tr>
    
    );
  }
);
