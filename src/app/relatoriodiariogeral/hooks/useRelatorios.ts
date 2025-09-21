import { useCallback, useEffect, useState } from 'react';
import { RelatorioDiarioGeral } from '@/types/relatorio';
import { getRelatorios } from '@/lib/api';

interface UseRelatoriosOptions {
  page?: number;
  limit?: number;
  auto?: boolean;
}

export function useRelatorios({ page = 1, limit = 100, auto = true }: UseRelatoriosOptions = {}) {
  const [data, setData] = useState<RelatorioDiarioGeral[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await getRelatorios(page, limit);
      setData(lista);
    } catch (e) {
      console.error('Erro ao carregar relatórios', e);
      setError('Falha ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    if (auto) refresh();
  }, [auto, refresh]);

  return { relatorios: data, loadingRelatorios: loading, erroRelatorios: error, refreshRelatorios: refresh };
}
