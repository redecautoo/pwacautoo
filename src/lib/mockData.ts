import {
  User,
  Vehicle,
  Alert,
  SentAlert,
  Praise,
  FriendRequest,
  Friend,
  ChatMessage,
  PlateTransfer,
  PlateClaim,
  Referral,
  Sighting,
  HelpRequest
} from './types';

// Solicitações de socorro mockadas (Admin mock)
export const mockHelpRequests: HelpRequest[] = [];

// ==========================================
// 4 PERFIS DE TESTE - CPF + CÓDIGO
// ==========================================

// CPF Mulher: 000.000.000-00
// - Código 000000 => Mulher NÃO cliente Cautoo
// - Código 000001 => Mulher CLIENTE Cautoo

// CPF Homem: 111.111.111-11
// - Código 111111 => Homem NÃO cliente Cautoo  
// - Código 111110 => Homem CLIENTE Cautoo

// Perfil: Mulher NÃO cliente (CPF: 000.000.000-00 + Código: 000000)
// - Selo deve ser PAGO R$50
// - Não tem plano Cautoo ativo
export const mockFemaleNonClient: User = {
  id: 'user-female-nonclient',
  name: 'Maria Teste',
  cpf: '000.000.000-00',
  phone: '(11) 99999-0000',
  email: 'maria.nocliente@teste.com',
  password: '123456',
  gender: 'feminino',
  icc: 100,
  ranking: 'Iniciante',
  referralCode: 'MARIA2024',
  referralCount: 0,
  referralPoints: 0,
  usefulAlertsSent: 0,
  validCritiquesReceived: 0,
  realHelpsGiven: 0,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 0,
  cauCashBalance: 150.00,
  isVerified: false,
  isCautooClient: false, // NÃO é cliente Cautoo
  verifiedFreeActivationUsed: false,
  verificationCode: 'MRN001',
  verificationCodeCreatedAt: '2025-01-01T10:00:00Z',
  createdAt: '2025-01-01T10:00:00Z',
};

// Perfil: Mulher CLIENTE (CPF: 000.000.000-00 + Código: 000001)
// - Primeira ativação do selo GRATUITA
// - Tem plano Cautoo ativo
// - Selo ainda não ativado (elegível para ativação gratuita)
export const mockFemaleClient: User = {
  id: 'user-female-client',
  name: 'Ana Cliente Cautoo',
  cpf: '000.000.000-00',
  phone: '(11) 99999-0001',
  email: 'ana.cliente@cautoo.com',
  password: '123456',
  gender: 'feminino',
  icc: 650,
  ranking: 'Guardião Viário',
  referralCode: 'ANA2024',
  referralCount: 5,
  referralPoints: 50,
  usefulAlertsSent: 12,
  validCritiquesReceived: 1,
  realHelpsGiven: 2,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 15,
  cauCashBalance: 150.00,
  isVerified: false, // AINDA NÃO ATIVOU - pode ativar grátis
  isCautooClient: true, // É cliente Cautoo
  activePlanType: 'cautela', // Plano Modo Cautela
  cautooClientSince: '2024-06-01T10:00:00Z',
  cautooClientPlanExpiresAt: '2025-06-01T10:00:00Z', // Plano de 12 meses
  verifiedFreeActivationUsed: false, // Ainda não usou a gratuidade
  verificationCode: 'ANC002',
  verificationCodeCreatedAt: '2024-06-01T10:00:00Z',
  createdAt: '2024-06-01T10:00:00Z',
};

// Perfil: Homem NÃO cliente (CPF: 111.111.111-11 + Código: 111111)
// - Selo deve ser PAGO R$50
// - Não tem plano Cautoo ativo
export const mockMaleNonClient: User = {
  id: 'user-male-nonclient',
  name: 'Carlos Teste',
  cpf: '111.111.111-11',
  phone: '(11) 88888-1111',
  email: 'carlos.nocliente@teste.com',
  password: '123456',
  gender: 'masculino',
  icc: 150,
  ranking: 'Iniciante',
  referralCode: 'CARLOS2024',
  referralCount: 0,
  referralPoints: 0,
  usefulAlertsSent: 2,
  validCritiquesReceived: 0,
  realHelpsGiven: 0,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 2,
  cauCashBalance: 150.00,
  isVerified: false,
  isCautooClient: false, // NÃO é cliente Cautoo
  verifiedFreeActivationUsed: false,
  verificationCode: 'CRL003',
  verificationCodeCreatedAt: '2025-01-05T10:00:00Z',
  createdAt: '2025-01-05T10:00:00Z',
};

