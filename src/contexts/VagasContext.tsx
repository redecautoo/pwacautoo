import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  Condominio,
  Vaga,
  Reserva,
  DenunciaVaga,
  AvaliacaoVaga,
  UsuarioCondominio,
  PagamentoReserva,
  ReportCondominio,
  MotivoReportCondominio,
  calcularValorReserva,
  calcularComissao,
  gerarLinkAcesso,
  gerarCodigoCondominioUnico,
  isUsuarioSuspenso,
  VALOR_DIARIA_PADRAO,
} from '@/lib/vagasTypes';
import {
  mockCondominios,
  mockVagas,
  mockReservas,
  mockDenuncias,
  mockAvaliacoes,
  mockUsuariosCondominios,
  mockPagamentos,
  mockReportsCondominios,
} from '@/lib/vagasMockData';
import { useApp } from '@/contexts/AppContext';

interface VagasContextType {
  // Condomínios
  condominios: Condominio[];
  meusCondominios: Condominio[];
  criarCondominio: (data: Omit<Condominio, 'id' | 'codigo' | 'criadoPor' | 'status' | 'createdAt'>) => Condominio;
  buscarCondominios: (termo: string) => Condominio[];
  entrarCondominio: (condominioId: string) => void;
  sairCondominio: (condominioId: string) => void;
  isMembroCondominio: (condominioId: string) => boolean;
  
  // Reports de Condomínio
  reportsCondominios: ReportCondominio[];
  reportarCondominio: (condominioId: string, motivo: MotivoReportCondominio, descricao: string) => void;
  
  // Vagas
  vagas: Vaga[];
  minhasVagas: Vaga[];
  vagasDisponiveis: (condominioId: string) => Vaga[];
  criarVaga: (data: Omit<Vaga, 'id' | 'userId' | 'createdAt'>) => Vaga;
  atualizarVaga: (vagaId: string, data: Partial<Vaga>) => void;
  excluirVaga: (vagaId: string) => void;
  
  // Reservas
  reservas: Reserva[];
  minhasReservas: Reserva[];
  reservasRecebidas: Reserva[];
  criarReserva: (data: Omit<Reserva, 'id' | 'userId' | 'valorTotal' | 'status' | 'linkAcesso' | 'createdAt'>) => Reserva;
  confirmarReserva: (reservaId: string) => void;
  confirmarEntrada: (reservaId: string) => void;
  excluirReserva: (reservaId: string) => void;
  cancelarReserva: (reservaId: string) => void;
  concluirReserva: (reservaId: string) => void;
  
  // Pagamentos
  pagamentos: PagamentoReserva[];
  liberarPagamento: (reservaId: string) => void;
  disputarPagamento: (reservaId: string) => void;
  
  // Denúncias
  denuncias: DenunciaVaga[];
  denunciarUsuario: (denunciadoId: string, condominioId: string, motivo: string) => void;
  
  // Avaliações
  avaliacoes: AvaliacaoVaga[];
  avaliarLocatario: (reservaId: string, nota: number, comentario?: string) => void;
  getIRCV: (userId: string) => number;
  
  // Usuário/Condomínio
  usuariosCondominios: UsuarioCondominio[];
  isUsuarioSuspensoEmCondominio: (condominioId: string) => boolean;
  getUsuarioCondominio: (condominioId: string) => UsuarioCondominio | undefined;
  
  // CauCash (delegado ao AppContext - saldo unificado)
  saldo: number;
  pagarComCauCash: (valor: number, descricao: string) => boolean;
  estornarCauCash: (valor: number, descricao: string) => void;
}

const VagasContext = createContext<VagasContextType | undefined>(undefined);

const STORAGE_KEY = 'cautoo_vagas_v1';

interface VagasStorage {
  condominios: Condominio[];
  vagas: Vaga[];
  reservas: Reserva[];
  pagamentos: PagamentoReserva[];
  denuncias: DenunciaVaga[];
  avaliacoes: AvaliacaoVaga[];
  usuariosCondominios: UsuarioCondominio[];
  reportsCondominios: ReportCondominio[];
}

function readStoredData(): VagasStorage | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VagasStorage;
  } catch {
    return null;
  }
}

