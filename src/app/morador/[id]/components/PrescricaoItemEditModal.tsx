"use client";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { listMedicamentos, updateMedicamentoPrescricao } from '@/lib/api';

interface Props {
  open: boolean;
  onOpenChange(v: boolean): void;
  itemId: number | null;
  medicamentoIdInicial: number | null | '';
  posologiaInicial: string;
  onSaved(): Promise<void> | void;
}

export function PrescricaoItemEditModal({ open, onOpenChange, itemId, medicamentoIdInicial, posologiaInicial, onSaved }: Props) {
  const [medicamentoId, setMedicamentoId] = useState<number | ''>('');
  const [posologia, setPosologia] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [medicamentosOpt, setMedicamentosOpt] = useState<Array<{ id: number; nome: string }>>([]);
  const [loadingOpts, setLoadingOpts] = useState(false);

  useEffect(() => {
    if (open) {
      setMedicamentoId(medicamentoIdInicial || '');
      setPosologia(posologiaInicial || '');
      setErro(''); setSucesso('');
      if (medicamentosOpt.length === 0) {
        (async () => {
          try {
            setLoadingOpts(true);
            const meds = await listMedicamentos(100);
            setMedicamentosOpt(meds);
          } catch {
            // silencioso
          } finally {
            setLoadingOpts(false);
          }
        })();
      }
    } else {
      setMedicamentoId(''); setPosologia(''); setErro(''); setSucesso('');
    }
  }, [open, medicamentoIdInicial, posologiaInicial, medicamentosOpt.length]);

  async function salvar() {
    if (!itemId) { onOpenChange(false); return; }
    const medParsed = Number(medicamentoId);
    if (!Number.isFinite(medParsed) || medParsed <= 0) { setErro('Selecione o medicamento.'); return; }
    if (!posologia.trim()) { setErro('Informe a posologia.'); return; }
    setLoading(true); setErro(''); setSucesso('');
    try {
      await updateMedicamentoPrescricao(itemId, { id_medicamento: medParsed, posologia: posologia.trim() });
      setSucesso('Item atualizado com sucesso.');
      await onSaved();
      setTimeout(() => onOpenChange(false), 500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar item');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-white">
        <DialogHeader>
          <DialogTitle>Editar item da prescrição</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          {erro && <div role="alert" className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{erro}</div>}
          {sucesso && <div role="status" className="rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{sucesso}</div>}
          <div>
            <Label>Medicamento</Label>
            <select
              className="mt-1 w-full border border-[#e5eaf1] rounded-md px-3 py-2 text-sm"
              disabled={loadingOpts}
              value={medicamentoId}
              onChange={(e) => setMedicamentoId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">Selecione...</option>
              {medicamentosOpt.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <Label>Posologia</Label>
            <Input value={posologia} onChange={(e) => setPosologia(e.target.value)} placeholder="1 cp 12/12h" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={loading} onClick={salvar} className="bg-[#002c6c] hover:bg-[#003d99] text-white">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
