"use client";

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { RelatorioDetalhe, RelatorioDiarioGeral } from '@/types/relatorio';
import { getRelatorioDetalhe } from '@/lib/api';

interface RelatorioViewModalProps {
  relatorio: RelatorioDiarioGeral | null;
  open: boolean;
  onOpenChange(open: boolean): void;
}

export function RelatorioViewModal({ relatorio, open, onOpenChange }: RelatorioViewModalProps) {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [detalhe, setDetalhe] = useState<RelatorioDetalhe | null>(null);

  useEffect(() => {
    if (open && relatorio) {
      setLoading(true);
      setErro('');
      setDetalhe(null);
      // Logging removed
      getRelatorioDetalhe(relatorio.id_relatorio_diario_geral)
        .then((d) => {
          setDetalhe(d);
        })
        .catch((e) => {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[RelatorioViewModal] Erro ao carregar detalhe', e);
          }
          setErro('Não foi possível carregar o relatório.');
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      setErro('');
      setDetalhe(null);
    }
  }, [open, relatorio]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-lg border border-[#cfd8e3]">
        <DialogHeader>
          <DialogTitle>{detalhe ? `Relatório #${detalhe.id_relatorio_diario_geral}` : 'Relatório'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-1">
          {loading && (
            <div className="text-sm text-[#6b87b5]">
              Carregando...
            </div>
          )}
          {erro && !loading && <div className="text-sm text-red-600">{erro}</div>}
          {/* Fallback: se ainda não temos detalhe mas temos objeto base */}
          {!loading && !erro && !detalhe && relatorio && (
            <div className="space-y-4 text-sm text-[#4a5b78]" aria-live="polite">
              <div className="rounded-md border border-[#e1e8f0] bg-[#f5f8fb] p-3">
                <p className="font-medium mb-1">Carregando informações detalhadas...</p>
                <p><strong>ID:</strong> {relatorio.id_relatorio_diario_geral}</p>
                <p><strong>Data:</strong> {(() => { const d = new Date(relatorio.data_hora); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR'); })()}</p>
                <p className="line-clamp-3"><strong>Observações (base):</strong> {relatorio.observacoes || '-'}</p>
              </div>
            </div>
          )}
          {!loading && !erro && detalhe && (
            <div className="space-y-6">
              <section className="space-y-2">
                <div className="flex flex-wrap gap-4 text-[13px] text-[#4a5b78]">
                  {(() => {
                    const dt = detalhe.data_hora ? new Date(detalhe.data_hora) : null;
                    const dataFormatada = dt && !isNaN(dt.getTime()) ? dt.toLocaleDateString('pt-BR') : '-';
                    return <span><strong>Data:</strong> {dataFormatada}</span>;
                  })()}
                  <span><strong>Profissional:</strong> {detalhe.usuario?.nome_completo ?? '-'}</span>
                  <span><strong>Total evoluções:</strong> {detalhe.evolucoes?.length ?? (detalhe.evolucaoindividual ? 1 : 0)}</span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#002c6c] mb-1">Observações Gerais</h3>
                  <div className="whitespace-pre-wrap break-all text-sm leading-relaxed text-[#2d3e55] bg-[#f5f8fb] border border-[#e1e8f0] rounded-md p-3">
                    {detalhe.observacoes || '-'}
                  </div>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-semibold text-[#002c6c]">Evoluções Associadas</h3>
                {(!detalhe.evolucoes || detalhe.evolucoes.length === 0) && !detalhe.evolucaoindividual && (
                  <div className="text-xs text-[#6b87b5]">Nenhuma evolução vinculada.</div>
                )}
                {detalhe.evolucaoindividual && !detalhe.evolucoes?.length && (
                  <div className="border rounded-md p-3 bg-[#f5f8fb]">
                    <p className="text-[11px] text-[#6b87b5] mb-1">(Formato legado)</p>
                    <p className="text-[13px] font-medium mb-1">Evolução #{detalhe.evolucaoindividual.id_evolucao_individual}</p>
                    <p className="text-[11px] text-[#4a5b78] mb-2">{(() => { const d = new Date(detalhe.evolucaoindividual!.data_hora); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR'); })()}</p>
                    <p className="text-sm whitespace-pre-wrap break-all">{detalhe.evolucaoindividual.observacoes}</p>
                  </div>
                )}
                {detalhe.evolucoes && detalhe.evolucoes.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f0f5fa]">
                        <tr className="text-left">
                          <th className="px-3 py-2 text-[#002c6c] font-semibold">ID</th>
                          <th className="px-3 py-2 text-[#002c6c] font-semibold">Data/Hora</th>
                          <th className="px-3 py-2 text-[#002c6c] font-semibold">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalhe.evolucoes.map(w => (
                          <tr key={w.evolucao.id_evolucao_individual} className="odd:bg-white even:bg-[#fafcfe]">
                            <td className="px-3 py-2 font-medium text-[#002c6c]">#{w.evolucao.id_evolucao_individual}</td>
                            <td className="px-3 py-2 text-[#2d3e55]">{(() => { const d = new Date(w.evolucao.data_hora); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR'); })()}</td>
                            <td className="px-3 py-2 text-[#2d3e55] whitespace-pre-wrap break-all">{w.evolucao.observacoes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
