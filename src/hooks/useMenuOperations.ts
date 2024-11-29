import { useState, useCallback, useEffect } from "react";
import { MenuItem } from "@/components/types";
import { useSession } from "next-auth/react";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { MenuItemSchema } from "@/schema/MenuItemSchema";

export const useMenuManagement = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { data: session } = useSession();
  const [imageFile, setImageFile] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});

  const validateInput = (name: string, value: string) => {
    try {
      let parsedValue: any = value.trim(); // Trim any surrounding whitespace
      const schemaType =
        MenuItemSchema.shape[name as keyof typeof MenuItemSchema.shape];

      if (schemaType instanceof z.ZodNumber) {
        if (parsedValue === "") {
          throw new Error("This field is required.");
        }

        if (isNaN(Number(parsedValue))) {
          throw new Error(`Expected a number, but received '${value}'`);
        }
        parsedValue = Number(parsedValue);
      }
      schemaType.parse(parsedValue);

      // Clear any previous validation errors
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errMessage = error.errors?.[0]?.message || "Invalid input";
        setValidationErrors((prev) => ({ ...prev, [name]: errMessage }));
      } else {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        setValidationErrors((prev) => ({ ...prev, [name]: errorMessage }));
      }
    }
  };

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
      toast({
        title: "Error",
        description: "Failed to fetch Menu Items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const handleValidationErrors = (zodError: z.ZodError) => {
    const errors: { [key: string]: string } = {};
    zodError.errors.forEach((err) => {
      if (err.path.length > 0) {
        errors[err.path[0]] = err.message;
      }
    });
    setValidationErrors(errors);
  };

  const addMenuItem = async (item: Omit<MenuItem, "id">) => {
    try {
      setValidationErrors({}); // Clear previous errors
      let imageUploadResult = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        try {
          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          if (!uploadResponse.ok) {
            throw new Error("Image upload failed");
          }

          const result = await uploadResponse.json();
          imageUploadResult = result.file?.filename;
        } catch (uploadError) {
          console.error("Image Upload Error:", uploadError);
        }
      }

      const itemData = {
        ...item,
        ...(imageUploadResult && {
          imageLink: "https://image.navya.so/" + imageUploadResult,
        }),
      };

      const validatedItem = MenuItemSchema.parse(itemData); // Validate using Zod

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

      toast({
        title: "Success",
        description: "Item added successfully",
      });

      const addedItem = await response.json();
      setMenu((prevMenu) => [...prevMenu, addedItem]);
      setImageFile("");
      return addedItem;
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleValidationErrors(error);
      } else {
        toast({
          title: "Error",
          description: "Failed to add Item",
          variant: "destructive",
        });
        console.error("Error adding menu item:", error);
      }
      throw error;
    }
  };

  const updateMenuItem = async (item: MenuItem) => {
    try {
      setValidationErrors({}); // Clear previous errors
      let imageUploadResult = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        try {
          const uploadResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          if (!uploadResponse.ok) {
            throw new Error("Image upload failed");
          }

          const result = await uploadResponse.json();
          imageUploadResult = result.file?.filename;
        } catch (uploadError) {
          console.error("Image Upload Error:", uploadError);
        }
      }

      const itemData = {
        ...item,
        imageLink: imageUploadResult
          ? `https://image.navya.so/${imageUploadResult}`
          : item.imageLink || "",
      };

      const validatedItem = MenuItemSchema.parse(itemData); // Validate using Zod

      const response = await fetch(
        `/api/restaurants/?id=${session?.user.id}&menu=true&menuItemId=${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user.token}`,
          },
          body: JSON.stringify(validatedItem),
        }
      );

      if (!response.ok) throw new Error("Failed to update menu item");

      toast({
        title: "Success",
        description: "Item updated successfully",
      });

      const updatedItem = await response.json();
      setMenu((prevMenu) =>
        prevMenu.map((menuItem) =>
          menuItem.id === item.id ? updatedItem : menuItem
        )
      );
      setImageFile("");
      return updatedItem;
    } catch (error) {
      if (error instanceof z.ZodError) {
        handleValidationErrors(error);
      } else {
        toast({
          title: "Error",
          description: "Failed to update Item",
          variant: "destructive",
        });
        console.error("Error updating menu item:", error);
      }
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
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });

      setMenu((prevMenu) => prevMenu.filter((item) => item.id !== itemId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete Item",
        variant: "destructive",
      });
      console.error("Error deleting menu item:", error);
      throw error;
    }
  };

  const filteredMenu = useCallback(() => {
    return menu.filter(
      (item) =>
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
    validationErrors,
    isLoading,
    error,
    searchTerm,
    setSearchTerm,
    fetchMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    imageFile,
    setImageFile,
    validateInput,
  };
};
