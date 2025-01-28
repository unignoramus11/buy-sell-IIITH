import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useCart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addToCart = async (itemId: string, quantity: number) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/cart", { itemId, quantity });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getCart = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/cart");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch cart",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const bargainItem = async (
    cartItemId: string,
    price: number,
    message: string
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/cart/${cartItemId}/bargain`, {
        price,
        message,
      });
      toast({
        title: "Bargain request sent",
        description: "The seller will be notified of your offer.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to send bargain request",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return { addToCart, getCart, bargainItem, isLoading };
};
