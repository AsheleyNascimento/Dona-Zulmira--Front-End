'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, LineChart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/ui/logout-button';
import { API_BASE } from '@/lib/api';

interface Morador {
  id_morador: number;
  nome_completo: string;
  situacao?: boolean | null;
}

const ITEMS_PER_PAGE = 8;

export default function MoradorListaPage() {
  const router = useRouter();
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [moradores, setMoradores] = useState<Morador[]>([]);
  const [busca, setBusca] = useState('');
  const [filterBy, setFilterBy] = useState<'nome'>('nome');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || funcao !== 'Cuidador' && funcao !== 'Enfermeiro') {
      setAcessoNegado(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
      setVerificado(true);
      return;
    }

  // <-- LISTAGEM: fetch para o backend GET /morador (popula estado `moradores`)
  fetch(`${API_BASE}/morador`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        type ApiMorador = {
          id_morador: number;
          nome_completo: string;
          grau_ilpi?: string | number | null;
          mobilidade?: string | null;
          dependencia_atividades?: string | null;
          dependencias?: string | null;
        };
        const list = (Array.isArray(data.data) ? data.data : []) as Array<ApiMorador>;
        const mapped: Morador[] = list.map((m) => ({
          id_morador: m.id_morador,
          nome_completo: m.nome_completo,
          situacao: (m as any).situacao ?? null,
        }));
  // debug: inspecionar dados retornados do backend (temporário)
  try { console.log('moradores fetched:', mapped); } catch {}
  setMoradores(mapped);
        setVerificado(true);
      })
      .catch(() => {
        setMoradores([]);
        setVerificado(true);
      });
  }, [router]);

  const filtrados = useMemo(() => {
    const s = busca.trim().toLowerCase();
    if (!s) return moradores;
    if (filterBy === 'nome') {
      return moradores.filter((m) => m.nome_completo?.toLowerCase().includes(s));
    }
    return moradores;
  }, [busca, moradores, filterBy]);

  const totalPages = Math.max(1, Math.ceil(filtrados.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, filtrados.length);
  // <-- PAGINAÇÃO: fatia atual que será exibida na tabela
  // `filtrados` -> `paginated`
  const paginated = filtrados.slice(startIdx, endIdx);

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

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      <aside className="w-full lg:w-64 flex flex-col bg-white p-6 border-b lg:border-r lg:border-b-0 border-[#e9f1f9]">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo-ssvp.png" alt="Logo SSVP Casa Dona Zulmira" width={96} height={96} className="w-24 h-24" />
          <h2 className="text-[#002c6c] text-sm font-bold uppercase text-center">Casa Dona Zulmira</h2>
        </div>
        <LateralNav />
        <div className="mt-auto pt-6 border-t border-[#e9f1f9]">
          <LogoutButton />
        </div>
      </aside>

  <main className="flex-1 flex flex-col p-6 sm:p-8 relative">

        <div className="w-full bg-white/60 backdrop-blur rounded-3xl shadow-sm p-3 mb-6">
          <div className="flex items-center gap-3 px-2">
            <Search className="text-[#6b87b5] w-6 h-6" />
            <Input
              placeholder="Pesquise..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setCurrentPage(1); }}
              className="border-none shadow-none focus-visible:ring-0 text-[#002c6c] text-base"
            />
          </div>
        </div>

        <Card className="rounded-3xl border border-[#cfd8e3]/60 shadow-md bg-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-[#002c6c]">Todos os moradores</h2>
            <div className="text-sm text-[#6b87b5] flex items-center gap-2">
              <span>Filtrar por :</span>
              <Select value={filterBy} onValueChange={(v) => setFilterBy(v as 'nome')}>
                <SelectTrigger className="w-[140px] h-8 text-[#002c6c]">
                  <SelectValue placeholder="Nome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#002c6c] font-semibold">ID</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Nome completo</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Situação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* <-- RENDER: mapeamento de `paginated` — cada linha representa um morador */}
              {paginated.map((m) => (
                <TableRow
                  key={m.id_morador}
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer"
                  onClick={() => router.push(`/morador/${m.id_morador}`)}
                >
                  <TableCell className="text-gray-800 font-medium">{m.id_morador}</TableCell>
                  <TableCell className="text-gray-700">{m.nome_completo ?? '-'}</TableCell>
                  <TableCell className="text-gray-700">{m.situacao === null || m.situacao === undefined ? '-' : m.situacao ? 'Ativo' : 'Inativo'}</TableCell>
                </TableRow>
              ))}
              {paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-gray-500">Nenhum morador encontrado.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 text-sm text-gray-600">
            <span>
              Exibindo {filtrados.length === 0 ? 0 : startIdx + 1} à {endIdx} de {filtrados.length} moradores
            </span>
            <div className="flex gap-1 items-center">
              <button
                className="w-8 h-8 rounded-md border border-[#cfd8e3] text-[#002c6c] disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Página anterior"
              >
                ‹
              </button>
              {getPaginationItems(currentPage, totalPages).map((it, idx) =>
                it === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-[#6b87b5]">…</span>
                ) : (
                  <button
                    key={`page-${it}`}
                    className={`w-8 h-8 rounded-md ${currentPage === it ? 'bg-[#002c6c] text-white' : 'border border-[#002c6c] text-[#002c6c] hover:bg-[#e9f1f9]'}`}
                    onClick={() => setCurrentPage(it as number)}
                  >
                    {it}
                  </button>
                )
              )}
              <button
                className="w-8 h-8 rounded-md border border-[#cfd8e3] text-[#002c6c] disabled:opacity-40"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Próxima página"
              >
                ›
              </button>
            </div>
          </div>
        </Card>
        {/* Logout agora movido para a barra lateral */}
      </main>
    </div>
  );
}

function LateralNav() {
  const router = useRouter();
  const pathname = usePathname();
  const items = [
    { label: 'Relatórios', href: '/relatoriodiariogeral', icon: <LineChart className="h-5 w-5" /> },
  ];
  return (
    <nav className="mt-8 flex flex-col gap-2 text-[0.95rem] text-[#002c6c]">
      {items.map((it) => {
  const active = pathname === it.href;
        return (
          <Button
            key={it.href}
            variant="ghost"
            className={`justify-between px-3 cursor-pointer hover:bg-[#e9f1f9]/60 ${active ? 'bg-[#e9f1f9]' : ''}`}
            onClick={() => router.push(it.href)}
          >
            <span className="flex items-center gap-3">{it.icon}{it.label}</span>
            <span className="text-[#003d99]">›</span>
          </Button>
        );
      })}
    </nav>
  );
}

function getPaginationItems(current: number, total: number): Array<number | '…'> {
  const items: Array<number | '…'> = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) items.push(i);
    return items;
  }
  const showLeft = Math.max(1, current - 1);
  const showRight = Math.min(total, current + 1);
  // Always show first
  items.push(1);
  if (showLeft > 2) items.push('…');
  for (let i = showLeft; i <= showRight; i++) {
    if (i !== 1 && i !== total) items.push(i);
  }
  if (showRight < total - 1) items.push('…');
  // Always show last
  items.push(total);
  return items;
}
