"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterToolbar } from "@/components/ui/filter-toolbar";

const mockData = [
  {
    nome: "Jane Cooper",
    grau: "01",
    mobilidade: "Autônomo",
    dependencias: "Higiene, Alimentação",
  },
  {
    nome: "Floyd Miles",
    grau: "02",
    mobilidade: "Cadeira de rodas",
    dependencias: "Higiene",
  },
  {
    nome: "Ronald Richards",
    grau: "01",
    mobilidade: "Precisa de assistência",
    dependencias: "Alimentação, Locomoção",
  },
  {
    nome: "Marvin McKinney",
    grau: "03",
    mobilidade: "Precisa de assistência",
    dependencias: "Alimentação",
  },
  {
    nome: "Jerome Bell",
    grau: "03",
    mobilidade: "Autônomo",
    dependencias: "Locomoção",
  },
  {
    nome: "Kathryn Murphy",
    grau: "02",
    mobilidade: "Cadeira de rodas",
    dependencias: "Higiene, Alimentação, Locomoção",
  },
  {
    nome: "Jacob Jones",
    grau: "01",
    mobilidade: "Autônomo",
    dependencias: "Alimentação",
  },
  {
    nome: "Kristin Watson",
    grau: "01",
    mobilidade: "Autônomo",
    dependencias: "Higiene",
  },
];

const ITEMS_PER_PAGE = 5;

export default function ListaMoradoresPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState("nome");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtrar e buscar dados
  const filteredData = mockData.filter((item) => {
    const searchValue = searchTerm.toLowerCase();
    switch (filterBy) {
      case "nome":
        return item.nome.toLowerCase().includes(searchValue);
      case "grau":
        return item.grau.toLowerCase().includes(searchValue);
      case "mobilidade":
        return item.mobilidade.toLowerCase().includes(searchValue);
      default:
        return item.nome.toLowerCase().includes(searchValue);
    }
  });

  // Paginação
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Efeito para atualizar a página se o número de itens mudar
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen flex bg-[#e9f1f9] font-poppins">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
          .font-poppins {
            font-family: 'Poppins', sans-serif;
          }
        `}
      </style>
      <aside className="w-1/5 flex flex-col bg-white p-6 border-r border-[#e9f1f9]">
        <div className="flex items-center mb-8">
          <img src="/logo-ssvp.png" alt="Logo" className="w-[3em] mr-2" />
          <h2 className="text-[#002c6c] text-[1.2em] font-bold uppercase">
            CASA DONA ZULMIRA
          </h2>
        </div>
        <nav className="flex flex-col gap-4 text-[#002c6c] text-[1em]">
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
          >
            Moradores &gt;
          </Button>
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
          >
            Evoluções individuais &gt;
          </Button>
          <Button
            variant="ghost"
            className="justify-start hover:bg-[#e9f1f9]/50 cursor-pointer"
          >
            Usuários &gt;
          </Button>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col py-6 px-8">
        <FilterToolbar
          onSearchChange={(value) => setSearchTerm(value)}
          onFilterChange={(value) => setFilterBy(value)}
          onAddClick={() => router.push("/cad-morador")}
        />

        <Card className="rounded-lg p-0 border border-[#cfd8e3] shadow-sm bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[#002c6c] font-semibold">
                  Nome completo
                </TableHead>
                <TableHead className="text-[#002c6c] font-semibold">
                  Grau IPI
                </TableHead>
                <TableHead className="text-[#002c6c] font-semibold">
                  Mobilidade
                </TableHead>
                <TableHead className="text-[#002c6c] font-semibold">
                  Dependência atividades diárias
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((item, index) => (
                <TableRow
                  key={index}
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer"
                >
                  <TableCell className="text-[#002c6c]">{item.nome}</TableCell>
                  <TableCell className="text-[#002c6c]">{item.grau}</TableCell>
                  <TableCell className="text-[#002c6c]">
                    {item.mobilidade}
                  </TableCell>
                  <TableCell className="text-[#002c6c]">
                    {item.dependencias}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <div className="flex justify-between items-center mt-4 text-sm text-[#002c6c]">
          <span>
            Exibindo {startIndex + 1} a{" "}
            {Math.min(endIndex, filteredData.length)} de {filteredData.length}{" "}
            moradores
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-[#e9f1f9]/50 cursor-pointer"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from(
              { length: Math.min(3, totalPages) },
              (_, i) => i + 1
            ).map((page) => (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                className={`hover:bg-[#e9f1f9]/50 cursor-pointer ${
                  currentPage === page ? "bg-[#e9f1f9]" : ""
                }`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            {totalPages > 3 && (
              <>
                <Button variant="ghost" size="sm" disabled>
                  ...
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-[#e9f1f9]/50 cursor-pointer"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-[#e9f1f9]/50 cursor-pointer"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
