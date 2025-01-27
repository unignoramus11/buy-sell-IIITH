"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

interface ReCAPTCHAProps {
  onVerify: (token: string) => void;
}

export function ReCAPTCHA({ onVerify }: ReCAPTCHAProps) {
  const { toast } = useToast();

  useEffect(() => {
    const loadReCaptcha = async () => {
      try {
        await window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY, {
              action: "submit",
            })
            .then((token: string) => {
              onVerify(token);
            })
            .catch((error: any) => {
              toast({
                title: "ReCAPTCHA Error",
                description: "Failed to verify reCAPTCHA. Please try again.",
                variant: "destructive",
              });
            });
        });
      } catch (error) {
        console.error("ReCAPTCHA failed to load:", error);
      }
    };

    loadReCaptcha();
  }, [onVerify]);

  return null;
}
