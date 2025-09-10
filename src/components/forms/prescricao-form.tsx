// src/components/forms/prescricao-form.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PrescricaoFormData {
  id_morador: number;
  id_medicamento: number;
  id_medico: number;
  dosagem: string;
  frequencia: string;
  data_inicio: string;
  data_fim: string | null;
  observacoes: string | null;
  situacao: boolean;
}

interface PrescricaoFormProps {
  onSubmit: (data: PrescricaoFormData) => void;
  onClose: () => void;
  initialData?: Partial<PrescricaoFormData>;
}

interface SelectOption {
  id: number;
  nome: string;
}

export function PrescricaoForm({
  onSubmit,
  onClose,
  initialData,
}: PrescricaoFormProps) {
  const [moradores, setMoradores] = useState<SelectOption[]>([]);
  const [medicamentos, setMedicamentos] = useState<SelectOption[]>([]);
  const [medicos, setMedicos] = useState<SelectOption[]>([]);

  const [formData, setFormData] = useState({
    id_morador: initialData?.id_morador ?? 0,
    id_medicamento: initialData?.id_medicamento ?? 0,
    id_medico: initialData?.id_medico ?? 0,
    dosagem: initialData?.dosagem ?? "",
    frequencia: initialData?.frequencia ?? "",
    data_inicio: initialData?.data_inicio
      ? new Date(initialData.data_inicio).toISOString().split("T")[0]
      : "",
    data_fim:
      initialData?.data_fim
        ? new Date(initialData.data_fim).toISOString().split("T")[0]
        : null,
    observacoes: initialData?.observacoes ?? "",
    situacao: initialData?.situacao ?? true,
  });

  useEffect(() => {
    const fetchData = async (endpoint: string, setter: Function, keyMap: { id: string, name: string }) => {
      const accessToken = localStorage.getItem("accessToken");
      try {
        const response = await fetch(`http://localhost:4000/${endpoint}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const result = await response.json();
        if (Array.isArray(result.data)) {
          const options = result.data.map((item: any) => ({
            id: item[keyMap.id],
            nome: item[keyMap.name],
          }));
          setter(options);
        }
      } catch (error) {
        console.error(`Erro ao buscar ${endpoint}:`, error);
      }
    };

    fetchData("morador", setMoradores, { id: 'id_morador', name: 'nome_completo' });
    fetchData("medicamento", setMedicamentos, { id: 'id_medicamento', name: 'nome_comercial' });
    fetchData("medico", setMedicos, { id: 'id_medico', name: 'nome_completo' });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof PrescricaoFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: Number(value) }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, situacao: e.target.value === "true" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id_morador || !formData.id_medicamento || !formData.id_medico || !formData.dosagem || !formData.frequencia || !formData.data_inicio) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }
    onSubmit(formData as PrescricaoFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="id_morador">Morador</Label>
          <Select onValueChange={handleSelectChange("id_morador")} defaultValue={String(formData.id_morador || '')}>
            <SelectTrigger><SelectValue placeholder="Selecione um morador" /></SelectTrigger>
            <SelectContent>
              {moradores.map((morador) => (
                <SelectItem key={morador.id} value={String(morador.id)}>{morador.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="id_medicamento">Medicamento</Label>
          <Select onValueChange={handleSelectChange("id_medicamento")} defaultValue={String(formData.id_medicamento || '')}>
            <SelectTrigger><SelectValue placeholder="Selecione um medicamento" /></SelectTrigger>
            <SelectContent>
              {medicamentos.map((medicamento) => (
                <SelectItem key={medicamento.id} value={String(medicamento.id)}>{medicamento.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="id_medico">Médico</Label>
          <Select onValueChange={handleSelectChange("id_medico")} defaultValue={String(formData.id_medico || '')}>
            <SelectTrigger><SelectValue placeholder="Selecione um médico" /></SelectTrigger>
            <SelectContent>
              {medicos.map((medico) => (
                <SelectItem key={medico.id} value={String(medico.id)}>{medico.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dosagem">Dosagem</Label>
          <Input id="dosagem" value={formData.dosagem} onChange={handleInputChange} placeholder="Ex: 500mg, 1 comprimido" />
        </div>

        <div>
          <Label htmlFor="frequencia">Frequência</Label>
          <Input id="frequencia" value={formData.frequencia} onChange={handleInputChange} placeholder="Ex: 1 vez ao dia, de 8 em 8 horas" />
        </div>

        <div>
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input id="data_inicio" type="date" value={formData.data_inicio} onChange={handleInputChange} />
        </div>

        <div>
          <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
          <Input id="data_fim" type="date" value={formData.data_fim ?? ''} onChange={handleInputChange} />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="observacoes">Observações</Label>
          <Textarea id="observacoes" value={formData.observacoes ?? ''} onChange={handleInputChange} placeholder="Alguma observação adicional?" />
        </div>

        <div className="md:col-span-2">
            <Label htmlFor="situacao">Situação</Label>
            <div className="flex gap-4 items-center pt-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="true"
                  checked={formData.situacao === true}
                  onChange={handleRadioChange}
                />
                Ativa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="situacao"
                  value="false"
                  checked={formData.situacao === false}
                  onChange={handleRadioChange}
                />
                Inativa
              </label>
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Gravar</Button>
      </div>
    </form>
  );
}