import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import Link from "next/link";

export default function loginPage() {
  const footer = (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Don't have an account?
      <Link href="/signup" className="ml-1 text-primary hover:underline">
        Sign Up
      </Link>
    </div>
  );

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome Back!"
        description="Enter your details to login"
        footer={footer}
      >
        <LoginForm />
      </AuthCard>
    </AuthLayout>
  );
}
