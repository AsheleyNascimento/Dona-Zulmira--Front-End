"use client";
import { useEffect, useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NotebookPen, Trash2 } from 'lucide-react';
import { createPrescricaoCompleta, listMedicos, listMedicamentos } from '@/lib/api';
import type { PrescricaoCompletaCreatePayload } from '@/types/relatorio';

interface ItemTemp { id_medicamento: number | ''; posologia: string }

interface Props {
  idMorador: number;
  onSaved(): Promise<void> | void;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function PrescricaoFormModal({ idMorador, onSaved, triggerLabel = 'Cadastrar prescrição', triggerClassName = 'h-10 px-4' }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [idMedico, setIdMedico] = useState<number | ''>('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [itens, setItens] = useState<ItemTemp[]>([{ id_medicamento: '', posologia: '' }]);
  const [medicosOpt, setMedicosOpt] = useState<Array<{ id: number; nome: string }>>([]);
  const [medicamentosOpt, setMedicamentosOpt] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  // Carrega opções ao abrir
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingOpts(true);
        const [medicos, meds] = await Promise.all([listMedicos(100), listMedicamentos(100)]);
        setMedicosOpt(medicos);
        setMedicamentosOpt(meds);
      } catch {
        // silencioso
      } finally {
        setLoadingOpts(false);
      }
    })();
  }, [open]);

  function reset() {
    setErro(''); setSucesso(''); setIdMedico(''); setMes(''); setAno(''); setItens([{ id_medicamento: '', posologia: '' }]);
  }

  async function salvar() {
    setErro(''); setSucesso('');
    const medicoParsed = Number(idMedico);
    if (!Number.isFinite(medicoParsed) || medicoParsed <= 0) { setErro('Selecione o médico.'); return; }
    if (!/^\d{2}$/.test(mes)) { setErro('Informe o mês (MM).'); return; }
    if (!/^\d{4}$/.test(ano)) { setErro('Informe o ano (YYYY).'); return; }
    const itensValidos = itens.filter(i => i.id_medicamento !== '' && i.posologia.trim().length > 0);
    if (itensValidos.length === 0) { setErro('Adicione ao menos um item (medicamento + posologia).'); return; }
    const payload: PrescricaoCompletaCreatePayload = {
      id_morador: idMorador,
      id_medico: medicoParsed,
      mes,
      ano,
      itens: itensValidos.map(i => ({ id_medicamento: Number(i.id_medicamento), posologia: i.posologia.trim() })),
    };
    setLoading(true);
    try {
      await createPrescricaoCompleta(payload);
      setSucesso('Prescrição registrada com sucesso.');
      await onSaved();
      setTimeout(() => { setOpen(false); reset(); }, 500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar prescrição');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v); }}>
      <DialogTrigger asChild>
        <Button data-trigger="prescricao-create" className={triggerClassName + ' bg-[#002c6c] hover:bg-[#003d99] text-white flex items-center gap-2'}>
          <NotebookPen className="w-4 h-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[680px] bg-white">
        <DialogHeader>
          <DialogTitle>Registrar prescrição</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {erro && <div role="alert" className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{erro}</div>}
          {sucesso && <div role="status" className="rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{sucesso}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-3">
              <Label>Médico</Label>
              <select
                className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
                disabled={loadingOpts}
                value={idMedico}
                onChange={(e) => setIdMedico(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">Selecione...</option>
                {medicosOpt.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
            </div>
            <div>
              <Label>Mês (MM)</Label>
              <Input className="mt-1" value={mes} maxLength={2} onChange={(e) => setMes(e.target.value)} placeholder="09" />
            </div>
            <div>
              <Label>Ano (YYYY)</Label>
              <Input className="mt-1" value={ano} maxLength={4} onChange={(e) => setAno(e.target.value)} placeholder="2025" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Itens</Label>
              <Button type="button" variant="outline" onClick={() => setItens(prev => [...prev, { id_medicamento: '', posologia: '' }])}>Adicionar item</Button>
            </div>
            <div className="space-y-3">
              {itens.map((it, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-[2fr_3fr_auto] gap-2 items-end">
                  <div>
                    <Label>Medicamento</Label>
                    <select
                      className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
                      disabled={loadingOpts}
                      value={it.id_medicamento}
                      onChange={(e) => {
                        const v = e.target.value ? Number(e.target.value) : '';
                        setItens(prev => prev.map((p, i) => i === idx ? { ...p, id_medicamento: v } : p));
                      }}
                    >
                      <option value="">Selecione...</option>
                      {medicamentosOpt.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Posologia</Label>
                    <Input value={it.posologia} onChange={(e) => setItens(prev => prev.map((p, i) => i === idx ? { ...p, posologia: e.target.value } : p))} placeholder="1 cp 12/12h" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={() => setItens(prev => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button disabled={loading} onClick={salvar} className="bg-[#002c6c] hover:bg-[#003d99] text-white">
            {loading ? 'Salvando...' : 'Salvar prescrição'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
