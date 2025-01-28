import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const login = async (
    email: string,
    password: string,
    recaptchaToken: string
  ) => {
    setIsLoading(true);
    const recaptchaAction = "login";
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        recaptchaToken,
        recaptchaAction,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      router.push("/explore");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description:
          error.response?.data?.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (formData: any, recaptchaToken: string) => {
    setIsLoading(true);
    const recaptchaAction = "login";
    try {
      const { data } = await api.post("/auth/register", {
        ...formData,
        recaptchaToken,
        recaptchaAction,
      });

      toast({
        title: "Registration successful",
        description: "Please check your email for verification.",
      });

      router.push("/auth/login");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  return { login, register, logout, isLoading };
};
