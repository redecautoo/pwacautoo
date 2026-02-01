// Tipos do módulo Cautoo Vagas

export type TipoCondominio = 'predio' | 'casas';

export type StatusCondominio = 'ativo' | 'em_revisao';

export interface Condominio {
  id: string;
  codigo: string; // Código único permanente (ex: CT-8F3K9A)
  nome: string;
  tipo: TipoCondominio;
  endereco: string;
  numero?: string; // Número do endereço
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  criadoPor: string; // userId
  status: StatusCondominio;
  createdAt: string;
}

export type MotivoReportCondominio = 
  | 'duplicado'
  | 'endereco_incorreto'
  | 'nome_incorreto'
  | 'informacoes_fraudulentas'
  | 'solicitar_atualizacao';

export interface ReportCondominio {
  id: string;
  condominioId: string;
  userId: string;
  motivo: MotivoReportCondominio;
  descricao: string;
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
  precoDiario: number;
  precoMensal?: number;
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
export const VALOR_DIARIA_PADRAO = 25; // R$ 25/dia default
export const COMISSAO_CAUTOO = 0.20; // 20% comissão

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

export function calcularValorReserva(dataInicio: string, dataFim: string, precoDiario: number = VALOR_DIARIA_PADRAO): number {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return dias * precoDiario;
}

export function calcularComissao(valorTotal: number): { comissaoCautoo: number; valorProprietario: number } {
  const comissaoCautoo = Math.round(valorTotal * COMISSAO_CAUTOO * 100) / 100;
  const valorProprietario = Math.round((valorTotal - comissaoCautoo) * 100) / 100;
  return { comissaoCautoo, valorProprietario };
}

// Normaliza texto removendo acentos, espaços extras e convertendo para minúsculo
function normalizarTexto(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
}

// Extrai apenas números de uma string
function extrairNumeros(texto: string): string {
  return texto.replace(/\D/g, '');
}

// Verifica se já existe um condomínio com os mesmos dados críticos
export function verificarCondominioExistente(
  condominios: Condominio[],
  nome: string,
  endereco: string,
  cep: string
): Condominio | undefined {
  const nomeNorm = normalizarTexto(nome);
  const enderecoNorm = normalizarTexto(endereco);
  const cepNorm = extrairNumeros(cep);
  
  return condominios.find(c => {
    const cNomeNorm = normalizarTexto(c.nome);
    const cEnderecoNorm = normalizarTexto(c.endereco);
    const cCepNorm = extrairNumeros(c.cep);
    
    // Verifica match exato em nome + endereço + CEP
    if (cNomeNorm === nomeNorm && cEnderecoNorm === enderecoNorm && cCepNorm === cepNorm) {
      return true;
    }
    
    // Verifica match em endereço + CEP (pode ser mesmo prédio com nome diferente)
    if (cEnderecoNorm === enderecoNorm && cCepNorm === cepNorm) {
      return true;
    }
    
    return false;
  });
}

// Gera código único permanente para o condomínio
export function gerarCodigoCondominio(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sem I, O, 0, 1 para evitar confusão
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CT-${codigo}`;
}

// Verifica se código já existe
export function codigoCondominioExiste(condominios: Condominio[], codigo: string): boolean {
  return condominios.some(c => c.codigo === codigo);
}

// Gera código único garantindo que não exista duplicado
export function gerarCodigoCondominioUnico(condominios: Condominio[]): string {
  let codigo = gerarCodigoCondominio();
  let tentativas = 0;
  while (codigoCondominioExiste(condominios, codigo) && tentativas < 100) {
    codigo = gerarCodigoCondominio();
    tentativas++;
  }
  return codigo;
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
