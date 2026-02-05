// Tipos do sistema Cautoo

export type SealType = 'none' | 'blue' | 'yellow' | 'green';

// Novo sistema de 7 categorias para Score da Placa (PÚBLICO)
export type ScoreCategory =
  | 'alerta'      // < 0
  | 'neutra'      // 0-199
  | 'conhecida'   // 200-399
  | 'confiavel'   // 400-649
  | 'distinta'    // 650-849
  | 'exemplar'    // 850-1000
  | 'icone';      // 1001+

// Novo sistema de 7 categorias para ICC (PRIVADO)
export type ICCCategory =
  | 'negativo'    // < 0
  | 'iniciante'   // 0-199
  | 'ativo'       // 200-399
  | 'engajado'    // 400-649
  | 'protetor'    // 650-849
  | 'embaixador'  // 850-1000
  | 'guardiao';   // 1001+

export type ClaimStatus = 'none' | 'pending' | 'approved' | 'rejected';

export type VehicleOwnershipType = 'proprio' | 'assinatura';

export interface VehicleSubscriptionInfo {
  companyName: string;
  companyCnpj?: string;
  contractEndDate: string;
}

export interface VehicleInsuranceInfo {
  companyName: string;
  endDate: string;
}

// Histórico de score arquivado (quando placa é transferida/reivindicada)
export interface ScoreHistoryEntry {
  score: number;
  category: ScoreCategory;
  archivedAt: string;
  reason: 'transfer' | 'claim';
}

// Requisição de reivindicação/transferência de placa
export interface PlateClaimRequest {
  id: string;
  plateId: string;
  requesterId: string;
  documentUrl: string; // URL da foto do CRLV
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  color: string;
  ownerId: string;
  score: number; // 0-1000
  hasCompleteInfo: boolean; // Taxa de R$ 25 paga para info completa
  hasActivePlan: boolean; // Se tem plano CAUTOO ativo (isenta R$ 5 de placa adicional)
  isStolen: boolean;
  stolenInfo?: {
    location: string;
    date: string;
    time: string;
    sightings: Sighting[];
  };
  stolenAlert?: StolenAlertInfo; // Informações do alerta pago
  claimStatus?: ClaimStatus; // Status da reivindicação (se placa já era de outro usuário)
  originalOwnerId?: string; // ID do dono original (para reivindicações)
  createdAt: string;
  monthlyPraises?: number; // Contador de elogios recebidos no mês
  monthlyCritiques?: number; // Contador de críticas recebidas no mês
  hasCollaborativeSeal?: boolean; // Selo "Condutor Colaborativo" (3+ elogios no mês)
  hasTrustSeal?: boolean; // Selo de confiança (removido se 3+ críticas no mês)

  // Tipo de propriedade do veículo
  ownershipType?: VehicleOwnershipType;
  subscriptionInfo?: VehicleSubscriptionInfo;
  insuranceInfo?: VehicleInsuranceInfo;

  // Sistema de Score atualizado
  scoreCategory?: ScoreCategory; // Categoria calculada do score
  scoreHistory?: ScoreHistoryEntry[]; // Histórico de scores arquivados
  lastClaimDate?: string; // Última reivindicação (proteção 6 meses)
  lastScoreUpdate?: string; // Para controle de decaimento mensal

  // Personalização
  skinId?: number; // ID da skin (cor livre ou especial) aplicada
}

// Helper para verificar se veículo está bloqueado (reivindicação pendente)
export function isVehicleBlocked(vehicle?: Vehicle | null): boolean {
  if (!vehicle) return false;
  return vehicle.claimStatus === 'pending';
}

// Informações do alerta de roubo pago
export interface StolenAlertInfo {
  activatedAt: string;
  expiresAt: string;
  renewalUsed: boolean; // Se já usou a renovação gratuita de 3 dias
  isActive: boolean;
}

