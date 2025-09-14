// Arquivo: src/components/ui/filter-toolbar.tsx

"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";

type FilterToolbarProps = {
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onAddClick: () => void;
  filterValue: string;
};

export function FilterToolbar({
  onSearchChange,
  onFilterChange,
  onAddClick,
  filterValue,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar..."
          className="pl-10"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <Select onValueChange={onFilterChange} value={filterValue}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Filtrar por..." />
        </SelectTrigger>
        
        {/* ======================================================= */}
        {/* 👇 A CORREÇÃO DEFINITIVA ESTÁ NESTA LINHA 👇 */}
        {/* ======================================================= */}
        <SelectContent className="bg-white">
          {/* 👇 Substitua as opções antigas por estas 👇 */}
          <SelectItem value="id">ID Morador</SelectItem>
          <SelectItem value="nome">Nome Completo</SelectItem>
          <SelectItem value="cpf">CPF</SelectItem>
          <SelectItem value="situacao">Situação</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" onClick={onAddClick} className="flex items-center gap-2 bg-[#002c6c] text-white hover:bg-[#002c6c]/90 cursor-pointer">
        <PlusCircle className="h-5 w-5 " />
        Adicionar Morador
      </Button>
    </div>
  );
}