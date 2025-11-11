// src/components/ui/filter-toolbar-medicos.tsx

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

type FilterToolbarMedicosProps = {
  onSearchChange: (value: string) => void;
  onFilterChange: (value: string) => void;
  onAddClick: () => void;
  filterValue: string;
};

// Exportação garantida para build
export function FilterToolbarMedicos({
  onSearchChange,
  onFilterChange,
  onAddClick,
  filterValue,
}: FilterToolbarMedicosProps) {
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
      {/* Removed per-field Select — search will be global across all fields */}
      <Button onClick={onAddClick} className="flex items-center gap-2 bg-[#002c6c] text-white hover:bg-[#002c6c]/90 cursor-pointer">
        <PlusCircle className="h-5 w-5 " />
        Adicionar Médico
      </Button>
    </div>
  );
}
// Forçar atualização do build
export const __FORCE_REFRESH__ = true;
