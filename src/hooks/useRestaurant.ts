import { useState, useEffect } from "react";
import { Restaurant } from "@/components/types";
import { useSession } from "next-auth/react";

interface UseRestaurantReturn {
  restaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;
  fetchRestaurantDetails: () => Promise<void>;
  updateRestaurant: (updatedRestaurant: Restaurant) => Promise<void>;
}

const useRestaurant = (): UseRestaurantReturn => {
  const { data: session, status } = useSession();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurantDetails = async () => {
    if (status !== "authenticated") return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/restaurants?id=${session?.user.id}`, {
        headers: {
          Authorization: `Bearer ${session?.user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch restaurant details");
      }

      const data = await response.json();
      setRestaurant(data);
    } catch (err) {
      console.error("Error fetching restaurant details:", err);
      setError("Failed to load restaurant details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateRestaurant = async (updatedRestaurant: Restaurant) => {
    if (!updatedRestaurant) {
      throw new Error("No restaurant data to save.");
    }

    try {
      const response = await fetch(`/api/restaurants?id=${session?.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user.token}`,
        },
        body: JSON.stringify(updatedRestaurant),
      });

      if (!response.ok) throw new Error("Failed to update restaurant");

      const updatedData = await response.json();
      setRestaurant(updatedData); // Update restaurant state
    } catch (err) {
      console.error("Error updating restaurant:", err);
      setError("Failed to update restaurant. Please try again later.");
    }
  };

  useEffect(() => {
    fetchRestaurantDetails();
  }, [status]);

  return {
    restaurant,
    isLoading,
    error,
    fetchRestaurantDetails,
    updateRestaurant,
  };
};

export default useRestaurant;