// Perfil: Homem CLIENTE (CPF: 111.111.111-11 + Código: 111110)
// - Primeira ativação do selo GRATUITA
// - Tem plano Cautoo ativo
// - Selo ainda não ativado (elegível para ativação gratuita)
export const mockMaleClient: User = {
  id: 'user-male-client',
  name: 'Pedro Cliente Cautoo',
  cpf: '111.111.111-11',
  phone: '(11) 88888-1110',
  email: 'pedro.cliente@cautoo.com',
  password: '123456',
  gender: 'masculino',
  icc: 500,
  ranking: 'Apoiador Urbano',
  referralCode: 'PEDRO2024',
  referralCount: 3,
  referralPoints: 30,
  usefulAlertsSent: 8,
  validCritiquesReceived: 0,
  realHelpsGiven: 1,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 10,
  cauCashBalance: 150.00,
  isVerified: false, // AINDA NÃO ATIVOU - pode ativar grátis
  isCautooClient: true, // É cliente Cautoo
  activePlanType: 'certo', // Plano Modo Certo
  cautooClientSince: '2024-05-01T10:00:00Z',
  cautooClientPlanExpiresAt: '2025-05-01T10:00:00Z', // Plano de 12 meses
  verifiedFreeActivationUsed: false, // Ainda não usou a gratuidade
  verificationCode: 'PDR004',
  verificationCodeCreatedAt: '2024-05-01T10:00:00Z',
  createdAt: '2024-05-01T10:00:00Z',
};

// ==========================================
// PERFIS DE TESTE - SELO AMARELO (CPF: 222.222.222-22)
// Regra: Selo Amarelo requer Selo Azul (isVerified) + ICC ≥ 300
// ==========================================

// Perfil: Mulher com SELO AMARELO, comprou Selo Azul mas SEM plano de cliente (CPF: 222.222.222-22 + Código: 222222)
export const mockFemaleYellowSealNonClient: User = {
  id: 'user-female-yellow-nonclient',
  name: 'Lucia Amarela',
  cpf: '222.222.222-22',
  phone: '(11) 77777-2222',
  email: 'lucia.amarela@teste.com',
  password: '123456',
  gender: 'feminino',
  icc: 650, // ICC ≥ 650 para selo amarelo
  ranking: 'Guardião Viário',
  referralCode: 'LUCIA2024',
  referralCount: 5,
  referralPoints: 25,
  usefulAlertsSent: 15,
  validCritiquesReceived: 2,
  realHelpsGiven: 1,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 10,
  cauCashBalance: 150.00,
  isVerified: true, // OBRIGATÓRIO para ter selo amarelo
  verifiedAt: '2024-06-01T10:00:00Z',
  verifiedExpiresAt: '2025-06-01T10:00:00Z',
  verifiedFreeActivationUsed: false, // Pagou pelo selo (não é cliente)
  isCautooClient: false,
  seal: 'yellow',
  verificationCode: 'LCA005',
  verificationCodeCreatedAt: '2024-08-01T10:00:00Z',
  createdAt: '2024-08-01T10:00:00Z',
};

