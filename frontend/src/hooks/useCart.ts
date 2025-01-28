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

      // fetch seller details
      const sellerIDs = data.map((item: any) => item.item.seller);
      const sellers: { [key: string]: any } = {};

      // Fetch seller details
      await Promise.all(
        sellerIDs.map(async (id: string) => {
          if (!sellers[id]) {
            const { data } = await api.get(`/users/${id}`);
            sellers[id] = data;
          }
        })
      );

      // Transform backend data to match frontend interface
      return data.map((item: any) => ({
        id: item._id,
        name: item.item.name,
        price: item.item.price,
        bargainedPrice:
          item.bargainRequest?.status === "ACCEPTED"
            ? item.bargainRequest.price
            : null,
        quantity: item.quantity,
        image: item.item.images[0], // Assuming first image is main
        seller: {
          id: item.item.seller,
          name: `${sellers[item.item.seller].user.firstName} ${
            sellers[item.item.seller].user.lastName
          }`,
          email: sellers[item.item.seller].user.email,
        },
        bargainStatus: item.bargainRequest?.status || "NONE",
      }));
    } catch (error: any) {
      toast({
        title: "Failed to fetch cart",
        description: error.response?.data?.message || "Please try again later",
        variant: "destructive",
      });
      return [];
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      await api.delete(`/cart/${itemId}`);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to remove item",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const bargainItem = async (
    itemId: string,
    price: number,
    message: string
  ) => {
    try {
      const { data } = await api.post(`/cart/${itemId}/bargain`, {
        price,
        message,
      });
      toast({
        title: "Bargain request sent",
        description: "The seller will be notified of your offer.",
      });
      return true;
    } catch (error: any) {
      toast({
        title: "Failed to send bargain request",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return false;
    }
  };

  const getCartCount = async () => {
    try {
      const { data } = await api.get("/cart/count");
      return data.count;
    } catch (error: any) {
      toast({
        title: "Failed to fetch cart count",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
      return 0;
    }
  };

  return {
    addToCart,
    getCart,
    removeFromCart,
    bargainItem,
    isLoading,
    getCartCount,
  };
};
