import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useOrders = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createOrder = async (cartItemIds: string[], recaptchaToken: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/orders", {
        cartItemIds,
        recaptchaToken,
      });
      toast({
        title: "Order placed successfully",
        description: "Check your orders page for OTP and delivery status.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to place order",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const getOrders = async (type?: string, status?: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/orders", {
        params: { type, status },
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch orders",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const verifyDelivery = async (orderId: string, otp: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/orders/verify-delivery", {
        orderId,
        otp,
      });
      toast({
        title: "Delivery verified",
        description: "Order has been marked as delivered.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const regenerateOTP = async (orderId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/orders/${orderId}/regenerate-otp`);
      toast({
        title: "OTP regenerated",
        description: "New OTP has been generated.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to regenerate OTP",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  return {
    createOrder,
    getOrders,
    verifyDelivery,
    regenerateOTP,
    isLoading,
  };
};