// Perfil: Mulher com SELO AMARELO, CLIENTE (CPF: 222.222.222-22 + Código: 222220)
export const mockFemaleYellowSealClient: User = {
  id: 'user-female-yellow-client',
  name: 'Fernanda Amarela Cliente',
  cpf: '222.222.222-22',
  phone: '(11) 77777-2220',
  email: 'fernanda.amarela@cautoo.com',
  password: '123456',
  gender: 'feminino',
  icc: 700, // ICC alto mas < 850 (ainda não tem selo verde)
  ranking: 'Guardião Viário',
  referralCode: 'FERNANDA2024',
  referralCount: 8,
  referralPoints: 60,
  usefulAlertsSent: 20,
  validCritiquesReceived: 1,
  realHelpsGiven: 2,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 18,
  cauCashBalance: 150.00,
  isVerified: true, // OBRIGATÓRIO para ter selo amarelo
  verifiedAt: '2024-10-01T10:00:00Z',
  verifiedExpiresAt: '2025-10-01T10:00:00Z',
  verifiedFreeActivationUsed: true, // Usou ativação gratuita (é cliente)
  isCautooClient: true,
  activePlanType: 'certo', // Plano Modo Certo
  cautooClientSince: '2024-04-01T10:00:00Z',
  cautooClientPlanExpiresAt: '2025-04-01T10:00:00Z',
  seal: 'yellow',
  yellowSealStolenAlertsUsed: 0,
  yellowSealBenefitsStartedAt: '2024-10-01T10:00:00Z',
  verificationCode: 'FND006',
  verificationCodeCreatedAt: '2024-04-01T10:00:00Z',
  createdAt: '2024-04-01T10:00:00Z',
};

// ==========================================
// PERFIS DE TESTE - SELO VERDE (CPF: 333.333.333-33)
// Regra: Selo Verde requer Selo Azul (isVerified) + ICC ≥ 700 + Score ≥ 80
// ==========================================

// Perfil: Homem com SELO VERDE, comprou Selo Azul mas SEM plano de cliente (CPF: 333.333.333-33 + Código: 333333)
export const mockMaleGreenSealNonClient: User = {
  id: 'user-male-green-nonclient',
  name: 'Roberto Verde',
  cpf: '333.333.333-33',
  phone: '(11) 66666-3333',
  email: 'roberto.verde@teste.com',
  password: '123456',
  gender: 'masculino',
  icc: 850, // ICC ≥ 850 para selo verde
  ranking: 'Referência Cautoo',
  referralCode: 'ROBERTO2024',
  referralCount: 10,
  referralPoints: 50,
  usefulAlertsSent: 35,
  validCritiquesReceived: 2,
  realHelpsGiven: 4,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 15,
  cauCashBalance: 150.00,
  isVerified: true, // OBRIGATÓRIO para ter selo verde
  verifiedAt: '2024-05-01T10:00:00Z',
  verifiedExpiresAt: '2025-05-01T10:00:00Z',
  verifiedFreeActivationUsed: false, // Pagou pelo selo (não é cliente)
  isCautooClient: false,
  seal: 'green',
  hasUsedGreenSealCall: false,
  greenSealStolenAlertsUsed: 0,
  greenSealBenefitsStartedAt: '2024-07-01T10:00:00Z',
  verificationCode: 'RBT007',
  verificationCodeCreatedAt: '2024-07-01T10:00:00Z',
  createdAt: '2024-07-01T10:00:00Z',
};

// Perfil: Homem com SELO VERDE, CLIENTE (CPF: 333.333.333-33 + Código: 333330)
export const mockMaleGreenSealClient: User = {
  id: 'user-male-green-client',
  name: 'Marcos Verde Cliente',
  cpf: '333.333.333-33',
  phone: '(11) 66666-3330',
  email: 'marcos.verde@cautoo.com',
  password: '123456',
  gender: 'masculino',
  icc: 900, // ICC alto, Referência Cautoo
  ranking: 'Referência Cautoo',
  referralCode: 'MARCOS2024',
  referralCount: 15,
  referralPoints: 120,
  usefulAlertsSent: 50,
  validCritiquesReceived: 0,
  realHelpsGiven: 5,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 30,
  cauCashBalance: 150.00,
  isVerified: true, // OBRIGATÓRIO para ter selo verde
  verifiedAt: '2024-09-01T10:00:00Z',
  verifiedExpiresAt: '2025-09-01T10:00:00Z',
  verifiedFreeActivationUsed: true, // Usou ativação gratuita (é cliente)
  isCautooClient: true,
  activePlanType: 'ciente', // Plano Modo Ciente
  cautooClientSince: '2024-03-01T10:00:00Z',
  cautooClientPlanExpiresAt: '2025-03-01T10:00:00Z',
  seal: 'green',
  hasUsedGreenSealCall: false,
  greenSealStolenAlertsUsed: 0,
  greenSealBenefitsStartedAt: '2024-03-01T10:00:00Z',
  verificationCode: 'MRC008',
  verificationCodeCreatedAt: '2024-03-01T10:00:00Z',
  createdAt: '2024-03-01T10:00:00Z',
};

