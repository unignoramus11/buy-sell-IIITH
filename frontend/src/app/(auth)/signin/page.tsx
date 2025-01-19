import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignInForm } from "@/components/auth/SignInForm";
import Link from "next/link";

export default function SignInPage() {
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
        description="Enter your details to sign in"
        footer={footer}
      >
        <SignInForm />
      </AuthCard>
    </AuthLayout>
  );
}
