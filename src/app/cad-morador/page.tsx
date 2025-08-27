"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";

export default function CadastroMoradorPage() {
  const router = useRouter();
  const [ativo, setAtivo] = useState(false);
  const [formData, setFormData] = useState({
    id: "01",
    nome: "",
    nascimento: "",
    cpf: "",
    rg: "",
  });

  // Atualiza os valores dos campos
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Salva os dados (exemplo simples com alert)
  const handleSave = () => {
    console.log("Dados salvos:", formData, "Situação:", ativo);
    alert("Morador salvo com sucesso!");
    router.push("/lista-moradores"); // Redireciona para a lista após salvar
  };

  return (
    <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      <aside className="w-1/5 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
        <div className="flex items-center mb-8">
          <img src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" />
          <h2 className="text-[#002c6c] text-[1.2em] font-bold uppercase">
            CASA DONA ZULMIRA
          </h2>
        </div>
        <nav className="flex flex-col gap-4 text-[#002c6c] text-[1em]">
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
            onClick={() => router.push("/lista-moradores")}
          >
            Cadastro de moradores &gt;
          </Button>
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
            onClick={() => router.push("/cadastro-usuarios")}
          >
            Cadastro de usuários &gt;
          </Button>
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
            onClick={() => router.push("/relatorios")}
          >
            Relatórios &gt;
          </Button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col py-10 px-8">
        <Button
          variant="ghost"
          className="text-[#003d99] self-start mb-6 hover:bg-[#e9f1f9]/50 cursor-pointer"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div className="max-w-md bg-white p-6 rounded-[1.5em] border border-[#cfd8e3] shadow-sm">
          <h1 className="text-xl font-semibold text-[#002c6c] mb-6">
            Cadastro de Morador
          </h1>

          <div className="space-y-4">
            <div>
              <Label htmlFor="id" className="text-[#002c6c] block mb-2">
                ID Morador
              </Label>
              <Input
                id="id"
                value={formData.id}
                disabled
                className="bg-[#f2f5f9] mb-0"
              />
            </div>

            <div>
              <Label htmlFor="nome" className="text-[#002c6c] block mb-2">
                Nome completo
              </Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome completo"
                className="mb-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="nascimento"
                  className="text-[#002c6c] block mb-2"
                >
                  Data de nascimento
                </Label>
                <Input
                  id="nascimento"
                  type="date"
                  value={formData.nascimento}
                  onChange={handleInputChange}
                  className="mb-0"
                />
              </div>
              <div>
                <Label htmlFor="cpf" className="text-[#002c6c] block mb-2">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  className="mb-0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="rg" className="text-[#002c6c] block mb-2">
                RG
              </Label>
              <Input
                id="rg"
                value={formData.rg}
                onChange={handleInputChange}
                placeholder="Digite o RG"
                className="mb-0"
              />
            </div>

            <div className="flex items-center gap-4 mt-4">
              <Label className="text-[#002c6c] block mb-0">
                Situação (Ativo/Inativo)
              </Label>
              <Switch
                checked={ativo}
                onCheckedChange={setAtivo}
                aria-label="Situação"
                className="cursor-pointer"
              />
            </div>
          </div>

          <Button
            className="bg-[#003d99] text-white px-6 py-2 rounded-full mt-6 hover:bg-[#002c6c] cursor-pointer"
            onClick={handleSave}
          >
            Gravar
          </Button>
        </div>
      </main>
    </div>
  );
}
