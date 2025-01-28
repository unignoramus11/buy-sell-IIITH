import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useSeller = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getDashboardStats = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/items/stats");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch stats",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSellerItems = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/items/seller");
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch items",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBargainRequest = async (
    cartItemId: string,
    action: "accept" | "reject" | "counter",
    counterPrice?: number
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/cart/${cartItemId}/bargain-response`, {
        action,
        counterPrice,
      });
      toast({
        title: "Bargain request handled",
        description: `Bargain request ${action}ed successfully.`,
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to handle bargain",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    getDashboardStats,
    getSellerItems,
    handleBargainRequest,
    isLoading,
  };
};
