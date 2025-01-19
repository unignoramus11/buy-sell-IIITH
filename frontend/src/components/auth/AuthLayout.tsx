"use client";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full dark:bg-black bg-white dark:bg-grid-white/[0.05] bg-grid-black/[0.05] relative flex items-center justify-center">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      <BackgroundBeamsWithCollision>{children}</BackgroundBeamsWithCollision>
    </div>
  );
};
