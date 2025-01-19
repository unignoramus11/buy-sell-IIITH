"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "./FormField";
import ReCAPTCHA from "react-google-recaptcha";

export const SignUpForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    age: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const recaptcha = useRef<ReCAPTCHA>(null);

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const token = recaptcha.current?.getValue();
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email.match(/^[a-zA-Z0-9._%+-]+@[^\s]+\.iiit\.ac\.in$/)) {
      toast({
        title: "Error",
        description: "Please use a valid IIIT email address",
        variant: "destructive",
      });
      return;
    }

    // TODO: add signup logic
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
      description: "Account created successfully!",
    });

    window.location.href = "/signin";
  };

  const handleChange = (e: { target: { name: any; value: any } }) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="First Name"
          id="firstName"
          name="firstName"
          required
          value={formData.firstName}
          onChange={handleChange}
        />
        <FormField
          label="Last Name"
          id="lastName"
          name="lastName"
          required
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Age"
          id="age"
          name="age"
          type="number"
          required
          value={formData.age}
          onChange={handleChange}
        />
        <FormField
          label="Contact Number"
          id="contactNumber"
          name="contactNumber"
          required
          value={formData.contactNumber}
          onChange={handleChange}
        />
      </div>
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
      <FormField
        label="Confirm Password"
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      <div className="flex justify-center items-center w-full my-4">
        <ReCAPTCHA
          ref={recaptcha}
          sitekey={String(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)}
        />
      </div>
      <Button type="submit" className="w-full">
        Create Account
      </Button>
    </form>
  );
};
