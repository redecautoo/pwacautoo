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
    hintsUsed: number;        // Dicas usadas
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
// ESTADO GLOBAL
// ============================================
export interface SkinsGlobalState {
    // Cores livres
    selectedColor: string;    // Hex da cor selecionada

    // Categorias e skins
    categories: SkinCategory[];

    // Coleção
    collection: Collection;

    // Mineração
    mining: MiningState;

    // Marketplace
    listings: MarketplaceListing[];
    myListings: MarketplaceListing[];

    // UI
    onboardingCompleted: boolean;
}
