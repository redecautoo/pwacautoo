// ============================================
// TIPOS DO SISTEMA DE SKINS & COLEÇÃO
// Seguindo especificação completa do prompt
// ============================================

// IDs das 13 categorias oficiais
export type SkinCategoryId =
    | 'base_colors'           // 0. Cores livres
    | 'score_skins'           // 1. Score
    | 'icc_skins'             // 2. ICC
    | 'referral_monthly'      // 3. Indicação mensal
    | 'rewards_points'        // 4. Recompensa pontos
    | 'benefit_ops'           // 5. Benefício operacional
    | 'alert_skins'           // 6. Alerta roubo
    | 'caution_record'        // 7. Registro cautelar
    | 'ghost_challenge'       // 8. Fantasma desafio
    | 'mining_skins'          // 9. Mineração
    | 'value_skins'           // 10. Valor (10k-100k)
    | 'surprise_skins'        // 11. Surpresa global
    | 'rare_skins';           // 12. Raras

export type SkinStatus =
    | 'locked'                // Bloqueada
    | 'unlocked'              // Desbloqueada (pode comprar layout)
    | 'owned'                 // Layout comprado (na coleção)
    | 'linked'                // Vinculada à placa
    | 'in_cooldown'           // Em carência (7 dias)
    | 'active'                // Benefício ativo
    | 'expired'               // Expirada
    | 'consumed';             // Benefício consumido

export type BenefitType =
    | 'none'                  // Sem benefício
    | 'coverage'              // Cobertura assistencial
    | 'priority'              // Prioridade em alertas
    | 'credit'                // Crédito para serviços
    | 'challenge_reward'      // Recompensa de desafio
    | 'operational';          // Benefício operacional

// ============================================
// SKIN
// ============================================
export interface Skin {
    id: number;
    name: string;
    categoryId: SkinCategoryId;

    // Visual
    colorPrimary?: string;
    colorSecondary?: string;
    icon?: string;

    // Estado
    status: SkinStatus;

    // Economia
    layoutCost: number;       // Custo para comprar layout
    canSell: boolean;
    canBuyLayout: boolean;
    minSellPrice?: number;    // Preço mínimo de venda

    // Benefício
    benefitType: BenefitType;
    benefitValue?: number;    // Ex: 50000 (R$ 50k)
    benefitDescription?: string;

    // Datas (se aplicável)
    linkedAt?: string;        // Data de vinculação
    activatesAt?: string;     // Data de ativação (após carência)
    expiresAt?: string;       // Data de expiração

    // Requisitos para desbloquear
    requiresScore?: number;
    requiresICC?: number;
    requiresReferrals?: number;
}

// ============================================
// CATEGORIA
// ============================================
export interface SkinCategory {
    id: SkinCategoryId;
    name: string;
    description: string;
    icon: string;

    // Regras
    unlockRules: string;      // Como desbloqueia
    benefitRules?: string;    // Regras de benefício

    // Configurações
    allowLayoutPurchase: boolean;
    allowSell: boolean;
    addToCollection: boolean;

    // Skins desta categoria
    skins: Skin[];
}

// ============================================
// COLEÇÃO (PUZZLE)
// ============================================
export interface CollectionSlot {
    position: number;         // 1-7
    skinId: number | null;
    isCorrect?: boolean;      // Se está na posição correta
}

export interface Collection {
    slots: CollectionSlot[];  // 7 slots fixos
    ownedSkins: number[];     // IDs de todas as skins possuídas
    correctCount: number;     // Quantas posições corretas
    canReorder: boolean;      // >= 15 skins
}

// ============================================
// MINERAÇÃO
// ============================================
export interface MiningPrize {
    id: string;
    name: string;
    targetCode: string;       // Código secreto (7 chars)
    bestGuess: string;        // Melhor palpite do usuário
    correctChars: number;     // 0-7 caracteres corretos
    progress: number;         // 0-100%
    maxHints: number;         // Máximo de dicas
    hintsUnlocked: number;    // Dicas desbloqueadas
    categoryId: SkinCategoryId; // Categoria do prêmio
}

export interface MiningState {
    attemptsThisWeek: number; // Tentativas restantes
    maxAttemptsPerWeek: number; // Limite semanal
    prizes: MiningPrize[];    // Prêmios ativos do mês
    lastResetDate: string;    // Última vez que resetou
}

// ============================================
// MARKETPLACE
// ============================================
export interface MarketplaceListing {
    id: string;
    skinId: number;
    sellerId: string;
    sellerName: string;
    price: number;
    listedAt: string;
    expiresAt?: string;       // Para value skins (1 mês)
}

// ============================================
// DNA ÚNICO (Apenas skins mineradas)
// ============================================
export interface DNA {
    id: string;

    // Genes (0-1)
    genes: {
        fire: number;
        water: number;
        earth: number;
        air: number;
        rarity_base: number;
        evolution_potential: number;
    };

    // Metadata (momento da mineração)
    metadata: {
        genesis_block: string;        // ISO timestamp
        miner_id: string;
        attempts_until_mined: number;
        month_cycle: string;           // "FEV/2026"
        moon_phase: string;            // "New", "Full", etc
        temperature_sp: number;        // Mock: 18-35°C
        active_plates_moment: number;
        serial_number: string;         // "25k_000847"
    };
}

// Badge alternativo para skins não-mineradas
export interface SkinBadge {
    type: 'purchased' | 'achievement' | 'reward';
    label: string;              // "Colecionador #00847"
    acquiredAt: string;
    serial?: string;
}

// ============================================
// EVOLUÇÃO (5 Níveis)
// ============================================
export type SkinLevel = 1 | 2 | 3 | 4 | 5;

