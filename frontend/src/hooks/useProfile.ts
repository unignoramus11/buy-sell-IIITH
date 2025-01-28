import { useState } from "react";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getProfile = async (userId: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/users/${userId}`);
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to fetch profile",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const updateProfile = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const { data } = await api.patch("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to update profile",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const updatePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.patch("/users/password", {
        currentPassword,
        newPassword,
      });
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const createReview = async (
    userId: string,
    rating: number,
    comment: string
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.post(`/users/${userId}/reviews`, {
        rating,
        comment,
      });
      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully.",
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Failed to submit review",
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
    getProfile,
    updateProfile,
    updatePassword,
    createReview,
    isLoading,
  };
};
