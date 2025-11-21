"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FilterToolbar } from '@/components/ui/filter-toolbar';
import { Users, ClipboardList } from 'lucide-react';
import type { RelatorioDiarioGeral } from '@/types/relatorio';
import { RelatorioFormModal } from './components/RelatorioFormModal';
import { RelatorioViewModal } from './components/RelatorioViewModal';
import { useRelatorios } from './hooks/useRelatorios';
import { useEvolucoes } from './hooks/useEvolucoes';
import { LogoutButton } from '@/components/ui/logout-button';

const ITEMS_PER_PAGE = 10;

export default function RelatorioDiarioGeralPage() {
  const router = useRouter();
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const { relatorios, loadingRelatorios, erroRelatorios, refreshRelatorios } = useRelatorios();
  const [editando, setEditando] = useState<RelatorioDiarioGeral | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'observacoes' | 'profissional'>('observacoes');

  // Visualização
  const [openView, setOpenView] = useState(false);
  const [viewRelatorio, setViewRelatorio] = useState<RelatorioDiarioGeral | null>(null);

  const { evolucoes: evolucoesDisponiveis, loadingEvolucoes, erroEvolucoes } = useEvolucoes();
  const [currentPage, setCurrentPage] = useState(1);

  // Carregamento inicial (apenas autenticação e evoluções; relatórios via hook)
  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || (funcao !== 'Cuidador' && funcao !== 'Enfermeiro')) {
      setAcessoNegado(true);
      setTimeout(() => { router.push('/login'); }, 2000);
      setVerificado(true);
      return;
    }
    // Evoluções agora carregadas via hook (useEvolucoes). Apenas marcamos verificado.
    setVerificado(true);
  }, [router]);

  const filtrados = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return relatorios;
    if (filterBy === 'observacoes') return relatorios.filter(r => r.observacoes?.toLowerCase().includes(s));
    if (filterBy === 'profissional') return relatorios.filter(r => r.usuario?.nome_completo?.toLowerCase().includes(s));
    return relatorios;
  }, [searchTerm, relatorios, filterBy]);

  const ordenados = filtrados; // sem ordenação para paridade com moradores

  const totalPages = Math.max(1, Math.ceil(ordenados.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, ordenados.length);
  const paginated = ordenados.slice(startIdx, endIdx);

  // Lógicas de criação/edição/IA e filtragens foram extraídas para os componentes dedicados

  // refreshRelatorios fornecido pelo hook

  function iniciarEdicao(rel: RelatorioDiarioGeral) { setEditando(rel); }

  function abrirVisualizacao(rel: RelatorioDiarioGeral) {
    setViewRelatorio(rel);
    setOpenView(true);
  }

  // Callback após refresh para destacar último criado/atualizado
  const handleAfterSave = async () => { await refreshRelatorios(); };

  // Atalhos de teclado gerenciados no componente de formulário

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
    <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); .font-poppins { font-family: 'Poppins', sans-serif; }`}
      </style>
      <SidebarPadrao />
      <main className="relative flex-1 flex flex-col py-6 px-8">
        <FilterToolbar
          onSearchChange={(v)=>{ setSearchTerm(v); setCurrentPage(1); }}
          onFilterChange={(v)=>{ setFilterBy(v as 'observacoes' | 'profissional'); setCurrentPage(1); }}
          filterValue={filterBy}
          showAddButton={false}
          filterOptions={[
            { value: 'observacoes', label: 'Observações' },
            { value: 'profissional', label: 'Profissional' },
          ]}
        />
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <h2 className="text-xl font-bold text-[#002c6c]">Relatórios Diários Gerais</h2>
          <div className="hidden" />
        </div>
        <Card className="rounded-2xl border border-[#cfd8e3] shadow-md bg-white p-4">
          {erroRelatorios && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm flex items-center justify-between" role="alert">
              <span>{erroRelatorios}</span>
              <Button size="sm" variant="outline" className="h-7" onClick={() => refreshRelatorios()}>Tentar novamente</Button>
            </div>
          )}
          <div className="mb-4">
            <RelatorioFormModal
              editando={editando}
              setEditando={setEditando}
              evolucoesDisponiveis={evolucoesDisponiveis}
              loadingEvolucoes={loadingEvolucoes}
              erroEvolucoes={erroEvolucoes}
              onRefresh={handleAfterSave}
              triggerLabel="Novo"
            />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#002c6c] font-semibold">Data/Hora</TableHead>
                <TableHead className="text-[#002c6c] font-semibold">Profissional</TableHead>
                <TableHead className="text-[#002c6c] font-semibold w-[42%] min-w-[320px]">Observações (resumo)</TableHead>
                <TableHead className="text-[#002c6c] font-semibold w-[12%] text-nowrap">Evoluções</TableHead>
                <TableHead className="text-[#002c6c] font-semibold text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingRelatorios && relatorios.length === 0 &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`} className="animate-pulse">
                    <TableCell className="py-4"><div className="h-4 w-24 bg-[#e2eaf2] rounded" /></TableCell>
                    <TableCell><div className="h-4 w-40 bg-[#e2eaf2] rounded" /></TableCell>
                    <TableCell><div className="h-4 w-64 bg-[#e2eaf2] rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-[#e2eaf2] rounded" /></TableCell>
                    <TableCell className="text-right"><div className="h-4 w-20 bg-[#e2eaf2] rounded ml-auto" /></TableCell>
                  </TableRow>
                ))}
              {paginated.map((r) => {
                const data = r.data_hora ? new Date(r.data_hora) : null;
                const dataFmt = data ? data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
                return (
                  <TableRow
                    key={r.id_relatorio_diario_geral}
                    className="hover:bg-[#e9f1f9]/50 cursor-pointer border-b"
                    onClick={() => iniciarEdicao(r)}
                  >
                    <TableCell className="text-gray-800 font-medium">{dataFmt}</TableCell>
                    <TableCell className="text-gray-700">{r.usuario?.nome_completo ?? '-'}</TableCell>
                    <TableCell className="text-gray-700 max-w-[480px] w-[42%] align-top">
                      <span className="block truncate" title={r.observacoes || undefined}>
                        {r.observacoes ? (r.observacoes.length > 120 ? r.observacoes.slice(0,120) + '…' : r.observacoes) : '-'}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 w-[12%] align-top text-nowrap">
                      {r.evolucoes?.length ? `${r.evolucoes.length} ${r.evolucoes.length === 1 ? 'evolução' : 'evoluções'}` : (r.evolucaoindividual?.id_evolucao_individual ? `1 (legado #${r.evolucaoindividual.id_evolucao_individual})` : '-')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button aria-label="Editar relatório" variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); iniciarEdicao(r); }}>Editar</Button>
                        <Button aria-label="Ver relatório" variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={(e) => { e.stopPropagation(); abrirVisualizacao(r); }}>Ver</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!loadingRelatorios && paginated.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12">
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="rounded-full bg-[#e9f1f9] p-4 text-[#002c6c]">
                        <ClipboardList className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#002c6c]">Nenhum relatório encontrado</h3>
                        {searchTerm ? (
                          <p className="text-sm text-[#4a5b78] mt-1">Tente alterar os filtros ou limpar a busca.</p>
                        ) : (
                          <p className="text-sm text-[#4a5b78] mt-1">Comece registrando o primeiro acompanhamento do dia.</p>
                        )}
                      </div>
                      <Button onClick={() => setEditando({} as RelatorioDiarioGeral)} className="bg-[#003d99] hover:bg-[#002c6c] text-white">Cadastrar relatório</Button>
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-xs text-[#003d99] hover:underline" aria-label="Limpar busca">Limpar busca</button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
            <span>Exibindo {ordenados.length === 0 ? 0 : startIdx + 1} a {Math.min(endIdx, ordenados.length)} de {ordenados.length} relatórios</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full hover:bg-[#e9f1f9]/50 cursor-pointer" onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}>‹</Button>
              {Array.from({ length: totalPages }, (_,i)=> i+1).map(p => (
                <Button key={p} size="sm" className={`w-8 h-8 rounded-full ${currentPage===p ? 'bg-[#002c6c] text-white' : 'border border-[#002c6c] text-[#002c6c] hover:bg-[#e9f1f9]'}`} onClick={()=>setCurrentPage(p)}>{p}</Button>
              ))}
              <Button variant="ghost" size="sm" className="w-8 h-8 rounded-full hover:bg-[#e9f1f9]/50 cursor-pointer" onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>›</Button>
            </div>
          </div>
        </Card>
        <RelatorioViewModal relatorio={viewRelatorio} open={openView} onOpenChange={(v)=>{ if(!v){ setOpenView(false); setViewRelatorio(null);} else { setOpenView(true);} }} />
      </main>
    </div>
  );
}
function SidebarPadrao(){
  const router = useRouter();
  const pathname = usePathname();
  const items = [
    { href: '/morador', label: 'Lista de Moradores', icon: <Users className='h-5 w-5'/> },
  ];
  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
      <div className="flex items-center mb-8">
        <Image src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" width={48} height={48} />
        <h2 className="text-[#002c6c] text-lg font-bold uppercase tracking-tight">CASA DONA ZULMIRA</h2>
      </div>
      <nav className="flex flex-col gap-2 mt-2 text-[1em] text-[#002c6c] flex-1">
        {items.map(item => (
          <Button
            key={item.href}
            variant="ghost"
            className={`justify-start gap-3 px-3 cursor-pointer hover:bg-[#e9f1f9]/50 ${pathname === item.href ? 'bg-[#e9f1f9]' : ''}`}
            onClick={()=>router.push(item.href)}
          >
            {item.icon}
            {item.label}
          </Button>
        ))}
      </nav>
      <div className="pt-4 border-t border-[#e9f1f9]">
        <LogoutButton />
      </div>
    </aside>
  );
}

// Paginação simples sem elipses para padronização com moradores
