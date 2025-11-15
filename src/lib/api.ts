import {
  ApiItemResponse,
  ApiListResponse,
  RelatorioDiarioGeral,
  RelatorioDetalhe,
  EvolucaoIndividual,
  PrescricaoAnaliticoItem,
  PrescricaoCompletaCreatePayload,
  MedicamentoPrescricaoUpdatePayload,
} from '@/types/relatorio';

// Base da API controlada por variável de ambiente com fallback local.
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

// Erro customizado para facilitar captura tipada.
export class ApiError extends Error {
  status: number;
  raw?: unknown;
  constructor(message: string, status: number, raw?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.raw = raw;
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean; // se true, injeta token do localStorage (client-side)
  skipJsonParse?: boolean; // para casos específicos (não usado agora)
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (options.auth) {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, { ...options, headers });
  let parsed: unknown = null;
  try {
    parsed = await response.json();
  } catch {
    // Pode não haver corpo JSON (ex: 204 No Content); seguimos com null
  }

  if (!response.ok) {
    const message = extractErrorMessage(parsed) || `Erro HTTP ${response.status}`;
    throw new ApiError(message, response.status, parsed);
  }
  return (parsed as T);
}

function extractErrorMessage(body: unknown): string | null {
  if (!body) return null;
  if (typeof body === 'string') return body;
  if (typeof body === 'object') {
    const anyBody = body as Record<string, unknown>;
    if (Array.isArray(anyBody.message)) return (anyBody.message as string[]).join(', ');
    if (typeof anyBody.message === 'string') return anyBody.message as string;
    if (typeof anyBody.error === 'string') return anyBody.error as string;
  }
  return null;
}

// ---- Endpoints específicos ----

export async function getRelatorios(page = 1, limit = 100) {
  const data = await apiFetch<ApiListResponse<RelatorioDiarioGeral>>(`/relatorio-geral?page=${page}&limit=${limit}`, { auth: true });
  return data.data || [];
}

export async function getRelatorioDetalhe(id: number) {
  // O backend (findOne) atualmente retorna o objeto direto (não envelopado em { data })
  // mas mantemos compatibilidade caso futuramente padronize no formato ApiItemResponse
  const raw = await apiFetch<unknown>(`/relatorio-geral/${id}`, { auth: true });
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown> & { data?: unknown };
    if (r.data) {
      return r.data as RelatorioDetalhe;
    }
  }
  return raw as RelatorioDetalhe;
}

interface CreateRelatorioPayload {
  observacoes: string;
  ids_evolucoes: number[];
  data_hora?: string; // ISO
}

export async function createRelatorio(payload: CreateRelatorioPayload) {
  return apiFetch<ApiItemResponse<RelatorioDetalhe>>('/relatorio-geral', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  });
}

interface UpdateRelatorioPayload {
  observacoes?: string;
  ids_evolucoes?: number[];
  data_hora?: string;
}

export async function updateRelatorio(id: number, payload: UpdateRelatorioPayload) {
  return apiFetch<ApiItemResponse<RelatorioDetalhe>>(`/relatorio-geral/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function getEvolucoes(page = 1, limit = 100) {
  const data = await apiFetch<ApiListResponse<EvolucaoIndividual>>(`/evolucao-individual?page=${page}&limit=${limit}`, { auth: true });
  return data.data || [];
}

// ---- Evolução Individual (refatorado) ----
export interface EvolucaoCreatePayload {
  id_morador: number;
  observacoes: string;
  data_hora?: string; // opcional caso backend aceite
}

export interface EvolucaoUpdatePayload {
  observacoes?: string;
  data_hora?: string;
}

export async function listEvolucoes(params: { page?: number; limit?: number; id_morador?: number; observacoes?: string; data_inicio?: string; data_fim?: string } = {}) {
  const qp = new URLSearchParams();
  if (params.page) qp.set('page', String(params.page));
  if (params.limit) qp.set('limit', String(params.limit));
  if (params.id_morador) qp.set('id_morador', String(params.id_morador));
  if (params.observacoes) qp.set('observacoes', params.observacoes);
  if (params.data_inicio) qp.set('data_inicio', params.data_inicio);
  if (params.data_fim) qp.set('data_fim', params.data_fim);
  const data = await apiFetch<ApiListResponse<EvolucaoIndividual>>(`/evolucao-individual?${qp.toString()}`, { auth: true });
  return data;
}

export async function getEvolucao(id: number) {
  const raw = await apiFetch<unknown>(`/evolucao-individual/${id}`, { auth: true });
  if (raw && typeof raw === 'object') {
    const r = raw as Record<string, unknown> & { data?: unknown };
    if (r.data) {
      return r.data as EvolucaoIndividual;
    }
  }
  return raw as EvolucaoIndividual;
}

export async function createEvolucao(payload: EvolucaoCreatePayload) {
  return apiFetch<EvolucaoIndividual | ApiItemResponse<EvolucaoIndividual>>('/evolucao-individual', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function updateEvolucao(id: number, payload: EvolucaoUpdatePayload) {
  return apiFetch<EvolucaoIndividual | ApiItemResponse<EvolucaoIndividual>>(`/evolucao-individual/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    auth: true,
  });
}

