Let's continue with the remaining integrations and add some important utilities:

```typescript
// frontend/src/lib/utils/validation.ts
export const validateEmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@[^\s@]+\.iiit\.ac\.in$/.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

export const validatePhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};
```

```typescript
// frontend/src/hooks/useRecaptcha.ts
import { useState, useEffect } from "react";

export const useRecaptcha = () => {
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const executeRecaptcha = async (action: string) => {
    try {
      const token = await window.grecaptcha.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action }
      );
      setRecaptchaToken(token);
      return token;
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      return null;
    }
  };

  return { recaptchaToken, executeRecaptcha };
};
```

```typescript
// frontend/src/components/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-full">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
  </div>
);
```

Let's update the explore page with search and filtering functionality:

```typescript
// frontend/src/app/explore/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useItems } from "@/hooks/useItems";
import { useCart } from "@/hooks/useCart";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import debounce from "lodash/debounce";

export default function ExplorePage() {
  const { getItems } = useItems();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    categories: [],
    minPrice: "",
    maxPrice: "",
  });

  const debouncedSearch = debounce(async (searchTerm: string) => {
    const results = await getItems({ search: searchTerm });
    if (results) setItems(results);
  }, 300);

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true);
      const results = await getItems(filters);
      if (results) setItems(results);
      setIsLoading(false);
    };

    fetchItems();
  }, [filters.categories, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    if (filters.search) {
      debouncedSearch(filters.search);
    }
    return () => {
      debouncedSearch.cancel();
    };
  }, [filters.search]);

  // ... rest of the component
}
```

Update the cart functionality:

```typescript
// frontend/src/app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useOrders } from "@/hooks/useOrders";
import { useRecaptcha } from "@/hooks/useRecaptcha";

export default function CartPage() {
  const { getCart, bargainItem, removeFromCart } = useCart();
  const { createOrder } = useOrders();
  const { executeRecaptcha } = useRecaptcha();

  const handleCheckout = async () => {
    const token = await executeRecaptcha("checkout");
    if (!token) {
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive",
      });
      return;
    }

    const cartItemIds = cartItems.map((item) => item.id);
    await createOrder(cartItemIds, token);
  };

  // ... rest of the component
}
```

Add a protected route wrapper:

```typescript
// frontend/src/components/ProtectedRoute.tsx
"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "./LoadingSpinner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !pathname.startsWith("/auth")) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, pathname]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated && !pathname.startsWith("/auth")) {
    return null;
  }

  return <>{children}</>;
}
```

Update the MainLayout to use ProtectedRoute:

```typescript
// frontend/src/components/layouts/MainLayout.tsx
import ProtectedRoute from "../ProtectedRoute";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      {/* Your existing MainLayout code */}
      {children}
    </ProtectedRoute>
  );
}
```

Add error boundaries:

```typescript
// frontend/src/components/ErrorBoundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Update your app layout to include the ErrorBoundary:

```typescript
// frontend/src/app/layout.tsx
import ErrorBoundary from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{/* ... */}</head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

This completes most of the frontend-backend integration with:

1. Protected routes
2. Authentication flow
3. API integration
4. Error handling
5. Loading states
6. Form validation
7. reCAPTCHA integration
8. Cart functionality
9. Order management
10. Search and filtering
11. Error boundaries
12. Type safety

Would you like me to continue with any specific feature or component?
