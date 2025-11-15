// src/app/moradores/page.tsx
// src/app/usuarios/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
// import { FilterToolbar } from "@/components/ui/filter-toolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { MoradorForm, MoradorFormData } from "@/components/forms/morador-form";
import { UsuarioForm, UsuarioFormData } from "@/components/forms/usuario-form";
import { ChevronLeft, ChevronRight, Users, UserCog, Home, Stethoscope, Pill } from "lucide-react";
import { usePathname } from "next/navigation";
import { FilterToolbarUsuario } from "@/components/ui/filter-toolbar-usuario";
import { LogoutButton } from "@/components/ui/logout-button";
import Image from "next/image";
import { API_BASE } from '@/lib/api';
//

export interface Usuario {
  id_usuario: number;
  nome_usuario: string;
  nome_completo: string;
  cpf: string;
  email: string;
  funcao: string;
  situacao: boolean;
}

// Resposta potencial das APIs de usuário (PATCH/POST)
interface UsuarioApiResponse {
  usuario?: Usuario;      // objeto retornado em criação/atualização
  message?: string;       // mensagem de erro/sucesso eventual
  data?: Usuario[];       // usado em listagens (consistência)
  // Permite campos extras sem recorrer a 'any'
  [key: string]: unknown;
}

const ITEMS_PER_PAGE = 10;

