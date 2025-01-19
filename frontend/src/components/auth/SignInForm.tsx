"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "./FormField";
import ReCAPTCHA from "react-google-recaptcha";

export const SignInForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const recaptcha = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // TODO: add signin logic
    const token = recaptcha.current?.getValue();
    if (!token) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Signed in successfully!",
    });
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Email"
        id="email"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
      />
      <FormField
        label="Password"
        id="password"
        name="password"
        type="password"
        required
        value={formData.password}
        onChange={handleChange}
      />
      <div className="flex justify-center items-center w-full my-4">
        <ReCAPTCHA
          ref={recaptcha}
          sitekey={String(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)}
        />
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
};
