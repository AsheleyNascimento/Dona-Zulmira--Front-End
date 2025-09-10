// src/components/forms/relatorio-form.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RelatorioFormData {
  tipoRelatorio: string;
  dataInicio: string | null;
  dataFim: string | null;
}

interface RelatorioFormProps {
  onSubmit: (data: RelatorioFormData) => void;
  onClose: () => void;
}

export function RelatorioForm({
  onSubmit,
  onClose,
}: RelatorioFormProps) {
  const [formData, setFormData] = useState({
    tipoRelatorio: "",
    dataInicio: null,
    dataFim: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, tipoRelatorio: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tipoRelatorio) {
      alert("Por favor, selecione um tipo de relatório.");
      return;
    }
    onSubmit(formData as RelatorioFormData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="tipoRelatorio">Tipo de Relatório</Label>
          <Select onValueChange={handleSelectChange} value={formData.tipoRelatorio}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo de relatório" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="moradores_ativos">Lista de Moradores Ativos</SelectItem>
              <SelectItem value="medicamentos_estoque">Controle de Medicamentos</SelectItem>
              <SelectItem value="prescricoes_periodo">Prescrições por Período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dataInicio">Data de Início (opcional)</Label>
          <Input id="dataInicio" type="date" value={formData.dataInicio ?? ''} onChange={handleInputChange} />
        </div>

        <div>
          <Label htmlFor="dataFim">Data de Fim (opcional)</Label>
          <Input id="dataFim" type="date" value={formData.dataFim ?? ''} onChange={handleInputChange} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-6">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Gerar Relatório</Button>
      </div>
    </form>
  );
}