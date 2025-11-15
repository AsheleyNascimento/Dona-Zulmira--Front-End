'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import HeaderBrand from '@/components/HeaderBrand';

export default function RegistrarEvolucaoMoradorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [moradorNome, setMoradorNome] = useState<string>('');
  const [moradorCarregando, setMoradorCarregando] = useState<boolean>(true);
  const [userRole, SetUserRole] = useState<string>('');

  // Form state
  const [descricao, setDescricao] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const MAX_DESC = 1000;
  const descCounter = `${descricao.length}/${MAX_DESC}`;
  const isDirtyRef = useRef(false);
  const formRef = useRef<HTMLFormElement | null>(null);



  useEffect(() => {

    const funcao = typeof window !== 'undefined' ? localStorage.getItem('funcao') : null;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    if (!accessToken || funcao !== 'Cuidador') {
      setAcessoNegado(true);
      setTimeout(() => router.push('/login'), 2000);
    }
    if(funcao){
      SetUserRole(funcao);
    }
    setVerificado(true);
  }, [router]);





  // Load morador summary and draft
  useEffect(() => {
    // Carrega rascunho independentemente
    try {
      if (id) {
        const raw = localStorage.getItem(`evolucaoDraft:${id}`);
        if (raw) {
          const d = JSON.parse(raw) as Partial<{ descricao: string }>;
          if (d.descricao) setDescricao(d.descricao);
        }
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    if (!verificado || acessoNegado) return;
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!id || !accessToken) return;

    // Pré-carrega do sessionStorage para evitar "Morador" até o fetch finalizar
    try {
      const cache = sessionStorage.getItem(`moradorNome:${id}`);
      if (cache) {
        setMoradorNome(cache);
      }
    } catch {}

    setMoradorCarregando(true);
    fetch(`http://localhost:4000/morador/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    })
      .then((r) => r.json())
      .then((data) => {
        const mRaw = (data && (data.data ?? data.morador ?? data)) || null;
        const nome = mRaw?.nome_completo ?? '';
        setMoradorNome(nome);
        try { if (nome) sessionStorage.setItem(`moradorNome:${id}`, nome); } catch {}
      })
      .catch(() => {
        // mantém valor atual ou vazio
      })
      .finally(() => setMoradorCarregando(false));
  }, [id, verificado, acessoNegado]);

  // Persist draft when form changes
  useEffect(() => {
    if (!id) return;
    const payload = JSON.stringify({ descricao });
    localStorage.setItem(`evolucaoDraft:${id}`, payload);
  }, [id, descricao]);

  // Keyboard shortcut: Ctrl/Cmd + Enter to submit
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const validate = () => {
    setErrorMsg('');
    if (!descricao || descricao.trim().length < 10) return 'Descreva a evolução com pelo menos 10 caracteres.';
    return '';
  };

  const clearDraft = () => {
    if (!id) return;
    localStorage.removeItem(`evolucaoDraft:${id}`);
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setErrorMsg(v);
      setSuccessMsg('');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const accessToken = localStorage.getItem('accessToken');
      const resp = await fetch('http://localhost:4000/evolucao-individual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ id_morador: Number(id), observacoes: descricao.trim() }),
      });
      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Falha ao salvar');
      }
      setSuccessMsg('Evolução registrada com sucesso.');
      clearDraft();
      isDirtyRef.current = false;
      // Redireciona para a página do morador após salvar
      setTimeout(() => router.push(`/morador/${id}`), 600);
    } catch {
      setErrorMsg('Não foi possível registrar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    if (descricao) {
      const sair = window.confirm('Há alterações não salvas. Deseja sair mesmo assim?');
      if (!sair) return;
    }
    router.push(`/morador/${id}`);
  };

  if (!verificado) return <div className="min-h-screen bg-white" />;
  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">Acesso restrito ao usuário! Redirecionando para login...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
          .font-poppins { font-family: 'Poppins', sans-serif; }
        `}
      </style>

      <HeaderBrand
        center={
          <div className="truncate px-4 text-[#002c6c] font-semibold text-base sm:text-lg">
            {moradorCarregando ? 'Carregando…' : moradorNome || 'Morador'}
          </div>
        }
      />

      <main className="flex-1 flex flex-col p-6 sm:p-8 gap-6 relative">
        {/* Contexto do Morador */}
        <section className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm border border-[#e5eaf1]">
          <p className="text-sm text-[#4a5b78]">Registre informações claras, objetivas e observáveis do plantão. A data e o horário serão definidos automaticamente.</p>
        </section>

        {/* Formulário de Evolução */}
        <section className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm border border-[#e5eaf1]">
          <h1 className="text-2xl font-semibold text-[#002c6c] mb-4">Registrar evolução</h1>

          {errorMsg && (
            <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-4 py-2 text-sm">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 text-green-700 px-4 py-2 text-sm">
              {successMsg}
            </div>
          )}

          <form
            className="grid grid-cols-1 gap-6"
            ref={formRef}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Observações</Label>
              <Textarea
                id="descricao"
                rows={8}
                placeholder="Ex.: Durante o período da manhã, o morador apresentou bom apetite e aceitação total das refeições. Caminhou com auxílio, sem intercorrências."
                maxLength={MAX_DESC}
                value={descricao}
                onChange={(e) => {
                  setDescricao(e.target.value);
                  isDirtyRef.current = true;
                }}
                aria-describedby="descricao-ajuda"
              />
              <div className="flex items-center justify-between mt-1">
                <p id="descricao-ajuda" className="text-xs text-[#6b87b5]">Dica: descreva fatos observáveis, horários e intervenções.</p>
                <span className="text-xs text-[#6b87b5]">{descCounter}</span>
              </div>
            </div>

            <div className="md:col-span-2 flex flex-wrap gap-3 justify-between items-center">
              <div className="text-xs text-[#6b87b5]">Atalho: Ctrl/⌘ + Enter para salvar</div>
              <div className="flex gap-2 ml-auto">
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting} className="bg-[#003d99] hover:bg-[#002c6c]">
                  {submitting ? 'Salvando...' : 'Salvar evolução'}
                </Button>
              </div>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
