'use client'

import { Input } from './input'
import { Button } from './button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from './select'
import { FaPlus } from 'react-icons/fa'

interface FilterToolbarProps {
  onSearchChange?: (value: string) => void
  onFilterChange?: (value: string) => void
  onAddClick?: () => void
}

export function FilterToolbar({
  onSearchChange,
  onFilterChange,
  onAddClick,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-[1.5em] shadow-sm border border-[#cfd8e3] mb-6">
      <Input
        placeholder="Pesquise..."
        className="w-full max-w-md bg-[#f2f5f9]"
        onChange={(e) => onSearchChange?.(e.target.value)}
      />

      <div className="flex items-center gap-4">
        <Select onValueChange={(value) => onFilterChange?.(value)}>
          <SelectTrigger className="w-[160px] bg-[#f2f5f9]">
            <SelectValue placeholder="Filtrar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nome">Nome</SelectItem>
            <SelectItem value="grau">Grau IPI</SelectItem>
            <SelectItem value="mobilidade">Mobilidade</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="bg-[#003d99] text-white hover:bg-[#002c6c]"
          onClick={onAddClick}
        >
          <FaPlus className="mr-2" />
          Novo Morador
        </Button>
      </div>
    </div>
  )
}
