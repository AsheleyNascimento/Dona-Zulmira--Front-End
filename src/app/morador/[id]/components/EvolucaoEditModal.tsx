"use client";
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { updateEvolucao } from '@/lib/api';
import type { EvolucaoIndividual } from '@/types/relatorio';

interface Props {
  evolucao: EvolucaoIndividual | null;
  open: boolean;
  onOpenChange(v: boolean): void;
  onSaved(): Promise<void> | void;
}

const MAX_LEN = 1000;

export function EvolucaoEditModal({ evolucao, open, onOpenChange, onSaved }: Props) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && evolucao) {
      setTexto(evolucao.observacoes || '');
      setErro(''); setSucesso('');
    } else if (!open) {
      setTexto(''); setErro(''); setSucesso('');
    }
  }, [open, evolucao]);

  async function salvar() {
    if (!evolucao) return;
    const val = texto.trim();
    if (val.length < 10) { setErro('Descreva a evolução com pelo menos 10 caracteres.'); return; }
    setLoading(true); setErro(''); setSucesso('');
    try {
      await updateEvolucao(evolucao.id_evolucao_individual, { observacoes: val });
      setSucesso('Evolução atualizada com sucesso.');
      await onSaved();
      setTimeout(() => onOpenChange(false), 500);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao atualizar evolução');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] bg-white">
        <DialogHeader>
          <DialogTitle>Editar evolução {evolucao ? `#${evolucao.id_evolucao_individual}` : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {erro && <div role="alert" className="rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{erro}</div>}
          {sucesso && <div role="status" className="rounded-md border border-green-200 bg-green-50 text-green-700 px-3 py-2 text-sm">{sucesso}</div>}
          <label className="flex flex-col gap-1 text-sm font-medium text-[#002c6c]">
            Observações
            <Textarea
              rows={8}
              maxLength={MAX_LEN}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
            <span className="text-[11px] text-[#6b87b5] self-end">{texto.length}/{MAX_LEN}</span>
          </label>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={loading || texto.trim().length < 10} onClick={salvar} className="bg-[#002c6c] hover:bg-[#003d99] text-white">
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
