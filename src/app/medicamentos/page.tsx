// src/app/medicamentos/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/ui/logout-button";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterToolbarMedicamentos } from "@/components/ui/filter-toolbar-medicamentos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MedicamentoForm } from "@/components/forms/medicamento-form";
import { API_BASE } from '@/lib/api';
import { ChevronLeft, ChevronRight, Users, UserCog, Stethoscope } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import toast from 'react-hot-toast';

export interface Medicamento {
  id_medicamento: number;
  nome_medicamento: string;
  situacao: boolean;
}

const ITEMS_PER_PAGE = 10;

const navItems = [
    { href: "/moradores", label: "Moradores", icon: <Users className="h-5 w-5" /> },
    { href: "/usuarios", label: "Usuários", icon: <UserCog className="h-5 w-5" /> },
    { href: "/medicos", label: "Médicos", icon: <Stethoscope className="h-5 w-5" /> },
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
          className={`justify-start gap-3 px-3 cursor-pointer hover:bg-[#e9f1f9]/50 ${pathname === item.href ? "bg-[#e9f1f9]" : ""}`}
          onClick={() => router.push(item.href)}
        >
          {item.icon}
          {item.label}
        </Button>
      ))}
    </nav>
  );
}

export default function ListaMoradoresPage() {
  const [medicamentoEditando, setMedicamentoEditando] = useState<Medicamento | null>(null);
  const router = useRouter();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || funcao !== 'Administrador') {
      setAcessoNegado(true);
      setTimeout(() => {
        router.push(funcao === 'Cuidador' ? '/admin' : '/login');
      }, 2000);
      setVerificado(true);
      return;
    }
    
    fetch(`${API_BASE}/medicamentos`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setMedicamentos(Array.isArray(data.data) ? data.data : []);
        setVerificado(true);
      })
      .catch(() => {
        setMedicamentos([]);
        setVerificado(true);
      });
  }, [router]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (!verificado) {
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

  const fetchMedicamentos = async () => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/medicamentos`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      const lista = await res.json();
      setMedicamentos(Array.isArray(lista.data) ? lista.data : []);
      setCurrentPage(1);
    } catch {
      setMedicamentos([]);
    }
  };

  const handleSaveMedicamento = async (formData: { nome_medicamento: string; situacao: boolean }) => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      alert('Token de acesso não encontrado. Faça login novamente.');
      return;
    }
    try {
      let response, data;
      if (medicamentoEditando) {
        const body: { nome_medicamento: string; situacao: boolean } = {
          nome_medicamento: formData.nome_medicamento,
          situacao: formData.situacao,
        };
        if (!medicamentoEditando.id_medicamento) {
          alert('ID do medicamento não encontrado.');
          return;
        }
        response = await fetch(`${API_BASE}/medicamentos/${medicamentoEditando.id_medicamento}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        data = await response.json();
        if (response.ok) {
          toast.success('Medicamento atualizado com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao atualizar medicamento.');
        }
      } else {
        response = await fetch(`${API_BASE}/medicamentos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nome_medicamento: formData.nome_medicamento,
            situacao: formData.situacao,
          }),
        });
        data = await response.json();
        if (response.ok && data.medicamento) {
          toast.success('Medicamento cadastrado com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao cadastrar medicamento.');
        }
      }
      setIsDialogOpen(false);
      setMedicamentoEditando(null);
      await fetchMedicamentos();
    } catch {
      toast.error('Erro de conexão ao salvar medicamento.');
    }
  };

  const itemMatchesSearchMedicamento = (item: Record<string, unknown>, rawSearch: string) => {
    const sv = String(rawSearch ?? "").toLowerCase().trim();
    if (!sv) return true;

    const normalizeBool = (v: unknown): boolean | null => {
      if (typeof v === "boolean") return v;
      if (typeof v === "number") return v === 1 ? true : v === 0 ? false : null;
      if (typeof v === "string") {
        const s = v.toLowerCase().trim();
        if (s === "true" || s === "1" || s === "ativo" || s === "sim") return true;
        if (s === "false" || s === "0" || s === "inativo" || s === "nao" || s === "não") return false;
        return null;
      }
      return null;
    };

    const svNorm = sv;
    if (svNorm === "sim" || svNorm === "true" || svNorm === "1" || "ativo".startsWith(svNorm)) {
      const desired = true;
      return Object.values(item).some((v) => {
        const b = normalizeBool(v);
        return b !== null && b === desired;
      });
    }
    if (svNorm === "nao" || svNorm === "não" || svNorm === "false" || svNorm === "0" || "inativo".startsWith(svNorm)) {
      const desired = false;
      return Object.values(item).some((v) => {
        const b = normalizeBool(v);
        return b !== null && b === desired;
      });
    }

    return Object.values(item).some((v) => String(v ?? "").toLowerCase().includes(svNorm));
  };

  // CORRIGIDO AQUI: Adicionado 'as unknown' antes de 'as Record<string, unknown>'
  const filteredData = medicamentos.filter((item) => itemMatchesSearchMedicamento(item as unknown as Record<string, unknown>, searchTerm));

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const SidebarContent = () => (
     <aside className="w-64 flex-shrink-0 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
    <div className="flex items-center mb-8">
      <Image src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" width={48} height={48} />
       <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tight">CASA DONA ZULMIRA</h2>
    </div>
        <SidebarNav />
        <div className="mt-auto pt-6 border-t border-[#e9f1f9]">
          <LogoutButton />
        </div>
    </aside>
  );

  return (
    <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
        <SidebarContent />

      <main className="relative flex-1 flex flex-col py-6 px-8">
        <FilterToolbarMedicamentos
          onSearchChange={setSearchTerm}
          onAddClick={() => {
            setMedicamentoEditando(null);
            setIsDialogOpen(true);
          }}
        />
         <h2 className="text-xl font-bold text-[#002c6c] mb-4">
        Todos os medicamentos</h2>
        <Card className="rounded-2xl border border-[#cfd8e3] shadow-md bg-white p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#002c6c] font-semibold">ID</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Nome do Medicamento</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={item.id_medicamento ?? index}
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer border-b"
                  onClick={() => {
                    setMedicamentoEditando(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <TableCell className="text-gray-700">{item.id_medicamento}</TableCell>
                  <TableCell className="text-gray-700 font-medium">{item.nome_medicamento}</TableCell>
                  <TableCell className="text-gray-700">{item.situacao ? "Em estoque" : "Sem estoque"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
         <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                  <span>
                    Exibindo {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de{" "}
                    {filteredData.length} medicamentos
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 shadow-lg rounded-lg border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#002c6c]">
              {medicamentoEditando ? 'Editar Medicamento' : 'Cadastro de Medicamento'}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {medicamentoEditando ? 'Edite os dados do medicamento e salve.' : 'Preencha os dados abaixo para cadastrar um novo medicamento.'}
            </DialogDescription>
          </DialogHeader>
          <MedicamentoForm
            onSubmit={handleSaveMedicamento}
            onClose={() => {
              setIsDialogOpen(false);
              setMedicamentoEditando(null);
              fetchMedicamentos();
            }}
            initialData={medicamentoEditando ? {
              nome_medicamento: medicamentoEditando.nome_medicamento,
              situacao: medicamentoEditando.situacao,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}