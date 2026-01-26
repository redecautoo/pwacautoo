// Tipos do sistema Frota Cautoo

export interface FleetMember {
  id: string;
  plate: string;
  model: string;
  color: string;
  ownerId: string;
  ownerName: string;
  joinedAt: string;
}

// Convite para participar de uma frota
export interface FleetInvite {
  id: string;
  fleetId: string;
  fleetName: string;
  plate: string;
  invitedBy: string;
  invitedByName: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  respondedAt?: string;
}

export interface FleetHelpRequest {
  id: string;
  fleetId: string;
  assistanceId: string; // ID da assistência contratada
  requesterId: string;
  requesterName: string;
  plate: string;
  status: 'pending_approval' | 'approved' | 'used' | 'expired' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  usedAt?: string;
  createdAt: string;
}

export interface FleetChatMessage {
  id: string;
  fleetId: string;
  senderId: string;
  senderName: string;
  text: string;
  type: 'message' | 'help_request' | 'system';
  helpRequestId?: string;
  createdAt: string;
}

// Nova estrutura: Assistência da Frota (contratada separadamente)
export interface FleetAssistance {
  id: string;
  fleetId: string;
  
  // Período da assistência
  validFrom: string; // Data início (00:00)
  validUntil: string; // Data fim (23:59)
  daysCount: number;
  
  // Veículos cobertos (snapshot no momento da contratação)
  vehicleCount: number;
  
  // Precificação por faixa
  pricePerVehiclePerDay: number;
  callsBasePerDay: number;
  multiplier: number; // 1x, 2x, 3x...
  
  // Totais calculados
  totalPrice: number;
  callsTotal: number;
  callsUsed: number;
  callsReserved: number;
  
  // Carência
  carenceEndsAt: string; // 3 dias após contratação
  contractedAt: string;
  
  // Status
  isActive: boolean;
  
  createdAt: string;
}

export interface CautooFleet {
  id: string;
  name: string;
  description?: string;
  
  // Criador e admins
  creatorId: string;
  creatorName: string;
  adminIds: string[];
  
  // Membros (veículos) - permanentes na comunidade
  members: FleetMember[];
  
  // Convites pendentes
  invites: FleetInvite[];
  
  // Assistências contratadas (podem ter várias ao longo do tempo)
  assistances: FleetAssistance[];
  
  // Selo de Frota Verificada
  isVerified: boolean;
  verifiedAt?: string;
  verifiedExpiresAt?: string;
  
  // Chat
  chatMessages: FleetChatMessage[];
  helpRequests: FleetHelpRequest[];
  
  createdAt: string;
}

// ====== REGRAS DE PRECIFICAÇÃO POR FAIXA ======

export interface PricingTier {
  minVehicles: number;
  maxVehicles: number;
  pricePerVehiclePerDay: number;
  callsBasePerDay: number;
}

export const PRICING_TIERS: PricingTier[] = [
  { minVehicles: 10, maxVehicles: 19, pricePerVehiclePerDay: 50, callsBasePerDay: 1 },
  { minVehicles: 20, maxVehicles: 29, pricePerVehiclePerDay: 40, callsBasePerDay: 2 },
  { minVehicles: 30, maxVehicles: 39, pricePerVehiclePerDay: 30, callsBasePerDay: 3 },
  { minVehicles: 40, maxVehicles: Infinity, pricePerVehiclePerDay: 25, callsBasePerDay: 4 },
];

// Obter faixa de preço baseada na quantidade de veículos
export function getPricingTier(vehicleCount: number): PricingTier | null {
  if (vehicleCount < 10) return null;
  return PRICING_TIERS.find(t => vehicleCount >= t.minVehicles && vehicleCount <= t.maxVehicles) || PRICING_TIERS[PRICING_TIERS.length - 1];
}

// Calcular custo total da assistência
export function calculateAssistanceCost(vehicleCount: number, days: number, multiplier: number): { 
  totalPrice: number; 
  callsTotal: number; 
  pricePerVehiclePerDay: number;
  callsBasePerDay: number;
} | null {
  const tier = getPricingTier(vehicleCount);
  if (!tier) return null;
  
  const totalPrice = vehicleCount * tier.pricePerVehiclePerDay * days * multiplier;
  const callsTotal = tier.callsBasePerDay * days * multiplier;
  
  return {
    totalPrice,
    callsTotal,
    pricePerVehiclePerDay: tier.pricePerVehiclePerDay,
    callsBasePerDay: tier.callsBasePerDay,
  };
}

// ====== HELPERS ======

// Verificar se assistência está em carência
export function isAssistanceInCarence(assistance: FleetAssistance): boolean {
  return new Date() < new Date(assistance.carenceEndsAt);
}

// Verificar se assistência está ativa (não em carência e dentro do período de validade)
export function isAssistanceOperational(assistance: FleetAssistance): boolean {
  const now = new Date();
  return (
    assistance.isActive &&
    now >= new Date(assistance.carenceEndsAt) &&
    now <= new Date(assistance.validUntil)
  );
}

// Verificar se assistência tem chamados disponíveis
export function hasAssistanceAvailableCalls(assistance: FleetAssistance): boolean {
  return (assistance.callsTotal - assistance.callsUsed - assistance.callsReserved) > 0;
}

// Calcular chamados restantes de uma assistência
export function getAssistanceAvailableCalls(assistance: FleetAssistance): number {
  return Math.max(0, assistance.callsTotal - assistance.callsUsed - assistance.callsReserved);
}

// Obter assistência ativa de uma frota (a mais recente que está operacional)
export function getActiveAssistance(fleet: CautooFleet): FleetAssistance | null {
  const now = new Date();
  return fleet.assistances
    .filter(a => a.isActive && now <= new Date(a.validUntil))
    .sort((a, b) => new Date(b.validUntil).getTime() - new Date(a.validUntil).getTime())[0] || null;
}

// Verificar se frota tem assistência ativa operacional
export function hasActiveAssistance(fleet: CautooFleet): boolean {
  const assistance = getActiveAssistance(fleet);
  return assistance !== null && isAssistanceOperational(assistance);
}

// Verificar se usuário é admin da frota
export function isFleetAdmin(fleet: CautooFleet, userId: string): boolean {
  return fleet.creatorId === userId || fleet.adminIds.includes(userId);
}

// Verificar se veículo é membro da frota
export function isMemberOfFleet(fleet: CautooFleet, plate: string): boolean {
  return fleet.members.some(m => m.plate.toUpperCase() === plate.toUpperCase());
}

// Calcular dias restantes de validade da assistência
export function getAssistanceDaysRemaining(assistance: FleetAssistance): number {
  const now = new Date();
  const validUntil = new Date(assistance.validUntil);
  const diff = validUntil.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Verificar se selo de frota está válido
export function isFleetSealValid(fleet: CautooFleet): boolean {
  if (!fleet.isVerified || !fleet.verifiedExpiresAt) return false;
  return new Date() < new Date(fleet.verifiedExpiresAt);
}

// Calcular dias de carência restantes
export function getCarenceDaysRemaining(assistance: FleetAssistance): number {
  const now = new Date();
  const carenceEnds = new Date(assistance.carenceEndsAt);
  const diff = carenceEnds.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Verificar se frota pode contratar assistência (mínimo 10 veículos)
export function canContractAssistance(fleet: CautooFleet): boolean {
  return fleet.members.length >= 10;
}

// Formatar faixa de preço para exibição
export function formatPricingTier(tier: PricingTier): string {
  const max = tier.maxVehicles === Infinity ? '+' : ` a ${tier.maxVehicles}`;
  return `${tier.minVehicles}${max} veículos`;
}
