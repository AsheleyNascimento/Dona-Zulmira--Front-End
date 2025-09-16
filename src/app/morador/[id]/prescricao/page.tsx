"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HeaderBrand from "@/components/HeaderBrand";

export default function PrescricaoMoradorPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [acessoNegado, setAcessoNegado] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [moradorNome, setMoradorNome] = useState<string>("");
  const [moradorCarregando, setMoradorCarregando] = useState<boolean>(true);

  useEffect(() => {
    const funcao = typeof window !== "undefined" ? localStorage.getItem("funcao") : null;
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!accessToken || funcao !== "Cuidador") {
      setAcessoNegado(true);
      setTimeout(() => router.push("/login"), 2000);
    }
    setVerificado(true);
  }, [router]);

  useEffect(() => {
    if (!verificado || acessoNegado) return;
    const accessToken = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!id || !accessToken) return;
    try {
      const cache = sessionStorage.getItem(`moradorNome:${id}`);
      if (cache) setMoradorNome(cache);
    } catch {}
    setMoradorCarregando(true);
    fetch(`http://localhost:4000/morador/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        const mRaw = (data && (data.data ?? data.morador ?? data)) || null;
        const nome = mRaw?.nome_completo ?? "";
        setMoradorNome(nome);
        try { if (nome) sessionStorage.setItem(`moradorNome:${id}`, nome); } catch {}
      })
      .catch(() => {})
      .finally(() => setMoradorCarregando(false));
  }, [id, verificado, acessoNegado]);

  if (!verificado) return <div className="min-h-screen bg-white" />;
  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="bg-red-100 text-red-700 px-6 py-4 rounded shadow text-xl font-bold">
          Acesso restrito ao usuário! Redirecionando para login...
        </div>
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
            {moradorCarregando ? "Carregando…" : moradorNome || "Morador"}
          </div>
        }
      />

      <main className="flex-1 flex flex-col p-6 sm:p-8 relative">
        <div className="max-w-3xl bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-[#002c6c] mb-6">Prescrição médica</h1>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <Label htmlFor="medicamento">Medicamento</Label>
              <Input id="medicamento" placeholder="Ex.: Dipirona 500mg" />
            </div>
            <div className="md:col-span-1">
              <Label htmlFor="posologia">Posologia</Label>
              <Input id="posologia" placeholder="Ex.: 1 comp 8/8h" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" rows={4} placeholder="Observações adicionais" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => router.push(`/morador/${id}`)}>
                Cancelar
              </Button>
              <Button type="submit">
                Salvar
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
