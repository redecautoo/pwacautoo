import { 
  Condominio, 
  Vaga, 
  Reserva, 
  DenunciaVaga, 
  AvaliacaoVaga, 
  UsuarioCondominio,
  PagamentoReserva
} from './vagasTypes';

// Mock Condomínios
export const mockCondominios: Condominio[] = [
  {
    id: 'cond-1',
    nome: 'Edifício Solar das Palmeiras',
    endereco: 'Rua das Flores, 123',
    bairro: 'Jardim América',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01310-100',
    criadoPor: 'user-1',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cond-2',
    nome: 'Condomínio Vista Verde',
    endereco: 'Av. Brasil, 456',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01020-000',
    criadoPor: 'user-2',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'cond-3',
    nome: 'Residencial Park Avenue',
    endereco: 'Rua Augusta, 789',
    bairro: 'Consolação',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01305-000',
    criadoPor: 'user-3',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Vagas
export const mockVagas: Vaga[] = [
  {
    id: 'vaga-1',
    condominioId: 'cond-1',
    userId: 'user-1',
    numero: '15A',
    tipo: 'coberta',
    placa: 'ABC1D23',
    observacao: 'Próxima ao elevador',
    status: 'disponivel',
    disponivelDe: new Date().toISOString().split('T')[0],
    disponivelAte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vaga-2',
    condominioId: 'cond-1',
    userId: 'user-2',
    numero: '32B',
    tipo: 'descoberta',
    placa: 'XYZ9K87',
    status: 'disponivel',
    disponivelDe: new Date().toISOString().split('T')[0],
    disponivelAte: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vaga-3',
    condominioId: 'cond-2',
    userId: 'user-3',
    numero: '05',
    tipo: 'coberta',
    placa: 'DEF4G56',
    observacao: 'Vaga grande, cabe SUV',
    status: 'ocupada',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Reservas
export const mockReservas: Reserva[] = [
  {
    id: 'reserva-1',
    vagaId: 'vaga-1',
    userId: 'user-3',
    tipoUso: 'morador',
    placa: 'GHI7J89',
    motorista: 'Carlos Silva',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    valorTotal: 100, // 4 dias x R$25
    status: 'confirmada',
    linkAcesso: 'https://cautoo.app/v/ABC12345',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Pagamentos
export const mockPagamentos: PagamentoReserva[] = [
  {
    id: 'pag-1',
    reservaId: 'reserva-1',
    valor: 100,
    status: 'retido',
    dataPagamento: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Denúncias
export const mockDenuncias: DenunciaVaga[] = [];

// Mock Avaliações
export const mockAvaliacoes: AvaliacaoVaga[] = [];

// Mock Associações de usuários a condomínios
export const mockUsuariosCondominios: UsuarioCondominio[] = [
  {
    id: 'uc-1',
    userId: 'user-1',
    condominioId: 'cond-1',
    ircv: 85,
    excluido: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'uc-2',
    userId: 'user-2',
    condominioId: 'cond-1',
    ircv: 72,
    excluido: false,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
