// src/components/forms/medicamento-form.tsx

"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// (select imports removed – not used in this form)


export interface MedicosFormData {
  id_medico?: number;
  nome_completo: string;
  crm: string;
  situacao: boolean;
}


interface MedicosFormProps {
  onSubmit?: (data: MedicosFormData) => void;
  onClose: () => void;
  initialData?: Partial<MedicosFormData> & { id_medico?: number };
}


export function MedicosForm({ onSubmit, onClose, initialData }: MedicosFormProps) {
  const [situacao, setSituacao] = useState(initialData?.situacao ?? true);
  const [formData, setFormData] = useState({
    id_medico: initialData?.id_medico,
    nome_completo: initialData?.nome_completo ?? "",
    crm: initialData?.crm ?? "",
  });
  const isEditing = !!initialData;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome_completo) {
      toast.error("O nome do médico é obrigatório.");
      return;
    }
    if (!formData.crm) {
      toast.error("O CRM é obrigatório.");
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
  nome_completo: formData.nome_completo,
  crm: formData.crm,
  situacao: Boolean(situacao),
      };
      console.log('Enviando para backend:', payload);
      if (isEditing) {
        // Edição
        response = await fetch(`http://localhost:4000/medicos/${formData.id_medico}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (response.ok) {
          toast.success('Médico atualizado com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao atualizar médico.');
        }
      } else {
        // Cadastro
        response = await fetch('http://localhost:4000/medicos', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        data = await response.json();
        if (response.ok) {
          // Aceita diferentes formatos: {medico}, {data}, ou o objeto direto
          // const medicoResp = (data && (data.medico ?? data.data ?? data)) || null;
          toast.success('Médico cadastrado com sucesso!');
        } else {
          const msg = (data && (data.message || data.error)) || 'Erro ao cadastrar médico.';
          toast.error(msg);
        }
      }
      if (onSubmit) onSubmit(payload);
      onClose();
    } catch {
      toast.error('Erro de conexão ao salvar médico.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <Label htmlFor="nome_completo">Nome Completo</Label>
          <Input
            id="nome_completo"
            value={formData.nome_completo}
            onChange={handleInputChange}
            placeholder="Digite o nome do médico"
            required
          />
        </div>
        <div>
          <Label htmlFor="crm">CRM</Label>
          <Input
            id="crm"
            value={formData.crm}
            onChange={handleInputChange}
            placeholder="Digite o CRM"
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
                Ativo
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="false"
                  checked={situacao === false}
                  onChange={() => setSituacao(false)}
                />
                Inativo
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