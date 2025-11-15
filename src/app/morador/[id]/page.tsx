"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Search, Plus, Eye, ArrowLeft, X } from 'lucide-react';
import { EvolucaoFormModal } from './components/EvolucaoFormModal';
import { EvolucaoEditModal } from './components/EvolucaoEditModal';
import { PrescricaoFormModal } from './components/PrescricaoFormModal';
import { PrescricaoItemEditModal } from './components/PrescricaoItemEditModal';
import { useEvolucoesIndividuais } from './hooks/useEvolucoesIndividuais';
import { usePrescricoes } from './hooks/usePrescricoes';
import HeaderBrand from '@/components/HeaderBrand';
import { API_BASE } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LogoutButton } from '@/components/ui/logout-button';

interface MoradorDetalhe { id_morador: number; nome_completo: string; cpf?: string; rg?: string; situacao?: boolean; }
interface EvolucaoItem { id: number; data: string; hora?: string | null; descricao?: string | null; profissional?: string | null; }

// Prescrições agora fornecidas via hook usePrescricoes

export default function PerfilMoradorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [morador, setMorador] = useState<MoradorDetalhe | null>(null);
  const [tab, setTab] = useState<'evolucoes' | 'prescricoes'>('evolucoes');
  const [userRole, setUserRole] = useState<string | null>(null);
  // Estados de paginação/filtros de evoluções (antes do hook)
  const [ePage, setEPage] = useState(1);
  const [eLimit, setELimit] = useState(10);
  const [eObsFilter, setEObsFilter] = useState(''); // efetivo (aplicado)
  const [eSearchRaw, setESearchRaw] = useState(''); // digitação bruta com debounce
  const [eDataInicio, setEDataInicio] = useState(''); // yyyy-mm-dd
  const [eDataFim, setEDataFim] = useState(''); // yyyy-mm-dd
  // Hook evoluções
  const { dados: evolucoesDados, loading: loadingEvolucoes, erro: erroEvolucoes, total: evolucoesTotal, lastPage: evolucoesLastPage, refresh: refreshEvolucoes } = useEvolucoesIndividuais({
    idMorador: id,
    page: ePage,
    limit: eLimit,
    observacoes: eObsFilter,
    dataInicio: eDataInicio,
    dataFim: eDataFim,
  });
  // Adaptar para shape local
  const evolucoes: EvolucaoItem[] = evolucoesDados.map(ev => {
    const dt = new Date(ev.data_hora);
    const hora = `${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    const usuarioExtra = ev as unknown as { usuario?: { nome_usuario?: string; nome_completo?: string } };
    const profissional = ev.usuario?.nome_completo || usuarioExtra.usuario?.nome_usuario || null;
    return { id: ev.id_evolucao_individual, data: ev.data_hora, hora, descricao: ev.observacoes, profissional };
  });
  const eTotal = evolucoesTotal;
  const eLastPage = evolucoesLastPage;
  // Seleção de evoluções para copiar
  const [moradorCarregando, setMoradorCarregando] = useState(true);
  const [pPage, setPPage] = useState(1);
  const [pLimit, setPLimit] = useState(10);
  const [pObsFilter, setPObsFilter] = useState(''); // efetivo
  const [pSearchRaw, setPSearchRaw] = useState(''); // bruto
  const [pDataInicio, setPDataInicio] = useState('');
  const [pDataFim, setPDataFim] = useState('');
  const {
    filtered: prescricoesFiltradas,
    loading: loadingPrescricoes,
    erro: erroPrescricoes,
    total: prescricoesTotal,
    lastPage: prescricoesLastPage,
    refresh: refreshPrescricoes,
  } = usePrescricoes({ idMorador: id, page: pPage, limit: pLimit, texto: pObsFilter, dataInicio: pDataInicio, dataFim: pDataFim });
  // Estados antigos de criação de evolução substituídos por EvolucaoFormModal
  // (legacy) ref mantida para futuras integrações caso necessário
  // Toast/snackbar
  const [toastMsg, setToastMsg] = useState('');
  // Modal de visualização (formato ficha)
  const [openView, setOpenView] = useState(false);
  const [viewType, setViewType] = useState<'evolucao' | 'prescricao' | null>(null);
  const [viewProfNome, setViewProfNome] = useState('');
  const [viewCaregiver, setViewCaregiver] = useState('');
  const [viewTexto, setViewTexto] = useState('');
  const [viewDataISO, setViewDataISO] = useState('');
  // Modal de edição (novo componente)
  const [openEdit, setOpenEdit] = useState(false);
  const [editEvolucao, setEditEvolucao] = useState<EvolucaoItem | null>(null);
  // Modal Prescrição state
  const [openPrescEdit, setOpenPrescEdit] = useState(false);
  const [editPrescItemId, setEditPrescItemId] = useState<number | null>(null);
  const [editPrescMedicamentoId, setEditPrescMedicamentoId] = useState<number | ''>('');
  const [editPrescPosologia, setEditPrescPosologia] = useState('');

  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || (funcao !== 'Cuidador' && funcao !== 'Enfermeiro')) {
      setAcessoNegado(true);
      setTimeout(() => router.push('/login'), 2000);
      setVerificado(true);
      return;
    }
    // armazena a função do usuário para controle de UI
    setUserRole(funcao);

    fetch(`${API_BASE}/morador/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const mRaw = (data && (data.data ?? data.morador ?? data)) || null;
        const m = mRaw
          ? { id_morador: mRaw.id_morador, nome_completo: mRaw.nome_completo, cpf: mRaw.cpf, rg: mRaw.rg, situacao: mRaw.situacao }
          : null;
        setMorador(m);
        try { if (m?.nome_completo) sessionStorage.setItem(`moradorNome:${id}`, m.nome_completo); } catch {}
        setVerificado(true);
      })
      .catch(() => {
        setMorador(null);
        setVerificado(true);
      })
      .finally(() => setMoradorCarregando(false));
  }, [id, router]);

  // Se a aba atual for 'prescricoes' e o usuário não tiver permissão, volta para 'evolucoes'
  // Define aba padrão e visibilidade com base na role do usuário.
  // - Enfermeiro: apenas 'prescricoes' visível e selecionada.
  // - Outros (ex.: Cuidador): apenas 'evolucoes' visível e selecionada.
  useEffect(() => {
    if (!userRole) return; // aguarda role definida
    if (userRole === 'Enfermeiro') {
      if (tab !== 'prescricoes') setTab('prescricoes');
    } else {
      if (tab !== 'evolucoes') setTab('evolucoes');
    }
  }, [userRole]);

  // Reaplica refresh de prescrições quando mudarmos página/limit (hook já depende). Filtros são client-side.
  useEffect(() => { void refreshPrescricoes(); }, [pPage, pLimit, refreshPrescricoes]);

  // Debounce busca evoluções
  useEffect(() => {
    const t = setTimeout(() => {
      setEObsFilter(eSearchRaw);
      setEPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [eSearchRaw]);

  // Debounce busca prescrições
  useEffect(() => {
    const t = setTimeout(() => {
      setPObsFilter(pSearchRaw);
      setPPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [pSearchRaw]);

  // Limpa seleção quando lista/filtros mudarem
  // (Removido) Lógica de seleção e cópia de evoluções

  // Estados iniciais de verificação
  if (!verificado) return <div className="p-6 text-[#003d99]">Verificando acesso...</div>;
  if (acessoNegado) return <div className="p-6 text-red-600">Acesso negado. Redirecionando...</div>;
  if (moradorCarregando) return <div className="p-6 text-[#003d99]">Carregando dados do morador...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f7fb]">
      <HeaderBrand
        center={
          <div className="flex items-center justify-center">
            <div
              className="text-xs sm:text-sm md:text-base font-medium text-[#003d99] max-w-[50vw] sm:max-w-md truncate"
              title={morador?.nome_completo ? `Morador: ${morador.nome_completo}` : 'Carregando morador...'}
              aria-label={morador?.nome_completo ? `Nome do morador: ${morador.nome_completo}` : 'Carregando nome do morador'}
            >
              {morador?.nome_completo ? (
                <>{morador.nome_completo}</>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#003d99] animate-pulse" />
                  <span className="text-[#4a5b78]">Carregando...</span>
                </span>
              )}
            </div>
          </div>
        }
        left={
          <Button
            variant="ghost"
            className="gap-1 px-2 text-[#003d99] hover:bg-[#e9f1f9]"
            aria-label="Voltar"
            title="Voltar"
            onClick={() => {
              try { if (typeof window !== 'undefined' && window.history.length > 1) { window.history.back(); return; } } catch {}
              router.push('/moradores');
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
        }
        right={tab === 'evolucoes' ? (
          <EvolucaoFormModal
            idMorador={id}
            editando={null}
            onClose={() => { /* noop */ }}
            onSaved={async () => { await refreshEvolucoes(); setToastMsg('Evolução registrada com sucesso!'); setTimeout(()=>setToastMsg(''),3000); }}
          />
        ) : (
          <PrescricaoFormModal
            idMorador={id}
            onSaved={async () => { await refreshPrescricoes(); setToastMsg('Prescrição criada com sucesso!'); setTimeout(()=>setToastMsg(''),3000); }}
          />
        )}
      />

      <main className="flex-1 flex flex-col p-6 sm:p-8 relative">
        {/* Botão Voltar movido para HeaderBrand (slot left) */}

        {/* Abas simples */}
        <Card className="bg-white rounded-2xl p-0 shadow-sm overflow-hidden">
          <div className="border-b border-[#e5eaf1] bg-white px-4 sm:px-6">
            <div className="flex gap-2">
              {/* Mostrar apenas a aba relevante para a role atual */}
              {userRole !== 'Enfermeiro' && (
                <TabButton active={tab === 'evolucoes'} onClick={() => setTab('evolucoes')}>Evoluções</TabButton>
              )}
              {userRole === 'Enfermeiro' && (
                <TabButton active={tab === 'prescricoes'} onClick={() => setTab('prescricoes')}>Prescrições</TabButton>
              )}
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {tab === 'evolucoes' ? (
              <div>
                {/* Filtros reorganizados e com contraste melhor */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-[minmax(240px,1fr)_auto_auto_auto] gap-3 items-end">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#002c6c]" />
                    <Input
                      className="pl-9 pr-8 placeholder:text-gray-700"
                      placeholder="Buscar por texto ou profissional"
                      aria-label="Buscar evoluções"
                      value={eSearchRaw}
                      onChange={(e) => { setESearchRaw(e.target.value); }}
                    />
                    {eSearchRaw && (
                      <button
                        type="button"
                        aria-label="Limpar busca"
                        onClick={() => { setESearchRaw(''); setEObsFilter(''); setEPage(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a5b78] hover:text-[#003d99]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#002c6c]">Início</label>
                    <Input type="date" value={eDataInicio} onChange={(e) => { setEDataInicio(e.target.value); setEPage(1); }} className="placeholder:text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#002c6c]">Fim</label>
                    <Input type="date" value={eDataFim} onChange={(e) => { setEDataFim(e.target.value); setEPage(1); }} className="placeholder:text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#002c6c]">Itens por página:</span>
                    <select
                      className="border border-[#e5eaf1] rounded-md px-3 py-2 text-sm text-[#002c6c] bg-white"
                      value={eLimit}
                      onChange={(e) => { setELimit(Number(e.target.value)); setEPage(1); }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {/* (Removido) Barra de seleção e botão 'Copiar selecionadas' */}

                {erroEvolucoes && (
                  <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{erroEvolucoes}</div>
                )}
                {loadingEvolucoes && (
                  <div className="space-y-2" aria-label="Carregando evoluções">
                    {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-10 rounded bg-[#e2ecf6] animate-pulse" />))}
                  </div>
                )}
                {!loadingEvolucoes && evolucoes.length === 0 && !erroEvolucoes && (
                  <div className="text-[#6b87b5] text-sm">Nenhuma evolução registrada.</div>
                )}
                {!loadingEvolucoes && evolucoes.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {/* Coluna de seleção removida */}
                        <TableHead className="text-[#002c6c]">Data</TableHead>
                        <TableHead className="text-[#002c6c]">Hora</TableHead>
                        <TableHead className="text-[#002c6c]">Profissional</TableHead>
                        <TableHead className="text-[#002c6c] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evolucoes.map((ev) => (
                        <TableRow key={ev.id} className="hover:bg-[#e9f1f9]/40">
                          {/* Checkbox de seleção removido */}
                          <TableCell className="text-gray-800">{new Date(ev.data).toLocaleDateString()}</TableCell>
                          <TableCell className="text-gray-700">{ev.hora ?? '-'}</TableCell>
                          <TableCell className="text-gray-700">{ev.profissional ?? '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                title="Ver"
                                onClick={() => {
                                  setViewType('evolucao');
                                  setViewProfNome(ev.profissional ?? '');
                                  setViewTexto(ev.descricao ?? '');
                                  setViewDataISO(ev.data);
                                  setOpenView(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon" title="Editar" onClick={() => { setEditEvolucao(ev); setOpenEdit(true); }}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

                {/* Paginação */}
                <div className="mt-4 flex items-center justify-between text-sm text-[#4a5b78]">
                  <div>
                    {eTotal > 0 ? (
                      <span>
                        Mostrando {Math.min((ePage - 1) * eLimit + 1, eTotal)}–{Math.min(ePage * eLimit, eTotal)} de {eTotal}
                      </span>
                    ) : (
                      <span>Nenhum registro</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" disabled={ePage <= 1} onClick={() => setEPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                    <span>Página {ePage} de {eLastPage}</span>
                    <Button variant="outline" disabled={ePage >= eLastPage} onClick={() => setEPage((p) => Math.min(eLastPage, p + 1))}>Próxima</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {/* Filtros Prescrições - idênticos aos de Evoluções */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-[minmax(240px,1fr)_auto_auto_auto] gap-3 items-end">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#002c6c]" />
                    <Input
                      className="pl-9 pr-8 placeholder:text-gray-700"
                      placeholder="Buscar por medicamento, posologia ou cuidador"
                      aria-label="Buscar prescrições"
                      value={pSearchRaw}
                      onChange={(e) => { setPSearchRaw(e.target.value); }}
                    />
                    {pSearchRaw && (
                      <button
                        type="button"
                        aria-label="Limpar busca"
                        onClick={() => { setPSearchRaw(''); setPObsFilter(''); setPPage(1); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4a5b78] hover:text-[#003d99]"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#002c6c]">Início</label>
                    <Input type="date" value={pDataInicio} onChange={(e) => { setPDataInicio(e.target.value); setPPage(1); }} className="placeholder:text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-[#002c6c]">Fim</label>
                    <Input type="date" value={pDataFim} onChange={(e) => { setPDataFim(e.target.value); setPPage(1); }} className="placeholder:text-gray-700" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#002c6c]">Itens por página:</span>
                    <select
                      className="border border-[#e5eaf1] rounded-md px-3 py-2 text-sm text-[#002c6c] bg-white"
                      value={pLimit}
                      onChange={(e) => { setPLimit(Number(e.target.value)); setPPage(1); }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {erroPrescricoes && (
                  <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{erroPrescricoes}</div>
                )}
                {loadingPrescricoes && (
                  <div className="space-y-2" aria-label="Carregando prescrições">
                    {Array.from({length:3}).map((_,i)=>(<div key={i} className="h-10 rounded bg-[#e2ecf6] animate-pulse" />))}
                  </div>
                )}
                {!loadingPrescricoes && !erroPrescricoes && prescricoesFiltradas.length === 0 && (
                  <div className="text-[#6b87b5] text-sm">Nenhuma prescrição encontrada.</div>
                )}
                {!loadingPrescricoes && !erroPrescricoes && prescricoesFiltradas.length > 0 && (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[#002c6c]">Data</TableHead>
                          <TableHead className="text-[#002c6c]">Hora</TableHead>
                          <TableHead className="text-[#002c6c]">Médico</TableHead>
                          <TableHead className="text-[#002c6c]">Profissional</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {prescricoesFiltradas.map((p, idx) => (
                          <TableRow key={(p.id_medicamento_prescricao ?? `${p.id_prescricao}-${idx}`)} className="hover:bg-[#e9f1f9]/40">
                            <TableCell className="text-gray-800">{new Date(p.data_iso).toLocaleDateString()}</TableCell>
                            <TableCell className="text-gray-700">{p.horario ?? '-'}</TableCell>
                            <TableCell className="text-gray-700">{p.medico ?? '-'}</TableCell>
                            <TableCell className="text-gray-700">{(p as unknown as { cuidador?: string | null }).cuidador ?? '-'}</TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Ver"
                                  onClick={() => {
                                    setViewType('prescricao');
                                    setViewProfNome(p.medico ?? '');
                                    setViewCaregiver(((p as unknown as { cuidador?: string | null }).cuidador) || '');
                                    setViewTexto(p.observacoes || '');
                                    setViewDataISO(p.data_iso);
                                    setOpenView(true);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Editar"
                                  onClick={async () => {
                                    if (!p.id_medicamento_prescricao) { alert('Não é possível editar este item.'); return; }
                                    setEditPrescItemId(p.id_medicamento_prescricao);
                                    setEditPrescMedicamentoId(p.id_medicamento ?? '');
                                    setEditPrescPosologia(p.posologia || '');
                                    setOpenPrescEdit(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Paginação Prescrições */}
                    <div className="mt-2 flex items-center justify-between text-sm text-[#4a5b78]">
                      <div>
                        {prescricoesTotal > 0 ? (
                          <span>
                            Mostrando {Math.min((pPage - 1) * pLimit + 1, prescricoesTotal)}–{Math.min(pPage * pLimit, prescricoesTotal)} de {prescricoesTotal}
                          </span>
                        ) : (<span>Nenhum registro</span>)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={pPage <= 1} onClick={() => setPPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                        <span>Página {pPage} de {prescricoesLastPage}</span>
                        <Button variant="outline" disabled={pPage >= prescricoesLastPage} onClick={() => setPPage((p) => Math.min(prescricoesLastPage, p + 1))}>Próxima</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
  {/* Botão flutuante de logout no canto inferior esquerdo */}
        <div className="absolute bottom-6 left-6 sm:bottom-8 sm:left-8">
          <LogoutButton variant="floating" />
        </div>
      </main>
      {/* Modal de visualização em formato de ficha */}
  <Dialog open={openView} onOpenChange={(v) => { setOpenView(v); if (!v) { setViewType(null); setViewProfNome(''); setViewTexto(''); setViewDataISO(''); } }}>
        <DialogContent className="print-container sm:max-w-[760px] bg-white" aria-describedby={undefined}>
          {/* Header acessível (título invisível para screen readers exigido pelo Radix) */}
          <DialogHeader className="sr-only">
            <DialogTitle>
              {viewType === 'evolucao' ? 'Ficha de evolução individual' : 'Prescrição de medicamentos'}
            </DialogTitle>
          </DialogHeader>
          <div id="print-area" className="print-area space-y-5 px-2 sm:px-4 py-2">
            {/* Cabeçalho com logo e título */}
            <div className="flex items-start gap-3">
              <Image src="/logo-svvp.svg" alt="Casa Dona Zulmira" width={40} height={40} className="h-10 w-10 object-contain" />
              <div className="flex-1">
                <h2 className="text-[#002c6c] font-semibold text-base sm:text-lg">
                  {viewType === 'evolucao' ? 'Ficha de evolução individual' : 'Prescrição de medicamentos'}
                  <span className="font-normal"> - 01</span>
                </h2>
              </div>
            </div>

            {/* Identificação */}
            <div className="text-sm text-gray-900 space-y-1">
              <p>
                <span className="font-semibold">Nome do morador:</span>
                <span className="ml-1 text-[#0d5fa8] font-semibold">{morador?.nome_completo ?? '-'}</span>
              </p>
              {viewType === 'evolucao' ? (
                <>
                  <p>
                    <span className="font-semibold">Nome do enfermeiro:</span>
                    <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <span className="font-semibold">Nome do médico:</span>
                    <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Nome do cuidador:</span>
                    <span className="ml-1 text-[#0d5fa8] font-semibold">{viewCaregiver || '-'}</span>
                  </p>
                </>
              )}
            </div>

            {/* Corpo */}
            <div className="pt-2">
              <p className="font-semibold text-gray-900 text-sm mb-2">Intercorrências:</p>
              <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                {viewTexto || '-'}
              </div>
            </div>

            {/* Assinatura */}
            <div className="pt-10 signature-block">
              <div className="h-px bg-[#cfd8ea]" />
              <p className="text-center text-xs text-gray-700 mt-2">Assinatura do cuidador responsável</p>
            </div>

            {/* Rodapé com cidade e data */}
            <div className="text-center text-xs text-gray-700">
              <p className="font-semibold">Governador Valadares - MG</p>
              <p>{new Date(viewDataISO || Date.now()).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => window.print()}>Imprimir</Button>
            <Button type="button" onClick={() => setOpenView(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Conteúdo dedicado à impressão (fora do modal) */}
      <div id="print-ficha" className="hidden">
        <div className="print-body space-y-5 px-6 py-4">
          <div className="flex items-start gap-3">
            <Image src="/logo-svvp.svg" alt="Casa Dona Zulmira" width={40} height={40} className="h-10 w-10 object-contain" />
            <div className="flex-1">
              <h2 className="text-[#002c6c] font-semibold text-base">
                {viewType === 'evolucao' ? 'Ficha de evolução individual' : 'Prescrição de medicamentos'}
                <span className="font-normal"> - 01</span>
              </h2>
            </div>
          </div>
          <div className="text-sm text-gray-900 space-y-1">
            <p>
              <span className="font-semibold">Nome do morador:</span>
              <span className="ml-1 text-[#0d5fa8] font-semibold">{morador?.nome_completo ?? '-'}</span>
            </p>
            {viewType === 'evolucao' ? (
              <>
                <p>
                  <span className="font-semibold">Nome do enfermeiro:</span>
                  <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                </p>
              </>
            ) : (
              <>
                <p>
                  <span className="font-semibold">Nome do médico:</span>
                  <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                </p>
                <p>
                  <span className="font-semibold">Nome do cuidador:</span>
                  <span className="ml-1 text-[#0d5fa8] font-semibold">{viewCaregiver || '-'}</span>
                </p>
              </>
            )}
          </div>
          <div className="pt-2">
            <p className="font-semibold text-gray-900 text-sm mb-2">Intercorrências:</p>
            <div className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
              {viewTexto || '-'}
            </div>
          </div>
          <div className="pt-10 signature-block">
            <div className="h-px bg-[#cfd8ea]" />
            <p className="text-center text-xs text-gray-700 mt-2">Assinatura do cuidador responsável</p>
          </div>
          <div className="text-center text-xs text-gray-700">
            <p className="font-semibold">Governador Valadares - MG</p>
            <p>{new Date(viewDataISO || Date.now()).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>
      {/* Regras globais de impressão: imprime apenas a ficha, no topo */}
      <style>
        {`
          @media print {
            html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
            /* Esconde tudo por padrão usando visibility para não afetar ancestrais */
            body * { visibility: hidden !important; }
            /* Mostra somente a ficha de impressão e seu conteúdo */
            #print-ficha { display: block !important; position: fixed !important; top: 0; left: 0; right: 0; width: 100% !important; transform: none !important; margin: 0 !important; padding: 0 !important; background: #ffffff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            #print-ficha, #print-ficha * { visibility: visible !important; }
            #print-ficha img { visibility: visible !important; }
            #print-ficha .print-body { padding: 0 !important; }
            /* Margens de página para ficar mais próximo do modelo (top/left/right/bottom) */
            @page { size: A4; margin: 10mm 12mm 12mm 12mm; }

            /* Tipografia e espaçamentos para impressão */
            #print-ficha .print-body { font-size: 11pt; line-height: 1.35; }
            #print-ficha h2 { font-size: 13pt; margin: 0; }
            #print-ficha p { margin: 0 0 2mm 0; }
            #print-ficha .signature-block { margin-top: 24mm !important; }
          }
        `}
      </style>
      {/* Modal para editar item de prescrição */}
  <PrescricaoItemEditModal
        open={openPrescEdit}
        onOpenChange={(v) => { setOpenPrescEdit(v); if (!v) { /* reset handled inside */ } }}
        itemId={editPrescItemId}
        medicamentoIdInicial={editPrescMedicamentoId}
        posologiaInicial={editPrescPosologia}
        onSaved={async () => { await refreshPrescricoes(); setToastMsg('Prescrição atualizada com sucesso!'); setTimeout(()=>setToastMsg(''),3000); }}
      />

      {/* Modal de edição de evolução (novo componente) */}
  <EvolucaoEditModal
        evolucao={editEvolucao ? {
          id_evolucao_individual: editEvolucao.id,
          data_hora: editEvolucao.data,
          observacoes: editEvolucao.descricao || '',
          usuario: editEvolucao.profissional ? { id_usuario: 0, nome_completo: editEvolucao.profissional } : undefined,
        } : null}
        open={openEdit}
        onOpenChange={(v) => { setOpenEdit(v); if (!v) { setEditEvolucao(null); } }}
        onSaved={async () => { await refreshEvolucoes(); setToastMsg('Evolução atualizada com sucesso!'); setTimeout(()=>setToastMsg(''),3000); }}
      />
      {/* Botão flutuante substituir "N" por "+" que abre o modal de criação */}
      <button
        aria-label={tab === 'evolucoes' ? 'Cadastrar evolução' : 'Nova prescrição'}
        title={tab === 'evolucoes' ? 'Cadastrar evolução' : 'Nova prescrição'}
        onClick={() => (tab === 'evolucoes'
          ? document.querySelector<HTMLButtonElement>('button[aria-label="Cadastrar evolução"]')?.click()
          : document.querySelector<HTMLButtonElement>('button[data-trigger="prescricao-create"]')?.click())}
        className="fixed left-4 bottom-4 h-12 w-12 rounded-full bg-[#003d99] text-white shadow-lg flex items-center justify-center hover:bg-[#002c6c]"
      >
        <Plus className="h-6 w-6" />
      </button>
      {/* Toast / Snackbar */}
  {toastMsg && (
        <div role="status" aria-live="polite" className="fixed top-4 right-4 z-50 bg-white text-[#003d99] border border-[#e5eaf1] shadow-lg rounded-md px-4 py-3">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
        active ? 'text-[#003d99] border-[#003d99]' : 'text-[#4a5b78] border-transparent hover:text-[#003d99]'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
