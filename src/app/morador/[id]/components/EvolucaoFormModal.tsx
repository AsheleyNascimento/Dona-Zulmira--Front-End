"use client";
import { useEffect, useState, useCallback } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { NotebookPen } from 'lucide-react';
import { createEvolucao, updateEvolucao } from '@/lib/api';
import type { EvolucaoIndividual } from '@/types/relatorio';

interface Props {
  idMorador: number;
  editando: EvolucaoIndividual | null;
  onClose(): void;
  onSaved(): Promise<void> | void;
  triggerClassName?: string;
  triggerLabel?: string;
}

const MAX_LEN = 1000;

export function EvolucaoFormModal({ idMorador, editando, onClose, onSaved, triggerClassName = 'h-8 px-3', triggerLabel = 'Cadastrar evolução' }: Props) {
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editando) {
      setOpen(true);
      setTexto(editando.observacoes || '');
      setErro(''); setSucesso('');
    }
  }, [editando]);

  // Envolvendo reset em useCallback
  const reset = useCallback(() => {
    setTexto('');
    setErro('');
    setSucesso('');
  }, []);

  // Envolvendo salvar em useCallback para estabilizar a referência
  const salvar = useCallback(async () => {
    setErro(''); setSucesso('');
    const val = texto.trim();
    if (val.length < 10) { setErro('Descreva a evolução com pelo menos 10 caracteres.'); return; }
    setLoading(true);
    try {
      if (editando) {
        await updateEvolucao(editando.id_evolucao_individual, { observacoes: val });
        setSucesso('Evolução atualizada com sucesso.');
      } else {
        await createEvolucao({ id_morador: idMorador, observacoes: val });
        setSucesso('Evolução criada com sucesso.');
      }
      await onSaved();
      setTimeout(() => { setOpen(false); onClose(); reset(); }, 400);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Falha ao salvar evolução');
    } finally {
      setLoading(false);
    }
  }, [texto, editando, idMorador, onSaved, onClose, reset]);

  // Atalho Ctrl+Enter com a dependência correta
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        void salvar();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, salvar]);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } setOpen(v); }}>
      {!editando && (
        <DialogTrigger asChild>
          <Button className={triggerClassName + ' bg-[#002c6c] hover:bg-[#003d99] text-white flex items-center gap-2'}>
            <NotebookPen className="w-4 h-4" /> {triggerLabel}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[640px] bg-white">
        <DialogHeader>
          <DialogTitle>{editando ? `Editar evolução #${editando.id_evolucao_individual}` : 'Registrar evolução'}</DialogTitle>
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
              placeholder="Ex.: Durante o período da manhã, o morador apresentou bom apetite..."
            />
            <span className="text-[11px] text-[#6b87b5] self-end">{texto.length}/{MAX_LEN}</span>
          </label>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button type="button" variant="ghost" onClick={() => { setOpen(false); onClose(); }}>Cancelar</Button>
          <Button disabled={loading || texto.trim().length < 10} onClick={salvar} className="bg-[#002c6c] hover:bg-[#003d99] text-white">
            {loading ? 'Salvando...' : (editando ? 'Atualizar' : 'Salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}