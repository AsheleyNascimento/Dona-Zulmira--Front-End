"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import HeaderBrand from "@/components/HeaderBrand";
import { API_BASE } from '@/lib/api';

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
    fetch(`${API_BASE}/morador/${id}`, {
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

      {/* Prescrições: formulário via modal `PrescricaoFormModal`.
          A página standalone foi removida - a UI principal usa o modal. */}
    </div>
  );
}
