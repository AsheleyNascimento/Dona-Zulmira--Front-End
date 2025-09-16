"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  UsersRound,
  UserCog,
  Briefcase,
  Pill,
  LineChart,
  FileText,
  LogOut,
  UserCircle,
} from "lucide-react";

const menuColumns = [
  [
    {
      label: "Moradores",
      icon: <UsersRound className="h-7 w-7 text-[#003d99]" />, // Ícone ligeiramente maior
      href: "/moradores",
    },
    {
      label: "Usuários",
      icon: <UserCog className="h-7 w-7 text-[#003d99]" />,
      href: "/usuarios",
    },
  ],
  [
    {
      label: "Medicamentos",
      icon: <Pill className="h-7 w-7 text-[#003d99]" />,
      href: "/medicamentos",
    },
    {
      label: "Medicos",
      icon: <Briefcase className="h-7 w-7 text-[#003d99]" />,
      href: "/medicos",
    },
    
  ],
];

export default function AdminPage() {
  const router = useRouter();
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    // Só roda no cliente!
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || funcao !== 'Administrador') {
      setAcessoNegado(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
    setVerificado(true);
  }, [router]);

  if (!verificado) {
    // Renderiza uma tela em branco até verificar
    return <div className="min-h-screen bg-white" />;
  }
  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">
          Acesso restrito ao usuário! Redirecionando para login...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#e9f1f9] font-poppins">
      {/* ...existing code... */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      {/* ...existing code... */}
      <aside className="w-full lg:w-1/4 flex flex-col items-center justify-center bg-white p-6 border-b lg:border-r lg:border-b-0 border-[#e9f1f9]">
        <img src="/logo-ssvp.png" alt="Logo SSVP Casa Dona Zulmira" className="w-32 mb-4" />
        <h2 className="text-[#002c6c] text-base font-bold uppercase text-center">
          Casa Dona Zulmira
        </h2>
      </aside>
      {/* ...existing code... */}
      <main className="flex-1 flex flex-col p-6 sm:p-8 relative">
        {/* ...existing code... */}
        <header className="flex justify-end items-center text-[#002c6c] text-lg font-semibold mb-8">
          <UserCircle className="mr-2 h-6 w-6 text-[#003d99]" />
          <span>Administrativo</span>
        </header>
        {/* ...existing code... */}
        <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8 w-full">
          {menuColumns.map((column, colIndex) => (
            <Card
              key={colIndex}
              className="flex flex-col bg-white rounded-3xl shadow-sm w-full max-w-sm h-auto p-4 border-none"
            >
              {column.map((item, itemIndex) => (
                <Button
                  key={itemIndex}
                  variant="ghost"
                  className="flex items-center justify-start gap-5 text-[#002c6c] text-lg font-medium p-7 rounded-2xl h-auto border-b border-[#003d99]/10 last:border-b-0 hover:bg-[#e9f1f9]/60 cursor-pointer transition-colors duration-200"
                  onClick={() => item.href && router.push(item.href)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </Card>
          ))}
        </div>
        {/* ...existing code... */}
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/login")}
            className="text-[#003d99] hover:bg-red-100 hover:text-red-600 p-3 rounded-full transition-colors duration-200"
            aria-label="Sair"
          >
            <LogOut className="h-8 w-8" />
          </Button>
        </div>
      </main>
    </div>
  );
}
