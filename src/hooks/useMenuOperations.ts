import { useState, useCallback, useEffect } from 'react';
import { MenuItem } from "@/components/types";
import { Session } from 'next-auth';
import { z } from 'zod';
import { MenuItemSchema } from "@/schema/MenuItemSchema";
import { useSession } from 'next-auth/react';

export const useMenuManagement = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const {data:session} = useSession()
  const [imageFile, setImageFile] = useState<string>('');

  const fetchMenu = useCallback(async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/restaurants/?id=${session.user.id}&menu=true`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to fetch menu");
      
      const data = await response.json();
      setMenu(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      let imageUploadResult = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/image/upload`, {
            method: 'POST',
            body: formData
          });
          if (!uploadResponse.ok) {
            throw new Error('Image upload failed');
          }

          const result = await uploadResponse.json();
          imageUploadResult = result.file?.filename;
        }
        catch (uploadError) {
          console.error('Image Upload Error:', uploadError);

        }
      }
      // Prepare item data with image links
      const itemData = {
        ...item,
        ...(imageUploadResult && { imageLink: "https://image.navya.so/" + imageUploadResult })

      };
      const validatedItem = MenuItemSchema.parse(itemData);
      
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

      if (!response.ok) throw new Error("Failed to add menu item");

      const addedItem = await response.json();
      setMenu(prevMenu => [...prevMenu, addedItem]);
      setImageFile("");
      return addedItem;
    } catch (error) {
      console.error("Error adding menu item:", error);
      throw error;
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    try {
      let imageUploadResult = '';
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        try {
          const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/image/upload`, {
            method: 'POST',
            body: formData
          });
          if (!uploadResponse.ok) {
            throw new Error('Image upload failed');
          }

          const result = await uploadResponse.json();
          imageUploadResult = result.file?.filename;
        }
        catch (uploadError) {
          console.error('Image Upload Error:', uploadError);

        }
      }
      // Prepare item data with image links
      const itemData = {
        ...item,
        ...(imageUploadResult && { imageLink: "https://image.navya.so/" + imageUploadResult })

      };
      const validatedItem = MenuItemSchema.parse(item);
      
      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(itemData),
        }
      );

      if (!response.ok) throw new Error("Failed to update menu item");

      const updatedItem = await response.json();
      setMenu(prevMenu => 
        prevMenu.map(menuItem => 
          menuItem.id === item.id ? updatedItem : menuItem
        )
      );
      setImageFile("");
      return updatedItem;
    } catch (error) {
      console.error("Error updating menu item:", error);
      throw error;
    }
  };

  const deleteMenuItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session?.user.token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete menu item");

      setMenu(prevMenu => prevMenu.filter(item => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting menu item:", error);
      throw error;
    }
  };

  const filteredMenu = useCallback(() => {
    return menu.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, searchTerm]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return {
    menu,
    filteredMenu: filteredMenu(),
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    imageFile,
    setImageFile
  };
};