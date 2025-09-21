import { useCallback, useEffect, useState } from 'react';
import type { EvolucaoIndividual } from '@/types/relatorio';
import { getEvolucoes } from '@/lib/api';

interface UseEvolucoesOptions {
  page?: number;
  limit?: number;
  auto?: boolean;
  usuarioId?: number | null; // (futuro) para filtrar por usuário
}

export function useEvolucoes({ page = 1, limit = 100, auto = true, usuarioId }: UseEvolucoesOptions = {}) {
  const [data, setData] = useState<EvolucaoIndividual[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await getEvolucoes(page, limit);
      // (futuro) se quisermos filtrar por usuário:
      const filtrada = usuarioId ? lista.filter(ev => ev.id_usuario === usuarioId) : lista;
      setData(filtrada);
    } catch (e) {
      console.error('Erro ao carregar evoluções', e);
      setError('Falha ao carregar evoluções');
    } finally {
      setLoading(false);
    }
  }, [page, limit, usuarioId]);

  useEffect(() => { if (auto) refresh(); }, [auto, refresh]);

  return { evolucoes: data, loadingEvolucoes: loading, erroEvolucoes: error, refreshEvolucoes: refresh };
}