const navItems = [
    { href: "/moradores", label: "Moradores", icon: <Users className="h-5 w-5" /> },
    { href: "/medicos", label: "Médicos", icon: <Stethoscope className="h-5 w-5" /> },
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

export default function ListaMoradoresPage() {
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("nome_usuario");
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
    // Buscar usuários do backend
    fetch(`${API_BASE}/usuario`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        setUsuarios(Array.isArray(data.data) ? data.data : []);
        setVerificado(true);
      })
      .catch(() => {
        setUsuarios([]);
        setVerificado(true);
      });
  }, [router]);

  // Diagnostic logs removed

  // When user types, show results from first page immediately
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

    const handleSaveUsuario = async (formData: UsuarioFormData) => {
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!accessToken) {
        toast.error('Token de acesso não encontrado. Faça login novamente.');
        return;
      }
      try {
  let response: Response;
  let data: UsuarioApiResponse;
        if (usuarioEditando) {
          // Edição
          const body: {
            nome_usuario: string;
            nome_completo: string;
            cpf: string;
            email: string;
            funcao: string;
            situacao: boolean;
            senha?: string;
          } = {
            nome_usuario: formData.nome_usuario,
            nome_completo: formData.nome_completo,
            cpf: formData.cpf.replace(/\D/g, ''),
            email: formData.email,
            funcao: formData.funcao,
            situacao: formData.situacao,
          };
          // Só envia senha se foi alterada
          if (formData.senha) {
            body.senha = formData.senha;
          }
          response = await fetch(`${API_BASE}/usuario/${usuarioEditando.id_usuario}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          data = await response.json();
          if (response.ok) {
            const usuarioAtualizado: Usuario = data.usuario || (data as unknown as Usuario);
            setUsuarios(prev => prev.map(u => u.id_usuario === usuarioEditando.id_usuario ? usuarioAtualizado : u));
            toast.success('Usuário atualizado com sucesso!');
          } else {
            toast.error(data.message || 'Erro ao atualizar usuário.');
          }
        } else {
          // Cadastro
          response = await fetch(`${API_BASE}/usuario`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nome_usuario: formData.nome_usuario,
              nome_completo: formData.nome_completo,
              cpf: formData.cpf.replace(/\D/g, ''),
              senha: formData.senha,
              email: formData.email,
              funcao: formData.funcao,
              situacao: formData.situacao,
            }),
          });
          data = await response.json();
          if (response.ok && data.usuario) {
            setUsuarios(prev => [...prev, data.usuario]);
            toast.success('Usuário cadastrado com sucesso!');
          } else {
            toast.error(data.message || 'Erro ao cadastrar usuário.');
          }
        }
        setIsDialogOpen(false);
        setUsuarioEditando(null);
      } catch {
        toast.error('Erro de conexão ao salvar usuário.');
      }
    };

  // Mapeamento correto dos campos para filtro
  const filterMap: Record<string, keyof Usuario> = {
    id_usuario: "id_usuario",
    nome_usuario: "nome_usuario",
    cpf: "cpf",
    email: "email",
    situacao: "situacao",
  };
  const filteredData = usuarios.filter((item) => itemMatchesSearch(item as Record<string, unknown>, searchTerm));

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
  const SidebarContent = () => (
     <aside className="w-64 flex-shrink-0 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
    <div className="flex items-center mb-8">
      <Image src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" width={48} height={48} />
              <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tight">

                    CASA DONA ZULMIRA

              </h2>       
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
  <main className="flex-1 flex flex-col py-6 px-8 relative">
       
        <FilterToolbarUsuario
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterBy}
          onAddClick={() => { setUsuarioEditando(null); setIsDialogOpen(true); }}
          filterValue={filterBy}
        />
         <h2 className="text-xl font-bold text-[#002c6c] mb-4">

        Todos os usuários

      </h2>
        <Card className="rounded-2xl border border-[#cfd8e3] shadow-md bg-white p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead  className="text-[#002c6c] font-semibold">ID</TableHead>
                <TableHead  className="text-[#002c6c] font-semibold">Nome de Usuário</TableHead>
                <TableHead  className="text-[#002c6c] font-semibold">CPF</TableHead>
                <TableHead  className="text-[#002c6c] font-semibold">Email</TableHead>
                <TableHead  className="text-[#002c6c] font-semibold">Função</TableHead>
                <TableHead  className="text-[#002c6c] font-semibold">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={item.id_usuario ?? item.cpf ?? index}
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer border-b"
                  onClick={() => {
                    setUsuarioEditando(item);
                    setIsDialogOpen(true);
                  }}
                >
                  <TableCell className="text-gray-700">{item.id_usuario}</TableCell>
                  <TableCell className="text-gray-700 font-medium">{item.nome_usuario}</TableCell>
                  <TableCell className="text-gray-700">{formatCpf(item.cpf)}</TableCell>
                  <TableCell className="text-gray-700">{item.email}</TableCell>
                  <TableCell className="text-gray-700">{(item as any).funcao ?? ''}</TableCell>
                  <TableCell className="text-gray-700">{item.situacao ? "Ativo" : "Inativo"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        {/* Paginação aqui... */}
         <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
                  <span>
                    Exibindo {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} de{" "}
                    {filteredData.length} usuários
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

        {/* Logout agora movido para a barra lateral */}

      </main>

      {/* Definição do Modal (Dialog) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white p-6 shadow-lg rounded-lg border">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#002c6c]">
              {usuarioEditando ? 'Editar Usuário' : 'Cadastro de Usuário'}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {usuarioEditando ? 'Edite os dados do usuário e salve.' : 'Preencha os dados abaixo para cadastrar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>
          <UsuarioForm
            onSubmit={handleSaveUsuario}
            onClose={() => {
              setIsDialogOpen(false);
              setUsuarioEditando(null);
            }}
            initialData={usuarioEditando ? {
              nome_usuario: usuarioEditando.nome_usuario,
              nome_completo: usuarioEditando.nome_completo,
              cpf: usuarioEditando.cpf,
              email: usuarioEditando.email,
              funcao: usuarioEditando.funcao,
              situacao: usuarioEditando.situacao,
            } : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper to format CPF for display as 000.000.000-00
const formatCpf = (value?: string) => {
  if (!value) return "";
  const v = String(value).replace(/\D/g, "").slice(0, 11);
  if (!v) return "";
  if (v.length <= 3) return v;
  if (v.length <= 6) return v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
};

// Helper que verifica se um item bate com o termo de busca, tratando booleanos (situacao)
const itemMatchesSearch = (item: Record<string, unknown>, rawSearch: string) => {
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

  // Support partial typing: treat prefixes like 'inat' -> 'inativo', 'ativ' -> 'ativo'
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