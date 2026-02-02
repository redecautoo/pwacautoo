// ============================================
// TIPOS DO SISTEMA DE SKINS & COLEÇÃO
// ============================================

export type SkinCategory = 'verde' | 'azul' | 'score' | 'mineracao';
export type SkinRarity = 'comum' | 'rara' | 'epica' | 'lendaria';
export type SkinStatus = 'bloqueada' | 'desbloqueada' | 'possui_layout' | 'vinculada' | 'a_venda';

// ============================================
// SKIN
// ============================================
export interface Skin {
    id: number;
    nome: string;
    categoria: SkinCategory;
    raridade: SkinRarity;
    bloqueada: boolean;
    preco_layout: number;
    descricao?: string;

    // Propriedades visuais
    cor_primaria?: string;
    cor_secundaria?: string;
    icone?: string;

    // Se usuário possui
    possui_layout?: boolean;
    data_aquisicao?: string; // ISO date

    // Vinculação
    vinculada_placa?: string; // ID da placa
    data_vinculacao?: string; // ISO date
    data_ativacao?: string; // ISO date (após carência)
    data_expiracao?: string; // ISO date

    // Benefício (se aplicável)
    beneficio?: SkinBenefit;

    // Venda
    a_venda?: boolean;
    preco_venda?: number;
    vendedor_id?: string;
}

// ============================================
// BENEFÍCIO DA SKIN
// ============================================
export interface SkinBenefit {
    tipo: 'cobertura' | 'prioridade' | 'bloqueio' | 'desconto';
    valor?: number; // Ex: 50000 (R$ 50k de cobertura)
    descricao: string;
    icone?: string;

    // Status do benefício
    ativo?: boolean;
    usado?: boolean;
    data_uso?: string;
    valor_usado?: number;
}

// ============================================
// CATEGORIA DE SKINS
// ============================================
export interface SkinCategoryData {
    id: SkinCategory;
    nome: string;
    descricao: string;
    icone: string;
    cor: string;
    requisito: string;
    skins: Skin[];
}

// ============================================
// COLEÇÃO (PUZZLE)
// ============================================
export interface Collection {
    posicoes: CollectionSlot[];
    posicoes_corretas: number; // 0-7
    puzzle_resolvido: boolean;
    recompensa_recebida?: boolean;
    data_resolucao?: string;
}

export interface CollectionSlot {
    posicao: number; // 1-7
    skinId: number | null;
    correta?: boolean; // Se está na posição certa
}

// ============================================
// MINERAÇÃO
// ============================================
export interface MiningState {
    tentativas_restantes: number; // max 200/semana
    tentativas_totais: number;
    data_reset: string; // ISO date (próxima segunda-feira)

    skins: MiningSkin[];
    dicas_ativas: MiningHint[];

    // Histórico
    codigos_tentados: string[];
    ultima_tentativa?: string; // ISO date
}

export interface MiningSkin {
    skinId: number;
    nome: string;
    progresso: number; // 0-100
    status: 'ativo' | 'bloqueado' | 'concluido';

    // Dicas
    proxima_dica?: number; // tentativas faltando
    dicas_desbloqueadas: number;

    // Ciclo
    proximo_ciclo?: string; // ISO date
    codigo_correto?: string; // Apenas para debug/mock
}

export interface MiningHint {
    id: number;
    texto: string;
    desbloqueada: boolean;
    tentativas_necessarias: number;
}

// ============================================
// CAUCASH
// ============================================
export interface CauCashState {
    saldo: number;
    transacoes: CauCashTransaction[];
    saldo_bloqueado?: number; // Skins à venda
}

export interface CauCashTransaction {
    id: string;
    tipo: 'credito' | 'debito';
    valor: number;
    descricao: string;
    categoria: 'compra_layout' | 'venda_skin' | 'recarga' | 'recompensa' | 'taxa';
    data: string; // ISO date

    // Referências
    skin_id?: number;
    relacionado_id?: string;
}

// ============================================
// MARKETPLACE
// ============================================
export interface MarketplaceListing {
    id: string;
    skin_id: number;
    vendedor_id: string;
    vendedor_nome: string;
    preco: number;
    data_listagem: string;
    status: 'ativa' | 'vendida' | 'cancelada';
}

// ============================================
// CORES LIVRES
// ============================================
export interface FreeColor {
    id: string;
    nome: string;
    hex: string;
    icone?: string;
}

// ============================================
// ESTADO GLOBAL DE SKINS
// ============================================
export interface SkinsState {
    // Cores livres
    cores_livres: FreeColor[];
    cor_selecionada: string; // hex

    // Skins
    categorias: SkinCategoryData[];
    skins_possuidas: number[]; // IDs

    // Coleção
    colecao: Collection;

    // Mineração
    mineracao: MiningState;

    // CauCash
    caucash: CauCashState;

    // Marketplace
    marketplace_listings: MarketplaceListing[];

    // UI
    onboarding_completed: boolean;
    tutorial_steps_completed: string[];
}

// ============================================
// HELPERS
// ============================================
export interface SkinFilters {
    categoria?: SkinCategory;
    raridade?: SkinRarity;
    bloqueada?: boolean;
    possui?: boolean;
}
