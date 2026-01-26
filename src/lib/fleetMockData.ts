import { CautooFleet, FleetMember, FleetChatMessage, FleetHelpRequest, FleetAssistance } from './fleetTypes';

// Mock de membros de uma frota
const mockFleetMembers: FleetMember[] = [
  { id: 'fm-1', plate: 'ABC1D23', model: 'Fiat Argo 2023', color: 'Vermelho', ownerId: 'user-female-client', ownerName: 'Ana Cliente', joinedAt: '2025-01-05T10:00:00Z' },
  { id: 'fm-2', plate: 'DEF4G56', model: 'Chevrolet Onix 2022', color: 'Branco', ownerId: 'user-2', ownerName: 'Carlos Silva', joinedAt: '2025-01-05T11:00:00Z' },
  { id: 'fm-3', plate: 'GHI7J89', model: 'Honda Civic 2023', color: 'Prata', ownerId: 'user-male-client', ownerName: 'Pedro Cliente', joinedAt: '2025-01-05T12:00:00Z' },
  { id: 'fm-4', plate: 'JKL1M23', model: 'Toyota Corolla 2022', color: 'Preto', ownerId: 'user-3', ownerName: 'Maria Santos', joinedAt: '2025-01-05T13:00:00Z' },
  { id: 'fm-5', plate: 'MNO4P56', model: 'Volkswagen Polo 2023', color: 'Azul', ownerId: 'user-4', ownerName: 'João Oliveira', joinedAt: '2025-01-05T14:00:00Z' },
  { id: 'fm-6', plate: 'QRS7T89', model: 'Hyundai HB20 2022', color: 'Vermelho', ownerId: 'user-5', ownerName: 'Fernanda Lima', joinedAt: '2025-01-05T15:00:00Z' },
  { id: 'fm-7', plate: 'UVW1X23', model: 'Renault Kwid 2023', color: 'Branco', ownerId: 'user-6', ownerName: 'Ricardo Costa', joinedAt: '2025-01-05T16:00:00Z' },
  { id: 'fm-8', plate: 'YZA4B56', model: 'Fiat Mobi 2022', color: 'Prata', ownerId: 'user-7', ownerName: 'Patrícia Alves', joinedAt: '2025-01-05T17:00:00Z' },
  { id: 'fm-9', plate: 'CDE7F89', model: 'Chevrolet Tracker 2023', color: 'Cinza', ownerId: 'user-8', ownerName: 'Lucas Mendes', joinedAt: '2025-01-05T18:00:00Z' },
  { id: 'fm-10', plate: 'GHI1J23', model: 'Jeep Compass 2022', color: 'Preto', ownerId: 'user-9', ownerName: 'Camila Rocha', joinedAt: '2025-01-05T19:00:00Z' },
  { id: 'fm-11', plate: 'KLM4N56', model: 'BMW X1 2023', color: 'Branco', ownerId: 'user-10', ownerName: 'André Souza', joinedAt: '2025-01-06T10:00:00Z' },
  { id: 'fm-12', plate: 'OPQ7R89', model: 'Audi A3 2022', color: 'Azul', ownerId: 'user-11', ownerName: 'Juliana Ferreira', joinedAt: '2025-01-06T11:00:00Z' },
];

// Mock de mensagens de chat
const mockFleetChat: FleetChatMessage[] = [
  { 
    id: 'msg-1', 
    fleetId: 'fleet-1', 
    senderId: 'user-female-client', 
    senderName: 'Ana Cliente', 
    text: 'Boa tarde, pessoal! Prontos para o evento?', 
    type: 'message',
    createdAt: '2025-01-10T14:00:00Z' 
  },
  { 
    id: 'msg-2', 
    fleetId: 'fleet-1', 
    senderId: 'user-male-client', 
    senderName: 'Pedro Cliente', 
    text: 'Sim! Vou sair daqui a pouco de SP.', 
    type: 'message',
    createdAt: '2025-01-10T14:05:00Z' 
  },
  { 
    id: 'msg-3', 
    fleetId: 'fleet-1', 
    senderId: 'system', 
    senderName: 'Sistema', 
    text: 'Carlos Silva entrou na frota.', 
    type: 'system',
    createdAt: '2025-01-10T14:10:00Z' 
  },
];

// Mock de solicitações de socorro
const mockFleetHelpRequests: FleetHelpRequest[] = [];

// Mock de assistência contratada
const mockFleetAssistance: FleetAssistance = {
  id: 'assist-1',
  fleetId: 'fleet-1',
  validFrom: '2025-01-15T00:00:00Z',
  validUntil: '2025-01-20T23:59:59Z',
  daysCount: 5,
  vehicleCount: 12,
  pricePerVehiclePerDay: 50, // Faixa 10-19
  callsBasePerDay: 1,
  multiplier: 1,
  totalPrice: 3000, // 12 * 50 * 5 * 1
  callsTotal: 5, // 1 * 5 * 1
  callsUsed: 0,
  callsReserved: 0,
  carenceEndsAt: '2025-01-08T00:00:00Z', // Já passou a carência
  contractedAt: '2025-01-05T10:00:00Z',
  isActive: true,
  createdAt: '2025-01-05T10:00:00Z',
};

// Frotas mockadas
export const mockFleets: CautooFleet[] = [
  {
    id: 'fleet-1',
    name: 'Caravana Litoral 2025',
    description: 'Grupo de amigos que viajam juntos para o litoral',
    creatorId: 'user-female-client',
    creatorName: 'Ana Cliente',
    adminIds: ['user-male-client'],
    members: mockFleetMembers,
    invites: [],
    assistances: [mockFleetAssistance],
    isVerified: true,
    verifiedAt: '2025-01-05T10:00:00Z',
    verifiedExpiresAt: '2026-01-05T10:00:00Z',
    chatMessages: mockFleetChat,
    helpRequests: mockFleetHelpRequests,
    createdAt: '2025-01-05T10:00:00Z',
  },
  {
    id: 'fleet-2',
    name: 'Amigos da Serra',
    description: 'Grupo para viagens à serra gaúcha',
    creatorId: 'user-male-client',
    creatorName: 'Pedro Cliente',
    adminIds: [],
    members: mockFleetMembers.slice(0, 10), // 10 veículos
    invites: [],
    assistances: [], // Ainda não contratou assistência
    isVerified: false,
    chatMessages: [],
    helpRequests: [],
    createdAt: '2025-01-12T10:00:00Z',
  },
  {
    id: 'fleet-3',
    name: 'Família Silva',
    description: 'Veículos da família',
    creatorId: 'user-3',
    creatorName: 'Maria Santos',
    adminIds: [],
    members: mockFleetMembers.slice(0, 5), // Apenas 5 veículos - não pode contratar assistência ainda
    invites: [],
    assistances: [],
    isVerified: false,
    chatMessages: [],
    helpRequests: [],
    createdAt: '2025-01-10T10:00:00Z',
  },
];

// Frota vazia para teste
export const mockEmptyFleet: CautooFleet = {
  id: 'fleet-draft',
  name: 'Minha Nova Frota',
  description: '',
  creatorId: 'user-1',
  creatorName: 'João Silva',
  adminIds: [],
  members: [],
  invites: [],
  assistances: [],
  isVerified: false,
  chatMessages: [],
  helpRequests: [],
  createdAt: new Date().toISOString(),
};
