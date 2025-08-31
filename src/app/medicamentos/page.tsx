// src/app/medicamentos/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterToolbarMedicamentos } from "@/components/ui/filter-toolbar-medicamentos";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MedicamentoForm } from "@/components/forms/medicamento-form";
import { ChevronLeft, ChevronRight, Users, UserCog, Home, Stethoscope, Pill } from "lucide-react";
import { usePathname } from "next/navigation";
// Dados iniciais que serão gerenciados pela página
const initialData = [
    { id: 1, Nome: "Jane Cooper", CPF: "11111111111", Situação: "Ativo" },
];

export interface Medicamento {
  id_medicamento: number;
  nome_medicamento: string;
  situacao: boolean;

}

const ITEMS_PER_PAGE = 10;

const navItems = [
    { href: "/admin", label: "Menu Principal", icon: <Home className="h-5 w-5" /> },
    { href: "/moradores", label: "Moradores", icon: <Users className="h-5 w-5" /> },
    { href: "/usuarios", label: "Usuários", icon: <UserCog className="h-5 w-5" /> },
    { href: "/medicos", label: "Médicos", icon: <Stethoscope className="h-5 w-5" /> },
    { href: "/medicamentos", label: "Medicamentos", icon: <Pill className="h-5 w-5" /> },
];

function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
     <nav className="flex flex-col gap-2 mt-8 text-base">
      {navItems.map((item) => (
        <Button
          key={item.label}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className="justify-start gap-3 px-3 text-md cursor-pointer"
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
  const [filterBy, setFilterBy] = useState("nome_medicamento");
  const [currentPage, setCurrentPage] = useState(1);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    // Proteção de rota: só Administrador pode acessar
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
    // Buscar medicamentos do backend
  fetch('http://localhost:4000/medicamentos', {
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

  // Proteção de rota: só Administrador pode acessar

  useEffect(() => {
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

    const fetchMedicamentos = async () => {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!accessToken) return;
      try {
        const res = await fetch('http://localhost:4000/medicamentos', {
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
          // Edição
          const body: any = {
            nome_medicamento: formData.nome_medicamento,
            situacao: formData.situacao,
          };
          if (!medicamentoEditando.id_medicamento) {
            alert('ID do medicamento não encontrado.');
            return;
          }
          response = await fetch(`http://localhost:4000/medicamentos/${medicamentoEditando.id_medicamento}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          data = await response.json();
          if (response.ok) {
            alert('Medicamento atualizado com sucesso!');
          } else {
            alert(data.message || 'Erro ao atualizar medicamento.');
          }
        } else {
          // Cadastro
          response = await fetch('http://localhost:4000/medicamentos', {
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
            alert('Medicamento cadastrado com sucesso!');
          } else {
            alert(data.message || 'Erro ao cadastrar medicamento.');
          }
        }
        setIsDialogOpen(false);
        setMedicamentoEditando(null);
        await fetchMedicamentos();
      } catch (error) {
        alert('Erro de conexão ao salvar medicamento.');
      }
    };

  // Mapeamento correto dos campos para filtro
  const filterMap: Record<string, string> = {
    id_medicamento: "id_medicamento",
    nome_medicamento: "nome_medicamento",
    situacao: "situacao"
  };
  const filteredData = medicamentos.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    const field = filterMap[filterBy] || filterBy;
    const itemValue = (item[field] || "").toString().toLowerCase();
    return itemValue.includes(searchValue);
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const SidebarContent = () => (
     <aside className="flex h-full flex-col bg-white p-4 border-r border-gray-200">
        <div className="flex items-center gap-3 p-2">
            <img src="/logo-ssvp.png" alt="Logo" className="w-12" />
            <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tighter">Casa Dona Zulmira</h2>
        </div>
        <SidebarNav />
    </aside>
  );

  return (
    <div className="min-h-screen flex flex-row bg-gray-50 font-poppins">
      <div className="w-64 flex-shrink-0 bg-white">
        <SidebarContent />
      </div>

      <main className="flex-1 flex flex-col overflow-x-auto p-4 md:p-8">
        <h1 className="text-2xl font-bold text-[#002c6c] mb-6">Lista de Medicamentos</h1>
        <FilterToolbarMedicamentos
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterBy}
          onAddClick={() => setIsDialogOpen(true)}
          filterValue={filterBy}
        />
        <Card className="mt-6 rounded-lg shadow-sm border-[#cfd8e3]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome do Medicamento</TableHead>
                <TableHead>Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={item.id_medicamento ?? index}
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => {
                    setMedicamentoEditando(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <TableCell>{item.id_medicamento}</TableCell>
                  <TableCell className="font-medium">{item.nome_medicamento}</TableCell>
                  <TableCell>{item.situacao ? "Em estoque" : "Sem estoque"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
        {/* Paginação aqui... */}
        {/* Paginação */}
        <div className="flex justify-end items-center mt-4 gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Próxima
          </Button>
        </div>
      </main>

      {/* Definição do Modal (Dialog) */}
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