// Usuário mockado padrão (para login sem perfil de teste)
export const mockCurrentUser: User = {
  id: 'user-1',
  name: 'João Silva',
  cpf: '123.456.789-00',
  phone: '(11) 99999-8888',
  email: 'joao@email.com',
  password: '123456',
  gender: 'masculino',
  icc: 450,
  ranking: 'Apoiador Urbano',
  referralCode: 'JOAO2024',
  referralCount: 5,
  referralPoints: 35,
  usefulAlertsSent: 8,
  validCritiquesReceived: 1,
  realHelpsGiven: 1,
  confirmedAbuses: 0,
  positiveActionsLast90Days: 12,
  cauCashBalance: 150.00,
  isVerified: false,
  verificationCode: 'ABC123',
  verificationCodeCreatedAt: '2024-01-15T10:00:00Z',
  createdAt: '2024-01-15T10:00:00Z',
};

// Usuária de teste legado (mantida para compatibilidade)
export const mockTestUser: User = mockFemaleClient;

// ==========================================
// VEÍCULOS DOS 4 PERFIS DE TESTE
// ==========================================

// Veículos Mulher NÃO cliente (nenhum com plano ativo)
export const mockFemaleNonClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-fnc-1',
    plate: 'AAA1A00',
    model: 'Fiat Mobi',
    color: 'Prata',
    ownerId: 'user-female-nonclient',
    score: 50,
    hasCompleteInfo: false,
    hasActivePlan: false,
    isStolen: false,
    createdAt: '2025-01-01T10:00:00Z',
  },
];

// Veículos Mulher CLIENTE (2 placas: 1 com plano, 1 sem)
export const mockFemaleClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-fc-1',
    plate: 'ABC1D23',
    model: 'Fiat Argo',
    color: 'Vermelho',
    ownerId: 'user-female-client',
    score: 92,
    hasCompleteInfo: true,
    hasActivePlan: true, // PLANO ATIVO
    isStolen: false,
    createdAt: '2024-06-01T10:00:00Z',
  },
  {
    id: 'vehicle-fc-2',
    plate: 'DEF4G56',
    model: 'Chevrolet Onix',
    color: 'Branco',
    ownerId: 'user-female-client',
    score: 78,
    hasCompleteInfo: false,
    hasActivePlan: false, // SEM PLANO
    isStolen: false,
    createdAt: '2024-12-15T10:00:00Z',
  },
];

// Veículos Homem NÃO cliente (nenhum com plano ativo)
export const mockMaleNonClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-mnc-1',
    plate: 'BBB2B11',
    model: 'Volkswagen Gol',
    color: 'Preto',
    ownerId: 'user-male-nonclient',
    score: 60,
    hasCompleteInfo: false,
    hasActivePlan: false,
    isStolen: false,
    createdAt: '2025-01-05T10:00:00Z',
  },
];

// Veículos Homem CLIENTE (2 placas: 1 com plano, 1 sem)
export const mockMaleClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-mc-1',
    plate: 'GHI7J89',
    model: 'Honda Civic',
    color: 'Prata',
    ownerId: 'user-male-client',
    score: 88,
    hasCompleteInfo: true,
    hasActivePlan: true, // PLANO ATIVO
    isStolen: false,
    createdAt: '2024-05-01T10:00:00Z',
  },
  {
    id: 'vehicle-mc-2',
    plate: 'KLM1N23',
    model: 'Toyota Corolla',
    color: 'Cinza',
    ownerId: 'user-male-client',
    score: 75,
    hasCompleteInfo: false,
    hasActivePlan: false, // SEM PLANO
    isStolen: false,
    createdAt: '2024-10-01T10:00:00Z',
  },
];

// ==========================================
// VEÍCULOS PERFIS SELO AMARELO
// ==========================================

