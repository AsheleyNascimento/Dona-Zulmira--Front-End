// src/app/medicos/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/ui/logout-button";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterToolbarMedicos } from "@/components/ui/filter-toolbar-medicos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MedicosForm } from "@/components/forms/medicos-form";
import { ChevronLeft, ChevronRight, Users, UserCog, Pill } from "lucide-react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { API_BASE } from '@/lib/api';

export interface Medico {
  id_medico: number;
  nome_completo: string;
  crm: string;
  situacao: boolean;
}

const ITEMS_PER_PAGE = 10;

const navItems = [
    { href: "/moradores", label: "Moradores", icon: <Users className="h-5 w-5" /> },
    { href: "/usuarios", label: "Usuários", icon: <UserCog className="h-5 w-5" /> },
    { href: "/medicamentos", label: "Medicamentos", icon: <Pill className="h-5 w-5" /> },
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
          className={`justify-start gap-3 px-3 cursor-pointer hover:bg-[#e9f1f9]/50 ${pathname === item.href ? "bg-[#e9f1f9]": ""}`}
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
  const [medicoEditando, setMedicoEditando] = useState<Medico | null>(null);
  const router = useRouter();
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // REMOVIDO: const [filterBy, setFilterBy] = useState("nome_completo");
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
    
    fetch(`${API_BASE}/medicos`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMedicos(data);
        } else if (Array.isArray(data.data)) {
          setMedicos(data.data);
        } else {
          setMedicos([]);
        }
        setVerificado(true);
      })
      .catch(() => {
        setMedicos([]);
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

  const itemMatchesSearchMedico = (item: Record<string, unknown>, rawSearch: string) => {
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

  // CORREÇÃO AQUI: Adicionado 'as unknown' antes de converter para Record
  const filteredData = medicos.filter((item) => itemMatchesSearchMedico(item as unknown as Record<string, unknown>, searchTerm));

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const SidebarContent = () => (
     <aside className="w-64 flex-shrink-0 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
        <div className="flex items-center mb-8">
            <Image src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" width={48} height={48} />
            <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tight">CASA DONA ZULMIRA </h2>
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
        <FilterToolbarMedicos
          onSearchChange={setSearchTerm}
          onAddClick={() => {
            setMedicoEditando(null);
            setIsDialogOpen(true);
          }}
        />
         <h2 className="text-xl font-bold text-[#002c6c] mb-4">
        Todos os médicos
      </h2>
        <Card className="rounded-2xl border border-[#cfd8e3] shadow-md bg-white p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#002c6c] font-semibold">ID</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Nome Completo</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">CRM</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={item.id_medico ?? index}
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer border-b"
                  onClick={() => {
                    setMedicoEditando(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <TableCell className="text-gray-700">{item.id_medico}</TableCell>
                  <TableCell className="text-gray-700 font-medium">{item.nome_completo}</TableCell>
                  <TableCell className="text-gray-700">{item.crm}</TableCell>
                  <TableCell className="text-gray-700">{item.situacao ? "Ativo" : "Inativo"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
       <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                 <span>
                   Exibindo {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                   {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de{" "}
                   {filteredData.length} médicos
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
              {medicoEditando ? 'Editar Médico' : 'Cadastro de Médico'}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {medicoEditando ? 'Edite os dados do médico e salve.' : 'Preencha os dados abaixo para cadastrar um novo médico.'}
            </DialogDescription>
          </DialogHeader>
          <MedicosForm
            onSubmit={() => {
              // Atualiza lista após cadastro/edição
              fetch(`${API_BASE}/medicos`, {
                headers: {
                  'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('accessToken') : ''}`,
                  'Content-Type': 'application/json',
                },
              })
                .then(res => res.json())
                .then(data => {
                  if (Array.isArray(data)) {
                    setMedicos(data);
                  } else if (Array.isArray(data.data)) {
                    setMedicos(data.data);
                  } else {
                    setMedicos([]);
                  }
                });
              setIsDialogOpen(false);
              setMedicoEditando(null);
            }}
            onClose={() => {
              setIsDialogOpen(false);
              setMedicoEditando(null);
            }}
            initialData={medicoEditando ? {
              id_medico: medicoEditando.id_medico,
              nome_completo: medicoEditando.nome_completo,
              crm: medicoEditando.crm,
              situacao: medicoEditando.situacao,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}