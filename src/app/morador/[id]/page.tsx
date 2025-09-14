'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotebookPen, Pencil, Trash2, Search, Plus } from 'lucide-react';
import HeaderBrand from '@/components/HeaderBrand';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface MoradorDetalhe {
  id_morador: number;
  nome_completo: string;
  cpf?: string;
  rg?: string;
  situacao?: boolean;
}

interface EvolucaoItem {
  id: number;
  data: string; // ISO date
  hora?: string | null;
  descricao?: string | null;
  profissional?: string | null;
}

interface PrescricaoItem {
  id: number; // id_prescricao
  data: string; // ISO date (aplicacao_data_hora ou 1º dia do mes/ano)
  medico?: string | null; // medico_nome
  aplicador?: string | null; // u_aplicador
  horario?: string | null; // HH:mm derivado de aplicacao_data_hora
  vinculadoPor?: string | null; // vinculado_por
  observacoes?: string | null; // nome_medicamento + ' — ' + posologia
  itemId?: number; // id_medicamento_prescricao (para edição)
  medicamentoId?: number | null; // id_medicamento
  posologia?: string | null; // posologia do item
}

export default function PerfilMoradorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params?.id);

  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [morador, setMorador] = useState<MoradorDetalhe | null>(null);
  const [tab, setTab] = useState<'evolucoes' | 'prescricoes'>('evolucoes');
  const [evolucoes, setEvolucoes] = useState<EvolucaoItem[]>([]);
  const [loadingEvolucoes, setLoadingEvolucoes] = useState(false);
  const [ePage, setEPage] = useState(1);
  const [eLimit, setELimit] = useState(10);
  const [eTotal, setETotal] = useState(0);
  const [eLastPage, setELastPage] = useState(1);
  const [eObsFilter, setEObsFilter] = useState('');
  const [eDataInicio, setEDataInicio] = useState(''); // yyyy-mm-dd
  const [eDataFim, setEDataFim] = useState(''); // yyyy-mm-dd
  // Seleção de evoluções para copiar
  const [selectedEvoIds, setSelectedEvoIds] = useState<Set<number>>(new Set());
  const [moradorCarregando, setMoradorCarregando] = useState(true);
  const [prescricoes, setPrescricoes] = useState<PrescricaoItem[]>([]);
  const [loadingPrescricoes, setLoadingPrescricoes] = useState(false);
  const [pPage, setPPage] = useState(1);
  const [pLimit, setPLimit] = useState(10);
  const [pTotal, setPTotal] = useState(0);
  const [pLastPage, setPLastPage] = useState(1);
  const [pObsFilter, setPObsFilter] = useState('');
  const [pDataInicio, setPDataInicio] = useState(''); // yyyy-mm-dd
  const [pDataFim, setPDataFim] = useState(''); // yyyy-mm-dd
  // Modal Evolução state
  const [openEvo, setOpenEvo] = useState(false);
  const [evoDescricao, setEvoDescricao] = useState('');
  const [evoSubmitting, setEvoSubmitting] = useState(false);
  const [evoError, setEvoError] = useState('');
  const [evoSuccess, setEvoSuccess] = useState('');
  const MAX_DESC = 1000;
  const evoFormRef = useRef<HTMLFormElement | null>(null);
  // Toast/snackbar
  const [toastMsg, setToastMsg] = useState('');
  // Modal de visualização (formato ficha)
  const [openView, setOpenView] = useState(false);
  const [viewType, setViewType] = useState<'evolucao' | 'prescricao' | null>(null);
  const [viewProfNome, setViewProfNome] = useState('');
  const [viewTexto, setViewTexto] = useState('');
  const [viewDataISO, setViewDataISO] = useState('');
  // Dialog para editar evolução
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editDescricao, setEditDescricao] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');
  // Modal Prescrição state
  const [openPresc, setOpenPresc] = useState(false);
  const [prescSubmitting, setPrescSubmitting] = useState(false);
  const [prescError, setPrescError] = useState('');
  const [prescSuccess, setPrescSuccess] = useState('');
  // Campos da prescrição completa
  const [pIdMedico, setPIdMedico] = useState<number | ''>('');
  const [pMes, setPMes] = useState(''); // MM
  const [pAno, setPAno] = useState(''); // YYYY
  type PrescItem = { id_medicamento: number | ''; posologia: string };
  const [pItens, setPItens] = useState<PrescItem[]>([{ id_medicamento: '', posologia: '' }]);
  // Opções
  const [medicosOpt, setMedicosOpt] = useState<Array<{ id: number; nome: string }>>([]);
  const [medicamentosOpt, setMedicamentosOpt] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);
  // Editar item de prescrição (modal)
  const [openPrescEdit, setOpenPrescEdit] = useState(false);
  const [editPrescItemId, setEditPrescItemId] = useState<number | null>(null);
  const [editPrescMedicamentoId, setEditPrescMedicamentoId] = useState<number | ''>('');
  const [editPrescPosologia, setEditPrescPosologia] = useState('');
  const [editPrescSubmitting, setEditPrescSubmitting] = useState(false);
  const [editPrescError, setEditPrescError] = useState('');
  const [editPrescSuccess, setEditPrescSuccess] = useState('');

  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken || funcao !== 'Cuidador') {
      setAcessoNegado(true);
      setTimeout(() => router.push('/login'), 2000);
      setVerificado(true);
      return;
    }

    fetch(`http://localhost:4000/morador/${id}`, {
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

    // Evoluções são carregadas pelo effect dedicado de paginação/filtro

    // Prescrições são carregadas pelo effect dedicado de paginação
  }, [id, router]);

  // Recarrega prescrições (analítico) quando paginação/filtros mudarem
  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) return;
    setLoadingPrescricoes(true);
    const params = new URLSearchParams();
    params.set('id_morador', String(id));
    params.set('page', String(pPage));
    params.set('limit', String(pLimit));
    // analítico ainda não aceita filtros de data/busca, faremos client-side
    fetch(`http://localhost:4000/prescricao/analitico/all?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const arr: unknown[] = Array.isArray(data?.data) ? data.data : [];
        const mapped: PrescricaoItem[] = arr.map((raw) => {
          const r = raw as Record<string, unknown>;
          const idp = (r.id_prescricao as number) ?? Math.floor(Math.random() * 1e9);
          const aplicacao = r.aplicacao_data_hora as string | null | undefined;
          const mes = (r.mes as string) ?? '';
          const ano = (r.ano as string) ?? '';
          let dataIso = new Date().toISOString();
          if (aplicacao) {
            const dt = new Date(aplicacao);
            if (!isNaN(dt.getTime())) dataIso = dt.toISOString();
          } else if (mes && ano) {
            const dt = new Date(`${ano}-${mes}-01T00:00:00Z`);
            if (!isNaN(dt.getTime())) dataIso = dt.toISOString();
          }
          const horario = aplicacao ? new Date(aplicacao).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
          const medico = (r.medico_nome as string) ?? null;
          const aplicador = (r.aplicador as string) ?? null;
          const vinculadoPor = (r.vinculado_por as string) ?? null;
          const nomeMedicamento = (r.nome_medicamento as string) ?? '';
          const posologia = (r.posologia as string) ?? '';
          const itemId = (r.id_medicamento_prescricao as number) ?? undefined;
          const medicamentoId = (r.id_medicamento as number) ?? null;
          const observacoes = [nomeMedicamento, posologia].filter(Boolean).join(' — ');
          return { id: idp, data: dataIso, medico, aplicador, horario, vinculadoPor, observacoes, itemId, medicamentoId, posologia };
        });
        setPrescricoes(mapped);
        setPTotal(Number(data?.total ?? mapped.length));
        setPLastPage(Number(data?.lastPage ?? 1));
      })
      .catch(() => {
        setPrescricoes([]);
        setPTotal(0);
        setPLastPage(1);
      })
      .finally(() => setLoadingPrescricoes(false));
  }, [id, pPage, pLimit, pObsFilter, pDataInicio, pDataFim]);

  // Recarrega evoluções quando filtros/paginação mudarem
  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) return;
    const params = new URLSearchParams();
    params.set('id_morador', String(id));
    params.set('page', String(ePage));
    params.set('limit', String(eLimit));
    if (eObsFilter.trim()) params.set('observacoes', eObsFilter.trim());
    if (eDataInicio) params.set('data_inicio', eDataInicio);
  // Fim inclusivo: inclui todo o dia selecionado
  if (eDataFim) params.set('data_fim', `${eDataFim}T23:59:59.999`);

    setLoadingEvolucoes(true);
    fetch(`http://localhost:4000/evolucao-individual?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const listUnknown: unknown = Array.isArray(data?.data) ? data.data : [];
        const mapped: EvolucaoItem[] = (listUnknown as unknown[]).map((raw) => {
          const e = raw as Record<string, unknown>;
          const id = (e.id_evolucao_individual as number) ?? (e.id_evolucao as number) ?? (e.id as number) ?? Math.floor(Math.random() * 1e9);
          const dataRaw = (e.data_hora as string) ?? (e.data as string) ?? (e.data_evolucao as string) ?? (e.criado_em as string) ?? new Date().toISOString();
          const dateObj = new Date(dataRaw);
          const dataIso = dateObj.toISOString();
          const hora = (e.hora as string) ?? (e.horario as string) ?? `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
          const descricao = (e.descricao as string) ?? (e.observacao as string) ?? (e.observacoes as string) ?? '';
          let profissional: string | null = null;
          const usuarioVal = e['usuario'];
          if (usuarioVal && typeof usuarioVal === 'object') {
            const nomeUsuario = (usuarioVal as { nome_usuario?: unknown }).nome_usuario;
            const nome = (usuarioVal as { nome?: unknown }).nome;
            if (typeof nomeUsuario === 'string') profissional = nomeUsuario;
            else if (typeof nome === 'string') profissional = nome;
          }
          if (!profissional) {
            const fallbackKeys = ['usuario_nome', 'profissional', 'responsavel', 'cuidador', 'enfermeiro'] as const;
            for (const k of fallbackKeys) {
              const v = e[k];
              if (typeof v === 'string') { profissional = v; break; }
            }
          }
          return { id, data: dataIso, hora, descricao, profissional };
        });
        setEvolucoes(mapped);
        setETotal(Number(data?.total ?? mapped.length));
        setELastPage(Number(data?.lastPage ?? 1));
      })
      .catch(() => {
        setEvolucoes([]);
        setETotal(0);
        setELastPage(1);
      })
      .finally(() => setLoadingEvolucoes(false));
  }, [id, ePage, eLimit, eObsFilter, eDataInicio, eDataFim]);

  // Limpa seleção quando a lista de evoluções mudar (página/filtros) ou trocar de aba
  useEffect(() => { setSelectedEvoIds(new Set()); }, [evolucoes, ePage, eLimit, eObsFilter, eDataInicio, eDataFim, tab]);

  const allEvoSelected = evolucoes.length > 0 && evolucoes.every(ev => selectedEvoIds.has(ev.id));
  const someEvoSelected = !allEvoSelected && evolucoes.some(ev => selectedEvoIds.has(ev.id));
  const toggleSelectAllEvo = (checked: boolean) => {
    if (checked) {
      const s = new Set<number>();
      evolucoes.forEach(ev => s.add(ev.id));
      setSelectedEvoIds(s);
    } else {
      setSelectedEvoIds(new Set());
    }
  };
  const toggleSelectEvo = (idRow: number, checked: boolean) => {
    setSelectedEvoIds(prev => {
      const s = new Set(prev);
      if (checked) s.add(idRow); else s.delete(idRow);
      return s;
    });
  };
  const copySelectedEvolucoes = async () => {
    try {
      const chosen = evolucoes.filter(ev => selectedEvoIds.has(ev.id));
      if (chosen.length === 0) return;
      const lines = chosen.map((ev, idx) => {
        const dataStr = new Date(ev.data).toLocaleDateString('pt-BR');
        const horaStr = ev.hora ?? '-';
        const prof = ev.profissional ?? '-';
        const desc = (ev.descricao ?? '').trim();
        return [
          `(${String(idx + 1).padStart(2,'0')}) Data: ${dataStr}  Hora: ${horaStr}`,
          `Profissional: ${prof}`,
          `Intercorrências:`,
          `${desc}`,
          `----------------------------------------`,
        ].join('\n');
      });
      const text = lines.join('\n');
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      setToastMsg(`${chosen.length} evolução(ões) copiada(s) para a área de transferência.`);
      setTimeout(() => setToastMsg(''), 2500);
    } catch {
      setToastMsg('Não foi possível copiar.');
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  if (!verificado) return <div className="min-h-screen bg-white" />;
  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">Acesso restrito ao usuário! Redirecionando para login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      <HeaderBrand
        title="Casa Dona Zulmira"
        compact
        sticky
        showBack
        onBack={() => router.back()}
        center={<div className="truncate px-4 text-[#002c6c] font-semibold text-base sm:text-lg">{moradorCarregando ? 'Carregando…' : morador?.nome_completo ?? 'Morador'}</div>}
        right={
          <div className="flex items-center gap-3 flex-wrap">
            {/* Botão dinâmico: Evolução ou Prescrição */}
            {tab === 'evolucoes' ? (
              <Dialog open={openEvo} onOpenChange={(v) => { setOpenEvo(v); if (!v) { setEvoDescricao(''); setEvoError(''); setEvoSuccess(''); } }}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <NotebookPen className="mr-2" /> Cadastrar evolução
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Registrar evolução</DialogTitle>
                  </DialogHeader>
                {evoError && (
                  <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{evoError}</div>
                )}
                {evoSuccess && (
                  <div role="status" className="mb-2 rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{evoSuccess}</div>
                )}
                <form
                  ref={evoFormRef}
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEvoError('');
                    setEvoSuccess('');
                    const text = evoDescricao.trim();
                    if (text.length < 10) {
                      setEvoError('Descreva a evolução com pelo menos 10 caracteres.');
                      return;
                    }
                    try {
                      setEvoSubmitting(true);
                      const accessToken = localStorage.getItem('accessToken');
                      const resp = await fetch('http://localhost:4000/evolucao-individual', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                        body: JSON.stringify({ id_morador: Number(id), observacoes: text }),
                      });
                      if (!resp.ok) {
                        const msg = await resp.text();
                        throw new Error(msg || 'Falha ao salvar');
                      }
                      setEvoSuccess('Evolução registrada com sucesso.');
                      setToastMsg('Evolução salva com sucesso!');
                      setTimeout(() => setToastMsg(''), 3000);
                      setEvoDescricao('');
                      // Recarregar a lista na primeira página
                      setEPage(1);
                      // Re-trigger do efeito de recarga
                      const params = new URLSearchParams();
                      params.set('id_morador', String(id));
                      params.set('page', '1');
                      params.set('limit', String(eLimit));
                      if (eObsFilter.trim()) params.set('observacoes', eObsFilter.trim());
                      if (eDataInicio) params.set('data_inicio', eDataInicio);
                      // Fim inclusivo também no refetch pós-salvar
                      if (eDataFim) params.set('data_fim', `${eDataFim}T23:59:59.999`);
                      const r2 = await fetch(`http://localhost:4000/evolucao-individual?${params.toString()}`, {
                        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                      });
                      const d2 = await r2.json();
                      const listUnknown: unknown = Array.isArray(d2?.data) ? d2.data : [];
                      const mapped: EvolucaoItem[] = (listUnknown as unknown[]).map((raw) => {
                        const e = raw as Record<string, unknown>;
                        const idRow = (e.id_evolucao_individual as number) ?? (e.id_evolucao as number) ?? (e.id as number) ?? Math.floor(Math.random() * 1e9);
                        const dataRaw = (e.data_hora as string) ?? (e.data as string) ?? (e.data_evolucao as string) ?? (e.criado_em as string) ?? new Date().toISOString();
                        const dateObj = new Date(dataRaw);
                        const dataIso = dateObj.toISOString();
                        const hora = (e.hora as string) ?? (e.horario as string) ?? `${String(dateObj.getHours()).padStart(2,'0')}:${String(dateObj.getMinutes()).padStart(2,'0')}`;
                        const descricao = (e.descricao as string) ?? (e.observacao as string) ?? (e.observacoes as string) ?? '';
                        let profissional: string | null = null;
                        const usuarioVal = e['usuario'];
                        if (usuarioVal && typeof usuarioVal === 'object') {
                          const nomeUsuario = (usuarioVal as { nome_usuario?: unknown }).nome_usuario;
                          const nome = (usuarioVal as { nome?: unknown }).nome;
                          if (typeof nomeUsuario === 'string') profissional = nomeUsuario;
                          else if (typeof nome === 'string') profissional = nome;
                        }
                        if (!profissional) {
                          const fallbackKeys = ['usuario_nome', 'profissional', 'responsavel', 'cuidador', 'enfermeiro'] as const;
                          for (const k of fallbackKeys) {
                            const v = e[k];
                            if (typeof v === 'string') { profissional = v; break; }
                          }
                        }
                        return { id: idRow, data: dataIso, hora, descricao, profissional };
                      });
                      setEvolucoes(mapped);
                      setETotal(Number(d2?.total ?? mapped.length));
                      setELastPage(Number(d2?.lastPage ?? 1));
                      // Fecha overlay após pequena demora para o usuário perceber sucesso
                      setTimeout(() => setOpenEvo(false), 500);
                    } catch {
                      setEvoError('Não foi possível registrar. Tente novamente.');
                    } finally {
                      setEvoSubmitting(false);
                    }
                  }}
                  className="space-y-3 mt-4"
                >
                  <Label htmlFor="evo-desc">Observações</Label>
                  <Textarea
                    id="evo-desc"
                    rows={8}
                    maxLength={MAX_DESC}
                    value={evoDescricao}
                    onChange={(e) => setEvoDescricao(e.target.value)}
                    placeholder="Ex.: Durante o período da manhã, o morador apresentou bom apetite..."
                  />
                  <div className="flex items-center justify-between text-xs text-[#6b87b5]">
                    <span>Dica: descreva fatos observáveis, horários e intervenções.</span>
                    <span>{evoDescricao.length}/{MAX_DESC}</span>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setOpenEvo(false)}>Cancelar</Button>
                    <Button type="submit" disabled={evoSubmitting} className="bg-[#003d99] hover:bg-[#002c6c]">
                      {evoSubmitting ? 'Salvando…' : 'Salvar evolução'}
                    </Button>
                  </DialogFooter>
                </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog
                open={openPresc}
                onOpenChange={async (v) => {
                  setOpenPresc(v);
                  if (v) {
                    // Carrega opções quando abrir
                    try {
                      setLoadingOpts(true);
                      const accessToken = localStorage.getItem('accessToken');
                      const [rMed, rMeds] = await Promise.all([
                        fetch('http://localhost:4000/medicos', { headers: { Authorization: `Bearer ${accessToken}` } }),
                        fetch('http://localhost:4000/medicamentos?limit=50', { headers: { Authorization: `Bearer ${accessToken}` } }),
                      ]);
                      const dMed = await rMed.json();
                      const dMeds = await rMeds.json();
                      const listMed: unknown[] = Array.isArray(dMed?.data) ? dMed.data : Array.isArray(dMed) ? dMed : [];
                      const listMeds: unknown[] = Array.isArray(dMeds?.data)
                        ? dMeds.data
                        : Array.isArray(dMeds)
                        ? dMeds
                        : Array.isArray(dMeds?.medicamentos)
                        ? dMeds.medicamentos
                        : [];
                      setMedicosOpt(
                        listMed
                          .map((m: unknown) => {
                            const r = (m as Record<string, unknown>) || {};
                            const id = (r.id_medico as number) ?? (r.id as number) ?? 0;
                            const nome = (r.nome_completo as string) ?? (r.nome as string) ?? '';
                            return { id, nome };
                          })
                          .filter((x) => x.id && x.nome)
                      );
                      setMedicamentosOpt(
                        listMeds
                          .map((m: unknown) => {
                            const r = (m as Record<string, unknown>) || {};
                            const id = (r.id_medicamento as number) ?? (r.id as number) ?? 0;
                            const nome = (r.nome_medicamento as string) ?? (r.nome as string) ?? '';
                            return { id, nome };
                          })
                          .filter((x) => x.id && x.nome)
                      );
                    } catch {
                      // mantém silencioso; selects ficarão vazios
                    } finally {
                      setLoadingOpts(false);
                    }
                  } else {
                    // resetar
                    setPrescError('');
                    setPrescSuccess('');
                    setPIdMedico('');
                    setPMes('');
                    setPAno('');
                    setPItens([{ id_medicamento: '', posologia: '' }]);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button size="lg">
                    <NotebookPen className="mr-2" /> Cadastrar prescrição
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[640px] bg-white">
                  <DialogHeader>
                    <DialogTitle>Registrar prescrição</DialogTitle>
                  </DialogHeader>
                  {prescError && (
                    <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{prescError}</div>
                  )}
                  {prescSuccess && (
                    <div role="status" className="mb-2 rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{prescSuccess}</div>
                  )}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setPrescError('');
                      setPrescSuccess('');
                      // validações
                      const parsedMedicoId = Number(pIdMedico);
                      if (!Number.isFinite(parsedMedicoId) || parsedMedicoId <= 0) { setPrescError('Selecione o médico.'); return; }
                      if (!/^\d{2}$/.test(pMes)) { setPrescError('Informe o mês no formato MM.'); return; }
                      if (!/^\d{4}$/.test(pAno)) { setPrescError('Informe o ano no formato YYYY.'); return; }
                      const itensValidos = pItens.filter(i => i.id_medicamento !== '' && i.posologia.trim().length > 0);
                      if (itensValidos.length === 0) { setPrescError('Adicione ao menos um medicamento com posologia.'); return; }
                      try {
                        setPrescSubmitting(true);
                        const accessToken = localStorage.getItem('accessToken');
                        const payload = {
                          id_morador: Number(id),
                          id_medico: parsedMedicoId,
                          mes: pMes,
                          ano: pAno,
                          itens: itensValidos.map(i => ({ id_medicamento: Number(i.id_medicamento), posologia: i.posologia.trim() })),
                        };
                        const resp = await fetch('http://localhost:4000/prescricao/completa', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                          body: JSON.stringify(payload),
                        });
                        if (!resp.ok) {
                          const msg = await resp.text();
                          throw new Error(msg || 'Falha ao salvar');
                        }
                        setPrescSuccess('Prescrição registrada com sucesso.');
                        setToastMsg('Prescrição salva com sucesso!');
                        setTimeout(() => setToastMsg(''), 3000);
                        // Recarregar a lista na primeira página
                        setPPage(1);
                        setTimeout(() => setOpenPresc(false), 500);
                      } catch {
                        setPrescError('Não foi possível registrar. Tente novamente.');
                      } finally {
                        setPrescSubmitting(false);
                      }
                    }}
                    className="space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-3">
                        <Label>Médico</Label>
                        <select
                          className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
                          disabled={loadingOpts}
                          value={pIdMedico}
                          onChange={(e) => setPIdMedico(e.target.value ? Number(e.target.value) : '')}
                        >
                          <option value="">Selecione...</option>
                          {medicosOpt.map((m) => (
                            <option key={m.id} value={m.id}>{m.nome}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Mês (MM)</Label>
                        <Input value={pMes} onChange={(e) => setPMes(e.target.value)} placeholder="09" maxLength={2} />
                      </div>
                      <div>
                        <Label>Ano (YYYY)</Label>
                        <Input value={pAno} onChange={(e) => setPAno(e.target.value)} placeholder="2025" maxLength={4} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Itens da prescrição</Label>
                        <Button type="button" variant="outline" onClick={() => setPItens(prev => [...prev, { id_medicamento: '', posologia: '' }])}>Adicionar item</Button>
                      </div>
                      <div className="space-y-3">
                        {pItens.map((it, idx) => (
                          <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_auto] gap-2 items-end">
                            <div>
                              <Label>Medicamento</Label>
                              <select
                                className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
                                disabled={loadingOpts}
                                value={it.id_medicamento}
                                onChange={(e) => {
                                  const v = e.target.value ? Number(e.target.value) : '';
                                  setPItens(prev => prev.map((p, i) => i === idx ? { ...p, id_medicamento: v } : p));
                                }}
                              >
                                <option value="">Selecione...</option>
                                {medicamentosOpt.map((m) => (
                                  <option key={m.id} value={m.id}>{m.nome}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <Label>Posologia</Label>
                              <Input value={it.posologia} onChange={(e) => setPItens(prev => prev.map((p, i) => i === idx ? { ...p, posologia: e.target.value } : p))} placeholder="1 cp 12/12h por 7 dias" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Button type="button" variant="outline" onClick={() => setPItens(prev => prev.filter((_, i) => i !== idx))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setOpenPresc(false)}>Cancelar</Button>
                      <Button type="submit" disabled={prescSubmitting} className="bg-[#003d99] hover:bg-[#002c6c]">
                        {prescSubmitting ? 'Salvando…' : 'Salvar prescrição'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        }
      />

      <main className="flex-1 flex flex-col p-6 sm:p-8 relative">

        {/* Abas simples */}
        <Card className="bg-white rounded-2xl p-0 shadow-sm overflow-hidden">
          <div className="border-b border-[#e5eaf1] bg-white px-4 sm:px-6">
            <div className="flex gap-2">
              <TabButton active={tab === 'evolucoes'} onClick={() => setTab('evolucoes')}>Evoluções</TabButton>
              <TabButton active={tab === 'prescricoes'} onClick={() => setTab('prescricoes')}>Prescrições</TabButton>
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
                      className="pl-9 placeholder:text-gray-700"
                      placeholder="Buscar por observações"
                      aria-label="Buscar por observações"
                      value={eObsFilter}
                      onChange={(e) => { setEObsFilter(e.target.value); setEPage(1); }}
                    />
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

                {/* Ações de seleção/cópia */}
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm text-[#4a5b78]">
                    {selectedEvoIds.size > 0 ? `${selectedEvoIds.size} selecionada(s)` : 'Nenhuma selecionada'}
                  </div>
                  <Button variant="outline" disabled={selectedEvoIds.size === 0} onClick={copySelectedEvolucoes}>
                    Copiar selecionadas
                  </Button>
                </div>

                {loadingEvolucoes ? (
                  <div className="text-[#6b87b5] text-sm">Carregando evoluções…</div>
                ) : evolucoes.length === 0 ? (
                  <div className="text-[#6b87b5] text-sm">Nenhuma evolução registrada.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">
                          <input
                            type="checkbox"
                            aria-label="Selecionar todas"
                            checked={allEvoSelected}
                            onChange={(e) => toggleSelectAllEvo(e.currentTarget.checked)}
                            ref={(el) => { if (el) el.indeterminate = someEvoSelected; }}
                          />
                        </TableHead>
                        <TableHead className="text-[#002c6c]">Data</TableHead>
                        <TableHead className="text-[#002c6c]">Hora</TableHead>
                        <TableHead className="text-[#002c6c]">Profissional</TableHead>
                        <TableHead className="text-[#002c6c]">Descrição</TableHead>
                        <TableHead className="text-[#002c6c] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {evolucoes.map((ev) => (
                        <TableRow key={ev.id} className="hover:bg-[#e9f1f9]/40">
                          <TableCell>
                            <input
                              type="checkbox"
                              aria-label={`Selecionar evolução ${ev.id}`}
                              checked={selectedEvoIds.has(ev.id)}
                              onChange={(e) => toggleSelectEvo(ev.id, e.currentTarget.checked)}
                            />
                          </TableCell>
                          <TableCell className="text-gray-800">{new Date(ev.data).toLocaleDateString()}</TableCell>
                          <TableCell className="text-gray-700">{ev.hora ?? '-'}</TableCell>
                          <TableCell className="text-gray-700">{ev.profissional ?? '-'}</TableCell>
                          <TableCell className="text-gray-700 max-w-[560px]">
                            <div
                              onClick={() => {
                                setViewType('evolucao');
                                setViewProfNome(ev.profissional ?? '');
                                setViewTexto(ev.descricao ?? '');
                                setViewDataISO(ev.data);
                                setOpenView(true);
                              }}
                              className="cursor-pointer hover:underline"
                              style={{ display: '-webkit-box', WebkitLineClamp: 2 as unknown as number, WebkitBoxOrient: 'vertical' as unknown as string, overflow: 'hidden' } as React.CSSProperties}
                              title={ev.descricao ?? ''}
                            >
                              {ev.descricao ?? '-'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                title="Editar"
                                onClick={() => { setEditId(ev.id); setEditDescricao(ev.descricao ?? ''); setEditError(''); setEditSuccess(''); setOpenEdit(true); }}
                              >
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
                      className="pl-9 placeholder:text-gray-700"
                      placeholder="Buscar por observações"
                      aria-label="Buscar por observações"
                      value={pObsFilter}
                      onChange={(e) => { setPObsFilter(e.target.value); setPPage(1); }}
                    />
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

                {loadingPrescricoes ? (
                  <div className="text-[#6b87b5] text-sm">Carregando prescrições…</div>
                ) : prescricoes.length === 0 ? (
                  <div className="text-[#6b87b5] text-sm">Nenhuma prescrição encontrada.</div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[#002c6c]">Data</TableHead>
                          <TableHead className="text-[#002c6c]">Hora</TableHead>
                          <TableHead className="text-[#002c6c]">Profissional</TableHead>
                          <TableHead className="text-[#002c6c]">Descrição</TableHead>
                          <TableHead className="text-[#002c6c] text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(pObsFilter || pDataInicio || pDataFim
                          ? prescricoes.filter((pp) => {
                              const term = pObsFilter.toLowerCase();
                              const matchesText = term
                                ? [pp.medico || '', pp.observacoes || '', pp.aplicador || '']
                                    .join(' ')
                                    .toLowerCase()
                                    .includes(term)
                                : true;
                              const dateVal = pp.data ? new Date(pp.data) : null;
                              // Comparação em UTC para evitar problemas de fuso horário
                              const startBoundary = pDataInicio ? new Date(`${pDataInicio}T00:00:00.000Z`) : null;
                              const endBoundary = pDataFim ? new Date(`${pDataFim}T23:59:59.999Z`) : null;
                              const afterStart = startBoundary && dateVal ? dateVal >= startBoundary : true;
                              const beforeEnd = endBoundary && dateVal ? dateVal <= endBoundary : true;
                              return matchesText && afterStart && beforeEnd;
                            })
                          : prescricoes).map((p, idx) => (
                          <TableRow key={(p.itemId ?? `${p.id}-${idx}`)} className="hover:bg-[#e9f1f9]/40">
                            <TableCell className="text-gray-800">{new Date(p.data).toLocaleDateString()}</TableCell>
                            <TableCell className="text-gray-700">{p.horario ?? '-'}</TableCell>
                            <TableCell className="text-gray-700">{p.medico ?? '-'}</TableCell>
                            <TableCell className="text-gray-700 max-w-[560px]">
                              <div
                                onClick={() => {
                                  setViewType('prescricao');
                                  setViewProfNome(p.medico ?? '');
                                  setViewTexto(p.observacoes ?? '');
                                  setViewDataISO(p.data);
                                  setOpenView(true);
                                }}
                                className="cursor-pointer hover:underline"
                                style={{ display: '-webkit-box', WebkitLineClamp: 2 as unknown as number, WebkitBoxOrient: 'vertical' as unknown as string, overflow: 'hidden' } as React.CSSProperties}
                                title={p.observacoes ?? ''}
                              >
                                {p.observacoes ?? '-'}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  title="Editar"
                                  onClick={async () => {
                                    if (!p.itemId) { alert('Não é possível editar este item.'); return; }
                                    setEditPrescItemId(p.itemId);
                                    setEditPrescMedicamentoId(p.medicamentoId ?? '');
                                    setEditPrescPosologia(p.posologia ?? '');
                                    setEditPrescError('');
                                    setEditPrescSuccess('');
                                    // Carrega opções de medicamentos se ainda não carregadas
                                    if (medicamentosOpt.length === 0) {
                                      try {
                                        setLoadingOpts(true);
                                        const accessToken = localStorage.getItem('accessToken');
                                        const rMeds = await fetch('http://localhost:4000/medicamentos?limit=50', { headers: { Authorization: `Bearer ${accessToken}` } });
                                        const dMeds = await rMeds.json();
                                        const listMeds: unknown[] = Array.isArray(dMeds?.data)
                                          ? dMeds.data
                                          : Array.isArray(dMeds)
                                          ? dMeds
                                          : Array.isArray(dMeds?.medicamentos)
                                          ? dMeds.medicamentos
                                          : [];
                                        setMedicamentosOpt(
                                          listMeds
                                            .map((m: unknown) => {
                                              const r = (m as Record<string, unknown>) || {};
                                              const idm = (r.id_medicamento as number) ?? (r.id as number) ?? 0;
                                              const nome = (r.nome_medicamento as string) ?? (r.nome as string) ?? '';
                                              return { id: idm, nome };
                                            })
                                            .filter((x) => x.id && x.nome)
                                        );
                                      } catch {
                                        // silencioso
                                      } finally {
                                        setLoadingOpts(false);
                                      }
                                    }
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
                        {pTotal > 0 ? (
                          <span>
                            Mostrando {Math.min((pPage - 1) * pLimit + 1, pTotal)}–{Math.min(pPage * pLimit, pTotal)} de {pTotal}
                          </span>
                        ) : (
                          <span>Nenhum registro</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" disabled={pPage <= 1} onClick={() => setPPage((p) => Math.max(1, p - 1))}>Anterior</Button>
                        <span>Página {pPage} de {pLastPage}</span>
                        <Button variant="outline" disabled={pPage >= pLastPage} onClick={() => setPPage((p) => Math.min(pLastPage, p + 1))}>Próxima</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>
      {/* Modal de visualização em formato de ficha */}
      <Dialog open={openView} onOpenChange={(v) => { setOpenView(v); if (!v) { setViewType(null); setViewProfNome(''); setViewTexto(''); setViewDataISO(''); } }}>
        <DialogContent className="print-container sm:max-w-[760px] bg-white">
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
                <p>
                  <span className="font-semibold">Nome do enfermeiro:</span>
                  <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Nome do médico:</span>
                  <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
                </p>
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
              <p>
                <span className="font-semibold">Nome do enfermeiro:</span>
                <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
              </p>
            ) : (
              <p>
                <span className="font-semibold">Nome do médico:</span>
                <span className="ml-1 text-[#0d5fa8] font-semibold">{viewProfNome || '-'}</span>
              </p>
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
      <Dialog open={openPrescEdit} onOpenChange={(v) => { setOpenPrescEdit(v); if (!v) { setEditPrescError(''); setEditPrescSuccess(''); } }}>
        <DialogContent className="sm:max-w-[640px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar item da prescrição</DialogTitle>
          </DialogHeader>
          {editPrescError && (
            <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{editPrescError}</div>
          )}
          {editPrescSuccess && (
            <div role="status" className="mb-2 rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{editPrescSuccess}</div>
          )}
          <div className="space-y-3 mt-1">
            <div>
              <Label>Medicamento</Label>
              <select
                className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
                disabled={loadingOpts}
                value={editPrescMedicamentoId}
                onChange={(e) => setEditPrescMedicamentoId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecione...</option>
                {medicamentosOpt.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Posologia</Label>
              <Input value={editPrescPosologia} onChange={(e) => setEditPrescPosologia(e.target.value)} placeholder="1 cp 12/12h por 7 dias" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenPrescEdit(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!editPrescItemId) { setOpenPrescEdit(false); return; }
                const parsedMedicamentoId = Number(editPrescMedicamentoId);
                if (!Number.isFinite(parsedMedicamentoId) || parsedMedicamentoId <= 0) { setEditPrescError('Selecione o medicamento.'); return; }
                if (!editPrescPosologia.trim()) { setEditPrescError('Informe a posologia.'); return; }
                try {
                  setEditPrescSubmitting(true);
                  const accessToken = localStorage.getItem('accessToken');
                  const resp = await fetch(`http://localhost:4000/medicamento-prescricao/${editPrescItemId}` , {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ id_medicamento: parsedMedicamentoId, posologia: editPrescPosologia.trim() }),
                  });
                  if (!resp.ok) throw new Error('Falha ao editar');
                  setEditPrescSuccess('Item atualizado com sucesso.');
                  setToastMsg('Prescrição atualizada com sucesso!');
                  setTimeout(() => setToastMsg(''), 3000);
                  // Recarrega lista de prescrições na primeira página para refletir alterações
                  setPPage(1);
                  setTimeout(() => setOpenPrescEdit(false), 500);
                } catch {
                  setEditPrescError('Não foi possível editar. Tente novamente.');
                } finally {
                  setEditPrescSubmitting(false);
                }
              }}
              disabled={editPrescSubmitting}
              className="bg-[#003d99] hover:bg-[#002c6c]"
            >
              {editPrescSubmitting ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para editar evolução */}
      <Dialog open={openEdit} onOpenChange={(v) => { setOpenEdit(v); if (!v) { setEditError(''); setEditSuccess(''); } }}>
        <DialogContent className="sm:max-w-[640px] bg-white">
          <DialogHeader>
            <DialogTitle>Editar evolução</DialogTitle>
          </DialogHeader>
          {editError && (
            <div role="alert" className="mb-2 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{editError}</div>
          )}
          {editSuccess && (
            <div role="status" className="mb-2 rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{editSuccess}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="edit-desc">Observações</Label>
            <Textarea id="edit-desc" rows={6} value={editDescricao} onChange={(e) => setEditDescricao(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!editId) return setOpenEdit(false);
                const text = editDescricao.trim();
                if (text.length < 10) { setEditError('Descreva a evolução com pelo menos 10 caracteres.'); return; }
                try {
                  setEditSubmitting(true);
                  const accessToken = localStorage.getItem('accessToken');
                  const resp = await fetch(`http://localhost:4000/evolucao-individual/${editId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ observacoes: text }),
                  });
                  if (!resp.ok) throw new Error('Falha ao editar');
                  setEditSuccess('Evolução atualizada com sucesso.');
                  // Recarrega a lista sem perder filtros
                  setEPage(1);
                  setToastMsg('Evolução atualizada com sucesso!');
                  setTimeout(() => setToastMsg(''), 3000);
                  setTimeout(() => setOpenEdit(false), 500);
                } catch {
                  setEditError('Não foi possível editar. Tente novamente.');
                } finally {
                  setEditSubmitting(false);
                }
              }}
              disabled={editSubmitting}
              className="bg-[#003d99] hover:bg-[#002c6c]"
            >
              {editSubmitting ? 'Salvando…' : 'Salvar alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Botão flutuante substituir "N" por "+" que abre o modal de criação */}
      <button
        aria-label={tab === 'evolucoes' ? 'Cadastrar evolução' : 'Nova prescrição'}
        title={tab === 'evolucoes' ? 'Cadastrar evolução' : 'Nova prescrição'}
        onClick={() => (tab === 'evolucoes' ? setOpenEvo(true) : setOpenPresc(true))}
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
