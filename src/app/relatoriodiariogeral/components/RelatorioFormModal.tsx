"use client";

import { useEffect, useMemo, useState, useCallback } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { gerarTextoIA, createRelatorio, updateRelatorio } from '@/lib/api';
import type { EvolucaoIndividual, RelatorioDiarioGeral } from '@/types/relatorio';
import { toast } from 'react-hot-toast';

interface Props {
  editando: RelatorioDiarioGeral | null;
  setEditando(v: RelatorioDiarioGeral | null): void;
  evolucoesDisponiveis: EvolucaoIndividual[];
  onRefresh(): Promise<void> | void;
  triggerLabel?: string;
  loadingEvolucoes?: boolean;
  erroEvolucoes?: string | null;
}

const MAX_OBS = 8000;

export function RelatorioFormModal({ editando, setEditando, evolucoesDisponiveis, onRefresh, triggerLabel = 'Novo', loadingEvolucoes = false, erroEvolucoes = null }: Props) {
  const [open, setOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [dataRelatorio, setDataRelatorio] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [buscaEvolucao, setBuscaEvolucao] = useState('');
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [selectedEvolucoes, setSelectedEvolucoes] = useState<EvolucaoIndividual[]>([]);
  const [loadingIA, setLoadingIA] = useState(false);
  const [confirmMerge, setConfirmMerge] = useState<null | { novo: string }>(null);
  const [erroIA, setErroIA] = useState<string | null>(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [erroForm, setErroForm] = useState('');
  const [sucessoForm, setSucessoForm] = useState('');

  const evolucoesFiltradas = useMemo(() => {
    let list = evolucoesDisponiveis;
    if (filtroInicio) {
      const [y,m,dStr] = filtroInicio.split('-');
      const start = new Date(Number(y), Number(m)-1, Number(dStr),0,0,0,0);
      list = list.filter(ev => { const d=new Date(ev.data_hora); return !isNaN(d.getTime()) && d>=start;});
    }
    if (filtroFim) {
      const [y2,m2,d2Str] = filtroFim.split('-');
      const end = new Date(Number(y2), Number(m2)-1, Number(d2Str),23,59,59,999);
      list = list.filter(ev => { const d=new Date(ev.data_hora); return !isNaN(d.getTime()) && d<=end;});
    }
    const s = buscaEvolucao.trim().toLowerCase();
    if (s) list = list.filter(ev => ev.observacoes.toLowerCase().includes(s) || ev.morador?.nome_completo?.toLowerCase().includes(s));
    return list;
  }, [buscaEvolucao, evolucoesDisponiveis, filtroInicio, filtroFim]);

  function toggleEvolucao(ev: EvolucaoIndividual) {
    setSelectedEvolucoes(prev => prev.some(e => e.id_evolucao_individual === ev.id_evolucao_individual)
      ? prev.filter(e => e.id_evolucao_individual !== ev.id_evolucao_individual)
      : [...prev, ev]);
  }

  const reset = useCallback(() => {
    setObservacoes('');
    setDataRelatorio(new Date().toISOString().slice(0,10));
    setBuscaEvolucao('');
    setFiltroInicio(''); setFiltroFim('');
    setSelectedEvolucoes([]);
    setConfirmMerge(null); setErroIA(null);
    setErroForm(''); setSucessoForm('');
  }, []);

  // Preenche ao editar
  useEffect(() => {
    if (editando) {
      setOpen(true);
      setObservacoes(editando.observacoes || '');
      if (editando.data_hora) {
        const d = new Date(editando.data_hora);
        if (!isNaN(d.getTime())) setDataRelatorio(d.toISOString().slice(0,10));
      }
      const evols = editando.evolucoes?.map(ev => ({
        id_evolucao_individual: ev.evolucao.id_evolucao_individual,
        data_hora: ev.evolucao.data_hora,
        observacoes: ev.evolucao.observacoes
      })) || (editando.evolucaoindividual ? [{ id_evolucao_individual: editando.evolucaoindividual.id_evolucao_individual, data_hora: editando.evolucaoindividual.data_hora, observacoes: editando.evolucaoindividual.observacoes }] : []);
      setSelectedEvolucoes(evols as EvolucaoIndividual[]);
    }
  }, [editando]);

  async function handleGerarIA() {
    if (selectedEvolucoes.length === 0 || loadingIA) return;
    setLoadingIA(true);
    setErroIA(null);
    try {
      const body = {
        ids_evolucoes: selectedEvolucoes.map(e => e.id_evolucao_individual),
        data_relatorio: dataRelatorio || undefined,
        modo: 'resumo'
      };
      const resp = await gerarTextoIA(body);
      const textoGerado = resp.texto || '';
      if (!observacoes.trim()) {
        setObservacoes(textoGerado);
      } else {
        setConfirmMerge({ novo: textoGerado });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao gerar';
      setErroIA(message);
      toast.error('Erro ao gerar observações (IA)');
    } finally {
      setLoadingIA(false);
    }
  }

  function aplicarMergeIA(estrategia: 'substituir' | 'anexar') {
    if (!confirmMerge) return;
    if (estrategia === 'substituir') setObservacoes(confirmMerge.novo);
    else setObservacoes(prev => prev.trim() + '\n\n' + confirmMerge.novo);
    setConfirmMerge(null);
  }

  const salvar = useCallback(async () => {
    setErroForm(''); setSucessoForm('');
    if (selectedEvolucoes.length === 0) { setErroForm('Selecione pelo menos uma evolução.'); return; }
    const trimmed = observacoes.trim();
    if (trimmed.length < 10) { setErroForm('Descreva as observações com pelo menos 10 caracteres.'); return; }
    setLoadingSubmit(true);
    try {
      const basePayload: { observacoes: string; ids_evolucoes: number[]; data_hora?: string } = {
        observacoes: trimmed,
        ids_evolucoes: selectedEvolucoes.map(e => e.id_evolucao_individual)
      };
      if (dataRelatorio) {
        const [y,m,d] = dataRelatorio.split('-');
        if (y && m && d) {
          const dt = new Date(Number(y), Number(m)-1, Number(d), 12,0,0,0);
          basePayload.data_hora = dt.toISOString();
        }
      }
      if (editando) {
        await updateRelatorio(editando.id_relatorio_diario_geral, basePayload);
        toast.success('Relatório atualizado');
        setSucessoForm('Relatório atualizado com sucesso.');
      } else {
        await createRelatorio(basePayload);
        toast.success('Relatório criado');
        setSucessoForm('Relatório criado com sucesso.');
      }
      await onRefresh();
      setOpen(false);
      setEditando(null);
      reset();
    } catch {
      setErroForm('Não foi possível salvar.');
      toast.error('Erro ao salvar relatório');
    } finally {
      setLoadingSubmit(false);
    }
  }, [selectedEvolucoes, observacoes, dataRelatorio, editando, onRefresh, reset, setEditando]);

  // Atalho Ctrl/Cmd+Enter
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        salvar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, salvar]);

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v){ setEditando(null); reset(); } setOpen(v); }}>
      <DialogTrigger asChild>
        <Button className="bg-[#002c6c] hover:bg-[#003d99] text-white h-8 px-3 flex items-center gap-2">
          <Plus className="w-4 h-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white shadow-lg border border-[#cfd8e3]">
        <DialogHeader>
          <DialogTitle>{editando ? `Editar Relatório #${editando.id_relatorio_diario_geral}` : 'Novo Relatório Diário Geral'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          {erroForm && <div className="rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-xs font-medium" role="alert">{erroForm}</div>}
          {sucessoForm && <div className="rounded-md border border-green-200 bg-green-50 text-green-700 px-4 py-2 text-xs font-medium" role="status">{sucessoForm}</div>}
          <label className="flex flex-col gap-1 text-sm font-medium text-[#002c6c]">
            Data
            <input type="date" value={dataRelatorio} onChange={e => setDataRelatorio(e.target.value)} className="border rounded px-2 py-1 text-sm" />
          </label>
          <div className="flex flex-col gap-1">
            <Label htmlFor="observacoes" className="text-sm font-medium text-[#002c6c]">Observações</Label>
            <Textarea
              id="observacoes"
              rows={6}
              placeholder="Ex.: Durante o período da manhã..."
              maxLength={MAX_OBS}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
              aria-describedby="observacoes-ajuda"
            />
            <div className="flex items-center justify-between mt-1">
              <p id="observacoes-ajuda" className="text-[11px] text-[#6b87b5]">Dica: descreva fatos observáveis, horários e intervenções.</p>
              <span className="text-[11px] text-[#6b87b5]">{observacoes.length}/{MAX_OBS}</span>
            </div>
            <div className="flex gap-2 flex-wrap mt-1">
              <Button type="button" variant="outline" disabled={selectedEvolucoes.length === 0 || loadingIA} onClick={handleGerarIA} className="h-8 px-3 text-xs">
                {loadingIA ? 'Gerando...' : 'Gerar Observações (IA)'}
              </Button>
              {erroIA && !confirmMerge && (
                <span className="text-xs text-red-600 font-medium max-w-full break-words">{erroIA}</span>
              )}
              {confirmMerge && (
                <div className="flex items-center gap-2 text-xs bg-[#e9f1f9] p-2 rounded">
                  <span>Substituir texto atual ou anexar?</span>
                  <Button type="button" size="sm" className="h-7 px-2" onClick={() => aplicarMergeIA('substituir')}>Substituir</Button>
                  <Button type="button" size="sm" variant="secondary" className="h-7 px-2" onClick={() => aplicarMergeIA('anexar')}>Anexar</Button>
                  <Button type="button" size="sm" variant="ghost" className="h-7 px-2" onClick={() => setConfirmMerge(null)}>Cancelar</Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#002c6c]">Selecione Evoluções</span>
              <Input placeholder="Buscar evolução..." value={buscaEvolucao} onChange={e => setBuscaEvolucao(e.target.value)} className="h-8 w-64" />
            </div>
            <div className="grid gap-2 md:grid-cols-2 text-[11px]">
              <label className="flex flex-col gap-1">
                <span className="font-medium text-[#002c6c]">Início</span>
                <input type="date" value={filtroInicio} onChange={e => setFiltroInicio(e.target.value)} className="border rounded px-2 py-1" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-medium text-[#002c6c]">Fim</span>
                <input type="date" value={filtroFim} onChange={e => setFiltroFim(e.target.value)} className="border rounded px-2 py-1" />
              </label>
            </div>
            <div className="border rounded-md p-2 max-h-56 overflow-y-auto bg-white">
              {loadingEvolucoes && (
                <div className="text-xs text-[#6b87b5] px-1 py-2">Carregando evoluções...</div>
              )}
              {erroEvolucoes && !loadingEvolucoes && (
                <div className="text-xs text-red-600 px-1 py-2">{erroEvolucoes}</div>
              )}
              {!loadingEvolucoes && !erroEvolucoes && evolucoesFiltradas.map(ev => {
                const sel = selectedEvolucoes.some(s => s.id_evolucao_individual === ev.id_evolucao_individual);
                return (
                  <button type="button" key={ev.id_evolucao_individual} onClick={() => toggleEvolucao(ev)} className={`w-full text-left px-2 py-1 rounded text-sm mb-1 border ${sel ? 'bg-[#002c6c] text-white border-[#002c6c]' : 'hover:bg-[#e9f1f9] border-transparent'}`}>
                    <span className="block font-medium">Evolução #{ev.id_evolucao_individual}</span>
                    <span className="block text-[11px] opacity-80">{new Date(ev.data_hora).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}).replace(',', '')} - {ev.morador?.nome_completo ?? 'Morador'}</span>
                    <span className="block text-[11px] line-clamp-2">{ev.observacoes}</span>
                  </button>
                );
              })}
              {!loadingEvolucoes && !erroEvolucoes && evolucoesFiltradas.length === 0 && (
                <div className="text-xs text-gray-500 px-1 py-2">Nenhuma evolução.</div>
              )}
            </div>
            {selectedEvolucoes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedEvolucoes.map(ev => (
                  <span key={ev.id_evolucao_individual} className="flex items-center gap-1 bg-[#002c6c] text-white rounded-full px-2 py-0.5 text-xs">
                    #{ev.id_evolucao_individual}
                    <button onClick={() => toggleEvolucao(ev)} className="hover:text-red-300" aria-label="Remover evolução">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="flex gap-2 justify-end mt-4">
          <div className="mr-auto text-[11px] text-[#6b87b5]">Atalho: Ctrl/⌘ + Enter para salvar</div>
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); setEditando(null); reset(); }}>Cancelar</Button>
          <Button disabled={loadingSubmit || selectedEvolucoes.length === 0 || !observacoes.trim()} onClick={salvar} className="bg-[#002c6c] hover:bg-[#003d99] text-white">
            {loadingSubmit ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
