"use client";

import Image from "next/image";
import Link from "next/link";

type HeaderBrandProps = {
  title?: string;
  href?: string;
  className?: string;
  right?: React.ReactNode;
  center?: React.ReactNode;
  left?: React.ReactNode; // novo slot para conteúdo à esquerda (ex: botão Voltar)
  sticky?: boolean;
  compact?: boolean;
  showBack?: boolean;
  onBack?: () => void;
};

export default function HeaderBrand({
  title = "Casa Dona Zulmira",
  href,
  className = "",
  right,
  center,
  left,
  sticky = true,
  compact = true,
  showBack = false,
  onBack,
}: HeaderBrandProps) {
  const Brand = (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/logo-ssvp.png"
        alt="Logo SSVP Casa Dona Zulmira"
        width={40}
        height={40}
        className="w-10 h-10 sm:w-12 sm:h-12"
        priority
      />
      <span className="text-[#002c6c] text-sm sm:text-base font-semibold tracking-wide">{title}</span>
    </div>
  );

  return (
    <header
      className={
        `${sticky ? 'sticky top-0 z-40' : ''} w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 ` +
        `${compact ? 'py-3' : 'py-4 sm:py-6'} px-4 sm:px-6 border-b border-[#e5eaf1]`
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Prioriza slot left sobre showBack legado */}
          {left ? left : showBack && (
            <button
              aria-label="Voltar"
              onClick={onBack}
              className="mr-1 rounded-md border border-[#e5eaf1] px-2 py-1 text-[#003d99] hover:bg-[#e9f1f9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003d99]"
            >
              ←
            </button>
          )}
          {href ? (
            <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#003d99] ring-offset-2 rounded">
              {Brand}
            </Link>
          ) : (
            Brand
          )}
        </div>
        <div className="flex-1 text-center min-w-0">
          {center ?? null}
        </div>
        <div className="flex items-center gap-2">
          {right ?? null}
        </div>
      </div>
    </header>
  );
}
