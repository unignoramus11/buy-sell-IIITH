import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export const AuthCard = ({
  title,
  description,
  children,
  footer,
}: AuthCardProps) => {
  return (
    <Card className="w-full max-w-md mx-4 relative z-10 backdrop-blur-sm bg-white/80 dark:bg-black/80">
      <CardHeader>
        <CardTitle>
          <TextGenerateEffect words={title} />
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && (
        <CardFooter className="flex flex-col space-y-2">{footer}</CardFooter>
      )}
    </Card>
  );
};
