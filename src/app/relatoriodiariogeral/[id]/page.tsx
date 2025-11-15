'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { API_BASE } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, LineChart, ArrowLeft } from 'lucide-react';

interface RelatorioDetalhe {
  id_relatorio_diario_geral: number;
  data_hora: string | null;
  observacoes: string;
  usuario?: { id_usuario: number; nome_completo: string; email: string } | null;
  evolucaoindividual?: { id_evolucao_individual: number; observacoes: string; data_hora: string } | null; // legado
  evolucoes?: { evolucao: { id_evolucao_individual: number; observacoes: string; data_hora: string; usuario?: { id_usuario: number; nome_completo: string } } }[];
}

function formatDateTime(iso?: string | null) {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export default function RelatorioDiarioGeralDetalhePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [verificado, setVerificado] = useState(false);
  const [acessoNegado, setAcessoNegado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string>('');
  const [relatorio, setRelatorio] = useState<RelatorioDetalhe | null>(null);

  const carregar = useCallback(async () => {
    if (!id) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return;
    setCarregando(true);
    setErro('');
    try {
      const res = await fetch(`${API_BASE}/relatorio-geral/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const obj = (data?.data ?? data) as RelatorioDetalhe;
      setRelatorio(obj);
    } catch (e) {
      setErro('Falha ao carregar relatório.');
    } finally {
      setCarregando(false);
    }
  }, [id]);

  useEffect(() => {
    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token || (funcao !== 'Cuidador' && funcao !== 'Enfermeiro')) {
      setAcessoNegado(true);
      setTimeout(() => router.push('/login'), 2000);
      setVerificado(true);
      return;
    }
    setVerificado(true);
  }, [router]);

  useEffect(() => {
    if (verificado && !acessoNegado) carregar();
  }, [verificado, acessoNegado, carregar]);

  if (!verificado) return <div className="min-h-screen bg-white" />;
  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">Acesso restrito ao usuário! Redirecionando para login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#e9f1f9] font-poppins">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'); .font-poppins{font-family:'Poppins',sans-serif;}`}</style>

      <aside className="w-full lg:w-64 flex flex-col bg-white p-6 border-b lg:border-r lg:border-b-0 border-[#e9f1f9]">
        <div className="flex flex-col items-center gap-2">
          <Image src="/logo-ssvp.png" alt="Logo SSVP Casa Dona Zulmira" width={96} height={96} className="w-24 h-24" />
          <h2 className="text-[#002c6c] text-sm font-bold uppercase text-center">Casa Dona Zulmira</h2>
        </div>
        <LateralNav />
      </aside>

      <main className="flex-1 flex flex-col p-6 sm:p-8 relative">
        <div className="mb-4 flex items-center gap-2">
          <Button variant="ghost" className="px-2 h-8" onClick={() => router.push('/relatoriodiariogeral')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
        </div>

        <Card className="rounded-3xl border border-[#cfd8e3]/60 shadow-md bg-white p-6 space-y-6">
          {carregando && <div className="text-sm text-[#6b87b5]">Carregando relatório...</div>}
          {erro && !carregando && <div className="text-sm text-red-600">{erro}</div>}
          {!carregando && !erro && relatorio && (
            <>
              <header className="flex flex-col gap-2">
                <h1 className="text-xl font-bold text-[#002c6c]">Relatório #{relatorio.id_relatorio_diario_geral}</h1>
                <div className="text-sm text-[#4a5b78] flex flex-wrap gap-4">
                  <span><strong>Data/Hora:</strong> {formatDateTime(relatorio.data_hora)}</span>
                  <span><strong>Profissional:</strong> {relatorio.usuario?.nome_completo ?? '-'} </span>
                  <span><strong>Total evoluções:</strong> {relatorio.evolucoes?.length ?? (relatorio.evolucaoindividual ? 1 : 0)}</span>
                </div>
              </header>

              <section className="space-y-2">
                <h2 className="text-lg font-semibold text-[#002c6c]">Observações Gerais</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#2d3e55] bg-[#f5f8fb] border border-[#e1e8f0] rounded-md p-4">
                  {relatorio.observacoes || '-'}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold text-[#002c6c]">Evoluções Associadas</h2>
                {(!relatorio.evolucoes || relatorio.evolucoes.length === 0) && !relatorio.evolucaoindividual && (
                  <div className="text-sm text-[#6b87b5]">Nenhuma evolução vinculada.</div>
                )}
                {relatorio.evolucaoindividual && !relatorio.evolucoes?.length && (
                  <Card className="p-4 border border-[#d9e2ec] bg-[#f5f8fb]">
                    <p className="text-xs text-[#6b87b5] mb-1">(Formato legado - única evolução)</p>
                    <p className="text-[13px] font-medium mb-1">Evolução #{relatorio.evolucaoindividual.id_evolucao_individual}</p>
                    <p className="text-[11px] text-[#4a5b78] mb-2">{formatDateTime(relatorio.evolucaoindividual.data_hora)}</p>
                    <p className="text-sm whitespace-pre-wrap">{relatorio.evolucaoindividual.observacoes}</p>
                  </Card>
                )}
                {relatorio.evolucoes && relatorio.evolucoes.length > 0 && (
                  <div className="border rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-[#002c6c] font-semibold">ID</TableHead>
                          <TableHead className="text-[#002c6c] font-semibold">Data/Hora</TableHead>
                          <TableHead className="text-[#002c6c] font-semibold">Profissional</TableHead>
                          <TableHead className="text-[#002c6c] font-semibold">Observações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatorio.evolucoes.map((wrap) => {
                          const ev = wrap.evolucao;
                          return (
                            <TableRow key={ev.id_evolucao_individual} className="hover:bg-[#f0f5fa]">
                              <TableCell className="text-sm font-medium text-[#002c6c]">#{ev.id_evolucao_individual}</TableCell>
                              <TableCell className="text-sm text-[#2d3e55]">{formatDateTime(ev.data_hora)}</TableCell>
                              <TableCell className="text-sm text-[#2d3e55]">{ev.usuario?.nome_completo ?? '-'}</TableCell>
                              <TableCell className="text-sm text-[#2d3e55] max-w-md whitespace-pre-wrap">{ev.observacoes}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </section>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => router.push('/relatoriodiariogeral')} className="mt-4">Voltar à lista</Button>
              </div>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

function LateralNav() {
  const router = useRouter();
  const items = [
    { label: 'Lista de moradores', href: '/morador', icon: <Users className="h-5 w-5" /> },
    { label: 'Relatórios', href: '/relatoriodiariogeral', icon: <LineChart className="h-5 w-5" /> },
  ];
  return (
    <nav className="mt-8 flex flex-col gap-2 text-[0.95rem] text-[#002c6c]">
      {items.map((it) => (
        <Button
          key={it.href}
            variant="ghost"
            className={`justify-between px-3 cursor-pointer hover:bg-[#e9f1f9]/60`}
            onClick={() => router.push(it.href)}
        >
          <span className="flex items-center gap-3">{it.icon}{it.label}</span>
          <span className="text-[#003d99]">›</span>
        </Button>
      ))}
    </nav>
  );
}
