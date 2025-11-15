// src/components/forms/medicamento-form.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export interface MedicamentoFormData {
  nome_medicamento: string;
  situacao: boolean;
}


interface MedicamentoFormProps {
  onSubmit?: (data: MedicamentoFormData) => void;
  onClose: () => void;
  initialData?: Partial<MedicamentoFormData>;
}


export function MedicamentoForm({ onSubmit, onClose, initialData }: MedicamentoFormProps) {
  const [situacao, setSituacao] = useState(initialData?.situacao ?? true);
  const [formData, setFormData] = useState({
    nome_medicamento: initialData?.nome_medicamento ?? "",
  });

  const isEditing = !!initialData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_medicamento) {
      toast.error("O nome do medicamento é obrigatório.");
      return;
    }
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!accessToken) {
      toast.error('Token de acesso não encontrado. Faça login novamente.');
      return;
    }
    try {
      let response, data;
      const payload = {
        nome_medicamento: formData.nome_medicamento,
        situacao: Boolean(situacao),
      };
      
      if (isEditing) {
        // Edição
        response = await fetch(`${API_BASE}/medicamento/${initialData?.id_medicamento}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (response.ok) {
          toast.success('Medicamento atualizado com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao atualizar medicamento.');
        }
      } else {
  response = await fetch(`${API_BASE}/medicamentos`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (response.ok && data.medicamento) {
          toast.success('Medicamento cadastrado com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao cadastrar medicamento.');
        }
      }
      if (onSubmit) onSubmit(payload);
      onClose();
    } catch (error) {
      toast.error('Erro de conexão ao salvar medicamento.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="nome_medicamento" className="mb-1">Nome do Medicamento</Label>
          <Input
            id="nome_medicamento"
            value={formData.nome_medicamento}
            onChange={handleInputChange}
            placeholder="Digite o nome do medicamento"
            required
          />
        </div>
        <div className="md:col-span-2 grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="situacao">Situação</Label>
            <div className="flex gap-4 items-center pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="true"
                  checked={situacao === true}
                  onChange={() => setSituacao(true)}
                />
                Em estoque
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="false"
                  checked={situacao === false}
                  onChange={() => setSituacao(false)}
                />
                Sem estoque
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          Gravar
        </Button>
      </div>
    </form>
  );
}