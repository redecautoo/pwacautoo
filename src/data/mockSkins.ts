import {
    FreeColor,
    SkinCategoryData,
    Collection,
    MiningState,
    CauCashState
} from '@/types/skins';

// ============================================
// CORES LIVRES (9 cores)
// ============================================
export const CORES_LIVRES: FreeColor[] = [
    { id: 'azul', nome: 'Azul Brasil', hex: '#2563EB', icone: '🇧🇷' },
    { id: 'preto', nome: 'Preto', hex: '#1F2937', icone: '⚫' },
    { id: 'branco', nome: 'Branco', hex: '#FFFFFF', icone: '⚪' },
    { id: 'verde', nome: 'Verde', hex: '#10B981', icone: '🟢' },
    { id: 'vermelho', nome: 'Vermelho', hex: '#EF4444', icone: '🔴' },
    { id: 'amarelo', nome: 'Amarelo', hex: '#F59E0B', icone: '🟡' },
    { id: 'roxo', nome: 'Roxo', hex: '#8B5CF6', icone: '🟣' },
    { id: 'rosa', nome: 'Rosa', hex: '#EC4899', icone: '🌸' },
    { id: 'laranja', nome: 'Laranja', hex: '#F97316', icone: '🟠' },
];

// ============================================
// CATEGORIAS DE SKINS
// ============================================
export const CATEGORIAS: SkinCategoryData[] = [
    {
        id: 'verde',
        nome: 'Selo Verde',
        descricao: 'Desbloqueie tendo Selo Verde ativo',
        icone: '🟢',
        cor: '#10B981',
        requisito: 'Selo Verde ativo',
        skins: [
            {
                id: 1,
                nome: 'Verde Clássico',
                categoria: 'verde',
                raridade: 'comum',
                bloqueada: true,
                preco_layout: 10.00,
                descricao: 'Placa verde tradicional com acabamento fosco',
                cor_primaria: '#10B981',
                icone: '🌿',
            },
            {
                id: 2,
                nome: 'Verde Escuro',
                categoria: 'verde',
                raridade: 'comum',
                bloqueada: true,
                preco_layout: 10.00,
                descricao: 'Tom verde mais escuro e elegante',
                cor_primaria: '#047857',
                icone: '🍃',
            },
            {
                id: 3,
                nome: 'Verde Neon',
                categoria: 'verde',
                raridade: 'rara',
                bloqueada: false,
                preco_layout: 10.00,
                descricao: 'Verde vibrante com efeito neon',
                cor_primaria: '#22C55E',
                icone: '✨',
            },
        ],
    },
    {
        id: 'azul',
        nome: 'Selo Azul',
        descricao: 'Desbloqueie tendo Selo Azul ativo',
        icone: '🔵',
        cor: '#2563EB',
        requisito: 'Selo Azul ativo',
        skins: [
            {
                id: 4,
                nome: 'Azul Clássico',
                categoria: 'azul',
                raridade: 'comum',
                bloqueada: true,
                preco_layout: 5.00,
                descricao: 'Azul padrão Brasil',
                cor_primaria: '#2563EB',
                icone: '🇧🇷',
            },
            {
                id: 5,
                nome: 'Azul Oceano',
                categoria: 'azul',
                raridade: 'rara',
                bloqueada: false,
                preco_layout: 5.00,
                descricao: 'Tom azul profundo inspirado no oceano',
                cor_primaria: '#1E40AF',
                icone: '🌊',
            },
        ],
    },
    {
        id: 'score',
        nome: 'Score da Placa',
        descricao: 'Desbloqueie tendo Score 650+',
        icone: '⭐',
        cor: '#F59E0B',
        requisito: 'Score 650+',
        skins: [
            {
                id: 6,
                nome: 'Estrela Bronze',
                categoria: 'score',
                raridade: 'rara',
                bloqueada: true,
                preco_layout: 25.00,
                descricao: 'Para motoristas com bom score',
                cor_primaria: '#CD7F32',
                icone: '🥉',
            },
            {
                id: 7,
                nome: 'Estrela Prata',
                categoria: 'score',
                raridade: 'epica',
                bloqueada: true,
                preco_layout: 50.00,
                descricao: 'Para motoristas exemplares',
                cor_primaria: '#C0C0C0',
                icone: '🥈',
                beneficio: {
                    tipo: 'cobertura',
                    valor: 25000,
                    descricao: 'Cobertura de R$ 25.000 em danos',
                    icone: '🛡️',
                },
            },
            {
                id: 8,
                nome: 'Estrela Ouro',
                categoria: 'score',
                raridade: 'lendaria',
                bloqueada: true,
                preco_layout: 100.00,
                descricao: 'Para os melhores motoristas',
                cor_primaria: '#FFD700',
                icone: '🥇',
                beneficio: {
                    tipo: 'cobertura',
                    valor: 50000,
                    descricao: 'Cobertura de R$ 50.000 em danos',
                    icone: '🛡️',
                },
            },
        ],
    },
    {
        id: 'mineracao',
        nome: 'Mineração',
        descricao: 'Desbloqueie através de mineração',
        icone: '⛏️',
        cor: '#8B5CF6',
        requisito: 'Mineração de códigos',
        skins: [
            {
                id: 9,
                nome: 'Skin 10k',
                categoria: 'mineracao',
                raridade: 'epica',
                bloqueada: true,
                preco_layout: 100.00,
                descricao: 'Skin rara de mineração',
                cor_primaria: '#8B5CF6',
                icone: '💎',
            },
            {
                id: 10,
                nome: 'Skin 25k',
                categoria: 'mineracao',
                raridade: 'epica',
                bloqueada: true,
                preco_layout: 250.00,
                descricao: 'Skin muito rara de mineração',
                cor_primaria: '#7C3AED',
                icone: '💠',
            },
            {
                id: 11,
                nome: 'Skin 50k',
                categoria: 'mineracao',
                raridade: 'lendaria',
                bloqueada: true,
                preco_layout: 500.00,
                descricao: 'Skin lendária de mineração',
                cor_primaria: '#6D28D9',
                icone: '👑',
            },
        ],
    },
];

