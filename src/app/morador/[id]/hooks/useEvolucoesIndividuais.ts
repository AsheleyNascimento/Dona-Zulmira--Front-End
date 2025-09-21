"use client";
import { useCallback, useEffect, useState } from 'react';
import { listEvolucoes } from '@/lib/api';
import type { EvolucaoIndividual } from '@/types/relatorio';

interface UseEvolucoesParams {
  idMorador: number;
  page: number;
  limit: number;
  observacoes?: string;
  dataInicio?: string;
  dataFim?: string; // yyyy-mm-dd
}

interface UseEvolucoesResult {
  dados: EvolucaoIndividual[];
  loading: boolean;
  erro: string | null;
  total: number;
  lastPage: number;
  refresh(): Promise<void>;
}

export function useEvolucoesIndividuais(params: UseEvolucoesParams): UseEvolucoesResult {
  const { idMorador, page, limit, observacoes, dataInicio, dataFim } = params;
  const [dados, setDados] = useState<EvolucaoIndividual[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  const carregar = useCallback(async () => {
    if (!idMorador) return;
    setLoading(true);
    setErro(null);
    try {
      const resposta = await listEvolucoes({
        page,
        limit,
        id_morador: idMorador,
        observacoes: observacoes?.trim() || undefined,
        data_inicio: dataInicio || undefined,
        data_fim: dataFim ? `${dataFim}T23:59:59.999` : undefined,
      });
      const bruta: unknown[] = Array.isArray(resposta.data) ? resposta.data : [];
      // Normalização defensiva (campos variantes legacy)
      const normalizada: EvolucaoIndividual[] = bruta.map((raw) => {
        const e = raw as Record<string, unknown>;
        const id = (e.id_evolucao_individual as number) ?? (e.id_evolucao as number) ?? (e.id as number) ?? Math.floor(Math.random() * 1e9);
        const dataRaw = (e.data_hora as string) ?? (e.data as string) ?? (e.data_evolucao as string) ?? (e.criado_em as string) ?? new Date().toISOString();
        const dataISO = (() => { const d = new Date(dataRaw); return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString(); })();
        const observacoesVal = (e.observacoes as string) ?? (e.descricao as string) ?? (e.observacao as string) ?? '';
        let usuarioNome: string | undefined;
        const usuarioVal = e['usuario'];
        if (usuarioVal && typeof usuarioVal === 'object') {
          const u = usuarioVal as Record<string, unknown>;
            usuarioNome = (u.nome_completo as string) || (u.nome_usuario as string) || (u.nome as string) || undefined;
        }
        if (!usuarioNome) {
          const fallback = ['usuario_nome','profissional','responsavel','cuidador','enfermeiro'] as const;
          for (const k of fallback) { const v = e[k]; if (typeof v === 'string') { usuarioNome = v; break; } }
        }
        const usuario = usuarioNome ? { id_usuario: (e.id_usuario as number) || 0, nome_completo: usuarioNome } : undefined;
        return { id_evolucao_individual: id, data_hora: dataISO, observacoes: observacoesVal, usuario };
      });
      setDados(normalizada);
      // Backend atual (pelo padrão anterior) retorna possivelmente total/lastPage fora ou não; ajustamos defensivamente
  interface MaybePaged { total?: number; lastPage?: number; meta?: { total?: number } }
  const anyResp = resposta as MaybePaged;
  const totalResp = typeof anyResp.total === 'number' ? anyResp.total : (anyResp.meta?.total ?? normalizada.length);
      setTotal(totalResp);
      const last = typeof anyResp.lastPage === 'number'
        ? anyResp.lastPage
        : (totalResp && limit ? Math.max(1, Math.ceil(totalResp / limit)) : 1);
      setLastPage(last);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar evoluções');
      setDados([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [idMorador, page, limit, observacoes, dataInicio, dataFim]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  return { dados, loading, erro, total, lastPage, refresh: carregar };
}
