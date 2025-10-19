// src/components/forms/morador-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// (select imports removed as they are not used here)

export interface MoradorFormData {
  nome: string;
  cpf: string;
  rg: string;
  ativo: boolean;
  nascimento?: string;
}

interface MoradorFormProps {
  onSubmit: (data: MoradorFormData) => void;
  onClose: () => void;
  initialData?: Partial<MoradorFormData>;
  saving?: boolean;
}

export function MoradorForm({ onSubmit, onClose, initialData, saving }: MoradorFormProps) {
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true);
  const [formData, setFormData] = useState({
    nome: initialData?.nome ?? "",
    cpf: initialData?.cpf ?? "",
    rg: initialData?.rg ?? "",
  });

  // Função para formatar o CPF
  const isEditing = !!initialData;
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditing) return; // Não permite editar CPF na edição
    const value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é dígito
    let formattedValue = value;

    // Limita a 11 dígitos
    if (value.length > 11) {
      formattedValue = value.slice(0, 11);
    }
    
    // Aplica a máscara
    if (formattedValue.length > 3) {
      formattedValue = formattedValue.replace(/^(\d{3})(\d)/, "$1.$2");
    }
    if (formattedValue.length > 7) {
      formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    }
    if (formattedValue.length > 11) {
      formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{2}).*/, "$1.$2.$3-$4");
    } else if (formattedValue.length > 9) {
      formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else if (formattedValue.length > 6) {
      formattedValue = formattedValue.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    } else if (formattedValue.length > 3) {
      formattedValue = formattedValue.replace(/^(\d{3})(\d)/, "$1.$2");
    }

    setFormData((prev) => ({ ...prev, cpf: formattedValue }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome) {
      alert("O nome é obrigatório.");
      return;
    }
  onSubmit({ ...formData, ativo });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="nome" className="mb-1">Nome completo</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={handleInputChange}
            placeholder="Digite o nome completo"
            required
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:col-span-2">
          <div>
            <Label htmlFor="cpf" className="mb-1">CPF</Label>
            <Input
              id="cpf"
              value={formData.cpf}
              onChange={handleCpfChange}
              placeholder="000.000.000-00"
              maxLength={14}
              disabled={isEditing}
            />
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="rg" className="mb-1">RG</Label>
            <Input
              id="rg"
              value={formData.rg}
              onChange={handleInputChange}
              placeholder="Digite o RG"
            />
          </div>
          <div>
            <Label htmlFor="situacao">Situação</Label>
            <div className="flex gap-4 items-center pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="true"
                  checked={ativo === true}
                  onChange={() => setAtivo(true)}
                />
                Ativo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="false"
                  checked={ativo === false}
                  onChange={() => setAtivo(false)}
                />
                Inativo
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="ghost" onClick={onClose} disabled={!!saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!!saving}>
          {saving ? 'Gravando…' : 'Gravar'}
        </Button>
      </div>
    </form>
  );
}