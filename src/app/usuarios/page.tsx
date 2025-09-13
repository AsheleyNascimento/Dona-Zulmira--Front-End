// src/app/moradores/page.tsx
// src/app/usuarios/page.tsx

"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/ui/filter-toolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { MoradorForm, MoradorFormData } from "@/components/forms/morador-form";
import { UsuarioForm, UsuarioFormData } from "@/components/forms/usuario-form";
import { ChevronLeft, ChevronRight, Users, UserCog, Home, Stethoscope, Pill } from "lucide-react";
import { usePathname } from "next/navigation";
import { FilterToolbarUsuario } from "@/components/ui/filter-toolbar-usuario";
// Dados iniciais que serão gerenciados pela página
const initialData = [
    { id: 1, Nome: "Jane Cooper", CPF: "11111111111", Situação: "Ativo" },
];

export interface Usuario {
  id_usuario: number;
  nome_usuario: string;
  nome_completo: string;
  cpf: string;
  email: string;
  funcao: string;
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
    fetch('http://localhost:4000/usuario', {
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
        alert('Token de acesso não encontrado. Faça login novamente.');
        return;
      }
      try {
        let response, data;
        if (usuarioEditando) {
          // Edição
          const body: any = {
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
          response = await fetch(`http://localhost:4000/usuario/${usuarioEditando.id_usuario}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
          });
          data = await response.json();
          if (response.ok) {
            const usuarioAtualizado = data.usuario || data;
            setUsuarios(prev => prev.map(u => u.id_usuario === usuarioEditando.id_usuario ? usuarioAtualizado : u));
            alert('Usuário atualizado com sucesso!');
          } else {
            alert(data.message || 'Erro ao atualizar usuário.');
          }
        } else {
          // Cadastro
          response = await fetch('http://localhost:4000/usuario', {
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
            alert('Usuário cadastrado com sucesso!');
          } else {
            alert(data.message || 'Erro ao cadastrar usuário.');
          }
        }
        setIsDialogOpen(false);
        setUsuarioEditando(null);
      } catch (error) {
        alert('Erro de conexão ao salvar usuário.');
      }
    };

  // Mapeamento correto dos campos para filtro
  const filterMap: Record<string, string> = {
    id_usuario: "id_usuario",
    nome_usuario: "nome_usuario",
    cpf: "cpf",
    email: "email",
    situacao: "situacao"
  };
  const filteredData = usuarios.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    const field = filterMap[filterBy] || filterBy;
    const itemValue = (item[field] || "").toString().toLowerCase();
    return itemValue.includes(searchValue);
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  
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
        <SidebarContent />     
      <main className="flex-1 flex flex-col py-6 px-8">
       
        <FilterToolbarUsuario
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterBy}
          onAddClick={() => setIsDialogOpen(true)}
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
                  <TableCell className="text-gray-700">{item.cpf}</TableCell>
                  <TableCell className="text-gray-700">{item.email}</TableCell>
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