export function VagasProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  // Usar CauCash unificado do AppContext
  const { cauCashBalance, addTransaction, getCurrentCauCashBalance, currentUser } = useApp();
  
  // Usar o ID do usuário do AppContext se disponível, senão fallback
  const currentUserId = currentUser?.id || userId || 'user-1';
  
  const stored = readStoredData();
  
  const [condominios, setCondominios] = useState<Condominio[]>(stored?.condominios || mockCondominios);
  const [vagas, setVagas] = useState<Vaga[]>(stored?.vagas || mockVagas);
  const [reservas, setReservas] = useState<Reserva[]>(stored?.reservas || mockReservas);
  const [pagamentos, setPagamentos] = useState<PagamentoReserva[]>(stored?.pagamentos || mockPagamentos);
  const [denuncias, setDenuncias] = useState<DenunciaVaga[]>(stored?.denuncias || mockDenuncias);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoVaga[]>(stored?.avaliacoes || mockAvaliacoes);
  const [usuariosCondominios, setUsuariosCondominios] = useState<UsuarioCondominio[]>(
    stored?.usuariosCondominios || mockUsuariosCondominios
  );
  const [reportsCondominios, setReportsCondominios] = useState<ReportCondominio[]>(
    stored?.reportsCondominios || mockReportsCondominios
  );

  // Persistir dados (exceto CauCash que é gerenciado pelo AppContext)
  useEffect(() => {
    const data: VagasStorage = {
      condominios,
      vagas,
      reservas,
      pagamentos,
      denuncias,
      avaliacoes,
      usuariosCondominios,
      reportsCondominios,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [condominios, vagas, reservas, pagamentos, denuncias, avaliacoes, usuariosCondominios, reportsCondominios]);

  // Condomínios
  const meusCondominios = condominios.filter(c => 
    usuariosCondominios.some(uc => uc.condominioId === c.id && uc.userId === currentUserId && !uc.excluido)
  );

  const criarCondominio = useCallback((data: Omit<Condominio, 'id' | 'codigo' | 'criadoPor' | 'status' | 'createdAt'>): Condominio => {
    const novoCondominio: Condominio = {
      ...data,
      id: `cond-${Date.now()}`,
      codigo: gerarCodigoCondominioUnico(condominios),
      criadoPor: currentUserId,
      status: 'ativo',
      createdAt: new Date().toISOString(),
    };
    setCondominios(prev => [...prev, novoCondominio]);
    
    // Auto-entrar no condomínio criado
    const novaAssociacao: UsuarioCondominio = {
      id: `uc-${Date.now()}`,
      userId: currentUserId,
      condominioId: novoCondominio.id,
      ircv: 100,
      excluido: false,
      createdAt: new Date().toISOString(),
    };
    setUsuariosCondominios(prev => [...prev, novaAssociacao]);
    
    return novoCondominio;
  }, [currentUserId, condominios]);

  // Report de Condomínio
  const reportarCondominio = useCallback((condominioId: string, motivo: MotivoReportCondominio, descricao: string) => {
    const novoReport: ReportCondominio = {
      id: `report-${Date.now()}`,
      condominioId,
      userId: currentUserId,
      motivo,
      descricao,
      createdAt: new Date().toISOString(),
    };
    setReportsCondominios(prev => [...prev, novoReport]);
    
    // Marcar condomínio como em revisão (opcional - pode ser feito apenas no backend real)
    setCondominios(prev => prev.map(c => 
      c.id === condominioId ? { ...c, status: 'em_revisao' as const } : c
    ));
  }, [currentUserId]);

  const buscarCondominios = useCallback((termo: string): Condominio[] => {
    const termoLower = termo.toLowerCase();
    return condominios.filter(c =>
      c.nome.toLowerCase().includes(termoLower) ||
      c.endereco.toLowerCase().includes(termoLower) ||
      c.bairro.toLowerCase().includes(termoLower) ||
      c.cidade.toLowerCase().includes(termoLower)
    );
  }, [condominios]);

  const entrarCondominio = useCallback((condominioId: string) => {
    const jaExiste = usuariosCondominios.find(
      uc => uc.condominioId === condominioId && uc.userId === currentUserId
    );
    
    if (jaExiste) {
      if (jaExiste.excluido) {
        // Reativar associação (se não estiver banido permanentemente)
        setUsuariosCondominios(prev => prev.map(uc =>
          uc.id === jaExiste.id ? { ...uc, excluido: false } : uc
        ));
      }
      return;
    }
    
    const novaAssociacao: UsuarioCondominio = {
      id: `uc-${Date.now()}`,
      userId: currentUserId,
      condominioId,
      ircv: 50, // Começa neutro
      excluido: false,
      createdAt: new Date().toISOString(),
    };
    setUsuariosCondominios(prev => [...prev, novaAssociacao]);
  }, [currentUserId, usuariosCondominios]);

  const sairCondominio = useCallback((condominioId: string) => {
    setUsuariosCondominios(prev => prev.filter(
      uc => !(uc.condominioId === condominioId && uc.userId === currentUserId)
    ));
  }, [currentUserId]);

  const isMembroCondominio = useCallback((condominioId: string): boolean => {
    return usuariosCondominios.some(
      uc => uc.condominioId === condominioId && uc.userId === currentUserId && !uc.excluido
    );
  }, [currentUserId, usuariosCondominios]);

  // Vagas
  const minhasVagas = vagas.filter(v => v.userId === currentUserId);

  const vagasDisponiveis = useCallback((condominioId: string): Vaga[] => {
    const hoje = new Date().toISOString().split('T')[0];
    return vagas.filter(v => 
      v.condominioId === condominioId && 
      v.status === 'disponivel' &&
      v.disponivelDe && v.disponivelAte &&
      v.disponivelDe <= hoje && v.disponivelAte >= hoje
    );
  }, [vagas]);

  const criarVaga = useCallback((data: Omit<Vaga, 'id' | 'userId' | 'createdAt'>): Vaga => {
    const novaVaga: Vaga = {
      ...data,
      id: `vaga-${Date.now()}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    setVagas(prev => [...prev, novaVaga]);
    return novaVaga;
  }, [currentUserId]);

  const atualizarVaga = useCallback((vagaId: string, data: Partial<Vaga>) => {
    setVagas(prev => prev.map(v => v.id === vagaId ? { ...v, ...data } : v));
  }, []);

  const excluirVaga = useCallback((vagaId: string) => {
    setVagas(prev => prev.filter(v => v.id !== vagaId));
  }, []);

  // Reservas
  const minhasReservas = reservas.filter(r => r.userId === currentUserId);
  
  const reservasRecebidas = reservas.filter(r => {
    const vaga = vagas.find(v => v.id === r.vagaId);
    return vaga?.userId === currentUserId;
  });

  const criarReserva = useCallback((
    data: Omit<Reserva, 'id' | 'userId' | 'valorTotal' | 'status' | 'linkAcesso' | 'createdAt'>
  ): Reserva => {
    // Buscar a vaga para obter o preço diário
    const vaga = vagas.find(v => v.id === data.vagaId);
    const precoDiario = vaga?.precoDiario || VALOR_DIARIA_PADRAO;
    const valorTotal = calcularValorReserva(data.dataInicio, data.dataFim, precoDiario);
    const { comissaoCautoo, valorProprietario } = calcularComissao(valorTotal);
    
    const novaReserva: Reserva = {
      ...data,
      id: `reserva-${Date.now()}`,
      userId: currentUserId,
      userName: "Lucia Amarela", // Mock user name
      userApartment: "123-A", // Mock user apartment
      valorTotal,
      status: 'pendente',
      linkAcesso: gerarLinkAcesso(),
      createdAt: new Date().toISOString(),
    };
    setReservas(prev => [...prev, novaReserva]);
    
    // Criar pagamento retido com informação de comissão
    const novoPagamento: PagamentoReserva = {
      id: `pag-${Date.now()}`,
      reservaId: novaReserva.id,
      valor: valorTotal,
      status: 'retido',
      dataPagamento: new Date().toISOString(),
    };
    setPagamentos(prev => [...prev, novoPagamento]);
    
    // Log da comissão (para debugging)
    console.log(`Reserva criada - Total: R$${valorTotal} | Comissão Cautoo (20%): R$${comissaoCautoo} | Proprietário (80%): R$${valorProprietario}`);
    
    return novaReserva;
  }, [currentUserId, vagas]);

  const confirmarReserva = useCallback((reservaId: string) => {
    setReservas(prev => prev.map(r => 
      r.id === reservaId ? { ...r, status: 'confirmada' } : r
    ));
  }, []);

  const confirmarEntrada = useCallback((reservaId: string) => {
    setReservas(prev => prev.map(r => 
      r.id === reservaId ? { ...r, status: 'concluida' } : r // Usamos concluida para simplificar ou poderíamos ter um status 'em_uso'
    ));
    
    // Atualizar status da vaga para ocupada
    const reserva = reservas.find(r => r.id === reservaId);
    if (reserva) {
      setVagas(prev => prev.map(v => 
        v.id === reserva.vagaId ? { ...v, status: 'ocupada' } : v
      ));
    }
  }, [reservas]);

  const excluirReserva = useCallback((reservaId: string) => {
    setReservas(prev => prev.filter(r => r.id !== reservaId));
  }, []);

  // CauCash Actions - delegadas ao AppContext (saldo unificado)
  const pagarComCauCash = useCallback((valor: number, descricao: string): boolean => {
    const saldoAtual = getCurrentCauCashBalance();
    if (saldoAtual < valor) return false;
    
    addTransaction({
      type: 'debit',
      amount: valor,
      description: descricao,
      category: 'Garagem'
    });
    return true;
  }, [getCurrentCauCashBalance, addTransaction]);

  const estornarCauCash = useCallback((valor: number, descricao: string) => {
    addTransaction({
      type: 'credit',
      amount: valor,
      description: `Estorno: ${descricao}`,
      category: 'Garagem'
    });
  }, [addTransaction]);

  const cancelarReserva = useCallback((reservaId: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;

    setReservas(prev => prev.map(r => 
      r.id === reservaId ? { ...r, status: 'cancelada' } : r
    ));
    
    // Se a reserva foi paga com CauCash (valorTotal), estornar
    if (reserva.status !== 'cancelada') {
      estornarCauCash(reserva.valorTotal, `Cancelamento de Reserva Vaga ${reserva.vagaId}`);
    }

    // Liberar pagamento de volta
    setPagamentos(prev => prev.map(p => 
      p.reservaId === reservaId ? { ...p, status: 'liberado' } : p
    ));
  }, [reservas, estornarCauCash]);

  const concluirReserva = useCallback((reservaId: string) => {
    setReservas(prev => prev.map(r => 
      r.id === reservaId ? { ...r, status: 'concluida' } : r
    ));
  }, []);

  // Pagamentos
  const liberarPagamento = useCallback((reservaId: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;
    
    // Calcular comissão
    const { comissaoCautoo, valorProprietario } = calcularComissao(reserva.valorTotal);
    
    // Creditar 80% ao proprietário da vaga
    const vaga = vagas.find(v => v.id === reserva.vagaId);
    if (vaga) {
      addTransaction({
        type: 'credit',
        amount: valorProprietario,
        description: `Aluguel Vaga ${vaga.numero} (80%)`,
        category: 'Garagem'
      });
      console.log(`Pagamento liberado - Proprietário recebe: R$${valorProprietario} | Comissão Cautoo: R$${comissaoCautoo}`);
    }
    
    setPagamentos(prev => prev.map(p => 
      p.reservaId === reservaId ? { ...p, status: 'liberado' } : p
    ));
    concluirReserva(reservaId);
  }, [reservas, vagas, concluirReserva, addTransaction]);

  const disputarPagamento = useCallback((reservaId: string) => {
    setPagamentos(prev => prev.map(p => 
      p.reservaId === reservaId ? { ...p, status: 'disputa' } : p
    ));
  }, []);

  // Denúncias
  const denunciarUsuario = useCallback((denunciadoId: string, condominioId: string, motivo: string) => {
    const novaDenuncia: DenunciaVaga = {
      id: `denuncia-${Date.now()}`,
      denuncianteId: currentUserId,
      denunciadoId,
      condominioId,
      motivo,
      status: 'aberta',
      createdAt: new Date().toISOString(),
    };
    setDenuncias(prev => [...prev, novaDenuncia]);
    
    // Verificar se já tem 2+ denúncias
    const denunciasDoUsuario = [...denuncias, novaDenuncia].filter(
      d => d.denunciadoId === denunciadoId && d.condominioId === condominioId && d.status !== 'rejeitada'
    );
    
    if (denunciasDoUsuario.length >= 2) {
      // Aplicar punição
      const associacao = usuariosCondominios.find(
        uc => uc.userId === denunciadoId && uc.condominioId === condominioId
      );
      
      if (associacao) {
        const jaSuspenso = associacao.suspensoAte && new Date(associacao.suspensoAte) > new Date();
        
        if (jaSuspenso) {
          // Segunda infração: exclusão definitiva
          setUsuariosCondominios(prev => prev.map(uc =>
            uc.id === associacao.id ? { ...uc, excluido: true } : uc
          ));
        } else {
          // Primeira infração: suspensão 7 dias
          const suspensoAte = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          setUsuariosCondominios(prev => prev.map(uc =>
            uc.id === associacao.id ? { ...uc, suspensoAte: suspensoAte.toISOString() } : uc
          ));
        }
        
        // Marcar denúncias como confirmadas
        setDenuncias(prev => prev.map(d =>
          d.denunciadoId === denunciadoId && d.condominioId === condominioId
            ? { ...d, status: 'confirmada' }
            : d
        ));
      }
    }
  }, [currentUserId, denuncias, usuariosCondominios]);

  // Avaliações
  const avaliarLocatario = useCallback((reservaId: string, nota: number, comentario?: string) => {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva) return;
    
    const novaAvaliacao: AvaliacaoVaga = {
      id: `aval-${Date.now()}`,
      reservaId,
      avaliadorId: currentUserId,
      avaliadoId: reserva.userId,
      nota,
      comentario,
      createdAt: new Date().toISOString(),
    };
    setAvaliacoes(prev => [...prev, novaAvaliacao]);
    
    // Atualizar IRC-V do avaliado
    const avaliacoesDoUsuario = [...avaliacoes, novaAvaliacao].filter(a => a.avaliadoId === reserva.userId);
    const mediaNotas = avaliacoesDoUsuario.reduce((sum, a) => sum + a.nota, 0) / avaliacoesDoUsuario.length;
    const novoIRCV = Math.round(mediaNotas * 20); // Converte 1-5 para 20-100
    
    setUsuariosCondominios(prev => prev.map(uc =>
      uc.userId === reserva.userId ? { ...uc, ircv: novoIRCV } : uc
    ));
  }, [currentUserId, reservas, avaliacoes]);

  const getIRCV = useCallback((userId: string): number => {
    const associacoes = usuariosCondominios.filter(uc => uc.userId === userId);
    if (associacoes.length === 0) return 50;
    return Math.round(associacoes.reduce((sum, uc) => sum + uc.ircv, 0) / associacoes.length);
  }, [usuariosCondominios]);

  // Usuário/Condomínio helpers
  const isUsuarioSuspensoEmCondominio = useCallback((condominioId: string): boolean => {
    const associacao = usuariosCondominios.find(
      uc => uc.condominioId === condominioId && uc.userId === currentUserId
    );
    return associacao ? isUsuarioSuspenso(associacao) : false;
  }, [currentUserId, usuariosCondominios]);

  const getUsuarioCondominio = useCallback((condominioId: string): UsuarioCondominio | undefined => {
    return usuariosCondominios.find(
      uc => uc.condominioId === condominioId && uc.userId === currentUserId
    );
  }, [currentUserId, usuariosCondominios]);

  const value: VagasContextType = {
    condominios,
    meusCondominios,
    criarCondominio,
    buscarCondominios,
    entrarCondominio,
    sairCondominio,
    isMembroCondominio,
    reportsCondominios,
    reportarCondominio,
    vagas,
    minhasVagas,
    vagasDisponiveis,
    criarVaga,
    atualizarVaga,
    excluirVaga,
    reservas,
    minhasReservas,
    reservasRecebidas,
    criarReserva,
    confirmarReserva,
    confirmarEntrada,
    excluirReserva,
    cancelarReserva,
    concluirReserva,
    pagamentos,
    liberarPagamento,
    disputarPagamento,
    denuncias,
    denunciarUsuario,
    avaliacoes,
    avaliarLocatario,
    getIRCV,
    usuariosCondominios,
    isUsuarioSuspensoEmCondominio,
    getUsuarioCondominio,
    saldo: cauCashBalance,
    pagarComCauCash,
    estornarCauCash,
  };

  return (
    <VagasContext.Provider value={value}>
      {children}
    </VagasContext.Provider>
  );
}

export function useVagas() {
  const context = useContext(VagasContext);
  if (!context) {
    throw new Error('useVagas must be used within a VagasProvider');
  }
  return context;
}