// Veículos Mulher Selo Amarelo NÃO cliente (1 placa sem plano)
export const mockFemaleYellowSealNonClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-fysn-1',
    plate: 'CCC2C22',
    model: 'Renault Kwid',
    color: 'Amarelo',
    ownerId: 'user-female-yellow-nonclient',
    score: 65,
    hasCompleteInfo: false,
    hasActivePlan: false,
    isStolen: false,
    createdAt: '2024-08-01T10:00:00Z',
  },
];

// Veículos Mulher Selo Amarelo CLIENTE (2 placas: 1 com plano, 1 sem)
export const mockFemaleYellowSealClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-fysc-1',
    plate: 'DDD3D33',
    model: 'Jeep Renegade',
    color: 'Laranja',
    ownerId: 'user-female-yellow-client',
    score: 85,
    hasCompleteInfo: true,
    hasActivePlan: true, // PLANO ATIVO
    isStolen: false,
    createdAt: '2024-04-01T10:00:00Z',
  },
  {
    id: 'vehicle-fysc-2',
    plate: 'EEE4E44',
    model: 'Fiat Pulse',
    color: 'Branco',
    ownerId: 'user-female-yellow-client',
    score: 70,
    hasCompleteInfo: false,
    hasActivePlan: false, // SEM PLANO
    isStolen: false,
    createdAt: '2024-11-01T10:00:00Z',
  },
];

// ==========================================
// VEÍCULOS PERFIS SELO VERDE
// ==========================================

// Veículos Homem Selo Verde NÃO cliente (1 placa sem plano, mas score ≥ 80)
export const mockMaleGreenSealNonClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-mgsn-1',
    plate: 'FFF5F55',
    model: 'Volkswagen T-Cross',
    color: 'Verde',
    ownerId: 'user-male-green-nonclient',
    score: 85, // Score ≥ 80 para selo verde
    hasCompleteInfo: false,
    hasActivePlan: false,
    isStolen: false,
    createdAt: '2024-07-01T10:00:00Z',
  },
];

// Veículos Homem Selo Verde CLIENTE (2 placas: 1 com plano, 1 sem - ambas score alto)
export const mockMaleGreenSealClientVehicles: Vehicle[] = [
  {
    id: 'vehicle-mgsc-1',
    plate: 'GGG6G66',
    model: 'BMW X1',
    color: 'Preto',
    ownerId: 'user-male-green-client',
    score: 95, // Score ≥ 80 para selo verde
    hasCompleteInfo: true,
    hasActivePlan: true, // PLANO ATIVO
    isStolen: false,
    createdAt: '2024-03-01T10:00:00Z',
  },
  {
    id: 'vehicle-mgsc-2',
    plate: 'HHH7H77',
    model: 'Audi A3',
    color: 'Azul',
    ownerId: 'user-male-green-client',
    score: 88, // Score ≥ 80 para selo verde
    hasCompleteInfo: false,
    hasActivePlan: false, // SEM PLANO
    isStolen: false,
    createdAt: '2024-08-01T10:00:00Z',
  },
];

// Veículos do usuário mockado padrão (João)
export const mockVehicles: Vehicle[] = [
  {
    id: 'vehicle-1',
    plate: 'ABC1D23',
    model: 'Honda Civic',
    color: 'Preto',
    ownerId: 'user-1',
    score: 85,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'vehicle-bunny',
    plate: 'ROS1A11',
    model: 'Volkswagen Gol',
    color: 'Rosa',
    ownerId: 'user-1',
    score: 95,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2025-01-30T10:00:00Z',
  },
  {
    id: 'vehicle-2',
    plate: 'XYZ4E56',
    model: 'Toyota Corolla',
    color: 'Branco',
    ownerId: 'user-1',
    score: 72,
    hasCompleteInfo: false,
    hasActivePlan: false,
    isStolen: false,
    createdAt: '2024-03-20T14:30:00Z',
  },

  // PLACAS LENDÁRIAS (DEMO)
  {
    id: 'vehicle-demo-spider',
    plate: 'ARA1234',
    model: 'Volkswagen Gol',
    color: 'Personalizado',
    ownerId: 'user-male-green-nonclient',
    score: 980,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-01T10:00:00Z',
    skinId: 1001
  },
  {
    id: 'vehicle-demo-bat',
    plate: 'BAT1234',
    model: 'Chevrolet Camaro',
    color: 'Preto Fosco',
    ownerId: 'user-male-client',
    score: 950,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-02T10:00:00Z',
    skinId: 1002
  },
  {
    id: 'vehicle-demo-future',
    plate: 'FUT1234',
    model: 'Tesla Model S',
    color: 'Neon Blue',
    ownerId: 'user-female-client',
    score: 990,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-03T10:00:00Z',
    skinId: 1003
  },
  {
    id: 'vehicle-demo-poke',
    plate: 'POK1234',
    model: 'Mini Cooper',
    color: 'Amarelo Elétrico',
    ownerId: 'user-1',
    score: 820,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-04T10:00:00Z',
    skinId: 1004
  },
  {
    id: 'vehicle-demo-rose',
    plate: 'ROS1234',
    model: 'Porsche Taycan',
    color: 'Rosa Imperial',
    ownerId: 'user-female-yellow-client',
    score: 940,
    hasCompleteInfo: true,
    hasActivePlan: true,
    isStolen: false,
    createdAt: '2024-01-05T10:00:00Z',
    skinId: 1005
  },
];

