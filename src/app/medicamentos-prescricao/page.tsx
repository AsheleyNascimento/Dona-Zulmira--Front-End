// src/app/medicamentos-prescricao/page.tsx

"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/ui/filter-toolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PrescricaoForm,
  PrescricaoFormData,
} from "@/components/forms/prescricao-form"; // Assumindo que este formulário exista
import {
  ChevronLeft,
  ChevronRight,
  Users,
  UserCog,
  Home,
  Stethoscope,
  Pill,
  ClipboardList, // Ícone para prescrições
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

const ITEMS_PER_PAGE = 10;

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

export default function PrescricoesPage() {
  const [prescricaoEditando, setPrescricaoEditando] = useState<Prescricao | null>(null);
  const router = useRouter();
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("morador"); // Filtro padrão
  const [currentPage, setCurrentPage] = useState(1);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);

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

    fetch("http://localhost:4000/prescricao", { // Endpoint para prescrições
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setPrescricoes(Array.isArray(data.data) ? data.data : []);
        setVerificado(true);
      })
      .catch(() => {
        setPrescricoes([]);
        setVerificado(true);
      });
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

  const handleSavePrescricao = async (formData: PrescricaoFormData) => {
    // TODO: Implementar a lógica para salvar (criar/editar) uma prescrição
    console.log("Salvando prescrição:", formData);
    // Exemplo de como a lógica de salvar poderia ser:
    // const method = prescricaoEditando ? 'PUT' : 'POST';
    // const url = prescricaoEditando
    //   ? `http://localhost:4000/prescricao/${prescricaoEditando.id_prescricao}`
    //   : 'http://localhost:4000/prescricao';
    // ... fetch ...
    setIsDialogOpen(false);
    setPrescricaoEditando(null);
    // Idealmente, recarregar os dados após salvar
  };

  const filteredData = prescricoes.filter((item) => {
    const searchValue = searchTerm.toLowerCase().trim();
    if (!searchValue) return true;

    switch (filterBy) {
      case "morador":
        return item.morador.nome_completo.toLowerCase().includes(searchValue);
      case "medicamento":
        return item.medicamento.nome_comercial.toLowerCase().includes(searchValue);
      default:
        return true;
    }
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      {/* Barra de busca + filtro + botão */}
      <FilterToolbar
        onSearchChange={setSearchTerm}
        onFilterChange={setFilterBy}
        onAddClick={() => setIsDialogOpen(true)}
        filterValue={filterBy}
        // className="mb-6"
      />

      {/* Título */}
      <h2 className="text-xl font-bold text-[#002c6c] mb-4">
        Todas as Prescrições
      </h2>

      {/* Tabela */}
      <Card className="rounded-2xl border border-[#cfd8e3] shadow-md bg-white p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#002c6c] font-semibold">Morador</TableHead>
              <TableHead className="text-[#002c6c] font-semibold">
                Medicamento
              </TableHead>
              <TableHead className="text-[#002c6c] font-semibold">
                Dosagem
              </TableHead>
              <TableHead className="text-[#002c6c] font-semibold">
                Frequência
              </TableHead>
              <TableHead className="text-[#002c6c] font-semibold">
                Médico
              </TableHead>
              <TableHead className="text-[#002c6c] font-semibold">
                Situação
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((item) => (
              <TableRow
                key={item.id_prescricao}
                className="hover:bg-[#e9f1f9]/50 cursor-pointer border-b"
                onClick={() => {
                  setPrescricaoEditando(item);
                  setIsDialogOpen(true);
                }}
              >
                <TableCell className="text-gray-700 font-medium">
                  {item.morador.nome_completo}
                </TableCell>
                <TableCell className="text-gray-700">
                  {item.medicamento.nome_comercial}
                </TableCell>
                <TableCell className="text-gray-700">{item.dosagem}</TableCell>
                <TableCell className="text-gray-700">{item.frequencia}</TableCell>
                <TableCell className="text-gray-700">
                  {item.medico.nome_completo}
                </TableCell>
                <TableCell className="text-gray-700">
                  {item.situacao ? "Ativa" : "Inativa"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <span>
            Exibindo {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de {filteredData.length} prescrições
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 rounded-full hover:bg-[#e9f1f9]/50 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                className={`w-8 h-8 rounded-full ${
                  currentPage === page
                    ? "bg-[#002c6c] text-white"
                    : "border border-[#002c6c] text-[#002c6c] hover:bg-[#e9f1f9]"
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 rounded-full hover:bg-[#e9f1f9]/50 cursor-pointer"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </main>

    {/* Modal */}
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="sm:max-w-[500px] bg-white p-6 shadow-lg rounded-lg border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#002c6c]">
            {prescricaoEditando ? "Editar Prescrição" : "Nova Prescrição"}
          </DialogTitle>
          <DialogDescription className="pt-2">
            {prescricaoEditando
              ? "Edite os dados da prescrição e salve."
              : "Preencha os dados abaixo para cadastrar uma nova prescrição."}
          </DialogDescription>
        </DialogHeader>
        <PrescricaoForm
          onSubmit={handleSavePrescricao}
          onClose={() => {
            setIsDialogOpen(false);
            setPrescricaoEditando(null);
          }}
          initialData={
            prescricaoEditando
              ? {
                  id_morador: prescricaoEditando.morador.id_morador,
                  id_medicamento: prescricaoEditando.medicamento.id_medicamento,
                  id_medico: prescricaoEditando.medico.id_medico,
                  dosagem: prescricaoEditando.dosagem,
                  frequencia: prescricaoEditando.frequencia,
                  data_inicio: prescricaoEditando.data_inicio,
                  data_fim: prescricaoEditando.data_fim,
                  observacoes: prescricaoEditando.observacoes,
                  situacao: prescricaoEditando.situacao,
                }
              : undefined
          }
        />
      </DialogContent>
    </Dialog>
  </div>
);

}