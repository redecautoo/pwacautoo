// Tipos do módulo Cautoo Vagas

export interface Condominio {
  id: string;
  nome: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  criadoPor: string; // userId
  createdAt: string;
}

export type TipoVaga = 'coberta' | 'descoberta';
export type StatusVaga = 'ocupada' | 'disponivel';

export interface Vaga {
  id: string;
  condominioId: string;
  userId: string;
  numero: string;
  tipo: TipoVaga;
  placa: string;
  observacao?: string;
  status: StatusVaga;
  disponivelDe?: string; // date ISO
  disponivelAte?: string; // date ISO
  createdAt: string;
}

export type TipoUso = 'morador' | 'visitante';
export type StatusReserva = 'pendente' | 'confirmada' | 'concluida' | 'cancelada';
export type StatusPagamento = 'retido' | 'liberado' | 'disputa';

export interface Reserva {
  id: string;
  vagaId: string;
  userId: string; // quem reservou
  userName?: string; // Nome de quem reservou
  userApartment?: string; // Apartamento de quem reservou
  tipoUso: TipoUso;
  placa: string;
  motorista: string;
  dataInicio: string; // date ISO
  dataFim: string; // date ISO
  valorTotal: number;
  status: StatusReserva;
  linkAcesso: string; // URL curta para QR Code
  createdAt: string;
}

export interface PagamentoReserva {
  id: string;
  reservaId: string;
  valor: number;
  status: StatusPagamento;
  dataPagamento: string;
}

export type StatusDenuncia = 'aberta' | 'confirmada' | 'rejeitada';

export interface DenunciaVaga {
  id: string;
  denuncianteId: string; // userId com selo azul
  denunciadoId: string; // userId acusado
  condominioId: string;
  motivo: string;
  status: StatusDenuncia;
  createdAt: string;
}

export interface AvaliacaoVaga {
  id: string;
  reservaId: string;
  avaliadorId: string; // dono da vaga
  avaliadoId: string; // locatário
  nota: number; // 1-5
  comentario?: string;
  createdAt: string;
}

export type TipoMovimentacao = 'credito' | 'debito' | 'estorno' | 'cancelamento';
export type StatusMovimentacao = 'concluido' | 'pendente' | 'cancelado';

export interface MovimentacaoCauCash {
  id: string;
  userId: string;
  tipo: TipoMovimentacao;
  descricao: string;
  valor: number;
  status: StatusMovimentacao;
  createdAt: string;
}

export interface CauCashWallet {
  saldo: number;
  historico: MovimentacaoCauCash[];
}

export interface UsuarioCondominio {
  id: string;
  userId: string;
  condominioId: string;
  ircv: number; // Índice de Reputação Comunitária de Vagas (0-100)
  suspensoAte?: string; // date ISO se suspenso
  excluido: boolean;
  createdAt: string;
}

// Constantes
export const VALOR_DIARIA = 25; // R$ 25/dia

// Helpers
export function isUsuarioSuspenso(usuario: UsuarioCondominio): boolean {
  if (usuario.excluido) return true;
  if (!usuario.suspensoAte) return false;
  return new Date(usuario.suspensoAte) > new Date();
}

export function getDiasSuspensao(usuario: UsuarioCondominio): number {
  if (!usuario.suspensoAte) return 0;
  const diff = new Date(usuario.suspensoAte).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function calcularValorReserva(dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return dias * VALOR_DIARIA;
}

export function gerarLinkAcesso(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  // Use o domínio do Replit para desenvolvimento
  const domain = window.location.host || 'ee14a1a2-4a70-4086-b8aa-169a74fbb26f-00-1fo6zantv7y2b.spock.replit.dev';
  const protocol = window.location.protocol || 'https:';
  return `${protocol}//${domain}/v/${result}`;
}