export interface EvolutionLevel {
    level: SkinLevel;
    name: 'Base' | 'Plus' | 'Ultra' | 'Master' | 'GENESIS';
    xp_required: number;
    time_estimate: string;
    benefit_multiplier: number;  // 1.0, 1.3, 1.6, 2.0, permanente
    visual_effect: string;
}

export const EVOLUTION_LEVELS: EvolutionLevel[] = [
    { level: 1, name: 'Base', xp_required: 0, time_estimate: '0', benefit_multiplier: 1.0, visual_effect: 'none' },
    { level: 2, name: 'Plus', xp_required: 5000, time_estimate: '1-2 meses', benefit_multiplier: 1.3, visual_effect: 'glow' },
    { level: 3, name: 'Ultra', xp_required: 20000, time_estimate: '4-6 meses', benefit_multiplier: 1.6, visual_effect: 'particles' },
    { level: 4, name: 'Master', xp_required: 70000, time_estimate: '12-18 meses', benefit_multiplier: 2.0, visual_effect: 'animation' },
    { level: 5, name: 'GENESIS', xp_required: 200000, time_estimate: '2-3 anos', benefit_multiplier: 999, visual_effect: 'holographic' }
];

// ============================================
// MARKETPLACE (Taxas Inversas - Decisão GPT)
// ============================================
export type SkinRarity = 'comum' | 'incomum' | 'rara' | 'epica' | 'lendaria' | 'unica';

export const MARKETPLACE_FEES: Record<SkinRarity, number> = {
    comum: 15,      // Taxa MAIOR para itens comuns
    incomum: 12,
    rara: 10,
    epica: 8,
    lendaria: 5,    // Taxa MENOR para itens raros
    unica: 3        // Taxa MÍNIMA para únicos
};

// ============================================
// SISTEMA DE DICAS (Puzzle)
// ============================================
export type HintType = 'category' | 'exact' | 'negation' | 'visual' | 'relational';

export interface PuzzleHint {
    id: string;
    type: HintType;
    message: string;
    earnedAt: string;
    usedAt: string | null;
    condition: string;  // Como foi ganha
}

export const HINT_CONDITIONS: Record<HintType, { requirement: string; reward: string }> = {
    category: {
        requirement: "30 dias sem crítica válida",
        reward: "Dica de categoria (ex: Selo no topo)"
    },
    exact: {
        requirement: "50 alertas úteis",
        reward: "Revela 1 posição exata"
    },
    negation: {
        requirement: "ICC ≥ 850",
        reward: "Elimina 3 posições incorretas"
    },
    visual: {
        requirement: "Score 1000+ por 7 dias",
        reward: "Mostra silhueta borrada"
    },
    relational: {
        requirement: "Completar 5 desafios",
        reward: "Dica de ordem (X vem antes de Y)"
    }
};

// ============================================
// SKIN ESTENDIDA (com DNA e Evolução)
// ============================================
export interface OwnedSkin extends Skin {
    // Identificação única
    uniqueId: string;
    userId: string;

    // Aquisição
    acquiredAt: string;
    acquisitionMethod: 'mining' | 'purchase' | 'achievement' | 'reward';

    // DNA (apenas se minerada)
    dna?: DNA;

    // Badge (se não minerada)
    badge?: SkinBadge;

    // Evolução
    level: SkinLevel;
    xp: number;

    // Vínculo
    linkedPlate: string | null;
    linkedAt: string | null;
    lastSwitchAt: string | null;  // Para cooldown 12h

    // Marketplace
    listedForSale: boolean;
    salePrice: number | null;
    rarity: SkinRarity;
}

// ============================================
// COLEÇÃO (7 slots puzzle)
// ============================================
export interface CollectionSlot {
    position: number; // 1-7
    skinId: number | null;
}

export interface Collection {
    slots: CollectionSlot[];
    ownedSkins: number[]; // IDs das skins que o usuário possui
    correctCount: number; // Quantas estão corretas
    canReorder: boolean; // Precisa >= 15 skins
    hintsEarned?: any[]; // Dicas ganhas
}

// ============================================
// COLEÇÃO ESTENDIDA (com dicas)
// ============================================
export interface CollectionExtended extends Collection {
    hintsEarned: PuzzleHint[];
    hintsUsed: PuzzleHint[];
    completed: boolean;
    completedAt: string | null;
}

// ============================================
// MARKETPLACE
// ============================================
export interface SkinListing {
    id: string;
    skinId: number;
    sellerId: string;
    sellerName: string;
    price: number;
    fee: number;           // Taxa aplicada (ex: 0.15 for 15%)
    level: SkinLevel;      // Level da skin no momento do anúncio
    rarity: SkinRarity;
    dna?: DNA;             // DNA se for minerada
    createdAt: string;
    status: 'active' | 'sold' | 'cancelled';
}

export interface MarketStats {
    totalVolume: number;   // Em CauCash (CC)
    floorPrice: number;    // Menor preço ativo
    totalActive: number;   // Total de anúncios ativos
}

// ============================================
// ESTADO GLOBAL
// ============================================
export interface SkinsGlobalState {
    // Cores livres
    selectedColor: string;    // Hex da cor selecionada

    // Categorias e skins
    categories: SkinCategory[];
    ownedSkins: OwnedSkin[];  // Skins do usuário

    // Coleção
    collection: CollectionExtended;

    // Mineração
    mining: MiningState;

    // Marketplace
    listings: MarketplaceListing[];
    myListings: MarketplaceListing[];

    // UI
    onboardingCompleted: boolean;
}
