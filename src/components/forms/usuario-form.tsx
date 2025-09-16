import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface UsuarioFormData {
  nome_usuario: string;
  nome_completo: string;
  cpf: string;
  senha: string;
  email: string;
  funcao: string;
  situacao: boolean;
}

interface UsuarioFormProps {
  initialData?: Partial<UsuarioFormData>;
  onSubmit: (data: UsuarioFormData) => void;
  onClose: () => void;
}

export function UsuarioForm({ initialData, onSubmit, onClose }: UsuarioFormProps) {
  const [form, setForm] = useState<UsuarioFormData>({
    nome_usuario: initialData?.nome_usuario || "",
    nome_completo: initialData?.nome_completo || "",
    cpf: initialData?.cpf || "",
    senha: "",
    email: initialData?.email || "",
    funcao: initialData?.funcao || "",
    situacao: initialData?.situacao ?? true,
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  const isEditing = !!initialData;
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        name="nome_usuario"
        value={form.nome_usuario}
        onChange={handleChange}
        placeholder="Nome de usuário"
        className="border p-2 rounded"
        required
      />
      <input
        name="nome_completo"
        value={form.nome_completo}
        onChange={handleChange}
        placeholder="Nome completo"
        className="border p-2 rounded"
        required
      />
      <input
        name="cpf"
        value={form.cpf}
        onChange={handleChange}
        placeholder="CPF"
        className="border p-2 rounded"
        required
      />
      {isEditing ? (
        <input
          name="senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          placeholder="Nova senha (opcional)"
          className="border p-2 rounded"
        />
      ) : (
        <input
          name="senha"
          type="password"
          value={form.senha}
          onChange={handleChange}
          placeholder="Senha"
          className="border p-2 rounded"
          required
        />
      )}
      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        className="border p-2 rounded"
        required
      />
      <select
        name="funcao"
        value={form.funcao}
        onChange={handleChange}
        className="border p-2 rounded"
        required
      >
        <option value="">Selecione a função</option>
        <option value="Administrador">Administrador</option>
        <option value="Cuidador">Cuidador</option>
      </select>
      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="situacao"
            value="true"
            checked={form.situacao === true}
            onChange={() => setForm((prev) => ({ ...prev, situacao: true }))}
          />
          Ativo
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="situacao"
            value="false"
            checked={form.situacao === false}
            onChange={() => setForm((prev) => ({ ...prev, situacao: false }))}
          />
          Inativo
        </label>
      </div>
      <div className="flex gap-2 mt-2">
        <Button type="submit" className="bg-[#002c6c] text-white">Salvar</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </form>
  );
}
