"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RelatorioMoradorPage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const funcao = typeof window !== "undefined" ? localStorage.getItem("funcao") : null;
    if (!token || funcao !== "Cuidador") {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex bg-[#f5f9ff]">
      {/* Sidebar simples para consistência visual */}
      <aside className="w-64 bg-white border-r border-[#e6effb] p-6 hidden md:block">
        <div className="text-xl font-semibold text-[#1a2b4b]">Relatórios</div>
        <nav className="mt-6 space-y-2 text-sm">
          <a href="/morador" className="block px-3 py-2 rounded-md text-[#1a2b4b] hover:bg-[#e9f1f9]/60">Lista de moradores</a>
          <a href="/morador/relatorio" className="block px-3 py-2 rounded-md bg-[#e9f1f9] text-[#1a2b4b]">Relatórios</a>
        </nav>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-[#1a2b4b]">Relatórios de Moradores</h1>
        <p className="mt-2 text-[#4a5b78]">Selecione filtros e gere relatórios referentes à evolução individual, prescrições e dados gerais.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#e6effb] rounded-lg p-4">
            <div className="text-sm text-[#4a5b78]">Tipo de relatório</div>
            <select className="mt-2 w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#86b7fe]">
              <option value="evolucao">Evolução individual</option>
              <option value="prescricao">Prescrições</option>
              <option value="geral">Geral</option>
            </select>
          </div>

          <div className="bg-white border border-[#e6effb] rounded-lg p-4">
            <div className="text-sm text-[#4a5b78]">Período</div>
            <div className="mt-2 flex gap-2">
              <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#86b7fe]" />
              <input type="date" className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#86b7fe]" />
            </div>
          </div>

          <div className="bg-white border border-[#e6effb] rounded-lg p-4">
            <div className="text-sm text-[#4a5b78]">Exportar</div>
            <div className="mt-2 flex gap-2">
              <button className="px-4 py-2 rounded-md bg-[#1a2b4b] text-white text-sm">Gerar PDF</button>
              <button className="px-4 py-2 rounded-md bg-[#e9f1f9] text-[#1a2b4b] text-sm">Exportar CSV</button>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white border border-[#e6effb] rounded-lg p-4">
          <div className="text-sm text-[#4a5b78]">Pré-visualização</div>
          <div className="mt-3 h-64 grid place-items-center text-[#93a3bf] text-sm border border-dashed border-[#e6effb] rounded-md">
            Relatório será exibido aqui.
          </div>
        </div>
      </main>
    </div>
  );
}