// Helper para verificar se o alerta de roubo está ativo
export function isStolenAlertActive(alert?: StolenAlertInfo): boolean {
  if (!alert) return false;
  return new Date(alert.expiresAt) > new Date();
}

// Helper para calcular dias restantes do alerta
export function getStolenAlertDaysRemaining(alert?: StolenAlertInfo): number {
  if (!alert) return 0;
  const now = new Date();
  const expires = new Date(alert.expiresAt);
  const diff = expires.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Helper para verificar se pode renovar gratuitamente
export function canRenewStolenAlertFree(alert?: StolenAlertInfo): boolean {
  if (!alert) return false;
  // Pode renovar se não usou a renovação e está nos últimos 2 dias ou expirado
  const daysRemaining = getStolenAlertDaysRemaining(alert);
  return !alert.renewalUsed && daysRemaining <= 2;
}

export interface Sighting {
  id: string;
  reporterId: string;
  reporterName: string;
  location: string;
  date: string;
  time: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  password: string; // Senha de 6 dígitos numéricos
  gender?: 'masculino' | 'feminino' | 'outro'; // Gênero para PPink

  // ICC - Índice de Contribuição Cautelar (INTERNO E PRIVADO)
  // Mede quanto o CPF contribui positivamente para a Rede Cautoo
  // Aumenta com: alertas úteis, elogios recebidos, ajuda em veículos roubados, indicações válidas
  // Diminui com: críticas válidas, denúncias confirmadas, abusos do sistema
  icc: number; // 0-1000

  ranking: RankingLevel;
  referralCode: string;
  referralCount: number;
  referralPoints: number;

  // Métricas para cálculo de selos
  usefulAlertsSent: number; // Alertas úteis enviados
  validCritiquesReceived: number; // Críticas válidas recebidas
  realHelpsGiven: number; // Ajudas reais prestadas
  confirmedAbuses: number; // Abusos confirmados (perda de selo se > 0)

  positiveActionsLast90Days: number;
  lastCritiqueDateWithConvergence?: string;
  banStatus?: BanStatus;

  // CauCash Wallet
  cauCashBalance: number;

  // Selo Azul (Perfil Verificado) - vinculado ao CPF
  // - Cliente Cautoo: ativação GRATUITA
  // - Não cliente: R$ 50,00
  // - Validade: 12 meses
  isVerified: boolean;
  verifiedAt?: string;
  verifiedExpiresAt?: string;
  verifiedFreeActivationUsed?: boolean; // Se já usou a ativação gratuita (cliente Cautoo)

  // Status de cliente Cautoo (plano ativo)
  isCautooClient?: boolean; // Se tem plano Cautoo ativo
  activePlanType?: 'cautela' | 'certo' | 'ciente'; // Tipo do plano ativo
  cautooClientSince?: string; // Desde quando é cliente
  cautooClientPlanExpiresAt?: string; // Quando o plano expira

  // Selo conquistado (blue, yellow, green)
  seal?: SealType;

  // Benefícios Selo Amarelo (Guardião Viário)
  // - 1 alerta de roubo gratuito a cada 30 dias
  yellowSealStolenAlertsUsed?: number;
  yellowSealBenefitsStartedAt?: string;

  // Benefícios Selo Verde (Referência Cautoo) - renovam a cada 6 meses
  // Cliente: 1 chamado gratuito a cada 6 meses + 2 alertas de roubo a cada 30 dias
  // Não cliente: 2 alertas de roubo a cada 30 dias
  hasUsedGreenSealCall?: boolean;
  greenSealCallUsedAt?: string;
  greenSealStolenAlertsUsed?: number;
  greenSealBenefitsStartedAt?: string;
  greenSealBenefitsRenewedAt?: string;

  // Sistema de ICC atualizado
  iccCategory?: ICCCategory; // Categoria calculada do ICC
  iccGracePeriodEndsAt?: string; // 30 dias de graça para novos usuários
  lastICCUpdate?: string; // Para controle de decaimento mensal

  // Código de Verificação Dinâmico (para Alerta Solidário)
  verificationCode?: string; // Código ativo atual (6-8 caracteres alfanuméricos)
  verificationCodeCreatedAt?: string; // Quando o código foi gerado

  createdAt: string;
}

// ===== REGRAS DE SELOS =====

// SELO AMARELO - Guardião Viário
// Requisitos para conquistar:
// - Selo Azul ativo
// - ICC ≥ 650
// - Pelo menos 10 alertas úteis enviados
// - No máximo 3 críticas válidas
// - Nenhum abuso confirmado
// Regra de perda: Se acumular mais de 10 críticas válidas, perde o selo e volta para Azul

export function canAchieveYellowSeal(user?: User | null): boolean {
  if (!user) return false;
  return (
    user.isVerified &&
    !isVerifiedSealExpired(user) &&
    user.icc >= 650 &&
    (user.usefulAlertsSent || 0) >= 10 &&
    (user.validCritiquesReceived || 0) <= 3 &&
    (user.confirmedAbuses || 0) === 0
  );
}

export function shouldLoseYellowSeal(user?: User | null): boolean {
  if (!user) return false;
  return (user.validCritiquesReceived || 0) > 10;
}

// SELO VERDE - Referência Cautoo
// Requisitos para conquistar:
// - Selo Azul ativo
// - Selo Amarelo ativo
// - ICC ≥ 850
// - Pelo menos 30 alertas úteis enviados
// - Pelo menos 3 ajudas reais
// - Média do score das placas ≥ 80
// - No máximo 3 críticas válidas
// - Nenhum abuso confirmado
// Regra de perda: Se acumular mais de 10 críticas válidas, volta para Amarelo

export function canAchieveGreenSeal(user?: User | null, vehicles?: Vehicle[]): boolean {
  if (!user) return false;

  // Precisa ter Selo Amarelo
  if (!canAchieveYellowSeal(user)) return false;

  // Calcular média de score dos veículos
  const avgScore = vehicles && vehicles.length > 0
    ? vehicles.reduce((sum, v) => sum + v.score, 0) / vehicles.length
    : 0;

  return (
    user.icc >= 850 &&
    (user.usefulAlertsSent || 0) >= 30 &&
    (user.realHelpsGiven || 0) >= 3 &&
    avgScore >= 80 &&
    (user.validCritiquesReceived || 0) <= 3 &&
    (user.confirmedAbuses || 0) === 0
  );
}

export function shouldLoseGreenSeal(user?: User | null): boolean {
  if (!user) return false;
  return (user.validCritiquesReceived || 0) > 10;
}

// Helper para verificar se selo verificado está expirado
export function isVerifiedSealExpired(user?: User | null): boolean {
  if (!user?.verifiedExpiresAt) return true;
  return new Date(user.verifiedExpiresAt) < new Date();
}

// Helper para verificar se usuário pode ativar selo gratuito
export function canActivateFreeSeal(user?: User | null): boolean {
  if (!user) return false;
  // Cliente Cautoo + primeira ativação + não tem selo ativo
  return (
    user.isCautooClient === true &&
    !user.verifiedFreeActivationUsed &&
    !user.isVerified
  );
}

// Help Request (Solicitação de Socorro)
// Tipos para solicitação de socorro
export type WellbeingState = 'safe' | 'risk' | 'danger';
export type PriorityLevel = 'NORMAL' | 'HIGH' | 'MAX' | 'PPINK';

export interface HelpRequest {
  id: string;
  vehicleId: string;
  plate: string;
  model: string;
  color: string;
  userId: string;
  userCpf: string;
  wellbeingState: WellbeingState;
  priority: PriorityLevel;
  problemType: string;
  address: string;
  cep?: string;
  reference: string;
  accessForTow: 'sim' | 'nao' | 'nao_sei';
  latitude?: string;
  longitude?: string;
  observations?: string;
  hasActivePlan: boolean;
  isPPinkActive: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
}

export type RankingLevel =
  | 'Iniciante'
  | 'Condutor Consciente'
  | 'Apoiador Urbano'
  | 'Guardião Viário'
  | 'Referência Cautoo';

export interface BanStatus {
  type: '24h' | '7d' | 'permanent';
  reason: string;
  until?: string;
  count: number;
}

export interface Alert {
  id: string;
  plateId: string;
  plate: string;
  categoryId: string;
  categoryName: string;
  messageId: string;
  messageText: string;
  senderId?: string; // undefined se não cadastrado
  senderHasSeal: boolean;
  createdAt: string;
  isRead: boolean;
}

export interface SentAlert {
  id: string;
  targetPlate: string;
  categoryId: string;
  categoryName: string;
  messageText: string;
  createdAt: string;
}

// Críticas de condução perigosa (separado para controle de limites)
export interface SentCritique {
  id: string;
  targetPlate: string;
  messageText: string;
  createdAt: string;
}

export interface Praise {
  id: string;
  fromUserId: string;
  toPlate: string;
  praiseType: string;
  createdAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromPlate: string;
  toUserId: string;
  toPlate: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface Friend {
  id: string;
  odometer?: string;
  userId: string;
  userName: string;
  plate: string;
  hasBlueSeal: boolean;
  chatEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  friendshipId: string;
  senderId: string;
  text: string; // max 140 chars
  createdAt: string;
}

export interface PlateTransfer {
  id: string;
  plateId: string;
  plate: string;
  fromUserId: string;
  fromUserName: string;
  toUserCpf: string;
  toUserId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
}

export interface PlateClaim {
  id: string;
  plate: string;
  claimantUserId: string;
  claimantName: string;
  claimantCpf: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  boughtBlueSeal: boolean;
  pointsEarned: number;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromPlate: string;
  toPlate: string;
  toUserId?: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  sharedContacts?: {
    phone?: boolean;
    email?: boolean;
    socialMedia?: boolean;
  };
  createdAt: string;
}

// Helper para calcular ranking baseado no ICC
export function getRankingFromICC(icc: number): RankingLevel {
  if (icc >= 850) return 'Referência Cautoo';
  if (icc >= 650) return 'Guardião Viário';
  if (icc >= 400) return 'Apoiador Urbano';
  if (icc >= 200) return 'Condutor Consciente';
  return 'Iniciante';
}

// Helper para obter cor do selo
export function getSealColor(seal: SealType): string {
  switch (seal) {
    case 'blue': return 'bg-blue-500';
    case 'yellow': return 'bg-yellow-500';
    case 'green': return 'bg-green-500';
    default: return 'bg-muted';
  }
}

// Helper para obter nome do selo
export function getSealName(seal: SealType): string {
  switch (seal) {
    case 'blue': return 'Perfil Verificado';
    case 'yellow': return 'Guardião Viário';
    case 'green': return 'Referência Cautoo';
    default: return 'Sem Selo';
  }
}

// ===== REGISTRO CAUTELAR =====

export type CautelarOccurrenceType =
  | 'colisao_leve'
  | 'dano_estacionamento'
  | 'engavetamento'
  | 'colisao_traseira'
  | 'abalroamento'
  | 'outro';

export type CautelarRegistryStatus =
  | 'aguardando_confirmacao'
  | 'em_andamento'
  | 'resolvido_acordo'
  | 'sem_resolucao'
  | 'mediacao_pendente'
  | 'mediacao_pagamento'
  | 'mediacao_concluida';

export type CautelarResolutionType =
  | 'acordo'
  | 'sem_resolucao'
  | 'mediacao';

export interface CautelarParticipant {
  id: string;
  plate: string;
  userId?: string;
  userName?: string;
  isRegistered: boolean;
  confirmed: boolean;
  confirmedAt?: string;
  inviteLink?: string;
  isResponsible?: boolean;
}

export interface CautelarDamage {
  value: number;
  establishmentName: string;
  establishmentCnpj: string;
  quotationAttached?: boolean;
  installments: number;
  paidInstallments: number;
}

export interface CautelarCertificate {
  id: string;
  type: 'resolucao' | 'mediacao' | 'pendente';
  registryNumber: string;
  generatedAt: string;
  hash: string;
  validationUrl: string;
}

export interface CautelarRegistry {
  id: string;
  registryNumber: string;
  creatorId: string;
  creatorName: string;
  participants: CautelarParticipant[];
  occurrenceType: CautelarOccurrenceType;
  occurrenceDate: string;
  occurrenceTime: string;
  location: string;
  description: string;
  status: CautelarRegistryStatus;
  resolutionType?: CautelarResolutionType;
  damage?: CautelarDamage;
  certificate?: CautelarCertificate;
  createdAt: string;
  resolvedAt?: string;
}

export function getOccurrenceTypeName(type: CautelarOccurrenceType): string {
  switch (type) {
    case 'colisao_leve': return 'Colisão Leve';
    case 'dano_estacionamento': return 'Dano de Estacionamento';
    case 'engavetamento': return 'Engavetamento';
    case 'colisao_traseira': return 'Colisão Traseira';
    case 'abalroamento': return 'Abalroamento';
    case 'outro': return 'Outro';
  }
}

export function getCautelarStatusName(status: CautelarRegistryStatus): string {
  switch (status) {
    case 'aguardando_confirmacao': return 'Aguardando Confirmação';
    case 'em_andamento': return 'Em Andamento';
    case 'resolvido_acordo': return 'Resolvido em Acordo';
    case 'sem_resolucao': return 'Sem Resolução';
    case 'mediacao_pendente': return 'Mediação Pendente';
    case 'mediacao_pagamento': return 'Mediação - Pagamento';
    case 'mediacao_concluida': return 'Mediação Concluída';
  }
}

export function getCautelarStatusColor(status: CautelarRegistryStatus): string {
  switch (status) {
    case 'aguardando_confirmacao': return 'text-yellow-500 bg-yellow-500/20';
    case 'em_andamento': return 'text-blue-500 bg-blue-500/20';
    case 'resolvido_acordo': return 'text-green-500 bg-green-500/20';
    case 'sem_resolucao': return 'text-red-500 bg-red-500/20';
    case 'mediacao_pendente': return 'text-orange-500 bg-orange-500/20';
    case 'mediacao_pagamento': return 'text-emerald-500 bg-emerald-500/20';
    case 'mediacao_concluida': return 'text-green-500 bg-green-500/20';
  }
}

export function generateRegistryNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `RC-${year}.${month}.${day}.${seq}`;
}

export function generateCertificateHash(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let hash = '';
  for (let i = 0; i < 32; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

export function canUseCautelarMediation(user?: User | null): boolean {
  if (!user) return false;
  return user.seal === 'green' && user.isVerified;
}

export function getMaxInstallments(user?: User | null): number {
  if (!user) return 0;
  if (user.icc >= 650) return 6;
  if (user.icc >= 400) return 3;
  return 0;
}

// ==========================================
// SOCORRO SOLIDÁRIO
// ==========================================

export type SolidaryEmergencyType =
  | 'pane_mecanica'
  | 'pneu_furado'
  | 'acidente_leve'
  | 'falta_combustivel'
  | 'roubo_furto'
  | 'situacao_risco'
  | 'outro';

export type SolidaryAlertStatus =
  | 'pendente_entrega'
  | 'entregue'
  | 'acionado'
  | 'resolvido'
  | 'sem_cobertura'
  | 'expirado';

export interface SolidaryAlert {
  id: string;
  senderId: string;
  senderName: string;
  targetPlate: string;
  targetVehicleId?: string;
  emergencyType: SolidaryEmergencyType;
  description: string;
  location: string;
  approximateTime: string;
  driverWithoutSignal: boolean;
  additionalPhone?: string;
  status: SolidaryAlertStatus;
  createdAt: string;
  deliveredAt?: string;
  resolvedAt?: string;
  resolution?: 'acionado' | 'ja_resolvido';
  isUseful?: boolean;
  hasCoverage: boolean;
  iccRewardApplied?: boolean;
  iccRewardPending?: boolean;
}

export function getEmergencyTypeLabel(type: SolidaryEmergencyType): string {
  switch (type) {
    case 'pane_mecanica': return 'Pane mecânica';
    case 'pneu_furado': return 'Pneu furado';
    case 'acidente_leve': return 'Acidente leve';
    case 'falta_combustivel': return 'Falta de combustível';
    case 'roubo_furto': return 'Roubo/furto';
    case 'situacao_risco': return 'Situação de risco / motorista sem sinal';
    case 'outro': return 'Outro';
  }
}

export function getSolidaryStatusLabel(status: SolidaryAlertStatus): string {
  switch (status) {
    case 'pendente_entrega': return 'Pendente de Entrega';
    case 'entregue': return 'Entregue';
    case 'acionado': return 'Socorro Acionado';
    case 'resolvido': return 'Resolvido';
    case 'sem_cobertura': return 'Sem Cobertura';
    case 'expirado': return 'Expirado';
  }
}

export function getSolidaryStatusColor(status: SolidaryAlertStatus): string {
  switch (status) {
    case 'pendente_entrega': return 'text-yellow-500 bg-yellow-500/20';
    case 'entregue': return 'text-blue-500 bg-blue-500/20';
    case 'acionado': return 'text-orange-500 bg-orange-500/20';
    case 'resolvido': return 'text-green-500 bg-green-500/20';
    case 'sem_cobertura': return 'text-gray-500 bg-gray-500/20';
    case 'expirado': return 'text-red-500 bg-red-500/20';
  }
}

export function checkVehicleCoverage(vehicle?: Vehicle | null, user?: User | null): boolean {
  if (!vehicle) return false;
  if (vehicle.hasActivePlan) return true;
  if (user?.seal === 'green' && user.isVerified) return true;
  return false;
}

// ===== CÓDIGO DE VERIFICAÇÃO DINÂMICO =====

// Caracteres seguros para código (sem I, O, 0, 1 para evitar confusão)
const VERIFICATION_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Gera um código de verificação único alfanumérico
 * @param length Tamanho do código (6-8 caracteres)
 */
export function generateVerificationCode(length: number = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += VERIFICATION_CODE_CHARS.charAt(
      Math.floor(Math.random() * VERIFICATION_CODE_CHARS.length)
    );
  }
  return result;
}

/**
 * Valida se um código de verificação é válido (formato correto)
 * Para testes: aceita formato 3 letras + 3 números (ex: ABC123)
 */
export function isValidVerificationCode(code: string): boolean {
  if (!code) return false;
  const cleanCode = code.trim().toUpperCase();

  // Aceita formato: 3 letras + 3 números (ABC123) para testes
  if (cleanCode.length === 6) {
    const lettersOnly = /^[A-Z]{3}[0-9]{3}$/;
    if (lettersOnly.test(cleanCode)) return true;
  }

  // Também aceita formato alfanumérico padrão (6-8 chars)
  if (cleanCode.length >= 6 && cleanCode.length <= 8) {
    const validChars = new Set(VERIFICATION_CODE_CHARS.split(''));
    return cleanCode.split('').every(char => validChars.has(char));
  }

  return false;
}

/**
 * Verifica se o código fornecido corresponde ao código ativo do usuário
 */
export function verifyCode(inputCode: string, userCode?: string): boolean {
  if (!inputCode || !userCode) return false;
  return inputCode.toUpperCase().trim() === userCode.toUpperCase().trim();
}
