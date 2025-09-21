"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface LogoutButtonProps {
  variant?: "sidebar" | "floating";
  className?: string;
  label?: string;
}

/**
 * Accessible logout button that clears auth-related storage keys
 * and redirects to /login. Two visual variants: sidebar (full width) and floating (icon circle).
 */
export function LogoutButton({ variant = "sidebar", className = "", label = "Sair" }: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = useCallback(() => {
    if (loading) return;
    setLoading(true);
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("funcao");
    } catch {}
    // Pequeno delay para feedback visual se quisermos no futuro
    setTimeout(() => {
      router.replace("/login");
    }, 80);
  }, [loading, router]);

  if (variant === "floating") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        aria-label={label}
        title={label}
        disabled={loading}
        className={`group relative h-12 w-12 rounded-full bg-white text-[#b42318] shadow-lg border border-red-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors ${className}`}
      >
        <LogOut className="h-6 w-6" />
        <span className="sr-only">{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label={label}
      disabled={loading}
      className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 transition-colors w-full justify-center ${className}`}
    >
      <LogOut className="h-4 w-4" />
      {loading ? "Saindo..." : label}
    </button>
  );
}
