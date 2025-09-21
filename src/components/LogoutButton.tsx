"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

type LogoutButtonProps = {
  className?: string;
  label?: string;
  size?: "sm" | "default" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  iconOnly?: boolean;
  iconClassName?: string;
};

export default function LogoutButton({
  className,
  label = "Sair",
  size = "default",
  variant = "outline",
  iconOnly = false,
  iconClassName,
}: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("funcao");
      toast.success("Você saiu com sucesso.");
    } catch {
      // silencioso
    }
    router.replace("/login");
  };

  return (
    <Button onClick={handleLogout} className={className} size={size} variant={variant} aria-label={label || "Sair"}>
      <LogOut className={`${iconOnly ? 'h-8 w-8' : 'h-4 w-4 mr-2'} ${iconClassName ?? ''}`} aria-hidden="true" />
      {iconOnly ? null : label}
    </Button>
  );
}
