"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
    onRecaptchaLoad?: () => void;
  }
}

interface ReCAPTCHAProps {
  onVerify: (token: string | null) => void;
}

export function ReCAPTCHA({ onVerify }: ReCAPTCHAProps) {
  useEffect(() => {
    // Initialize callback before loading script
    window.onRecaptchaLoad = () => {
      const executeReCaptcha = () => {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        if (!siteKey) {
          console.error("reCAPTCHA site key is not defined");
          return;
        }

        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, { action: "login" })
            .then((token: string) => {
              onVerify(token);
            })
            .catch((error: Error) => {
              console.error("reCAPTCHA error:", error);
              onVerify(null);
            });
        });
      };

      // Initial execution
      executeReCaptcha();

      // Refresh token every 2 minutes
      const intervalId = setInterval(executeReCaptcha, 120000);
      return () => clearInterval(intervalId);
    };

    // Load the reCAPTCHA script
    const script = document.createElement("script");
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    script.async = true;
    script.defer = true;
    script.onload = window.onRecaptchaLoad;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      delete window.onRecaptchaLoad;
    };
  }, [onVerify]);

  return null; // reCAPTCHA v3 is invisible
}