export async function deleteEvolucao(id: number) {
  return apiFetch<{ message?: string } | ApiItemResponse<unknown>>(`/evolucao-individual/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}

interface GerarIAPayload {
  ids_evolucoes: number[];
  data_relatorio?: string;
  modo?: string;
}

export async function gerarTextoIA(payload: GerarIAPayload) {
  return apiFetch<{ texto?: string; message?: string; error?: string }>(`/ai/gerar-relatorio`, {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  });
}

// ---- Prescrições ----

// Lista analítica de prescrições (flatten de prescricao + itens + aplicaçao)
export async function listPrescricoesAnalitico(params: { id_morador: number; page?: number; limit?: number } & Record<string, unknown>) {
  const qp = new URLSearchParams();
  qp.set('id_morador', String(params.id_morador));
  if (params.page) qp.set('page', String(params.page));
  if (params.limit) qp.set('limit', String(params.limit));
  // Backend atual ainda não suporta filtros de texto/data aqui; guardamos interface para futura extensão
  const data = await apiFetch<ApiListResponse<PrescricaoAnaliticoItem>>(`/prescricao/analitico/all?${qp.toString()}`, { auth: true });
  return data;
}

// Criação completa de prescrição com itens
export async function createPrescricaoCompleta(payload: PrescricaoCompletaCreatePayload) {
  return apiFetch<unknown>('/prescricao/completa', {
    method: 'POST',
    body: JSON.stringify(payload),
    auth: true,
  });
}

// Atualização de item (medicamento-prescricao)
export async function updateMedicamentoPrescricao(id: number, payload: MedicamentoPrescricaoUpdatePayload) {
  return apiFetch<unknown>(`/medicamento-prescricao/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    auth: true,
  });
}

// Utilidades para selects (médicos e medicamentos) - listagens simplificadas
export interface MedicoResumo { id: number; nome: string }
export interface MedicamentoResumo { id: number; nome: string }

export async function listMedicos(limit = 100) {
  const raw = await apiFetch<unknown>(`/medicos?limit=${limit}`, { auth: true });
  const container = raw as Record<string, unknown> | unknown[] | null;
  let arr: unknown[] = [];
  if (Array.isArray(container)) {
    arr = container;
  } else if (container && typeof container === 'object') {
    const possible = (container as Record<string, unknown>)['data'];
    if (Array.isArray(possible)) arr = possible;
  }
  return arr
    .map((m) => {
      const r = m as Record<string, unknown>;
      const id = (r.id_medico as number) ?? (r.id as number) ?? 0;
      const nome = (r.nome_completo as string) ?? (r.nome as string) ?? '';
      return { id, nome } as MedicoResumo;
    })
    .filter((x) => x.id && x.nome);
}

export async function listMedicamentos(limit = 100) {
  const raw = await apiFetch<unknown>(`/medicamentos?limit=${limit}`, { auth: true });
  const container = raw as Record<string, unknown> | { medicamentos?: unknown[] } | unknown[] | null;
  let arr: unknown[] = [];
  if (Array.isArray(container)) {
    arr = container;
  } else if (container && typeof container === 'object') {
    const withData = (container as Record<string, unknown>)['data'];
    if (Array.isArray(withData)) arr = withData;
    else {
      const medicamentos = (container as { medicamentos?: unknown[] }).medicamentos;
      if (Array.isArray(medicamentos)) arr = medicamentos;
    }
  }
  return arr
    .map((m) => {
      const r = m as Record<string, unknown>;
      const id = (r.id_medicamento as number) ?? (r.id as number) ?? 0;
      const nome = (r.nome_medicamento as string) ?? (r.nome as string) ?? '';
      return { id, nome } as MedicamentoResumo;
    })
    .filter((x) => x.id && x.nome);
}

// Expor util base
// `API_BASE` já é exportado no local onde foi declarado. Exportamos `apiFetch` diretamente acima.
