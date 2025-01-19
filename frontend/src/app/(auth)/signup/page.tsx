import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignUpForm } from "@/components/auth/SignUpForm";
import Link from "next/link";

export default function SignUpPage() {
  const footer = (
    <div className="text-sm text-gray-500 dark:text-gray-400">
      Already have an account?
      <Link href="/signin" className="ml-1 text-primary hover:underline">
        Sign In
      </Link>
    </div>
  );

  return (
    <AuthLayout>
      <AuthCard
        title="Create Your Account"
        description="Fill in your information to create an account"
        footer={footer}
      >
        <SignUpForm />
      </AuthCard>
    </AuthLayout>
  );
}
