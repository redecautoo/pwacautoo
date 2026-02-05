import { SkinCategory, SkinCategoryId, MiningState, Collection } from '@/types/skins';

// ============================================
// 9 CORES LIVRES
// ============================================
export const FREE_COLORS = [
    { id: 'azul', name: 'Azul (padrão)', hex: '#2563EB' },
    { id: 'preto', name: 'Preto', hex: '#1F2937' },
    { id: 'rosa', name: 'Rosa', hex: '#EC4899' },
    { id: 'verde', name: 'Verde Cautoo', hex: '#10B981' },
    { id: 'roxo', name: 'Roxo', hex: '#8B5CF6' },
    { id: 'vermelho', name: 'Vermelho', hex: '#EF4444' },
    { id: 'laranja', name: 'Laranja', hex: '#F97316' },
    { id: 'cinza', name: 'Cinza grafite', hex: '#6B7280' },
    { id: 'branco', name: 'Branco gelo', hex: '#F3F4F6' },
];

// ============================================
// 13 CATEGORIAS OFICIAIS
// ============================================
export const SKIN_CATEGORIES: SkinCategory[] = [
    // 0. CORES LIVRES
    {
        id: 'base_colors',
        name: 'Skins livres (cores)',
        description: 'Mude a cor da sua placa quantas vezes quiser',
        icon: '🎨',
        unlockRules: 'Sempre disponível',
        allowLayoutPurchase: false,
        allowSell: false,
        addToCollection: false,
        skins: FREE_COLORS.map((color, idx) => ({
            id: idx + 1,
            name: color.name,
            categoryId: 'base_colors',
            colorPrimary: color.hex,
            status: 'unlocked',
            layoutCost: 0,
            canSell: false,
            canBuyLayout: false,
            benefitType: 'none',
        })),
    },

    // 1. SCORE
    {
        id: 'score_skins',
        name: 'Skins de Score',
        description: 'Skins ligadas ao comportamento da sua placa',
        icon: '⭐',
        unlockRules: 'Score mínimo: Tier A (650+), B (850+), C (1001+)',
        benefitRules: 'Benefício pausa se score cair abaixo do requisito',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            {
                id: 10,
                name: 'Estrela Bronze',
                categoryId: 'score_skins',
                status: 'locked',
                layoutCost: 25,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'none',
                requiresScore: 650,
            },
            {
                id: 11,
                name: 'Estrela Prata',
                categoryId: 'score_skins',
                status: 'locked',
                layoutCost: 50,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'coverage',
                benefitValue: 25000,
                benefitDescription: 'Cobertura de R$ 25.000',
                requiresScore: 850,
            },
            {
                id: 12,
                name: 'Estrela Ouro',
                categoryId: 'score_skins',
                status: 'locked',
                layoutCost: 100,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'coverage',
                benefitValue: 50000,
                benefitDescription: 'Cobertura de R$ 50.000',
                requiresScore: 1001,
            },
        ],
    },

    // 2. ICC
    {
        id: 'icc_skins',
        name: 'Skins de ICC',
        description: 'Skins ligadas à sua reputação no app',
        icon: '🏆',
        unlockRules: 'ICC mínimo: Tier A (850+), B (1001+)',
        benefitRules: 'Benefício suspenso se ICC cair',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            {
                id: 20,
                name: 'Embaixador',
                categoryId: 'icc_skins',
                status: 'locked',
                layoutCost: 75,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'priority',
                benefitDescription: 'Prioridade em alertas',
                requiresICC: 850,
            },
            {
                id: 21,
                name: 'Guardião Elite',
                categoryId: 'icc_skins',
                status: 'locked',
                layoutCost: 150,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'operational',
                benefitDescription: 'Benefícios operacionais premium',
                requiresICC: 1001,
            },
        ],
    },

    // 3. INDICAÇÃO MENSAL
    {
        id: 'referral_monthly',
        name: 'Skins de Indicação',
        description: 'Ganhe skins exclusivas indicando a Cautoo',
        icon: '👥',
        unlockRules: '30 indicações cadastradas no mês',
        benefitRules: 'Categoria aberta até fim do mês. Escolha 1 skin.',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            {
                id: 30,
                name: 'Influencer Bronze',
                categoryId: 'referral_monthly',
                status: 'locked',
                layoutCost: 50,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'none',
                requiresReferrals: 30,
            },
        ],
    },

    // 4. RECOMPENSA PONTOS
    {
        id: 'rewards_points',
        name: 'Skins de Recompensa',
        description: 'Troque pontos por benefícios e skins',
        icon: '🎁',
        unlockRules: 'Baseado em pontos (50, 100, 200, 500)',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 40, name: 'Recompensa Bronze', categoryId: 'rewards_points', status: 'locked', layoutCost: 30, canSell: true, canBuyLayout: true, benefitType: 'none' },
            { id: 41, name: 'Recompensa Prata', categoryId: 'rewards_points', status: 'locked', layoutCost: 60, canSell: true, canBuyLayout: true, benefitType: 'none' },
        ],
    },

    // 5. BENEFÍCIO OPERACIONAL
    {
        id: 'benefit_ops',
        name: 'Skins de Benefício',
        description: 'Skins com benefícios práticos (guincho, etc)',
        icon: '🛠️',
        unlockRules: 'Por eventos, mineração ou recompensas',
        benefitRules: 'Carência 7 dias. Uso único.',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 50, name: 'Guincho S.O.S', categoryId: 'benefit_ops', status: 'locked', layoutCost: 80, canSell: true, canBuyLayout: true, benefitType: 'operational' },
            { id: 51, name: 'KM Livre Plus', categoryId: 'benefit_ops', status: 'locked', layoutCost: 120, canSell: true, canBuyLayout: true, benefitType: 'operational' },
        ],
    },

    // 6. ALERTA ROUBO
    {
        id: 'alert_skins',
        name: 'Skins de Alerta',
        description: 'Destaque máximo em alertas críticos',
        icon: '🚨',
        unlockRules: 'Por evento ou mineração',
        benefitRules: 'Prioridade em alertas de roubo. Uso único.',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 60, name: 'Alerta Neon Red', categoryId: 'alert_skins', status: 'locked', layoutCost: 200, canSell: true, canBuyLayout: true, benefitType: 'priority' },
        ],
    },

    // 7. REGISTRO CAUTELAR
    {
        id: 'caution_record',
        name: 'Skins Registro Cautelar',
        description: 'Créditos de apoio para ocorrências',
        icon: '📋',
        unlockRules: 'Por evento/mineração/recompensa',
        benefitRules: 'Crédito para suporte. Uso único.',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 70, name: 'Cautelar 1500', categoryId: 'caution_record', status: 'locked', layoutCost: 150, canSell: true, canBuyLayout: true, benefitType: 'coverage' },
        ],
    },

    // 8. FANTASMA DESAFIO
    {
        id: 'ghost_challenge',
        name: 'Skins Fantasma',
        description: 'Desafio: 30 dias sem alertas críticos',
        icon: '👻',
        unlockRules: 'Por evento ou mineração',
        benefitRules: 'Recompensa após 30 dias: R$ 50 OU 1 mês benefício',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 80, name: 'Fantasma Invisível', categoryId: 'ghost_challenge', status: 'locked', layoutCost: 300, canSell: true, canBuyLayout: true, benefitType: 'none' },
        ],
    },

    // 9. MINERAÇÃO
    {
        id: 'mining_skins',
        name: 'Skins de Mineração',
        description: 'Minere códigos e desbloqueie skins raras',
        icon: '⛏️',
        unlockRules: 'Via sistema de mineração',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            {
                id: 90,
                name: 'Mineiro Bronze',
                categoryId: 'mining_skins',
                status: 'locked',
                layoutCost: 100,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'none',
            },
            {
                id: 91,
                name: 'Mineiro Profundo',
                categoryId: 'mining_skins',
                status: 'locked',
                layoutCost: 200,
                canSell: true,
                canBuyLayout: true,
                benefitType: 'none',
            },
        ],
    },

    // 10. VALOR (10k-100k)
    {
        id: 'value_skins',
        name: 'Skins de Valor',
        description: 'Skins com valor assistencial',
        icon: '💎',
        unlockRules: 'SOMENTE por mineração',
        benefitRules: 'Validade 3 meses. Janela 1 mês para vender. Min R$ 1.000',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 100, name: 'Valor 10k', categoryId: 'value_skins', status: 'locked', layoutCost: 100, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 10000, minSellPrice: 1000 },
            { id: 101, name: 'Valor 15k', categoryId: 'value_skins', status: 'locked', layoutCost: 150, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 15000, minSellPrice: 1000 },
            { id: 102, name: 'Valor 20k', categoryId: 'value_skins', status: 'locked', layoutCost: 200, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 20000, minSellPrice: 1000 },
            { id: 103, name: 'Valor 25k', categoryId: 'value_skins', status: 'locked', layoutCost: 250, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 25000, minSellPrice: 1000 },
            { id: 104, name: 'Valor 30k', categoryId: 'value_skins', status: 'locked', layoutCost: 300, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 30000, minSellPrice: 1000 },
            { id: 105, name: 'Valor 50k', categoryId: 'value_skins', status: 'locked', layoutCost: 500, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 50000, minSellPrice: 1000 },
            { id: 106, name: 'Valor 100k', categoryId: 'value_skins', status: 'locked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 100000, minSellPrice: 1000 },
        ],
    },

    // 11. SURPRESA GLOBAL
    {
        id: 'surprise_skins',
        name: 'Skins Surpresa',
        description: 'Mineração global. 1 vencedor por mês',
        icon: '🎲',
        unlockRules: 'Mineração global',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 110, name: 'Misteriosa JAN/26', categoryId: 'surprise_skins', status: 'locked', layoutCost: 500, canSell: true, canBuyLayout: true, benefitType: 'none' },
        ],
    },

    // 12. RARAS
    {
        id: 'rare_skins',
        name: 'Skins Raras',
        description: 'Skins raras essenciais para coleções',
        icon: '✨',
        unlockRules: 'Eventos, drops e mineração',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 121, name: 'Cyberpunk 2077', categoryId: 'rare_skins', status: 'locked', layoutCost: 800, canSell: true, canBuyLayout: true, benefitType: 'none' },
        ],
    },

    // 13. DEMO LENDÁRIAS (PARA PLACAS DE TESTE)
    {
        id: 'legendary_demo',
        name: 'Coleção Lendária',
        description: 'Designs únicos e ultra-raros da primeira geração Cautoo',
        icon: '🔥',
        unlockRules: 'Edição limitada de lançamento',
        allowLayoutPurchase: true,
        allowSell: true,
        addToCollection: true,
        skins: [
            { id: 1001, name: 'Teia Escarlate', categoryId: 'legendary_demo', status: 'unlocked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 100000, benefitDescription: 'Seguro Especial R$ 100k' },
            { id: 1002, name: 'Cavaleiro das Trevas', categoryId: 'legendary_demo', status: 'unlocked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'priority', benefitDescription: 'Prioridade Total em Alertas' },
            { id: 1003, name: 'Futuro Imersivo', categoryId: 'legendary_demo', status: 'unlocked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'coverage', benefitValue: 100000 },
            { id: 1004, name: 'Mestre da Liga', categoryId: 'legendary_demo', status: 'unlocked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'none' },
            { id: 1005, name: 'Rosa Imperial', categoryId: 'legendary_demo', status: 'unlocked', layoutCost: 1000, canSell: true, canBuyLayout: true, benefitType: 'none' },
        ],
    },
];

// ============================================
// ESTADO INICIAL DA COLEÇÃO
// ============================================
export const INITIAL_COLLECTION: Collection = {
    slots: [
        { position: 1, skinId: null },
        { position: 2, skinId: null },
        { position: 3, skinId: null },
        { position: 4, skinId: null },
        { position: 5, skinId: null },
        { position: 6, skinId: null },
        { position: 7, skinId: null },
    ],
    ownedSkins: [], // Vazio inicialmente (PARA TESTES: pode adicionar [10, 11])
    correctCount: 0,
    canReorder: false, // Precisa >= 15 skins
    hintsEarned: [
        // Dica de teste 1
        {
            id: 'hint-test-1',
            type: 'category',
            message: 'Uma skin de Selo está no topo (posições 1-3)',
            earnedAt: new Date().toISOString(),
            usedAt: null,
            condition: 'Teste inicial'
        },
        // Dica de teste 2
        {
            id: 'hint-test-2',
            type: 'negation',
            message: 'As posições 4, 5 e 6 NÃO contêm skins de ICC',
            earnedAt: new Date().toISOString(),
            usedAt: null,
            condition: 'Teste inicial'
        }
    ] as any[], // TODO: Tipar corretamente
};

// ============================================
// ESTADO INICIAL DA MINERAÇÃO (Decisão Final)
// ============================================
export const INITIAL_MINING: MiningState = {
    attemptsThisWeek: 200, // 200 tentativas por semana (Decisão Final)
    maxAttemptsPerWeek: 200,
    prizes: [
        // 7 Prêmios VALUE (10k-100k)
        {
            id: 'value_10k',
            name: 'Valor 10k',
            targetCode: 'ABC1D23', // Código secreto (7 chars)
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 3,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_15k',
            name: 'Valor 15k',
            targetCode: 'XYZ4W89',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 3,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_20k',
            name: 'Valor 20k',
            targetCode: 'QWE7R56',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 2,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_25k',
            name: 'Valor 25k',
            targetCode: 'ASD3F12',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 2,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_30k',
            name: 'Valor 30k',
            targetCode: 'ZXC9V45',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 2,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_50k',
            name: 'Valor 50k',
            targetCode: 'RTY6U78',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 1,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        {
            id: 'value_100k',
            name: 'Valor 100k',
            targetCode: 'FGH2J90',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 1,
            hintsUnlocked: 0,
            categoryId: 'value_skins',
        },
        // Surpresa Global (1 vencedor/mês)
        {
            id: 'surprise_global',
            name: 'Surpresa Global',
            targetCode: 'CAU7O00',
            bestGuess: '',
            correctChars: 0,
            progress: 0,
            maxHints: 0, // Sem dicas!
            hintsUnlocked: 0,
            categoryId: 'surprise_skins',
        },
    ],
    lastResetDate: new Date().toISOString(),
};

// ============================================
// HELPERS
// ============================================
export const getAllSkins = () => {
    return SKIN_CATEGORIES.flatMap(cat => cat.skins);
};

export const getSkinById = (id: number) => {
    return getAllSkins().find(skin => skin.id === id);
};

export const getCategoryById = (id: SkinCategoryId) => {
    return SKIN_CATEGORIES.find(cat => cat.id === id);
};

// ============================================
// RARIDADES (Decisão Final)
// ============================================
export const getSkinRarity = (skinId: number): import('@/types/skins').SkinRarity => {
    // Lógica simplificada por categoria
    const skin = getSkinById(skinId);
    if (!skin) return 'comum';

    // Cores livres = não tem raridade
    if (skin.categoryId === 'base_colors') return 'comum';

    // Value skins por tier
    if (skin.categoryId === 'value_skins') {
        if (skinId === 106) return 'lendaria'; // 100k
        if (skinId === 105) return 'epica';    // 50k
        if (skinId >= 103) return 'rara';      // 25k-30k
        return 'incomum';                      // 10k-20k
    }

    // Surpresa = única
    if (skin.categoryId === 'surprise_skins') return 'unica';

    // Raras
    if (skin.categoryId === 'rare_skins') return 'rara';

    // Demo Lendárias
    if (skin.categoryId === 'legendary_demo') return 'lendaria';

    // Ghost Challenge
    if (skin.categoryId === 'ghost_challenge') return 'epica';

    // Resto = comum/incomum
    return skin.layoutCost > 100 ? 'incomum' : 'comum';
};

// ============================================
// DNA MOCK (Apenas para skins mineradas)
// ============================================
export const generateMockDNA = (skinId: number, userId: string): import('@/types/skins').DNA => {
    // Gerar genes pseudo-aleatórios baseados no skinId
    const seed = skinId * 123456;
    const random = (min: number, max: number) => {
        const x = Math.sin(seed) * 10000;
        return min + (x - Math.floor(x)) * (max - min);
    };

    return {
        id: `dna_${skinId}_${Date.now()}`,
        genes: {
            fire: random(0, 1),
            water: random(0, 1),
            earth: random(0, 1),
            air: random(0, 1),
            rarity_base: random(0.5, 1),
            evolution_potential: random(0.7, 1)
        },
        metadata: {
            genesis_block: new Date().toISOString(),
            miner_id: userId,
            attempts_until_mined: Math.floor(random(10, 150)),
            month_cycle: 'FEV/2026',
            moon_phase: ['New', 'Waxing', 'Full', 'Waning'][Math.floor(random(0, 4))],
            temperature_sp: random(18, 35),
            active_plates_moment: Math.floor(random(1000, 50000)),
            serial_number: `${skinId}k_${String(Math.floor(random(1, 9999))).padStart(6, '0')}`
        }
    };
};

