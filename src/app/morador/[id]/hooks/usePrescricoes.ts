"use client";
import { useCallback, useEffect, useState, useMemo } from 'react';
import { listPrescricoesAnalitico } from '@/lib/api';
import type { PrescricaoAnaliticoItem } from '@/types/relatorio';

interface UsePrescricoesParams {
  idMorador: number;
  page: number;
  limit: number;
  texto?: string; // filtro (medico / medicamento / posologia / aplicador)
  dataInicio?: string; // yyyy-mm-dd
  dataFim?: string; // yyyy-mm-dd
}

export interface PrescricaoLinhaNormalizada {
  id_prescricao: number;
  data_iso: string;
  horario: string | null;
  medico: string | null;
  aplicador: string | null;
  vinculado_por: string | null;
  cuidador: string | null; // <--- CORREÇÃO: Campo adicionado
  observacoes: string; // nome_medicamento — posologia
  id_medicamento_prescricao?: number;
  id_medicamento?: number | null;
  posologia?: string | null;
}

interface UsePrescricoesResult {
  dados: PrescricaoLinhaNormalizada[];
  loading: boolean;
  erro: string | null;
  total: number; // total informado pelo backend (não filtrado)
  lastPage: number;
  filtered: PrescricaoLinhaNormalizada[]; // após filtros texto/data
  refresh(): Promise<void>;
}

export function usePrescricoes(params: UsePrescricoesParams): UsePrescricoesResult {
  const { idMorador, page, limit, texto, dataInicio, dataFim } = params;
  const [dados, setDados] = useState<PrescricaoLinhaNormalizada[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const carregar = useCallback(async () => {
    if (!idMorador) return;
    setLoading(true); setErro(null);
    try {
      const resp = await listPrescricoesAnalitico({ id_morador: idMorador, page, limit });
      const bruta: PrescricaoAnaliticoItem[] = Array.isArray(resp.data) ? resp.data : [];
      const normalizada: PrescricaoLinhaNormalizada[] = bruta.map((raw) => {
        const idPresc = raw.id_prescricao ?? Math.floor(Math.random() * 1e9);
        // Derivar data: aplicacao_data_hora > (ano-mes-01) > agora
        let dataISO = new Date().toISOString();
        if (raw.aplicacao_data_hora) {
          const d = new Date(raw.aplicacao_data_hora);
            if (!isNaN(d.getTime())) dataISO = d.toISOString();
        } else if (raw.ano && raw.mes) {
          const d = new Date(`${raw.ano}-${raw.mes}-01T00:00:00Z`);
          if (!isNaN(d.getTime())) dataISO = d.toISOString();
        }
        const horario = raw.aplicacao_data_hora
          ? new Date(raw.aplicacao_data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : null;
        const nomeMedicamento = raw.nome_medicamento || '';
        const posologia = raw.posologia || '';
        const observacoes = [nomeMedicamento, posologia].filter(Boolean).join(' — ');
        
        // Derivar cuidador/responsável
        const cuidador = raw.cuidador_nome
          || raw.enfermeiro_nome
          || raw.nome_cuidador
          || raw.nome_enfermeiro
          || raw.usuario_nome
          || raw.vinculado_por // principal para responsável de cadastro
          || raw.aplicador // fallback final (quem aplicou)
          || null;

        return {
          id_prescricao: idPresc,
          data_iso: dataISO,
          horario,
          medico: raw.medico_nome || null,
          aplicador: raw.aplicador || null,
          vinculado_por: raw.vinculado_por || null,
          cuidador,
          observacoes,
          id_medicamento_prescricao: raw.id_medicamento_prescricao ?? undefined,
          id_medicamento: raw.id_medicamento ?? null,
          posologia: raw.posologia || null,
        };
      });
      setDados(normalizada);
      const metaTotal = (resp as { total?: number; meta?: { total?: number } }).total
        ?? (resp as { meta?: { total?: number } }).meta?.total
        ?? normalizada.length;
      setTotal(metaTotal);
      const lp = (resp as { lastPage?: number }).lastPage
        ?? (metaTotal && limit ? Math.max(1, Math.ceil(metaTotal / limit)) : 1);
      setLastPage(lp);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar prescrições');
      setDados([]); setTotal(0); setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [idMorador, page, limit]);

  useEffect(() => { void carregar(); }, [carregar]);

  const filtered = useMemo(() => {
    if (!dados.length) return [];
    const term = (texto ?? '').trim().toLowerCase();
    const startBoundary = dataInicio ? new Date(`${dataInicio}T00:00:00.000Z`) : null;
    const endBoundary = dataFim ? new Date(`${dataFim}T23:59:59.999Z`) : null;
    return dados.filter(d => {
      const dateVal = new Date(d.data_iso);
      const afterStart = startBoundary ? dateVal >= startBoundary : true;
      const beforeEnd = endBoundary ? dateVal <= endBoundary : true;
      const matches = term
    ? [d.medico || '', d.observacoes || '', d.aplicador || '', d.vinculado_por || '', d.cuidador || '']
            .join(' ') // juntar campos
            .toLowerCase()
            .includes(term)
        : true;
      return matches && afterStart && beforeEnd;
    });
  }, [dados, texto, dataInicio, dataFim]);

  return { dados, loading, erro, total, lastPage, filtered, refresh: carregar };
}