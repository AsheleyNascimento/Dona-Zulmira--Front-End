// src/types/relatorio.ts

// Tipagens compartilhadas para Relatórios e Evoluções
// Centraliza interfaces usadas em várias partes da aplicação.

export interface UsuarioResumo {
  id_usuario: number;
  nome_completo: string;
  email?: string;
}

export interface MoradorResumo {
  id_morador: number;
  nome_completo: string;
}

export interface EvolucaoIndividual {
  id_evolucao_individual: number;
  data_hora: string; // ISO
  observacoes: string;
  id_usuario?: number; // autor (quando retornado)
  usuario?: UsuarioResumo; // se backend incluir
  morador?: MoradorResumo;
}

export interface RelatorioEvolucaoWrap {
  evolucao: EvolucaoIndividual;
}

// Estrutura principal usada em listagens
export interface RelatorioDiarioGeral {
  id_relatorio_diario_geral: number;
  data_hora: string; // ISO
  observacoes: string;
  usuario?: UsuarioResumo;
  // Formato legado (1 evolução única)
  evolucaoindividual?: EvolucaoIndividual;
  // Novo formato N:N
  evolucoes?: RelatorioEvolucaoWrap[];
}

// CORRIGIDO: Alterado de interface vazia para type alias
export type RelatorioDetalhe = RelatorioDiarioGeral;

export interface PaginacaoMeta {
  page: number;
  limit: number;
  total?: number;
}

export interface ApiListResponse<T> {
  data: T[];
  meta?: PaginacaoMeta;
  message?: string;
}

export interface ApiItemResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorShape {
  status: number;
  message: string;
  raw?: unknown;
}

// ---------------- Prescrições ----------------
// Item individual retornado no endpoint analítico (/prescricao/analitico/all)
export interface PrescricaoAnaliticoItem {
  id_prescricao: number; // id da prescricao (pode repetir em vários itens)
  id_medicamento_prescricao?: number | null; // id do item específico
  id_medicamento?: number | null;
  nome_medicamento?: string | null;
  posologia?: string | null;
  aplicacao_data_hora?: string | null; // quando houver (aplicações)
  mes?: string | null; // fallback para montar data a partir de mes/ano
  ano?: string | null;
  medico_nome?: string | null;
  aplicador?: string | null;
  vinculado_por?: string | null;
  // Possíveis campos para responsável/cuidador/enfermeiro retornados por variações de backend
  cuidador_nome?: string | null;
  enfermeiro_nome?: string | null;
  nome_cuidador?: string | null;
  nome_enfermeiro?: string | null;
  usuario_nome?: string | null;
}

// Payload para criação completa (prescricao + itens)
export interface PrescricaoCompletaCreateItem {
  id_medicamento: number;
  posologia: string;
}

export interface PrescricaoCompletaCreatePayload {
  id_morador: number;
  id_medico: number;
  mes: string; // MM
  ano: string; // YYYY
  itens: PrescricaoCompletaCreateItem[];
}

// Payload para atualização de item de medicamento-prescricao
export interface MedicamentoPrescricaoUpdatePayload {
  id_medicamento: number;
  posologia: string;
}

export interface MedicamentoPrescricaoItem {
  id_medicamento_prescricao: number;
  id_medicamento: number;
  posologia: string;
  id_prescricao: number;
}