// ============================================
// ESTADO INICIAL DA COLEÇÃO
// ============================================
export const COLECAO_INICIAL: Collection = {
    posicoes: [
        { posicao: 1, skinId: 3 }, // Verde Neon
        { posicao: 2, skinId: null },
        { posicao: 3, skinId: 5 }, // Azul Oceano
        { posicao: 4, skinId: null },
        { posicao: 5, skinId: null },
        { posicao: 6, skinId: null },
        { posicao: 7, skinId: null },
    ],
    posicoes_corretas: 2,
    puzzle_resolvido: false,
};

// ============================================
// ESTADO INICIAL DA MINERAÇÃO
// ============================================
export const MINERACAO_INICIAL: MiningState = {
    tentativas_restantes: 200,
    tentativas_totais: 0,
    data_reset: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 dias

    skins: [
        {
            skinId: 9,
            nome: 'Skin 10k',
            progresso: 45,
            status: 'ativo',
            proxima_dica: 12,
            dicas_desbloqueadas: 2,
            codigo_correto: 'ABC1D23', // Mock
        },
        {
            skinId: 10,
            nome: 'Skin 25k',
            progresso: 12,
            status: 'ativo',
            proxima_dica: 30,
            dicas_desbloqueadas: 1,
            codigo_correto: 'XYZ9W87', // Mock
        },
        {
            skinId: 11,
            nome: 'Skin 50k',
            progresso: 0,
            status: 'bloqueado',
            proximo_ciclo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 dias
            dicas_desbloqueadas: 0,
            codigo_correto: 'QWE4R56', // Mock
        },
    ],

    dicas_ativas: [
        {
            id: 1,
            texto: 'Começa com letra',
            desbloqueada: true,
            tentativas_necessarias: 0,
        },
        {
            id: 2,
            texto: 'Posição 4 é número 1',
            desbloqueada: true,
            tentativas_necessarias: 10,
        },
        {
            id: 3,
            texto: 'Próxima dica',
            desbloqueada: false,
            tentativas_necessarias: 15,
        },
    ],

    codigos_tentados: [],
};

// ============================================
// ESTADO INICIAL DO CAUCASH
// ============================================
export const CAUCASH_INICIAL: CauCashState = {
    saldo: 500.00,
    transacoes: [
        {
            id: '1',
            tipo: 'credito',
            valor: 500.00,
            descricao: 'Bônus de boas-vindas',
            categoria: 'recompensa',
            data: new Date().toISOString(),
        },
    ],
    saldo_bloqueado: 0,
};

// ============================================
// HELPER: OBTER TODAS AS SKINS
// ============================================
export const getAllSkins = () => {
    return CATEGORIAS.flatMap(cat => cat.skins);
};

// ============================================
// HELPER: OBTER SKIN POR ID
// ============================================
export const getSkinById = (id: number) => {
    return getAllSkins().find(skin => skin.id === id);
};

// ============================================
// HELPER: OBTER SKINS POR CATEGORIA
// ============================================
export const getSkinsByCategory = (categoria: string) => {
    return CATEGORIAS.find(cat => cat.id === categoria)?.skins || [];
};
