import React, { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import {
  User,
  Vehicle,
  Alert,
  SentAlert,
  SentCritique,
  Praise,
  FriendRequest,
  Friend,
  ChatMessage,
  PlateTransfer,
  PlateClaim,
  Referral,
  StolenAlertInfo,
  ClaimStatus,
  HelpRequest,
  SealType,
  getRankingFromICC,
  isStolenAlertActive,
  isVehicleBlocked,
  CautelarRegistry,
  CautelarOccurrenceType,
  CautelarRegistryStatus,
  CautelarResolutionType,
  CautelarParticipant,
  CautelarDamage,
  generateRegistryNumber,
  generateCertificateHash,
  ContactRequest,
  VehicleOwnershipType,
  VehicleSubscriptionInfo,
  VehicleInsuranceInfo,
  SolidaryAlert,
  SolidaryEmergencyType,
  checkVehicleCoverage,
  ScoreCategory,
  ICCCategory,
  PlateClaimRequest,
  ScoreHistoryEntry,
  generateVerificationCode,
  verifyCode
} from '@/lib/types';
import {
  mockCurrentUser,
  mockVehicles,
  mockAlerts,
  mockSentAlerts,
  mockPraisesReceived,
  mockPraisesSent,
  mockFriendRequests,
  mockFriends,
  mockChatMessages,
  mockTransfers,
  mockClaims,
  mockReferrals,
  mockStolenVehicles,
  getTestProfile,
  mockFemaleNonClient,
  mockFemaleClient,
  mockMaleNonClient,
  mockMaleClient,
  mockFemaleYellowSealNonClient,
  mockFemaleYellowSealClient,
  mockMaleGreenSealNonClient,
  mockMaleGreenSealClient,
} from '@/lib/mockData';

// Mapa de todos os mock users por ownerId para lookup de cobertura
const mockUsersById: { [key: string]: User } = {
  [mockFemaleNonClient.id]: mockFemaleNonClient,
  [mockFemaleClient.id]: mockFemaleClient,
  [mockMaleNonClient.id]: mockMaleNonClient,
  [mockMaleClient.id]: mockMaleClient,
  [mockFemaleYellowSealNonClient.id]: mockFemaleYellowSealNonClient,
  [mockFemaleYellowSealClient.id]: mockFemaleYellowSealClient,
  [mockMaleGreenSealNonClient.id]: mockMaleGreenSealNonClient,
  [mockMaleGreenSealClient.id]: mockMaleGreenSealClient,
  [mockCurrentUser.id]: mockCurrentUser,
};
import { CautooFleet, FleetChatMessage, FleetHelpRequest, FleetMember, FleetInvite, FleetAssistance } from '@/lib/fleetTypes';
import { mockFleets } from '@/lib/fleetMockData';
import { INITIAL_COLLECTION, INITIAL_MINING, getSkinById as getSkinByIdMock, getCategoryById as getCategoryByIdMock } from '@/data/mockSkins';

// ===== HELPER FUNCTIONS FOR SCORE/ICC SYSTEM =====

/**
 * Calcula a categoria do Score da Placa (PÚBLICO)
 * Baseado nas novas 7 faixas
 */
export function getScoreCategory(score: number): ScoreCategory {
  if (score < 0) return 'alerta';
  if (score < 200) return 'neutra';
  if (score < 400) return 'conhecida';
  if (score < 650) return 'confiavel';
  if (score < 850) return 'distinta';
  if (score <= 1000) return 'exemplar';
  return 'icone';
}

/**
 * Calcula a categoria do ICC (PRIVADO)
 * Baseado nas novas 7 faixas
 */
export function getICCCategory(icc: number): ICCCategory {
  if (icc < 0) return 'negativo';
  if (icc < 200) return 'iniciante';
  if (icc < 400) return 'ativo';
  if (icc < 650) return 'engajado';
  if (icc < 850) return 'protetor';
  if (icc <= 1000) return 'embaixador';
  return 'guardiao';
}

/**
 * Retorna informações de exibição da categoria do Score
 */
export function getScoreCategoryInfo(score: number) {
  const category = getScoreCategory(score);

  const categoryMap = {
    'alerta': { label: 'Placa em Alerta', badgeClass: 'badge-vermelho', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    'neutra': { label: 'Placa Neutra', badgeClass: 'badge-cinza', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
    'conhecida': { label: 'Placa Conhecida', badgeClass: 'badge-azul', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'confiavel': { label: 'Placa Confiável', badgeClass: 'badge-laranja', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'distinta': { label: 'Placa Distinta', badgeClass: 'badge-roxo', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    'exemplar': { label: 'Placa Exemplar', badgeClass: 'badge-amarelo', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    'icone': { label: 'Placa Ícone Cautoo', badgeClass: 'badge-verde', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  };

  return { category, ...categoryMap[category] };
}

/**
 * Retorna informações de exibição da categoria do ICC
 */
export function getICCCategoryInfo(icc: number) {
  const category = getICCCategory(icc);

  const categoryMap = {
    'negativo': { label: 'Contribuidor Negativo', badgeClass: 'badge-vermelho', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    'iniciante': { label: 'Iniciante', badgeClass: 'badge-cinza', color: 'text-gray-400', bg: 'bg-gray-400/10', border: 'border-gray-400/20' },
    'ativo': { label: 'Colaborador Ativo', badgeClass: 'badge-azul', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    'engajado': { label: 'Cauteloso Engajado', badgeClass: 'badge-laranja', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    'protetor': { label: 'Protetor da Rede', badgeClass: 'badge-roxo', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    'embaixador': { label: 'Embaixador Cautoo', badgeClass: 'badge-amarelo', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
    'guardiao': { label: 'Guardião Elite', badgeClass: 'badge-verde', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
  };

  return { category, ...categoryMap[category] };
}

export interface AlertModalState {
  isOpen: boolean;
  title: string;
  description: string;
  variant: "success" | "warning" | "error" | "info";
  highlightText?: string;
}

interface AppContextType {
  // Auth state
  isLoggedIn: boolean;
  currentUser: User | null;
  login: (cpf: string) => void;
  loginWithPassword: (cpf: string, password: string) => boolean;
  logout: () => void;
  register: (data: { name: string; cpf: string; phone: string; email?: string; password: string; plate?: string; plateAlreadyRegistered?: boolean; ownershipType?: VehicleOwnershipType; subscriptionInfo?: VehicleSubscriptionInfo; insuranceInfo?: VehicleInsuranceInfo }) => void;

  // Vehicles
  vehicles: Vehicle[];
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'ownerId' | 'score' | 'isStolen' | 'createdAt' | 'hasCompleteInfo'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  markAsStolen: (id: string, info: { location: string; date: string; time: string }) => void;
  markAsRecovered: (id: string) => void;
  renewStolenAlert: (id: string) => boolean; // Renovar alerta por +3 dias (gratuito 1x)
  payForStolenAlert: (plate: string) => boolean; // Pagar por alerta de roubo
  reactivateStolenAlert: (id: string) => void; // Reativar alerta pago
  isPlateRegistered: (plate: string) => boolean;

  // Alerts
  alerts: Alert[];
  sentAlerts: SentAlert[];
  sentCritiques: SentCritique[];
  sendAlert: (plate: string, categoryId: string, categoryName: string, messageId: string, messageText: string) => void;
  markAlertAsRead: (id: string) => void;
  canSendCritique: (plate: string) => { canSend: boolean; reason: string };

  // Praises
  praisesReceived: Praise[];
  praisesSent: Praise[];
  sendPraise: (plate: string, praiseType: string) => boolean;

  // Friends
  friendRequests: FriendRequest[];
  friends: Friend[];
  chatMessages: ChatMessage[];
  sendFriendRequest: (toPlate: string) => void;
  respondToFriendRequest: (id: string, accept: boolean) => void;
  sendChatMessage: (friendshipId: string, text: string) => void;

  // Transfers
  transfers: PlateTransfer[];
  initiateTransfer: (plateId: string, plate: string, toUserCpf: string) => void;
  respondToTransfer: (id: string, accept: boolean) => void;

  // Claims
  claims: PlateClaim[];
  submitClaim: (plate: string, reason: string) => void;
  submitVehicleClaim: (vehicleId: string, reason: string) => void;
  isVehicleBlocked: (vehicleId: string) => boolean;

  // Referrals
  referrals: Referral[];

  // Stolen vehicles (for sighting feature)
  stolenVehicles: Vehicle[];
  reportSighting: (plateId: string, location: string, date: string, time: string) => void;

  // User actions
  updateUserProfile: (data: Partial<User>) => void;
  purchaseVerifiedSeal: (isFreeActivation?: boolean, skipDebit?: boolean) => void;
  canActivateFreeSeal: () => boolean;
  isVerifiedSealExpired: () => boolean;
  purchasePlateInfo: (vehicleId: string, skipBalanceCheck?: boolean) => void;
  addAdditionalPlate: (vehicle: Omit<Vehicle, 'id' | 'ownerId' | 'score' | 'isStolen' | 'createdAt' | 'hasCompleteInfo'>, isAdditional?: boolean) => void;

  // Verification Code (Código de Verificação Dinâmico)
  generateNewVerificationCode: () => string;
  validateVerificationCode: (inputCode: string) => boolean;
  rotateVerificationCode: () => string;

  // Help Requests (Socorro)
  helpRequests: HelpRequest[];
  addHelpRequest: (data: Omit<HelpRequest, 'id' | 'userId' | 'userCpf' | 'status'>) => void;

  // CauCash
  cauCashBalance: number;
  cauCashTransactions: any[];
  addTransaction: (data: { type: 'credit' | 'debit', amount: number, description: string, category: string }) => void;
  resetCauCashBalance: () => void;
  getCurrentCauCashBalance: () => number;

  // Green Seal Free Call
  useGreenSealCall: () => void;
  hasGreenSealFreeCall: () => boolean;

  // Green Seal Free Stolen Alerts
  useGreenSealStolenAlert: () => void;
  hasGreenSealFreeStolenAlert: () => boolean;
  getGreenSealStolenAlertsRemaining: () => number;

  // Frotas Cautoo
  userFleets: CautooFleet[];
  createFleet: (name: string, description?: string) => CautooFleet;
  deleteFleet: (fleetId: string) => void;
  updateFleet: (fleetId: string, updates: Partial<CautooFleet>) => void;
  addFleetMember: (fleetId: string, member: FleetMember) => void;
  removeFleetMember: (fleetId: string, memberId: string) => void;
  sendFleetChatMessage: (fleetId: string, text: string, type?: 'message' | 'help_request' | 'system', helpRequestId?: string) => void;
  addFleetHelpRequest: (fleetId: string, helpRequest: FleetHelpRequest) => void;
  updateFleetHelpRequest: (fleetId: string, helpRequestId: string, updates: Partial<FleetHelpRequest>) => void;

  // Compras de Frota (atômicas: verificam, debitam e atualizam em uma operação)
  purchaseFleetVerifiedSeal: (fleetId: string) => { success: boolean; message: string };
  purchaseFleetAssistance: (fleetId: string, totalPrice: number, description: string, assistanceData?: FleetAssistance) => { success: boolean; message: string };

  // Convites de Frota
  sendFleetInvite: (fleetId: string, plate: string) => FleetInvite;
  cancelFleetInvite: (fleetId: string, inviteId: string) => void;
  respondToFleetInvite: (fleetId: string, inviteId: string, accept: boolean) => void;
  getFleetInvitesForUser: () => FleetInvite[];

  // Registro Cautelar
  cautelarRegistries: CautelarRegistry[];
  createCautelarRegistry: (data: {
    plates: string[];
    occurrenceType: CautelarOccurrenceType;
    occurrenceDate: string;
    occurrenceTime: string;
    location: string;
    description: string;
  }) => CautelarRegistry;
  confirmCautelarParticipation: (registryId: string, participantId: string) => void;
  resolveCautelarRegistry: (registryId: string, resolutionType: CautelarResolutionType) => void;
  addCautelarDamage: (registryId: string, damage: CautelarDamage) => void;
  payMediationInstallment: (registryId: string) => boolean;
  getCautelarRegistriesForUser: () => CautelarRegistry[];

  // Solicitações de Contato
  contactRequests: ContactRequest[];
  sendContactRequest: (toPlate: string, reason: string) => boolean;
  respondToContactRequest: (requestId: string, accept: boolean, sharedContacts?: { phone?: boolean; email?: boolean; socialMedia?: boolean }) => void;
  blockContactRequest: (requestId: string) => void;
  getContactRequestsReceived: () => ContactRequest[];
  getContactRequestsSent: () => ContactRequest[];
  getVehicleByPlate: (plate: string) => Vehicle | undefined;

  // Alerta Solidário
  solidaryAlerts: SolidaryAlert[];
  sendSolidaryAlert: (data: {
    targetPlate: string;
    emergencyType: SolidaryEmergencyType;
    description: string;
    location: string;
    approximateTime: string;
    driverWithoutSignal: boolean;
    additionalPhone?: string;
    victimVerificationCode?: string;
  }) => { success: boolean; error?: string; hasCoverage?: boolean };
  getSolidaryAlertsForUser: (userId: string, type?: 'sent' | 'received') => SolidaryAlert[];
  respondToSolidaryAlert: (alertId: string, response: 'acionado' | 'ja_resolvido') => void;
  markSolidaryAlertAsUseful: (alertId: string, isUseful: boolean) => void;

  // Global Alert System
  alertModal: AlertModalState;
  showAlert: (title: string, description: string, variant?: "success" | "warning" | "error" | "info", highlightText?: string) => void;
  hideAlert: () => void;
  getPlateMetrics: (plate: string) => {
    score: number;
    category: ScoreCategory;
    label: string;
    badgeClass: string;
    categoryColor: string;
    categoryBg: string;
    categoryBorder: string;
    isPublic: boolean;
    isRegistered: boolean;
    totalInteractions: number;
    compliments: number;
    critiques: number;
    alerts: number;
    solidaryActions: number;
  };

  // ===== SKINS & COLEÇÃO (NOVA IMPLEMENTAÇÃO) =====
  // Estado
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  collection: import('@/types/skins').Collection;
  miningState: import('@/types/skins').MiningState;

  // Helpers
  getSkinById: (id: number) => import('@/types/skins').Skin | undefined;
  getSkinsByCategory: (categoryId: import('@/types/skins').SkinCategoryId) => import('@/types/skins').Skin[];

  // Ações
  buySkinLayout: (skinId: number) => { success: boolean; message: string };
  sellSkin: (skinId: number, price: number) => { success: boolean; message: string };
  mineSkin: (code: string) => { success: boolean; message: string; prize?: import('@/types/skins').MiningPrize };
  linkSkinToPlate: (skinId: number, plateId: string) => { success: boolean; message: string };

  // Onboarding
  skinsOnboardingCompleted: boolean;
  completeSkinsOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = "cautoo_mock_user_v1";
const FLEETS_STORAGE_KEY = "cautoo_fleets_v1";

// Custom event para notificar quando rewards foram aplicados
const REWARDS_APPLIED_EVENT = 'cautoo_rewards_applied';

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw) as User;

    // Aplicar recompensas pendentes de ICC ao restaurar sessão
    const pendingRewardsKey = 'cautoo_icc_rewards_v1';
    const existingRewards = localStorage.getItem(pendingRewardsKey);
    if (existingRewards) {
      const rewards: { userId: string; amount: number; reason: string; date: string; alertId?: string }[] = JSON.parse(existingRewards);
      const userRewards = rewards.filter(r => r.userId === user.id);

      if (userRewards.length > 0) {
        const totalBonus = userRewards.reduce((sum, r) => sum + r.amount, 0);
        const newICC = Math.min(1000, user.icc + totalBonus);
        user.icc = newICC;
        user.ranking = getRankingFromICC(newICC);

        // Atualizar alertas correspondentes no localStorage
        const alertIds = userRewards.filter(r => r.alertId).map(r => r.alertId);
        if (alertIds.length > 0) {
          try {
            const storedAlerts = localStorage.getItem('cautoo_solidary_v1');
            if (storedAlerts) {
              const alerts: SolidaryAlert[] = JSON.parse(storedAlerts);
              const updatedAlerts = alerts.map(a => {
                if (alertIds.includes(a.id)) {
                  return { ...a, iccRewardPending: false, iccRewardApplied: true };
                }
                return a;
              });
              localStorage.setItem('cautoo_solidary_v1', JSON.stringify(updatedAlerts));

              // Disparar evento para notificar componente
              window.dispatchEvent(new CustomEvent(REWARDS_APPLIED_EVENT, { detail: { alertIds } }));
            }
          } catch (e) { }
        }

        // Remover recompensas aplicadas
        const remainingRewards = rewards.filter(r => r.userId !== user.id);
        localStorage.setItem(pendingRewardsKey, JSON.stringify(remainingRewards));

        // Salvar usuário atualizado
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        console.log(`Session restored: ICC bonus +${totalBonus} applied for user ${user.id}, alerts updated: ${alertIds.join(', ')}`);
      }
    }

    return user;
  } catch {
    return null;
  }
}

function readStoredFleets(): CautooFleet[] | null {
  try {
    const raw = localStorage.getItem(FLEETS_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CautooFleet[];
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  // Auth state (mock/local)
  const [currentUser, setCurrentUser] = useState<User | null>(() => readStoredUser());
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => !!readStoredUser());

  // Persistência local (para teste do selo e recursos desbloqueados)
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }

    setIsLoggedIn(!!currentUser);
  }, [currentUser]);

  // Data state
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const stored = localStorage.getItem('cautoo_vehicles_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return mockVehicles;
  });

  // Persistir veículos sempre que mudarem
  useEffect(() => {
    try {
      localStorage.setItem('cautoo_vehicles_v1', JSON.stringify(vehicles));
    } catch (e) { }
  }, [vehicles]);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [sentAlerts, setSentAlerts] = useState<SentAlert[]>(mockSentAlerts);
  const [sentCritiques, setSentCritiques] = useState<SentCritique[]>([
    { id: 'crit-1', targetPlate: 'AAA1B22', messageText: 'Condução perigosa detectada', createdAt: new Date().toISOString() },
    { id: 'crit-2', targetPlate: 'AAA1B22', messageText: 'Motorista agressivo no trânsito', createdAt: new Date().toISOString() }
  ]);
  const [praisesReceived, setPraisesReceived] = useState<Praise[]>(() => {
    // Gerar 55 elogios para a placa ABC1D23 para testar o status "Confiável"
    const praises: Praise[] = [...mockPraisesReceived];
    for (let i = 0; i < 55; i++) {
      praises.push({
        id: `praise-mock-${i}`,
        fromUserId: `user-mock-${i}`,
        toPlate: 'ABC1D23',
        praiseType: 'Direção segura',
        createdAt: new Date().toISOString()
      });
    }
    return praises;
  });
  const [praisesSent, setPraisesSent] = useState<Praise[]>(mockPraisesSent);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(mockFriendRequests);
  const [friends, setFriends] = useState<Friend[]>(mockFriends);

  // Global Alert Modal State
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: "",
    description: "",
    variant: "success"
  });

  const showAlert = useCallback((title: string, description: string, variant: "success" | "warning" | "error" | "info" = "success", highlightText?: string) => {
    setAlertModal({
      isOpen: true,
      title,
      description,
      variant,
      highlightText
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  }, []);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [transfers, setTransfers] = useState<PlateTransfer[]>(mockTransfers);
  const [claims, setClaims] = useState<PlateClaim[]>(mockClaims);
  const [referrals] = useState<Referral[]>(mockReferrals);
  const [stolenVehicles, setStolenVehicles] = useState<Vehicle[]>(mockStolenVehicles);

  // Frotas Cautoo - persistidas em localStorage
  const [userFleets, setUserFleets] = useState<CautooFleet[]>(() => {
    const stored = readStoredFleets();
    return stored || mockFleets;
  });

  // Registro Cautelar de Teste - Roberto Verde bateu na traseira
  const mockCautelarRegistry: CautelarRegistry = {
    id: 'cautelar-test-001',
    registryNumber: 'RC-2026.01.19.9999',
    creatorId: 'user-male-green-nonclient',
    creatorName: 'Roberto Verde',
    participants: [
      {
        id: 'part-1',
        plate: 'FFF5F55',
        userId: 'user-male-green-nonclient',
        userName: 'Roberto Verde',
        isRegistered: true,
        confirmed: true,
        confirmedAt: '2026-01-19T16:05:00Z',
        isResponsible: true
      },
      {
        id: 'part-2',
        plate: 'XYZ9K88',
        userId: 'user-other-001',
        userName: 'Carlos Souza',
        isRegistered: true,
        confirmed: true,
        confirmedAt: '2026-01-19T17:30:00Z',
        isResponsible: false
      }
    ],
    occurrenceType: 'colisao_traseira',
    occurrenceDate: '2026-01-19',
    occurrenceTime: '15:45',
    location: 'Av. Paulista, 1500 - Bela Vista, São Paulo',
    description: 'Colisão traseira no semáforo. O veículo FFF5F55 bateu na traseira do veículo XYZ9K88 quando o sinal fechou. Danos leves no para-choque traseiro.',
    status: 'resolvido_acordo',
    resolutionType: 'acordo',
    createdAt: '2026-01-19T16:00:00Z',
    resolvedAt: '2026-01-19T18:00:00Z',
    certificate: {
      id: 'cert-test-001',
      type: 'resolucao',
      registryNumber: 'RC-2026.01.19.9999',
      generatedAt: '2026-01-19T18:00:00Z',
      hash: 'KV7EGH0A4Y3LTZ37EIKCWZH9GMJX88I7',
      validationUrl: 'cautoo.app/validar/RC-2026.01.19.9999'
    }
  };

  // Registro Cautelar de Teste 2 - Em andamento (para testar resolução)
  const mockCautelarRegistry2: CautelarRegistry = {
    id: 'cautelar-test-002',
    registryNumber: 'RC-2026.01.19.8888',
    creatorId: 'user-male-green-nonclient',
    creatorName: 'Roberto Verde',
    participants: [
      {
        id: 'part-3',
        plate: 'FFF5F55',
        userId: 'user-male-green-nonclient',
        userName: 'Roberto Verde',
        isRegistered: true,
        confirmed: true,
        confirmedAt: '2026-01-19T14:00:00Z',
        isResponsible: true
      },
      {
        id: 'part-4',
        plate: 'ABC1D23',
        userId: 'user-other-002',
        userName: 'Maria Silva',
        isRegistered: true,
        confirmed: true,
        confirmedAt: '2026-01-19T14:30:00Z',
        isResponsible: false
      }
    ],
    occurrenceType: 'dano_estacionamento',
    occurrenceDate: '2026-01-19',
    occurrenceTime: '13:30',
    location: 'Shopping Iguatemi - Estacionamento G2, vaga 245',
    description: 'Ao manobrar para estacionar, o veículo FFF5F55 encostou no para-choque traseiro do veículo ABC1D23 causando arranhões na pintura.',
    status: 'em_andamento',
    createdAt: '2026-01-19T14:00:00Z'
  };

  // Registro Cautelar - persistido em localStorage
  const [cautelarRegistries, setCautelarRegistries] = useState<CautelarRegistry[]>(() => {
    try {
      const stored = localStorage.getItem('cautoo_cautelar_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Atualiza os mocks de teste
        const filtered = parsed.filter((r: CautelarRegistry) =>
          r.id !== 'cautelar-test-001' && r.id !== 'cautelar-test-002'
        );
        return [...filtered, mockCautelarRegistry, mockCautelarRegistry2];
      }
    } catch (e) { }
    return [mockCautelarRegistry, mockCautelarRegistry2];
  });

  useEffect(() => {
    try {
      localStorage.setItem('cautoo_cautelar_v1', JSON.stringify(cautelarRegistries));
    } catch (e) { }
  }, [cautelarRegistries]);

  // Solicitações de Contato - persistidas em localStorage
  const [contactRequests, setContactRequests] = useState<ContactRequest[]>(() => {
    try {
      const stored = localStorage.getItem('cautoo_contact_requests_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('cautoo_contact_requests_v1', JSON.stringify(contactRequests));
    } catch (e) { }
  }, [contactRequests]);

  // Alerta Solidário - persistido em localStorage
  const [solidaryAlerts, setSolidaryAlerts] = useState<SolidaryAlert[]>(() => {
    try {
      const stored = localStorage.getItem('cautoo_solidary_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('cautoo_solidary_v1', JSON.stringify(solidaryAlerts));
    } catch (e) { }
  }, [solidaryAlerts]);





  // 2. Coleção
  // const [collection, setCollection] = useState<import('@/types/skins').Collection>(() => {




  // 3. Mineração


  // 4. Onboarding






  // Reconciliar alertas quando o usuário loga - recarregar do localStorage para refletir rewards aplicados
  // Este efeito garante que após qualquer login/restore, os alertas estejam sincronizados
  const hasReconciledRef = useRef(false);

  useEffect(() => {
    if (!currentUser) {
      hasReconciledRef.current = false;
      return;
    }

    // Sempre recarregar do localStorage na primeira vez que currentUser está disponível
    // Isso captura as atualizações feitas por readStoredUser/applyPendingICCRewards
    if (!hasReconciledRef.current) {
      hasReconciledRef.current = true;

      try {
        const storedAlerts = localStorage.getItem('cautoo_solidary_v1');
        if (storedAlerts) {
          const alerts: SolidaryAlert[] = JSON.parse(storedAlerts);
          setSolidaryAlerts(alerts);
        }
      } catch (e) { }
    }
  }, [currentUser]);

  // Reset o flag quando o usuário deslogar para permitir reconciliação no próximo login
  useEffect(() => {
    if (!isLoggedIn) {
      hasReconciledRef.current = false;
    }
  }, [isLoggedIn]);

  // Escutar eventos de rewards aplicados para sincronizar state imediatamente
  useEffect(() => {
    const handleRewardsApplied = () => {
      try {
        const storedAlerts = localStorage.getItem('cautoo_solidary_v1');
        if (storedAlerts) {
          const alerts: SolidaryAlert[] = JSON.parse(storedAlerts);
          setSolidaryAlerts(alerts);
          console.log('Solidary alerts synchronized after reward application');
        }
      } catch (e) { }
    };

    window.addEventListener(REWARDS_APPLIED_EVENT, handleRewardsApplied);
    return () => window.removeEventListener(REWARDS_APPLIED_EVENT, handleRewardsApplied);
  }, []);

  // Persistir frotas
  useEffect(() => {
    try {
      localStorage.setItem(FLEETS_STORAGE_KEY, JSON.stringify(userFleets));
    } catch {
      // ignore
    }
  }, [userFleets]);

  // Auth actions
  const login = useCallback((cpf: string) => {
    const user = { ...mockCurrentUser, cpf };
    // Auto-gerar código de verificação se não existir
    if (!user.verificationCode) {
      user.verificationCode = generateVerificationCode();
      user.verificationCodeCreatedAt = new Date().toISOString();
    }
    setCurrentUser(prev => (prev?.cpf === cpf ? prev : user));
    setVehicles(mockVehicles);
    setIsLoggedIn(true);
  }, []);

  // Helper: Aplicar recompensas pendentes de ICC
  const applyPendingICCRewards = (user: User): User => {
    const pendingRewardsKey = 'cautoo_icc_rewards_v1';
    try {
      const existing = localStorage.getItem(pendingRewardsKey);
      if (!existing) return user;

      const rewards: { userId: string; amount: number; reason: string; date: string; alertId?: string }[] = JSON.parse(existing);
      const userRewards = rewards.filter(r => r.userId === user.id);

      if (userRewards.length === 0) return user;

      // Calcular bonus total de ICC
      const totalBonus = userRewards.reduce((sum, r) => sum + r.amount, 0);
      const newICC = Math.min(1000, user.icc + totalBonus);

      // Atualizar alertas correspondentes no localStorage
      const alertIds = userRewards.filter(r => r.alertId).map(r => r.alertId);
      if (alertIds.length > 0) {
        try {
          const storedAlerts = localStorage.getItem('cautoo_solidary_v1');
          if (storedAlerts) {
            const alerts: SolidaryAlert[] = JSON.parse(storedAlerts);
            const updatedAlerts = alerts.map(a => {
              if (alertIds.includes(a.id)) {
                return { ...a, iccRewardPending: false, iccRewardApplied: true };
              }
              return a;
            });
            localStorage.setItem('cautoo_solidary_v1', JSON.stringify(updatedAlerts));

            // Disparar evento para notificar componente
            window.dispatchEvent(new CustomEvent(REWARDS_APPLIED_EVENT, { detail: { alertIds } }));
          }
        } catch (e) { }
      }

      // Remover recompensas aplicadas
      const remainingRewards = rewards.filter(r => r.userId !== user.id);
      localStorage.setItem(pendingRewardsKey, JSON.stringify(remainingRewards));

      console.log(`ICC bonus applied: +${totalBonus} for user ${user.id}, alerts updated: ${alertIds.join(', ')}`);
      return { ...user, icc: newICC, ranking: getRankingFromICC(newICC) };
    } catch {
      return user;
    }
  };

  // Login com senha
  const loginWithPassword = useCallback((cpf: string, password: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '');

    // Verificar perfis de teste (todos usam senha 123456)
    const testCpfs = ['00000000000', '11111111111', '22222222222', '33333333333'];

    if (testCpfs.includes(cleanCpf)) {
      // Para CPFs de teste, verificar senha e carregar perfil correspondente
      if (password !== '123456') {
        return false; // Senha incorreta para perfil de teste
      }

      // Carregar perfil de teste baseado no CPF
      // Para simplificar, usamos o primeiro perfil de cada CPF de teste
      const testProfile = getTestProfile(cpf, cleanCpf.charAt(0).repeat(6));
      if (testProfile) {
        // Aplicar recompensas pendentes de ICC
        let userWithRewards = applyPendingICCRewards(testProfile.user);
        // Auto-gerar código de verificação se não existir
        if (!userWithRewards.verificationCode) {
          userWithRewards = {
            ...userWithRewards,
            verificationCode: generateVerificationCode(),
            verificationCodeCreatedAt: new Date().toISOString()
          };
        }
        setCurrentUser(userWithRewards);
        setVehicles(testProfile.vehicles);
        setIsLoggedIn(true);
        console.log('Test profile loaded:', userWithRewards.name);
        return true;
      }
    }

    // CPF normal - verificar se senha tem 6 dígitos
    if (password.length !== 6 || !/^\d{6}$/.test(password)) {
      return false;
    }

    // Login bem sucedido para novos usuários
    const newUser = { ...mockCurrentUser, cpf, password };
    let userWithRewards = applyPendingICCRewards(newUser);
    // Auto-gerar código de verificação se não existir
    if (!userWithRewards.verificationCode) {
      userWithRewards = {
        ...userWithRewards,
        verificationCode: generateVerificationCode(),
        verificationCodeCreatedAt: new Date().toISOString()
      };
    }
    setCurrentUser(userWithRewards);
    setVehicles(mockVehicles);
    setIsLoggedIn(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  }, []);

  const register = useCallback((data: { name: string; cpf: string; phone: string; email?: string; password: string; plate?: string; plateAlreadyRegistered?: boolean; ownershipType?: VehicleOwnershipType; subscriptionInfo?: VehicleSubscriptionInfo; insuranceInfo?: VehicleInsuranceInfo }) => {
    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name: data.name,
      cpf: data.cpf,
      phone: data.phone,
      email: data.email,
      password: data.password,
      icc: 100,
      ranking: 'Iniciante',
      referralCode: data.name.split(' ')[0].toUpperCase() + Date.now().toString().slice(-4),
      referralCount: 0,
      referralPoints: 0,
      usefulAlertsSent: 0,
      validCritiquesReceived: 0,
      realHelpsGiven: 0,
      confirmedAbuses: 0,
      positiveActionsLast90Days: 0,
      cauCashBalance: 150.00,
      isVerified: false,
      verificationCode: generateVerificationCode(),
      verificationCodeCreatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);

    // Se placa foi informada, criar veículo automaticamente
    if (data.plate && data.plate.length === 7) {
      // Encontrar o dono original se a placa já está registrada
      const existingVehicle = vehicles.find(v =>
        v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === data.plate.toUpperCase().replace(/[^A-Z0-9]/g, '')
      );

      const newVehicle: Vehicle = {
        id: `vehicle-${Date.now()}`,
        plate: data.plate.toUpperCase(),
        model: '',
        color: '',
        ownerId: userId,
        score: data.plateAlreadyRegistered ? 0 : 70, // Score zerado se em reivindicação
        hasCompleteInfo: false,
        hasActivePlan: false,
        isStolen: false,
        claimStatus: data.plateAlreadyRegistered ? 'pending' : 'none',
        originalOwnerId: data.plateAlreadyRegistered ? existingVehicle?.ownerId : undefined,
        createdAt: new Date().toISOString(),
        ownershipType: data.ownershipType || 'proprio',
        subscriptionInfo: data.subscriptionInfo,
        insuranceInfo: data.insuranceInfo,
      };
      setVehicles(prev => [...prev, newVehicle]);
    }
  }, [vehicles]);

  // Vehicle actions
  const addVehicle = useCallback((vehicleData: Omit<Vehicle, 'id' | 'ownerId' | 'score' | 'isStolen' | 'createdAt' | 'hasCompleteInfo'>) => {
    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      ...vehicleData,
      ownerId: currentUser?.id || '',
      score: 70,
      hasCompleteInfo: false,
      isStolen: false,
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
  }, [currentUser]);

  const updateVehicle = useCallback((id: string, data: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...data } : v));
  }, []);

  const markAsStolen = useCallback((id: string, info: { location: string; date: string; time: string }) => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    const stolenAlert: StolenAlertInfo = {
      activatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      renewalUsed: false,
      isActive: true,
    };

    setVehicles(prev => prev.map(v =>
      v.id === id
        ? { ...v, isStolen: true, stolenInfo: { ...info, sightings: [] }, stolenAlert }
        : v
    ));
  }, []);

  const markAsRecovered = useCallback((id: string) => {
    setVehicles(prev => prev.map(v =>
      v.id === id
        ? { ...v, isStolen: false, stolenInfo: undefined, stolenAlert: undefined }
        : v
    ));
  }, []);

  // Renovar alerta por +3 dias (gratuito, apenas 1x)
  const renewStolenAlert = useCallback((id: string): boolean => {
    const vehicle = vehicles.find(v => v.id === id);
    if (!vehicle?.stolenAlert || vehicle.stolenAlert.renewalUsed) {
      return false; // Já usou renovação
    }

    const currentExpires = new Date(vehicle.stolenAlert.expiresAt);
    const newExpires = new Date(currentExpires.getTime() + 3 * 24 * 60 * 60 * 1000); // +3 dias

    setVehicles(prev => prev.map(v =>
      v.id === id && v.stolenAlert
        ? {
          ...v,
          stolenAlert: {
            ...v.stolenAlert,
            expiresAt: newExpires.toISOString(),
            renewalUsed: true
          }
        }
        : v
    ));

    return true;
  }, [vehicles]);

  // Check if plate is already registered
  const isPlateRegistered = useCallback((plate: string): boolean => {
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return vehicles.some(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate);
  }, [vehicles]);

  // Check if user can send critique to a plate
  const canSendCritique = useCallback((plate: string): { canSend: boolean; reason: string } => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Max 3 críticas por placa em 30 dias
    const critiquesForPlate = sentCritiques.filter(c =>
      c.targetPlate.toUpperCase() === plate.toUpperCase() &&
      new Date(c.createdAt) > thirtyDaysAgo
    );
    if (critiquesForPlate.length >= 3) {
      return { canSend: false, reason: "Limite de 3 críticas por placa a cada 30 dias atingido" };
    }

    // Max 5 críticas por dia por usuário
    const critiquesToday = sentCritiques.filter(c => new Date(c.createdAt) > todayStart);
    if (critiquesToday.length >= 5) {
      return { canSend: false, reason: "Limite de 5 críticas por dia atingido" };
    }

    return { canSend: true, reason: "" };
  }, [sentCritiques]);

  // Alert actions
  const sendAlert = useCallback((plate: string, categoryId: string, categoryName: string, messageId: string, messageText: string) => {
    // Se for crítica de condução perigosa, salvar separadamente
    if (categoryId === "conducao-perigosa") {
      const newCritique: SentCritique = {
        id: `critique-${Date.now()}`,
        targetPlate: plate,
        messageText,
        createdAt: new Date().toISOString(),
      };
      setSentCritiques(prev => [newCritique, ...prev]);

      // Críticas impactam o score do veículo (-1 pt) e não alteram ICC
      setVehicles(prev => prev.map(v => {
        if (v.plate.toUpperCase() === plate.toUpperCase()) {
          const newScore = Math.max(0, (v.score || 500) - 1);
          const monthlyCritiques = (v.monthlyCritiques || 0) + 1;
          const hasTrustSeal = monthlyCritiques < 3; // Remove selo se 3+ críticas
          return {
            ...v,
            score: newScore,
            monthlyCritiques,
            hasTrustSeal
          };
        }
        return v;
      }));
    } else {
      const newSentAlert: SentAlert = {
        id: `sent-${Date.now()}`,
        targetPlate: plate,
        categoryId,
        categoryName,
        messageText,
        createdAt: new Date().toISOString(),
      };
      setSentAlerts(prev => [newSentAlert, ...prev]);

      // Incrementar ICC se logado (apenas para alertas normais)
      if (currentUser) {
        setCurrentUser(prev => prev ? {
          ...prev,
          icc: Math.min(1000, prev.icc + 2),
          ranking: getRankingFromICC(Math.min(1000, prev.icc + 2)),
        } : null);
      }
    }
  }, [currentUser]);

  const markAlertAsRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  }, []);

  // Praise actions
  const sendPraise = useCallback((plate: string, praiseType: string): boolean => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Max 3 elogios por placa em 30 dias
    const praisesForPlate = praisesSent.filter(p =>
      p.toPlate.toUpperCase() === plate.toUpperCase() &&
      new Date(p.createdAt) > thirtyDaysAgo
    );
    if (praisesForPlate.length >= 3) {
      return false;
    }

    // Max 5 elogios por dia
    const praisesToday = praisesSent.filter(p => new Date(p.createdAt) > todayStart);
    if (praisesToday.length >= 5) {
      return false;
    }

    const newPraise: Praise = {
      id: `praise-${Date.now()}`,
      fromUserId: currentUser?.id || '',
      toPlate: plate,
      praiseType,
      createdAt: new Date().toISOString(),
    };
    setPraisesSent(prev => [newPraise, ...prev]);

    // Incrementar ICC do remetente (+1 pt)
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        icc: Math.min(1000, prev.icc + 1),
        ranking: getRankingFromICC(Math.min(1000, prev.icc + 1)),
        positiveActionsLast90Days: prev.positiveActionsLast90Days + 1,
      } : null);
    }

    // Atualizar score do veículo alvo (+2 pts) e verificar selo "Condutor Colaborativo"
    setVehicles(prev => prev.map(v => {
      if (v.plate.toUpperCase() === plate.toUpperCase()) {
        const newScore = Math.min(1000, (v.score || 500) + 2);
        const monthlyPraises = (v.monthlyPraises || 0) + 1;
        const hasCollaborativeSeal = monthlyPraises >= 3;
        return {
          ...v,
          score: newScore,
          monthlyPraises,
          hasCollaborativeSeal
        };
      }
      return v;
    }));

    return true;
  }, [currentUser, praisesSent]);

  // Friend actions
  const sendFriendRequest = useCallback((toPlate: string) => {
    const newRequest: FriendRequest = {
      id: `fr-${Date.now()}`,
      fromUserId: currentUser?.id || '',
      fromUserName: currentUser?.name || '',
      fromPlate: vehicles[0]?.plate || '',
      toUserId: 'unknown',
      toPlate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setFriendRequests(prev => [newRequest, ...prev]);
  }, [currentUser, vehicles]);

  const respondToFriendRequest = useCallback((id: string, accept: boolean) => {
    setFriendRequests(prev => prev.map(fr =>
      fr.id === id ? { ...fr, status: accept ? 'accepted' : 'rejected' } : fr
    ));

    if (accept) {
      const request = friendRequests.find(fr => fr.id === id);
      if (request) {
        const newFriend: Friend = {
          id: `friend-${Date.now()}`,
          userId: request.fromUserId,
          userName: request.fromUserName,
          plate: request.fromPlate,
          hasBlueSeal: true,
          chatEnabled: true,
        };
        setFriends(prev => [newFriend, ...prev]);
      }
    }
  }, [friendRequests]);

  const sendChatMessage = useCallback((friendshipId: string, text: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      friendshipId,
      senderId: currentUser?.id || '',
      text: text.slice(0, 140),
      createdAt: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  // Transfer actions
  const initiateTransfer = useCallback((plateId: string, plate: string, toUserCpf: string) => {
    const newTransfer: PlateTransfer = {
      id: `transfer-${Date.now()}`,
      plateId,
      plate,
      fromUserId: currentUser?.id || '',
      fromUserName: currentUser?.name || '',
      toUserCpf,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setTransfers(prev => [newTransfer, ...prev]);
  }, [currentUser]);

  const respondToTransfer = useCallback((id: string, accept: boolean) => {
    setTransfers(prev => prev.map(t =>
      t.id === id ? { ...t, status: accept ? 'completed' : 'rejected' } : t
    ));

    if (accept) {
      const transfer = transfers.find(t => t.id === id);
      if (transfer) {
        setVehicles(prev => prev.filter(v => v.id !== transfer.plateId));
      }
    }
  }, [transfers]);

  // Claim actions
  const submitClaim = useCallback((plate: string, reason: string) => {
    const newClaim: PlateClaim = {
      id: `claim-${Date.now()}`,
      plate,
      claimantUserId: currentUser?.id || '',
      claimantName: currentUser?.name || '',
      claimantCpf: currentUser?.cpf || '',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setClaims(prev => [newClaim, ...prev]);
  }, [currentUser]);

  // Submit claim for a vehicle already in user's profile
  const submitVehicleClaim = useCallback((vehicleId: string, reason: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    // Create claim record
    const newClaim: PlateClaim = {
      id: `claim-${Date.now()}`,
      plate: vehicle.plate,
      claimantUserId: currentUser?.id || '',
      claimantName: currentUser?.name || '',
      claimantCpf: currentUser?.cpf || '',
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setClaims(prev => [newClaim, ...prev]);

    // Update vehicle claim status to pending
    setVehicles(prev => prev.map(v =>
      v.id === vehicleId ? { ...v, claimStatus: 'pending' as const } : v
    ));
  }, [currentUser, vehicles]);

  // Check if a vehicle is blocked (pending claim)
  const isVehicleBlockedFn = useCallback((vehicleId: string): boolean => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle?.claimStatus === 'pending';
  }, [vehicles]);

  // Sighting action
  const reportSighting = useCallback((plateId: string, location: string, date: string, time: string) => {
    setStolenVehicles(prev => prev.map(v => {
      if (v.id === plateId && v.stolenInfo) {
        return {
          ...v,
          stolenInfo: {
            ...v.stolenInfo,
            sightings: [
              ...v.stolenInfo.sightings,
              {
                id: `sighting-${Date.now()}`,
                reporterId: currentUser?.id || '',
                reporterName: currentUser?.name || '',
                location,
                date,
                time,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        };
      }
      return v;
    }));

    // Incrementar ICC
    if (currentUser) {
      setCurrentUser(prev => prev ? {
        ...prev,
        icc: Math.min(1000, prev.icc + 10),
        ranking: getRankingFromICC(Math.min(1000, prev.icc + 10)),
      } : null);
    }
  }, [currentUser]);

  // User profile actions
  const updateUserProfile = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => prev ? { ...prev, ...data } : null);
  }, []);

  // Verification Code Management
  const generateNewVerificationCode = useCallback((): string => {
    const newCode = generateVerificationCode(6);
    const now = new Date().toISOString();
    setCurrentUser(prev => prev ? {
      ...prev,
      verificationCode: newCode,
      verificationCodeCreatedAt: now
    } : null);
    return newCode;
  }, []);

  const validateVerificationCode = useCallback((inputCode: string): boolean => {
    if (!currentUser?.verificationCode) return false;
    return verifyCode(inputCode, currentUser.verificationCode);
  }, [currentUser]);

  const rotateVerificationCode = useCallback((): string => {
    const newCode = generateVerificationCode(6);
    const now = new Date().toISOString();
    setCurrentUser(prev => prev ? {
      ...prev,
      verificationCode: newCode,
      verificationCodeCreatedAt: now
    } : null);
    return newCode;
  }, []);

  // Verificar se selo verificado está expirado
  const isVerifiedSealExpiredFn = useCallback((): boolean => {
    if (!currentUser?.verifiedExpiresAt) return true;
    return new Date(currentUser.verifiedExpiresAt) < new Date();
  }, [currentUser]);

  // Verificar se pode ativar selo gratuito (cliente Cautoo + primeira vez)
  const canActivateFreeSealFn = useCallback((): boolean => {
    if (!currentUser) return false;
    return (
      currentUser.isCautooClient === true &&
      !currentUser.verifiedFreeActivationUsed &&
      !currentUser.isVerified
    );
  }, [currentUser]);

  const [cauCashBalance, setCauCashBalance] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('cautoo_caucash_balance_v1');
      if (stored) return JSON.parse(stored);
      const storedUser = readStoredUser();
      if (storedUser?.cauCashBalance !== undefined) return storedUser.cauCashBalance;
    } catch (e) { }
    return 150.00;
  });

  // Ref para manter valor atual do saldo (resolve problema de closure)
  const cauCashBalanceRef = useRef(cauCashBalance);
  useEffect(() => {
    cauCashBalanceRef.current = cauCashBalance;
  }, [cauCashBalance]);

  // Refs para tracking de operações em andamento (previne double-spend sem depender do batching do React)
  const fleetSealPurchaseInProgressRef = useRef<Set<string>>(new Set());
  const fleetAssistancePurchaseInProgressRef = useRef<Set<string>>(new Set());

  const [cauCashTransactions, setCauCashTransactions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('cautoo_caucash_transactions_v1');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return [
      { id: '1', type: 'credit', amount: 150.00, description: 'Recarga Inicial', date: new Date().toISOString(), category: 'Recarga' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cautoo_caucash_balance_v1', JSON.stringify(cauCashBalance));
  }, [cauCashBalance]);

  useEffect(() => {
    localStorage.setItem('cautoo_caucash_transactions_v1', JSON.stringify(cauCashTransactions));
  }, [cauCashTransactions]);

  const addTransaction = useCallback((data: { type: 'credit' | 'debit', amount: number, description: string, category: string }) => {
    const newTransaction = {
      id: `trans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      date: new Date().toISOString()
    };

    setCauCashTransactions(prev => [newTransaction, ...prev]);
    setCauCashBalance(prev => {
      const newBalance = data.type === 'credit' ? prev + data.amount : prev - data.amount;
      return newBalance;
    });

    setCurrentUser(prev => prev ? {
      ...prev,
      cauCashBalance: data.type === 'credit' ? (prev.cauCashBalance || 0) + data.amount : (prev.cauCashBalance || 0) - data.amount
    } : null);
  }, []);

  const resetCauCashBalance = useCallback(() => {
    setCauCashBalance(0);
    cauCashBalanceRef.current = 0;
    setCauCashTransactions([]);
    setCurrentUser(prev => prev ? { ...prev, cauCashBalance: 0 } : null);
  }, []);

  // Função para obter saldo atualizado de forma síncrona (evita problemas de stale state)
  const getCurrentCauCashBalance = useCallback((): number => {
    return cauCashBalanceRef.current;
  }, []);

  const purchaseVerifiedSeal = useCallback((isFreeActivation: boolean = false, skipDebit: boolean = false) => {
    // Se não for gratuito e não pular débito, debitar do cauCashBalance
    if (!isFreeActivation && !skipDebit) {
      if (cauCashBalanceRef.current < 50) {
        return;
      }
      addTransaction({
        type: 'debit',
        amount: 50.00,
        description: 'Aquisição de Selo Verificado',
        category: 'Selo'
      });
    }

    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    setCurrentUser(prev => {
      const baseUser = prev ?? { ...mockCurrentUser, isVerified: false };
      return {
        ...baseUser,
        isVerified: true,
        verifiedAt: new Date().toISOString(),
        verifiedExpiresAt: expiresAt.toISOString(),
        verifiedFreeActivationUsed: isFreeActivation ? true : baseUser.verifiedFreeActivationUsed,
        seal: 'blue' as SealType,
      };
    });
    setIsLoggedIn(true);
  }, [addTransaction]);

  const purchasePlateInfo = useCallback((vehicleId: string, skipBalanceCheck?: boolean) => {
    if (!skipBalanceCheck && cauCashBalanceRef.current < 25) return;
    addTransaction({
      type: 'debit',
      amount: 25.00,
      description: 'Consulta de Informações Completas',
      category: 'Veículos'
    });

    setVehicles(prev => {
      const updated = prev.map(v => v.id === vehicleId ? { ...v, hasCompleteInfo: true } : v);
      localStorage.setItem('cautoo_vehicles_v1', JSON.stringify(updated));
      return updated;
    });
  }, [addTransaction]);

  const addAdditionalPlate = useCallback((vehicleData: Omit<Vehicle, 'id' | 'ownerId' | 'score' | 'isStolen' | 'createdAt' | 'hasCompleteInfo'>, isAdditional?: boolean) => {
    // Se for placa adicional (não a primeira), cobrar R$5
    if (isAdditional) {
      const cost = 5.00;
      if (cauCashBalanceRef.current < cost) return;
      addTransaction({
        type: 'debit',
        amount: cost,
        description: `Placa Adicional: ${vehicleData.plate}`,
        category: 'Veículos'
      });
    }

    const newVehicle: Vehicle = {
      id: `vehicle-${Date.now()}`,
      ...vehicleData,
      ownerId: currentUser?.id || '',
      score: 70,
      hasCompleteInfo: false,
      isStolen: false,
      createdAt: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
  }, [currentUser, addTransaction]);

  const payForStolenAlert = useCallback((plate: string): boolean => {
    console.log('[DEBUG payForStolenAlert] plate:', plate);
    console.log('[DEBUG payForStolenAlert] cauCashBalanceRef.current:', cauCashBalanceRef.current);
    if (cauCashBalanceRef.current < 10) {
      console.log('[DEBUG payForStolenAlert] SALDO INSUFICIENTE - retornando false');
      return false;
    }
    console.log('[DEBUG payForStolenAlert] Saldo OK, processando...');
    addTransaction({
      type: 'debit',
      amount: 10.00,
      description: `Alerta de roubo - Placa: ${plate}`,
      category: 'Segurança'
    });
    return true;
  }, [addTransaction]);

  const reactivateStolenAlert = useCallback((id: string) => {
    if (cauCashBalanceRef.current < 10) return;
    addTransaction({
      type: 'debit',
      amount: 10.00,
      description: 'Reativação de Alerta de Roubo',
      category: 'Segurança'
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setVehicles(prev => prev.map(v =>
      v.id === id
        ? {
          ...v,
          isStolen: true,
          stolenAlert: {
            activatedAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            renewalUsed: false,
            isActive: true,
          }
        }
        : v
    ));
  }, [addTransaction]);

  // ===== SKINS & COLEÇÃO (LÓGICA - POSIÇÃO CORRETA) =====

  // 1. Cores Livres
  const [selectedColor, setSelectedColor] = useState<string>(() => {
    try {
      return localStorage.getItem('skins_selected_color') || '#2563EB';
    } catch { return '#2563EB'; }
  });

  useEffect(() => {
    localStorage.setItem('skins_selected_color', selectedColor);
  }, [selectedColor]);

  // 2. Coleção
  const [collection, setCollection] = useState<import('@/types/skins').Collection>(() => {
    try {
      const stored = localStorage.getItem('skins_collection_v2');
      if (stored) return JSON.parse(stored);
      // Fallback para inicial
      return INITIAL_COLLECTION;
    } catch {
      return INITIAL_COLLECTION;
    }
  });

  useEffect(() => {
    localStorage.setItem('skins_collection_v2', JSON.stringify(collection));
  }, [collection]);

  // 3. Mineração
  const [miningState, setMiningState] = useState<import('@/types/skins').MiningState>(() => {
    try {
      const stored = localStorage.getItem('skins_mining_v2');
      if (stored) return JSON.parse(stored);
      return INITIAL_MINING;
    } catch {
      return INITIAL_MINING;
    }
  });

  useEffect(() => {
    localStorage.setItem('skins_mining_v2', JSON.stringify(miningState));
  }, [miningState]);

  // 4. Onboarding
  const [skinsOnboardingCompleted, setSkinsOnboardingCompleted] = useState<boolean>(() => {
    return localStorage.getItem('skins_onboarding_completed') === 'true';
  });

  const completeSkinsOnboarding = useCallback(() => {
    setSkinsOnboardingCompleted(true);
    localStorage.setItem('skins_onboarding_completed', 'true');
  }, []);

  // Helpers
  const getSkinById = useCallback((id: number) => {
    if (getSkinByIdMock) return getSkinByIdMock(id);
    return undefined;
  }, []);

  const getSkinsByCategory = useCallback((categoryId: import('@/types/skins').SkinCategoryId) => {
    if (getCategoryByIdMock) {
      const cat = getCategoryByIdMock(categoryId);
      return cat ? cat.skins : [];
    }
    return [];
  }, []);

  // Actions
  const buySkinLayout = useCallback((skinId: number) => {
    const skin = getSkinById(skinId);
    if (!skin) return { success: false, message: 'Skin não encontrada' };

    // IMPORTANTE: cauCashBalance já existe neste escopo agora
    if (cauCashBalance < skin.layoutCost) {
      return { success: false, message: `Saldo insuficiente. Necessário: R$ ${skin.layoutCost}` };
    }

    addTransaction({
      type: 'debit',
      amount: skin.layoutCost,
      description: `Compra layout: ${skin.name}`,
      category: 'compra_layout'
    });

    setCollection(prev => ({
      ...prev,
      ownedSkins: [...prev.ownedSkins, skinId]
    }));

    return { success: true, message: `Layout adquirida!` };
  }, [cauCashBalance, addTransaction, getSkinById]);

  const sellSkin = useCallback((skinId: number, price: number) => {
    // Mock simples de venda
    const skin = getSkinById(skinId);
    if (!skin) return { success: false, message: 'Erro ao vender' };

    // 85% para vendedor (mock)
    const amount = price * 0.85;
    addTransaction({
      type: 'credit',
      amount,
      description: `Venda skin: ${skin.name}`,
      category: 'venda_skin'
    });

    setCollection(prev => ({
      ...prev,
      ownedSkins: prev.ownedSkins.filter(id => id !== skinId)
    }));

    return { success: true, message: `Venda realizada! +R$ ${amount.toFixed(2)}` };
  }, [addTransaction, getSkinById]);

  const mineSkin = useCallback((code: string) => {
    // Lógica simplificada de mineração
    if (miningState.attemptsThisWeek <= 0) {
      return { success: false, message: 'Sem tentativas restantes esta semana.' };
    }

    setMiningState(prev => ({
      ...prev,
      attemptsThisWeek: prev.attemptsThisWeek - 1
    }));

    // Simulação de acerto (hardcoded para testes: se código começar com "WIN")
    if (code.toUpperCase().startsWith('WIN')) {
      return { success: true, message: 'VOCÊ MINEROU UM PRÊMIO!' };
    }

    return { success: false, message: 'Código incorreto. Tente novamente.' };
  }, [miningState]);

  const linkSkinToPlate = useCallback((skinId: number, plateId: string) => {
    return { success: true, message: 'Skin vinculada com sucesso (Mock)' };
  }, []);

  // Help Requests (Socorro)
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);

  const addHelpRequest = useCallback((data: Omit<HelpRequest, 'id' | 'userId' | 'userCpf' | 'status'>) => {
    const newRequest: HelpRequest = {
      id: `help-${Date.now()}`,
      ...data,
      userId: currentUser?.id || '',
      userCpf: currentUser?.cpf || '',
      status: 'pending',
    };
    setHelpRequests(prev => [...prev, newRequest]);
    console.log('Help Request registered (Admin mock):', newRequest);
  }, [currentUser]);

  // Green Seal Free Call - Marcar chamado gratuito como usado
  const useGreenSealCall = useCallback(() => {
    setCurrentUser(prev => prev ? {
      ...prev,
      hasUsedGreenSealCall: true,
      greenSealCallUsedAt: new Date().toISOString(),
    } : null);
    console.log('Green Seal free call used');
  }, []);

  // Verificar se usuário tem chamado gratuito disponível
  const hasGreenSealFreeCall = useCallback((): boolean => {
    if (!currentUser) return false;
    return currentUser.seal === 'green' && !currentUser.hasUsedGreenSealCall;
  }, [currentUser]);

  // Green Seal Free Stolen Alerts - Marcar alerta de roubo gratuito como usado
  const useGreenSealStolenAlert = useCallback(() => {
    setCurrentUser(prev => {
      if (!prev) return null;
      const currentUsed = prev.greenSealStolenAlertsUsed || 0;
      return {
        ...prev,
        greenSealStolenAlertsUsed: currentUsed + 1,
      };
    });
    console.log('Green Seal free stolen alert used');
  }, []);

  // Verificar se usuário tem alerta de roubo gratuito disponível (máximo 2)
  const hasGreenSealFreeStolenAlert = useCallback((): boolean => {
    if (!currentUser) return false;
    if (currentUser.seal !== 'green') return false;
    const used = currentUser.greenSealStolenAlertsUsed || 0;
    return used < 2;
  }, [currentUser]);

  // Obter quantidade de alertas de roubo gratuitos restantes
  const getGreenSealStolenAlertsRemaining = useCallback((): number => {
    if (!currentUser || currentUser.seal !== 'green') return 0;
    const used = currentUser.greenSealStolenAlertsUsed || 0;
    return Math.max(0, 2 - used);
  }, [currentUser]);

  // ====== FUNÇÕES DE FROTAS ======

  // Criar nova frota
  const createFleet = useCallback((name: string, description?: string): CautooFleet => {
    const newFleet: CautooFleet = {
      id: `fleet-${Date.now()}`,
      name,
      description,
      creatorId: currentUser?.id || '',
      creatorName: currentUser?.name || '',
      adminIds: [],
      members: [],
      invites: [],
      assistances: [],
      isVerified: false,
      chatMessages: [],
      helpRequests: [],
      createdAt: new Date().toISOString(),
    };
    setUserFleets(prev => [...prev, newFleet]);
    return newFleet;
  }, [currentUser]);

  // Deletar frota (apenas o criador pode deletar)
  const deleteFleet = useCallback((fleetId: string) => {
    setUserFleets(prev => prev.filter(f => f.id !== fleetId));
  }, []);

  // Atualizar frota
  const updateFleet = useCallback((fleetId: string, updates: Partial<CautooFleet>) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, ...updates } : f
    ));
  }, []);

  // Adicionar membro à frota
  const addFleetMember = useCallback((fleetId: string, member: FleetMember) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, members: [...f.members, member] } : f
    ));
  }, []);

  // Remover membro da frota
  const removeFleetMember = useCallback((fleetId: string, memberId: string) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, members: f.members.filter(m => m.id !== memberId) } : f
    ));
  }, []);

  // Enviar mensagem no chat da frota
  const sendFleetChatMessage = useCallback((fleetId: string, text: string, type: 'message' | 'help_request' | 'system' = 'message', helpRequestId?: string) => {
    const newMessage: FleetChatMessage = {
      id: `msg-${Date.now()}`,
      fleetId,
      senderId: currentUser?.id || '',
      senderName: currentUser?.name || '',
      text,
      type,
      helpRequestId,
      createdAt: new Date().toISOString(),
    };
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, chatMessages: [...f.chatMessages, newMessage] } : f
    ));
  }, [currentUser]);

  // Adicionar solicitação de socorro
  const addFleetHelpRequest = useCallback((fleetId: string, helpRequest: FleetHelpRequest) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, helpRequests: [...f.helpRequests, helpRequest] } : f
    ));
  }, []);

  // Atualizar solicitação de socorro
  const updateFleetHelpRequest = useCallback((fleetId: string, helpRequestId: string, updates: Partial<FleetHelpRequest>) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId
        ? { ...f, helpRequests: f.helpRequests.map(hr => hr.id === helpRequestId ? { ...hr, ...updates } : hr) }
        : f
    ));
  }, []);

  // ====== CONVITES DE FROTA ======

  // Enviar convite para uma placa participar da frota
  const sendFleetInvite = useCallback((fleetId: string, plate: string): FleetInvite => {
    const fleet = userFleets.find(f => f.id === fleetId);
    const newInvite: FleetInvite = {
      id: `invite-${Date.now()}`,
      fleetId,
      fleetName: fleet?.name || '',
      plate: plate.toUpperCase(),
      invitedBy: currentUser?.id || '',
      invitedByName: currentUser?.name || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setUserFleets(prev => prev.map(f =>
      f.id === fleetId ? { ...f, invites: [...f.invites, newInvite] } : f
    ));

    return newInvite;
  }, [currentUser, userFleets]);

  // Cancelar convite (admin)
  const cancelFleetInvite = useCallback((fleetId: string, inviteId: string) => {
    setUserFleets(prev => prev.map(f =>
      f.id === fleetId
        ? { ...f, invites: f.invites.map(inv => inv.id === inviteId ? { ...inv, status: 'cancelled' as const, respondedAt: new Date().toISOString() } : inv) }
        : f
    ));
  }, []);

  // Responder ao convite (aceitar/recusar)
  const respondToFleetInvite = useCallback((fleetId: string, inviteId: string, accept: boolean) => {
    setUserFleets(prev => prev.map(f => {
      if (f.id !== fleetId) return f;

      const invite = f.invites.find(inv => inv.id === inviteId);
      if (!invite) return f;

      // Atualizar status do convite
      const updatedInvites = f.invites.map(inv =>
        inv.id === inviteId
          ? { ...inv, status: (accept ? 'accepted' : 'rejected') as 'accepted' | 'rejected', respondedAt: new Date().toISOString() }
          : inv
      );

      // Se aceitar, adicionar como membro
      if (accept) {
        const newMember: FleetMember = {
          id: `fm-${Date.now()}`,
          plate: invite.plate,
          model: 'Veículo',
          color: 'N/A',
          ownerId: currentUser?.id || '',
          ownerName: currentUser?.name || '',
          joinedAt: new Date().toISOString(),
        };

        // Mensagem no chat
        const joinMessage: FleetChatMessage = {
          id: `msg-${Date.now()}`,
          fleetId,
          senderId: 'system',
          senderName: 'Sistema',
          text: `🎉 ${invite.plate} aceitou o convite e entrou na frota!`,
          type: 'system',
          createdAt: new Date().toISOString(),
        };

        return {
          ...f,
          invites: updatedInvites,
          members: [...f.members, newMember],
          chatMessages: [...f.chatMessages, joinMessage],
        };
      }

      return { ...f, invites: updatedInvites };
    }));
  }, [currentUser]);

  // Obter convites pendentes para o usuário (baseado nas placas dele)
  const getFleetInvitesForUser = useCallback((): FleetInvite[] => {
    const userPlatesList = vehicles.map(v => v.plate.toUpperCase());
    const allInvites: FleetInvite[] = [];

    userFleets.forEach(fleet => {
      fleet.invites
        .filter(inv => inv.status === 'pending' && userPlatesList.includes(inv.plate.toUpperCase()))
        .forEach(inv => allInvites.push(inv));
    });

    // Também verificar frotas que o usuário NÃO é membro (convites de outras frotas)
    // Para isso, precisamos buscar em todas as frotas
    return allInvites;
  }, [vehicles, userFleets]);

  // Compra de Selo de Frota Verificada (R$50) - ATÔMICA com guards de concorrência via refs
  const purchaseFleetVerifiedSeal = useCallback((fleetId: string): { success: boolean; message: string } => {
    const SEAL_PRICE = 50;

    // Guard de concorrência: verificar se já há operação em andamento para esta frota
    if (fleetSealPurchaseInProgressRef.current.has(fleetId)) {
      return { success: false, message: 'Operação em andamento' };
    }

    // Marcar operação como em andamento (sincronamente, antes de qualquer outro check)
    fleetSealPurchaseInProgressRef.current.add(fleetId);

    // Verificar se a frota existe
    const fleet = userFleets.find(f => f.id === fleetId);
    if (!fleet) {
      fleetSealPurchaseInProgressRef.current.delete(fleetId);
      return { success: false, message: 'Frota não encontrada' };
    }

    // Guard de idempotência: verificar se já possui selo válido
    if (fleet.isVerified && fleet.verifiedExpiresAt) {
      const expiryDate = new Date(fleet.verifiedExpiresAt);
      if (expiryDate > new Date()) {
        fleetSealPurchaseInProgressRef.current.delete(fleetId);
        return { success: false, message: 'Frota já possui selo verificado válido' };
      }
    }

    // Usar cauCashBalanceRef para garantir saldo atualizado
    if (cauCashBalanceRef.current < SEAL_PRICE) {
      fleetSealPurchaseInProgressRef.current.delete(fleetId);
      return { success: false, message: 'Saldo CauCash insuficiente' };
    }

    // Atualizar ref imediatamente para prevenir double-spend
    cauCashBalanceRef.current -= SEAL_PRICE;

    // Debitar do CauCash
    addTransaction({
      type: 'debit',
      amount: SEAL_PRICE,
      description: `Selo Frota Verificada - ${fleet.name}`,
      category: 'Frota'
    });

    // Atualizar frota atomicamente (dentro da mesma operação)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    setUserFleets(prev => prev.map(f =>
      f.id === fleetId
        ? { ...f, isVerified: true, verifiedAt: new Date().toISOString(), verifiedExpiresAt: expiresAt.toISOString() }
        : f
    ));

    // Manter no set por 1 segundo para prevenir cliques duplos rápidos após sucesso
    setTimeout(() => {
      fleetSealPurchaseInProgressRef.current.delete(fleetId);
    }, 1000);

    return { success: true, message: 'Selo adquirido com sucesso!' };
  }, [userFleets, addTransaction]);

  // Compra de Assistência para Frota (valor variável) - ATÔMICA com guards de concorrência via refs
  const purchaseFleetAssistance = useCallback((fleetId: string, totalPrice: number, description: string, assistanceData?: FleetAssistance): { success: boolean; message: string } => {
    // Guard de concorrência: verificar se já há operação em andamento para esta frota
    if (fleetAssistancePurchaseInProgressRef.current.has(fleetId)) {
      return { success: false, message: 'Operação em andamento' };
    }

    // Marcar operação como em andamento (sincronamente, antes de qualquer outro check)
    fleetAssistancePurchaseInProgressRef.current.add(fleetId);

    // Verificar se a frota existe
    const fleet = userFleets.find(f => f.id === fleetId);
    if (!fleet) {
      fleetAssistancePurchaseInProgressRef.current.delete(fleetId);
      return { success: false, message: 'Frota não encontrada' };
    }

    // Guard de idempotência: verificar se já existe assistência com o mesmo ID
    if (assistanceData) {
      const existingAssistance = fleet.assistances.find(a => a.id === assistanceData.id);
      if (existingAssistance) {
        fleetAssistancePurchaseInProgressRef.current.delete(fleetId);
        return { success: false, message: 'Assistência já contratada' };
      }
    }

    // Usar cauCashBalanceRef para garantir saldo atualizado
    if (cauCashBalanceRef.current < totalPrice) {
      fleetAssistancePurchaseInProgressRef.current.delete(fleetId);
      return { success: false, message: 'Saldo CauCash insuficiente' };
    }

    // Atualizar ref imediatamente para prevenir double-spend
    cauCashBalanceRef.current -= totalPrice;

    // Debitar do CauCash
    addTransaction({
      type: 'debit',
      amount: totalPrice,
      description,
      category: 'Frota'
    });

    // Atualizar frota com assistência atomicamente (se dados fornecidos)
    if (assistanceData) {
      setUserFleets(prev => prev.map(f =>
        f.id === fleetId
          ? { ...f, assistances: [...f.assistances, assistanceData] }
          : f
      ));
    }

    // Manter no set por 1 segundo para prevenir cliques duplos rápidos após sucesso
    setTimeout(() => {
      fleetAssistancePurchaseInProgressRef.current.delete(fleetId);
    }, 1000);

    return { success: true, message: 'Assistência contratada com sucesso!' };
  }, [userFleets, addTransaction]);

  // ===== REGISTRO CAUTELAR =====

  const createCautelarRegistry = useCallback((data: {
    plates: string[];
    occurrenceType: CautelarOccurrenceType;
    occurrenceDate: string;
    occurrenceTime: string;
    location: string;
    description: string;
  }): CautelarRegistry => {
    const registryNumber = generateRegistryNumber();
    const id = `cautelar_${Date.now()}`;

    const participants: CautelarParticipant[] = data.plates.map((plate, index) => {
      const vehicle = vehicles.find(v => v.plate.toUpperCase() === plate.toUpperCase());
      const isCreatorPlate = index === 0;

      return {
        id: `part_${Date.now()}_${index}`,
        plate: plate.toUpperCase(),
        userId: vehicle?.ownerId,
        userName: isCreatorPlate ? currentUser?.name : undefined,
        isRegistered: !!vehicle,
        confirmed: isCreatorPlate,
        confirmedAt: isCreatorPlate ? new Date().toISOString() : undefined,
        inviteLink: !vehicle ? `cautoo.app/convite/${registryNumber}/${plate.toUpperCase()}` : undefined,
      };
    });

    const newRegistry: CautelarRegistry = {
      id,
      registryNumber,
      creatorId: currentUser?.id || '',
      creatorName: currentUser?.name || '',
      participants,
      occurrenceType: data.occurrenceType,
      occurrenceDate: data.occurrenceDate,
      occurrenceTime: data.occurrenceTime,
      location: data.location,
      description: data.description,
      status: 'aguardando_confirmacao',
      createdAt: new Date().toISOString(),
    };

    setCautelarRegistries(prev => [newRegistry, ...prev]);
    return newRegistry;
  }, [vehicles, currentUser]);

  const confirmCautelarParticipation = useCallback((registryId: string, participantId: string) => {
    setCautelarRegistries(prev => prev.map(reg => {
      if (reg.id !== registryId) return reg;

      const updatedParticipants = reg.participants.map(p =>
        p.id === participantId ? { ...p, confirmed: true, confirmedAt: new Date().toISOString() } : p
      );

      const allConfirmed = updatedParticipants.filter(p => p.confirmed).length >= 2;

      return {
        ...reg,
        participants: updatedParticipants,
        status: allConfirmed ? 'em_andamento' : reg.status,
      };
    }));
  }, []);

  const resolveCautelarRegistry = useCallback((registryId: string, resolutionType: CautelarResolutionType) => {
    setCautelarRegistries(prev => prev.map(reg => {
      if (reg.id !== registryId) return reg;

      let newStatus: CautelarRegistryStatus;
      let certificateType: 'resolucao' | 'mediacao' | 'pendente';

      switch (resolutionType) {
        case 'acordo':
          newStatus = 'resolvido_acordo';
          certificateType = 'resolucao';
          break;
        case 'sem_resolucao':
          newStatus = 'sem_resolucao';
          certificateType = 'pendente';
          break;
        case 'mediacao':
          newStatus = 'mediacao_pendente';
          certificateType = 'mediacao';
          break;
      }

      const shouldGenerateCertificate = resolutionType !== 'mediacao';

      return {
        ...reg,
        status: newStatus,
        resolutionType,
        resolvedAt: new Date().toISOString(),
        certificate: shouldGenerateCertificate ? {
          id: `cert_${Date.now()}`,
          type: certificateType,
          registryNumber: reg.registryNumber,
          generatedAt: new Date().toISOString(),
          hash: generateCertificateHash(),
          validationUrl: `cautoo.app/validar/${reg.registryNumber}`,
        } : undefined,
      };
    }));

    // Impactos no score e ICC
    if (currentUser) {
      if (resolutionType === 'acordo') {
        setCurrentUser(prev => prev ? { ...prev, icc: Math.min(1000, prev.icc + 1) } : null);
        vehicles.forEach(v => {
          if (v.ownerId === currentUser.id) {
            setVehicles(prev => prev.map(veh =>
              veh.id === v.id ? { ...veh, score: Math.min(1000, veh.score + 2) } : veh
            ));
          }
        });
      } else if (resolutionType === 'sem_resolucao') {
        setCurrentUser(prev => prev ? { ...prev, icc: Math.max(0, prev.icc - 2) } : null);
        vehicles.forEach(v => {
          if (v.ownerId === currentUser.id) {
            setVehicles(prev => prev.map(veh =>
              veh.id === v.id ? { ...veh, score: Math.max(0, veh.score - 3) } : veh
            ));
          }
        });
      }
    }
  }, [currentUser, vehicles]);

  const addCautelarDamage = useCallback((registryId: string, damage: CautelarDamage) => {
    setCautelarRegistries(prev => prev.map(reg => {
      if (reg.id !== registryId) return reg;
      return { ...reg, damage, status: 'mediacao_pagamento' as CautelarRegistryStatus };
    }));
  }, []);

  const payMediationInstallment = useCallback((registryId: string): boolean => {
    const registry = cautelarRegistries.find(r => r.id === registryId);
    if (!registry?.damage) return false;

    const installmentValue = registry.damage.value / registry.damage.installments;

    if (cauCashBalanceRef.current < installmentValue) return false;

    cauCashBalanceRef.current -= installmentValue;
    addTransaction({
      type: 'debit',
      amount: installmentValue,
      description: `Mediação Cautelar - Parcela ${registry.damage.paidInstallments + 1}/${registry.damage.installments}`,
      category: 'Mediação'
    });

    setCautelarRegistries(prev => prev.map(reg => {
      if (reg.id !== registryId || !reg.damage) return reg;

      const newPaidInstallments = reg.damage.paidInstallments + 1;
      const isFullyPaid = newPaidInstallments >= reg.damage.installments;

      return {
        ...reg,
        damage: { ...reg.damage, paidInstallments: newPaidInstallments },
        status: isFullyPaid ? 'mediacao_concluida' : reg.status,
        resolvedAt: isFullyPaid ? new Date().toISOString() : reg.resolvedAt,
        certificate: isFullyPaid ? {
          id: `cert_${Date.now()}`,
          type: 'mediacao',
          registryNumber: reg.registryNumber,
          generatedAt: new Date().toISOString(),
          hash: generateCertificateHash(),
          validationUrl: `cautoo.app/validar/${reg.registryNumber}`,
        } : reg.certificate,
      };
    }));

    // Impactos positivos ao pagar parcela
    if (currentUser) {
      setCurrentUser(prev => prev ? { ...prev, icc: Math.min(1000, prev.icc + 2) } : null);
      vehicles.forEach(v => {
        if (v.ownerId === currentUser.id) {
          setVehicles(prev => prev.map(veh =>
            veh.id === v.id ? { ...veh, score: Math.min(1000, veh.score + 3) } : veh
          ));
        }
      });
    }

    return true;
  }, [cautelarRegistries, addTransaction, currentUser, vehicles]);

  const getCautelarRegistriesForUser = useCallback((): CautelarRegistry[] => {
    if (!currentUser) return [];

    return cautelarRegistries.filter(reg => {
      if (reg.creatorId === currentUser.id) return true;
      return reg.participants.some(p => p.userId === currentUser.id);
    });
  }, [cautelarRegistries, currentUser]);

  // Solicitações de Contato
  const getVehicleByPlate = useCallback((plate: string): Vehicle | undefined => {
    const allVehicles = [...vehicles, ...stolenVehicles];
    return allVehicles.find(v => v.plate === plate);
  }, [vehicles, stolenVehicles]);

  const sendContactRequest = useCallback((toPlate: string, reason: string): boolean => {
    if (!currentUser || vehicles.length === 0) return false;

    const fromPlate = vehicles[0].plate;
    const targetVehicle = getVehicleByPlate(toPlate);

    const newRequest: ContactRequest = {
      id: `cr_${Date.now()}`,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      fromPlate,
      toPlate,
      toUserId: targetVehicle?.ownerId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setContactRequests(prev => [...prev, newRequest]);
    return true;
  }, [currentUser, vehicles, getVehicleByPlate]);

  const respondToContactRequest = useCallback((requestId: string, accept: boolean, sharedContacts?: { phone?: boolean; email?: boolean; socialMedia?: boolean }) => {
    setContactRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: accept ? 'accepted' : 'rejected',
        sharedContacts: accept ? sharedContacts : undefined,
      };
    }));
  }, []);

  const blockContactRequest = useCallback((requestId: string) => {
    setContactRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'blocked' } : req
    ));
  }, []);

  const getContactRequestsReceived = useCallback((): ContactRequest[] => {
    if (!currentUser) return [];

    // Pegar todas as placas do usuário atual
    const userPlates = vehicles.filter(v => v.ownerId === currentUser.id).map(v => v.plate);

    // Retornar solicitações que:
    // 1. Tem toUserId igual ao usuário atual, OU
    // 2. toPlate corresponde a uma das placas do usuário atual (para entregas deferred)
    return contactRequests.filter(req =>
      req.toUserId === currentUser.id ||
      userPlates.includes(req.toPlate)
    );
  }, [contactRequests, currentUser, vehicles]);

  const getContactRequestsSent = useCallback((): ContactRequest[] => {
    if (!currentUser) return [];
    return contactRequests.filter(req => req.fromUserId === currentUser.id);
  }, [contactRequests, currentUser]);

  // Alerta Solidário Functions
  const sendSolidaryAlert = useCallback((data: {
    targetPlate: string;
    emergencyType: SolidaryEmergencyType;
    description: string;
    location: string;
    approximateTime: string;
    driverWithoutSignal: boolean;
    additionalPhone?: string;
    victimVerificationCode?: string;
  }): { success: boolean; error?: string; hasCoverage?: boolean } => {
    if (!currentUser) return { success: false, error: 'Usuário não autenticado' };

    const cleanPlate = data.targetPlate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Código de verificação é OBRIGATÓRIO (mínimo 6 caracteres)
    const cleanVictimCode = data.victimVerificationCode?.trim().toUpperCase() || '';
    if (!cleanVictimCode || cleanVictimCode.length < 6) {
      return { success: false, error: 'Código de verificação do motorista é obrigatório (mínimo 6 caracteres).' };
    }

    // Buscar veículo para verificar o código da vítima
    const targetVehicle = vehicles.find(v => v.plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase() === cleanPlate);

    // Validar formato do código (6-8 chars alfanuméricos)
    if (!/^[A-Z0-9]{6,8}$/.test(cleanVictimCode)) {
      return { success: false, error: 'Formato de código inválido. Use 3 letras + 3 números (ex: ABC123).' };
    }

    // Para veículos cadastrados, validar código contra proprietário
    if (targetVehicle) {
      // Buscar o dono do veículo para validar o código
      if (targetVehicle.ownerId === currentUser.id) {
        // Não pode enviar alerta solidário para si mesmo
        return { success: false, error: 'Você não pode enviar alerta solidário para seu próprio veículo' };
      }

      const victimOwner = mockUsersById[targetVehicle.ownerId];

      // Se proprietário existe e tem código, validar correspondência
      if (victimOwner?.verificationCode) {
        if (!verifyCode(cleanVictimCode, victimOwner.verificationCode)) {
          return { success: false, error: 'Código de verificação inválido. Confirme o código com o motorista.' };
        }
      }
      // Se proprietário não tem código, aceita qualquer código válido no formato (modo teste)
    }
    // Se veículo não está cadastrado, aceita qualquer código válido no formato (modo teste)

    // Verificar limite de 2 alertas por hora
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAlerts = solidaryAlerts.filter(a =>
      a.senderId === currentUser.id && new Date(a.createdAt) > oneHourAgo
    );
    if (recentAlerts.length >= 2) {
      return { success: false, error: 'Limite de 2 alertas por hora atingido' };
    }

    // Verificar cobertura baseado no veículo
    let hasCoverage = false;
    if (targetVehicle) {
      // 1. Verificar se o veículo tem plano ativo (hasActivePlan ou subscription válida)
      const hasActivePlan = targetVehicle.hasActivePlan ||
        (targetVehicle.subscriptionInfo && new Date(targetVehicle.subscriptionInfo.contractEndDate) > new Date()) ||
        false;

      // 2. Verificar se tem assistência contratada via frota
      const hasFleetAssistance = userFleets.some(f =>
        f.members.some(m => m.plate === targetVehicle.plate) &&
        f.assistances.some(a => a.isActive && new Date(a.validUntil) > new Date())
      );

      // 3. Verificar se o dono tem selo verde verificado
      // Primeiro verificar se o dono é o currentUser
      let ownerHasGreenSeal = false;
      if (currentUser && targetVehicle.ownerId === currentUser.id) {
        ownerHasGreenSeal = currentUser.seal === 'green' && currentUser.isVerified === true;
      } else {
        // Buscar perfil do owner do mapa de mock users
        const owner = mockUsersById[targetVehicle.ownerId];
        if (owner) {
          ownerHasGreenSeal = owner.seal === 'green' && owner.isVerified === true;
        }
      }

      hasCoverage = hasActivePlan || hasFleetAssistance || ownerHasGreenSeal || false;
    }

    const newAlert: SolidaryAlert = {
      id: `solidary-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      targetPlate: cleanPlate,
      targetVehicleId: targetVehicle?.id,
      emergencyType: data.emergencyType,
      description: data.description,
      location: data.location,
      approximateTime: data.approximateTime,
      driverWithoutSignal: data.driverWithoutSignal,
      additionalPhone: data.additionalPhone,
      status: hasCoverage ? 'entregue' : 'sem_cobertura',
      createdAt: new Date().toISOString(),
      deliveredAt: hasCoverage ? new Date().toISOString() : undefined,
      hasCoverage
    };

    setSolidaryAlerts(prev => [...prev, newAlert]);

    // Aumentar ICC se alerta foi útil (será verificado depois)
    return { success: true, hasCoverage };
  }, [currentUser, solidaryAlerts, vehicles]);

  const getSolidaryAlertsForUser = useCallback((userId: string, type?: 'sent' | 'received'): SolidaryAlert[] => {
    if (type === 'sent') {
      return solidaryAlerts.filter(a => a.senderId === userId);
    }
    if (type === 'received') {
      // Retornar alertas para placas do usuário
      const userVehicleIds = vehicles.filter(v => v.ownerId === userId).map(v => v.id);
      return solidaryAlerts.filter(a =>
        a.targetVehicleId && userVehicleIds.includes(a.targetVehicleId)
      );
    }
    return solidaryAlerts.filter(a =>
      a.senderId === userId || (a.targetVehicleId && vehicles.some(v => v.id === a.targetVehicleId && v.ownerId === userId))
    );
  }, [solidaryAlerts, vehicles]);

  const respondToSolidaryAlert = useCallback((alertId: string, response: 'acionado' | 'ja_resolvido') => {
    const alert = solidaryAlerts.find(a => a.id === alertId);

    setSolidaryAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        status: response === 'acionado' ? 'acionado' : 'resolvido',
        resolution: response,
        resolvedAt: new Date().toISOString()
      };
    }));

    // Rotacionar código da vítima após atendimento (quando é o currentUser que recebeu ajuda)
    if (alert?.targetVehicleId && response === 'acionado') {
      const targetVehicle = vehicles.find(v => v.id === alert.targetVehicleId);
      if (targetVehicle && targetVehicle.ownerId === currentUser?.id) {
        // Gerar novo código para a vítima (currentUser)
        const newCode = generateVerificationCode();
        setCurrentUser(prev => prev ? {
          ...prev,
          verificationCode: newCode,
          verificationCodeCreatedAt: new Date().toISOString()
        } : prev);
      }
    }
  }, [solidaryAlerts, vehicles, currentUser]);

  const markSolidaryAlertAsUseful = useCallback((alertId: string, isUseful: boolean) => {
    const alert = solidaryAlerts.find(a => a.id === alertId);
    if (!alert) return;

    // Proteção contra duplicatas: não permitir re-marcar se já foi processado
    if (alert.isUseful !== undefined) {
      console.log('Alert already marked as useful/not useful, skipping');
      return;
    }

    // Verificar também se já existe um reward pendente para este alerta
    if (isUseful) {
      const pendingRewardsKey = 'cautoo_icc_rewards_v1';
      const existing = localStorage.getItem(pendingRewardsKey);
      if (existing) {
        const rewards: { alertId?: string }[] = JSON.parse(existing);
        if (rewards.some(r => r.alertId === alertId)) {
          console.log('Reward already pending for this alert, skipping');
          return;
        }
      }
    }

    const senderIsCurrentUser = currentUser && alert.senderId === currentUser.id;

    // Atualizar o alerta com a informação de isUseful
    // iccRewardApplied = true apenas se o sender é o currentUser (aplicação imediata)
    setSolidaryAlerts(prev => prev.map(a => {
      if (a.id !== alertId) return a;
      return {
        ...a,
        isUseful,
        iccRewardApplied: isUseful && senderIsCurrentUser,
        iccRewardPending: isUseful && !senderIsCurrentUser
      };
    }));

    // Se marcado como útil, processar a recompensa de ICC (+2)
    if (isUseful) {
      if (senderIsCurrentUser) {
        // Aplicar imediatamente para o currentUser
        setCurrentUser(prev => {
          if (!prev) return prev;
          const newICC = Math.min(1000, prev.icc + 2);
          return { ...prev, icc: newICC, ranking: getRankingFromICC(newICC) };
        });
      } else {
        // Persistir no localStorage para aplicar quando o sender logar
        const pendingRewardsKey = 'cautoo_icc_rewards_v1';
        const existing = localStorage.getItem(pendingRewardsKey);
        const rewards: { userId: string; amount: number; reason: string; date: string; alertId: string }[] = existing ? JSON.parse(existing) : [];
        rewards.push({
          userId: alert.senderId,
          amount: 2,
          reason: 'Alerta solidário útil',
          date: new Date().toISOString(),
          alertId: alertId
        });
        localStorage.setItem(pendingRewardsKey, JSON.stringify(rewards));
      }
    }
  }, [solidaryAlerts, currentUser]);

  /**
   * Obtém métricas e score de uma placa
   * IMPORTANTE: Função PÚBLICA - não requer autenticação
   * O score e a categoria são públicos, mas detalhes dos alertas são privados
   */
  const getPlateMetrics = useCallback((plate: string) => {
    const normalizedPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const isRegistered = isPlateRegistered(normalizedPlate);

    // Buscar veículo no sistema
    const vehicle = vehicles.find(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate);

    // In this mock, we aggregate data from various sources to simulate a global history
    const totalAlerts = (sentAlerts.filter(a => a.targetPlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length) +
      (alerts.filter(a => a.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length);

    const totalCritiques = sentCritiques.filter(c => c.targetPlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length;

    const totalCompliments = (praisesSent.filter(p => p.toPlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length) +
      (praisesReceived.filter(p => p.toPlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length);

    const totalSolidary = solidaryAlerts.filter(s => s.targetPlate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate).length;

    // Score Rules (usando lógica antiga como base, mas retornando com novo sistema):
    // Initial: 0
    // Negative: each critique -1 (always)
    let score = vehicle?.score || -totalCritiques;

    // Positive: only for registered plates
    if (isRegistered && !vehicle) {
      score += totalCompliments + totalSolidary;
    }

    // Usar score do veículo se existir, senão calcular
    const finalScore = vehicle?.score ?? score;

    // Calcular categoria usando nova função
    const categoryInfo = getScoreCategoryInfo(finalScore);

    // PÚBLICO: Retorna score, categoria e totais (sem detalhes)
    return {
      // Dados PÚBLICOS
      score: finalScore,
      category: categoryInfo.category,
      label: categoryInfo.label,
      badgeClass: categoryInfo.badgeClass,
      categoryColor: categoryInfo.color,
      categoryBg: categoryInfo.bg,
      categoryBorder: categoryInfo.border,
      isPublic: true, // Indicador de que estes dados são públicos
      isRegistered,
      // Totais agregados (sem detalhes específicos)
      totalInteractions: totalAlerts + totalCritiques + totalCompliments + totalSolidary,
      // Dados agregados (sem detalhes individuais)
      compliments: totalCompliments,
      critiques: totalCritiques,
      alerts: totalAlerts,
      solidaryActions: totalSolidary,
    };
  }, [vehicles, sentAlerts, alerts, sentCritiques, praisesSent, praisesReceived, solidaryAlerts, isPlateRegistered]);

  const value: AppContextType = {
    isLoggedIn,
    currentUser,
    login,
    loginWithPassword,
    logout,
    register,
    vehicles,
    addVehicle: addAdditionalPlate, // mapped to the implementation
    updateVehicle,
    markAsStolen,
    markAsRecovered,
    renewStolenAlert,
    payForStolenAlert,
    reactivateStolenAlert,
    isPlateRegistered,
    alerts,
    sentAlerts,
    sentCritiques,
    sendAlert,
    markAlertAsRead,
    canSendCritique,
    praisesReceived,
    praisesSent,
    sendPraise,
    friendRequests,
    friends,
    chatMessages,
    sendFriendRequest,
    respondToFriendRequest,
    sendChatMessage,
    transfers,
    initiateTransfer,
    respondToTransfer,
    claims,
    submitClaim,
    submitVehicleClaim,
    isVehicleBlocked: isVehicleBlockedFn,
    referrals,
    stolenVehicles,
    reportSighting,
    updateUserProfile,
    purchaseVerifiedSeal,
    canActivateFreeSeal: canActivateFreeSealFn,
    isVerifiedSealExpired: isVerifiedSealExpiredFn,
    purchasePlateInfo,
    addAdditionalPlate,
    generateNewVerificationCode,
    validateVerificationCode,
    rotateVerificationCode,
    helpRequests,
    addHelpRequest,
    useGreenSealCall,
    hasGreenSealFreeCall,
    useGreenSealStolenAlert,
    hasGreenSealFreeStolenAlert,
    getGreenSealStolenAlertsRemaining,
    cauCashBalance,
    cauCashTransactions,
    addTransaction,
    resetCauCashBalance,
    getCurrentCauCashBalance,
    // Frotas
    userFleets,
    createFleet,
    deleteFleet,
    updateFleet,
    addFleetMember,
    removeFleetMember,
    sendFleetChatMessage,
    addFleetHelpRequest,
    updateFleetHelpRequest,
    // Compras de Frota (CauCash)
    purchaseFleetVerifiedSeal,
    purchaseFleetAssistance,
    // Convites de Frota
    sendFleetInvite,
    cancelFleetInvite,
    respondToFleetInvite,
    getFleetInvitesForUser,
    // Registro Cautelar
    cautelarRegistries,
    createCautelarRegistry,
    confirmCautelarParticipation,
    resolveCautelarRegistry,
    addCautelarDamage,
    payMediationInstallment,
    getCautelarRegistriesForUser,
    // Solicitações de Contato
    contactRequests,
    sendContactRequest,
    respondToContactRequest,
    blockContactRequest,
    getContactRequestsReceived,
    getContactRequestsSent,
    getVehicleByPlate,
    // Alerta Solidário
    solidaryAlerts,
    sendSolidaryAlert,
    getSolidaryAlertsForUser,
    respondToSolidaryAlert,
    markSolidaryAlertAsUseful,
    // Global Alert System
    alertModal,
    showAlert,
    hideAlert,
    getPlateMetrics,

    // SKINS & COLEÇÃO
    selectedColor,
    setSelectedColor,
    collection,
    miningState,
    getSkinById,
    getSkinsByCategory,
    buySkinLayout,
    sellSkin,
    mineSkin,
    linkSkinToPlate,
    skinsOnboardingCompleted,
    completeSkinsOnboarding
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