// Veículos da usuária de teste legada
export const mockTestVehicles: Vehicle[] = mockFemaleClientVehicles;

// Função para obter perfil de teste por CPF + Código
export function getTestProfile(cpf: string, code: string): { user: User; vehicles: Vehicle[] } | null {
  const cleanCpf = cpf.replace(/\D/g, '');

  // CPF Mulher: 00000000000
  if (cleanCpf === '00000000000') {
    if (code === '000000') {
      return { user: mockFemaleNonClient, vehicles: mockFemaleNonClientVehicles };
    }
    if (code === '000001') {
      return { user: mockFemaleClient, vehicles: mockFemaleClientVehicles };
    }
  }

  // CPF Homem: 11111111111
  if (cleanCpf === '11111111111') {
    if (code === '111111') {
      return { user: mockMaleNonClient, vehicles: mockMaleNonClientVehicles };
    }
    if (code === '111110') {
      return { user: mockMaleClient, vehicles: mockMaleClientVehicles };
    }
  }

  // CPF Mulher Selo Amarelo: 22222222222
  if (cleanCpf === '22222222222') {
    if (code === '222222') {
      return { user: mockFemaleYellowSealNonClient, vehicles: mockFemaleYellowSealNonClientVehicles };
    }
    if (code === '222220') {
      return { user: mockFemaleYellowSealClient, vehicles: mockFemaleYellowSealClientVehicles };
    }
  }

  // CPF Homem Selo Verde: 33333333333
  if (cleanCpf === '33333333333') {
    if (code === '333333') {
      return { user: mockMaleGreenSealNonClient, vehicles: mockMaleGreenSealNonClientVehicles };
    }
    if (code === '333330') {
      return { user: mockMaleGreenSealClient, vehicles: mockMaleGreenSealClientVehicles };
    }
  }

  return null;
}

// Placa cadastrada por outro usuário (para testes)
export const mockRegisteredPlate = 'GHI8J90';

// Veículos roubados mockados (de outros usuários, para simular avistamentos)
export const mockStolenVehicles: Vehicle[] = [
  {
    id: 'stolen-1',
    plate: 'ROB1A23',
    model: 'Volkswagen Gol',
    color: 'Prata',
    ownerId: 'user-7',
    score: 60,
    hasCompleteInfo: true,
    hasActivePlan: false,
    isStolen: true,
    stolenInfo: {
      location: 'Av. Brasil, 1500 - São Paulo',
      date: '2024-12-20',
      time: '23:30',
      sightings: [],
    },
    createdAt: '2023-06-10T10:00:00Z',
  },
];

