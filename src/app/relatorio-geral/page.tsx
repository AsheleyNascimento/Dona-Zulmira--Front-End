// src/app/medicamentos-prescricao/page.tsx

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  UserCog,
  Home,
  Stethoscope,
  Pill,
  ClipboardList, // Ícone para prescrições
  FileText, // Ícone para relatórios
} from "lucide-react";

interface Prescricao {
  id_prescricao: number;
  morador: {
    id_morador: number;
    nome_completo: string;
  };
  medicamento: {
    id_medicamento: number;
    nome_comercial: string;
  };
  medico: {
    id_medico: number;
    nome_completo: string;
  };
  dosagem: string;
  frequencia: string;
  data_inicio: string;
  data_fim: string | null;
  observacoes: string | null;
  situacao: boolean;
}

// Itens de navegação da barra lateral
const navItems = [
  {
    href: "/admin",
    label: "Menu Principal",
    icon: <Home className="h-5 w-5" />,
  },
  {
    href: "/moradores",
    label: "Moradores",
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: "/usuarios",
    label: "Usuários",
    icon: <UserCog className="h-5 w-5" />,
  },
  {
    href: "/medicos",
    label: "Médicos",
    icon: <Stethoscope className="h-5 w-5" />,
  },
  {
    href: "/medicamentos",
    label: "Medicamentos",
    icon: <Pill className="h-5 w-5" />,
  },
  {
    href: "/medicamentos-prescricao",
    label: "Prescrições",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    href: "/relatorio-geral",
    label: "Relatório Geral",
    icon: <FileText className="h-5 w-5" />,
  },
];

function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-2 mt-8 text-[1em] text-[#002c6c]">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          className={`justify-start gap-3 px-3 cursor-pointer hover:bg-[#e9f1f9]/50 ${
            pathname === item.href ? "bg-[#e9f1f9]" : ""
          }`}
          onClick={() => router.push(item.href)}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export default function RelatorioGeralPage() {
  const router = useRouter();
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [reportData, setReportData] = useState<{
    totalMoradores: number;
    totalMedicamentos: number;
    totalPrescricoesAtivas: number;
  } | null>(null);

  useEffect(() => {
    const funcao = localStorage.getItem("funcao");
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || funcao !== "Administrador") {
      setAcessoNegado(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      setVerificado(true);
      return;
    }

    const fetchData = async () => {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      };

      try {
        const [moradoresRes, medicamentosRes, prescricoesRes] = await Promise.all([
          fetch("http://localhost:4000/morador", { headers }),
          fetch("http://localhost:4000/medicamento", { headers }),
          fetch("http://localhost:4000/prescricao", { headers }),
        ]);

        if (!moradoresRes.ok || !medicamentosRes.ok || !prescricoesRes.ok) {
          throw new Error("Falha ao buscar dados para o relatório.");
        }

        const moradoresData = await moradoresRes.json();
        const medicamentosData = await medicamentosRes.json();
        const prescricoesData = await prescricoesRes.json();

        const totalMoradores = Array.isArray(moradoresData.data) ? moradoresData.data.length : 0;
        const totalMedicamentos = Array.isArray(medicamentosData.data) ? medicamentosData.data.length : 0;
        const totalPrescricoesAtivas = Array.isArray(prescricoesData.data)
          ? prescricoesData.data.filter((p: Prescricao) => p.situacao).length
          : 0;

        setReportData({
          totalMoradores,
          totalMedicamentos,
          totalPrescricoesAtivas,
        });

      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        setReportData(null);
      } finally {
        setVerificado(true);
      }
    };

    fetchData();
  }, [router]);

  if (!verificado) return <div className="min-h-screen bg-white" />;

  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">
          Acesso restrito ao usuário! Redirecionando para login...
        </div>
      </div>
    );
  }

  const SidebarContent = () => (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
      <div className="flex items-center mb-8">
        <img src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" />
        <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tight">
          CASA DONA ZULMIRA
        </h2>
      </div>
      <SidebarNav />
    </aside>
  );

return (
  <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
    {/* Sidebar */}
    <SidebarContent />

    {/* Main */}
    <main className="flex-1 flex flex-col py-6 px-8">
      {/* Título */}
      <h2 className="text-xl font-bold text-[#002c6c] mb-4">
        Relatório Geral
      </h2>

      {/* Cards de Métricas */}
      {reportData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <Card className="p-6 rounded-2xl shadow-md flex flex-col items-center justify-center bg-white">
            <Users className="h-10 w-10 text-[#002c6c] mb-3" />
            <p className="text-4xl font-bold text-gray-800">{reportData.totalMoradores}</p>
            <p className="text-gray-500 mt-1">Moradores Cadastrados</p>
          </Card>
          <Card className="p-6 rounded-2xl shadow-md flex flex-col items-center justify-center bg-white">
            <Pill className="h-10 w-10 text-[#002c6c] mb-3" />
            <p className="text-4xl font-bold text-gray-800">{reportData.totalMedicamentos}</p>
            <p className="text-gray-500 mt-1">Medicamentos Cadastrados</p>
          </Card>
          <Card className="p-6 rounded-2xl shadow-md flex flex-col items-center justify-center bg-white">
            <ClipboardList className="h-10 w-10 text-[#002c6c] mb-3" />
            <p className="text-4xl font-bold text-gray-800">{reportData.totalPrescricoesAtivas}</p>
            <p className="text-gray-500 mt-1">Prescrições Ativas</p>
          </Card>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-md">
          <div className="text-center">
            <p className="text-lg text-gray-600">Carregando dados do relatório...</p>
            <div className="mt-4 w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#002c6c]"></div>
          </div>
        </div>
      )}
    </main>
  </div>
);

}