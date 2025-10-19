// ========== COLE ESTE CÓDIGO NO LUGAR DO SEU ATUAL COMPONENTE ==========

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";

// 1. Definimos TODAS as funções válidas que existem no seu back-end
const funcoesValidas = [
  "Administrador",
  "Enfermeiro",
  "Tecnico de Enfermagem",
  "Cuidador",
  "Medico",
  "Farmaceutico",
] as const;

// 2. Criamos o schema de validação com Zod
export const usuarioSchema = z.object({
  nome_usuario: z.string().min(1, "O nome de usuário é obrigatório."),
  nome_completo: z.string().min(1, "O nome completo é obrigatório."),
  cpf: z.string().min(14, "O CPF deve ser preenchido corretamente."),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres."),
  email: z.string().email("Por favor, insira um email válido."),
  funcao: z.enum(funcoesValidas, {
    errorMap: () => ({ message: "Selecione uma função válida." }),
  }),
  situacao: z.preprocess((val) => String(val) === 'true', z.boolean()),
});

// Adicionamos o schema para o modo de edição
export const updateUsuarioSchema = usuarioSchema.extend({
  senha: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: "A nova senha deve ter no mínimo 6 caracteres",
    }),
});


// 3. Criamos um tipo TypeScript a partir do schema
export type UsuarioFormData = z.infer<typeof usuarioSchema>;

interface UsuarioFormProps {
  initialData?: Partial<UsuarioFormData>;
  onSubmit: (data: UsuarioFormData) => void;
  onClose: () => void;
}

export function UsuarioForm({
  initialData,
  onSubmit,
  onClose,
}: UsuarioFormProps) {
  const isEditing = !!initialData;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    // Escolhe o schema correto dependendo se está editando ou criando
    resolver: zodResolver(isEditing ? updateUsuarioSchema : usuarioSchema),
    defaultValues: {
      nome_usuario: initialData?.nome_usuario || "",
      nome_completo: initialData?.nome_completo || "",
      cpf: initialData?.cpf || "",
      senha: "", // Senha sempre começa vazia
      email: initialData?.email || "",
      funcao: initialData?.funcao,
      situacao: initialData?.situacao ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input
        {...register("nome_usuario")}
        placeholder="Nome de usuário"
        className="border p-2 rounded"
      />
      {errors.nome_usuario && (
        <p className="text-red-500 text-sm -mt-2">
          {errors.nome_usuario.message}
        </p>
      )}

      <input
        {...register("nome_completo")}
        placeholder="Nome completo"
        className="border p-2 rounded"
      />
      {errors.nome_completo && (
        <p className="text-red-500 text-sm -mt-2">
          {errors.nome_completo.message}
        </p>
      )}

      <input
        {...register("cpf")}
        placeholder="CPF"
        className="border p-2 rounded"
      />
      {errors.cpf && (
        <p className="text-red-500 text-sm -mt-2">{errors.cpf.message}</p>
      )}

      <input
        {...register("senha")}
        type="password"
        placeholder={isEditing ? "Nova senha (opcional)" : "Senha"}
        className="border p-2 rounded"
      />
      {errors.senha && (
        <p className="text-red-500 text-sm -mt-2">{errors.senha.message}</p>
      )}

      <input
        {...register("email")}
        type="email"
        placeholder="Email"
        className="border p-2 rounded"
      />
      {errors.email && (
        <p className="text-red-500 text-sm -mt-2">{errors.email.message}</p>
      )}

      <select {...register("funcao")} className="border p-2 rounded">
        <option value="">Selecione a função</option>
        {funcoesValidas.map((funcao) => (
          <option key={funcao} value={funcao}>
            {funcao}
          </option>
        ))}
      </select>
      {errors.funcao && (
        <p className="text-red-500 text-sm -mt-2">{errors.funcao.message}</p>
      )}

      <div className="flex gap-4 items-center">
        <label className="flex items-center gap-2">
          <input
            {...register("situacao")}
            type="radio"
            value="true"
          />
          Ativo
        </label>
        <label className="flex items-center gap-2">
          <input
            {...register("situacao")}
            type="radio"
            value="false"
          />
          Inativo
        </label>
      </div>
      {errors.situacao && (
        <p className="text-red-500 text-sm -mt-2">{errors.situacao.message}</p>
      )}

      <div className="flex justify-end gap-4 mt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? "Salvar Alterações" : "Criar Usuário"}</Button>
      </div>
    </form>
  );
}