// Alertas recebidos mockados
export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    plateId: 'vehicle-1',
    plate: 'ABC1D23',
    categoryId: 'risco-mecanico',
    categoryName: 'Risco Mecânico ou Operacional',
    messageId: '5',
    messageText: 'Farol ou lanterna do veículo estão ligados.',
    senderHasSeal: true,
    createdAt: '2024-12-28T14:30:00Z',
    isRead: false,
  },
  {
    id: 'alert-2',
    plateId: 'vehicle-1',
    plate: 'ABC1D23',
    categoryId: 'estacionamento-irregular',
    categoryName: 'Estacionamento Irregular',
    messageId: '1',
    messageText: 'Seu veículo está parado em frente a uma garagem.',
    senderHasSeal: false,
    createdAt: '2024-12-27T09:15:00Z',
    isRead: true,
  },
  {
    id: 'alert-3',
    plateId: 'vehicle-2',
    plate: 'XYZ4E56',
    categoryId: 'transito-obstrucao',
    categoryName: 'Trânsito / Obstrução',
    messageId: '1',
    messageText: 'Seu veículo está bloqueando a passagem de outros veículos.',
    senderHasSeal: true,
    createdAt: '2024-12-26T18:45:00Z',
    isRead: true,
  },
];

// Alertas enviados mockados
export const mockSentAlerts: SentAlert[] = [
  {
    id: 'sent-1',
    targetPlate: 'DEF5G67',
    categoryId: 'seguranca-imediata',
    categoryName: 'Segurança Imediata',
    messageText: 'Alarme do veículo está disparando continuamente.',
    createdAt: '2024-12-25T11:00:00Z',
  },
];

// Elogios recebidos mockados
export const mockPraisesReceived: Praise[] = [
  {
    id: 'praise-1',
    fromUserId: 'user-2',
    toPlate: 'ABC1D23',
    praiseType: 'Direção cortês e segura',
    createdAt: '2024-12-20T16:00:00Z',
  },
];

// Elogios enviados mockados
export const mockPraisesSent: Praise[] = [
  {
    id: 'praise-sent-1',
    fromUserId: 'user-1',
    toPlate: 'GHI8J90',
    praiseType: 'Estacionou corretamente',
    createdAt: '2024-12-22T10:00:00Z',
  },
];

// Solicitações de amizade mockadas
export const mockFriendRequests: FriendRequest[] = [
  {
    id: 'fr-1',
    fromUserId: 'user-3',
    fromUserName: 'Maria Oliveira',
    fromPlate: 'MNO1P23',
    toUserId: 'user-1',
    toPlate: 'ABC1D23',
    status: 'pending',
    createdAt: '2024-12-27T12:00:00Z',
  },
];

// Amigos mockados
export const mockFriends: Friend[] = [
  {
    id: 'friend-1',
    odometer: undefined,
    userId: 'user-4',
    userName: 'Carlos Souza',
    plate: 'QRS4T56',
    hasBlueSeal: true,
    chatEnabled: true,
  },
];

// Mensagens de chat mockadas
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    friendshipId: 'friend-1',
    senderId: 'user-4',
    text: 'Oi! Vi seu carro na Paulista hoje',
    createdAt: '2024-12-28T10:00:00Z',
  },
  {
    id: 'msg-2',
    friendshipId: 'friend-1',
    senderId: 'user-1',
    text: 'Opa! Estava por lá mesmo. Tudo bem?',
    createdAt: '2024-12-28T10:05:00Z',
  },
];

// Transferências de placa mockadas
export const mockTransfers: PlateTransfer[] = [];

// Reivindicações de placa mockadas
export const mockClaims: PlateClaim[] = [];

// Indicações mockadas
export const mockReferrals: Referral[] = [
  {
    id: 'ref-1',
    referrerId: 'user-1',
    referredUserId: 'user-5',
    referredUserName: 'Ana Santos',
    boughtBlueSeal: true,
    pointsEarned: 15,
    createdAt: '2024-11-15T10:00:00Z',
  },
  {
    id: 'ref-2',
    referrerId: 'user-1',
    referredUserId: 'user-6',
    referredUserName: 'Pedro Lima',
    boughtBlueSeal: false,
    pointsEarned: 5,
    createdAt: '2024-12-01T14:00:00Z',
  },
];

// Tipos de elogios disponíveis
export const praiseTypes = [
  'Direção cortês e segura',
  'Estacionou corretamente',
  'Cedeu passagem gentilmente',
  'Respeitou a sinalização',
  'Ajudou outro motorista',
  'Condução exemplar no trânsito',
];