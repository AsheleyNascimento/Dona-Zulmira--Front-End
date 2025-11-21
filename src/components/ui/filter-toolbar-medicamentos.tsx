// src/components/ui/filter-toolbar-medicamentos.tsx

"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle } from "lucide-react";

// Removido onFilterChange e filterValue da tipagem
type FilterToolbarMedicamentosProps = {
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
};

export function FilterToolbarMedicamentos({
  onSearchChange,
  onAddClick,
}: FilterToolbarMedicamentosProps) {
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
      
      <Button onClick={onAddClick} className="flex items-center gap-2 bg-[#002c6c] text-white hover:bg-[#002c6c]/90 cursor-pointer">
        <PlusCircle className="h-5 w-5 " />
        Adicionar Medicamento
      </Button>
    </div>
  );
}