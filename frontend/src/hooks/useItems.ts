import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useItems = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createItem = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const quantity = formData.get("quantity");
      const name = formData.get("name");

      formData.set("quantity", "1");

      for (let i = 0; i < Number(quantity); i++) {
        if (Number(quantity) > 1)
          formData.set("name", `${name} (${i + 1}/${quantity})`);
        await api.post("/items", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      toast({
        title: "Item created",
        description: "Your item has been listed successfully.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Failed to create item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getItems = async (params?: any) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/items", { params });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch items",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return { createItem, getItems, isLoading };
};
