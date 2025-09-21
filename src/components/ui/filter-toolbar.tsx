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

type FilterOption = { value: string; label: string };

type FilterToolbarProps = {
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  filterValue: string;
  onAddClick?: () => void; // optional now
  showAddButton?: boolean; // control visibility
  addButtonLabel?: string; // customizable label (default Adicionar Morador)
  filterOptions?: FilterOption[]; // new prop
};

export function FilterToolbar({
  onSearchChange,
  onFilterChange,
  filterValue,
  onAddClick,
  showAddButton = true,
  addButtonLabel = "Adicionar Morador",
  filterOptions,
}: FilterToolbarProps) {
  const options = filterOptions ?? [
    { value: "id", label: "ID Morador" },
    { value: "nome", label: "Nome Completo" },
    { value: "cpf", label: "CPF" },
    { value: "situacao", label: "Situação" },
  ];
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
        <SelectContent className="bg-white">
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAddButton && (
        <Button
          type="button"
          onClick={onAddClick}
          className="flex items-center gap-2 bg-[#002c6c] text-white hover:bg-[#002c6c]/90 cursor-pointer"
        >
          <PlusCircle className="h-5 w-5 " />
          {addButtonLabel}
        </Button>
      )}
    </div>
  );
}