import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarDays, 
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const VagasReservasRecebidas = () => {
  const navigate = useNavigate();
  const { 
    reservasRecebidas, 
    vagas, 
    condominios, 
    pagamentos,
    liberarPagamento,
    disputarPagamento,
    avaliarLocatario
  } = useVagas();

  const [avaliacaoModal, setAvaliacaoModal] = useState<{ reservaId: string } | null>(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState("");

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pendente' };
      case 'confirmada':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Em uso' };
      case 'concluida':
        return { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Concluída' };
      case 'cancelada':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Cancelada' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-secondary', label: status };
    }
  };

  const getPagamentoStatus = (reservaId: string) => {
    const pag = pagamentos.find(p => p.reservaId === reservaId);
    return pag?.status || 'retido';
  };

  const handleLiberarPagamento = (reservaId: string) => {
    liberarPagamento(reservaId);
    toast.success("Pagamento liberado com sucesso!");
  };

  const handleDisputar = (reservaId: string) => {
    disputarPagamento(reservaId);
    toast.warning("Disputa aberta. A Cautoo irá analisar.");
  };

  const handleAvaliar = () => {
    if (!avaliacaoModal) return;
    avaliarLocatario(avaliacaoModal.reservaId, nota, comentario.trim() || undefined);
    toast.success("Avaliação enviada!");
    setAvaliacaoModal(null);
    setNota(5);
    setComentario("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/garagem")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Reservas Recebidas</h1>
                <p className="text-sm text-muted-foreground">{reservasRecebidas.length} reserva(s)</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            
            {reservasRecebidas.length === 0 ? (
              <motion.div 
                className="bg-card border border-border rounded-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nenhuma reserva recebida</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Quando alguém reservar sua vaga, aparecerá aqui.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {reservasRecebidas.map((reserva, index) => {
                  const vaga = vagas.find(v => v.id === reserva.vagaId);
                  const cond = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;
                  const statusInfo = getStatusInfo(reserva.status);
                  const StatusIcon = statusInfo.icon;
                  const pagStatus = getPagamentoStatus(reserva.id);
                  const podeLiberar = reserva.status === 'confirmada' && pagStatus === 'retido';
                  const podeConcluir = new Date(reserva.dataFim) <= new Date();

                  return (
                    <motion.div
                      key={reserva.id}
                      className="bg-card border border-border rounded-xl overflow-hidden"
                      variants={staggerItemVariants}
                      custom={index}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                Vaga {vaga?.numero || '?'}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusInfo.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {cond?.nome || 'Condomínio'}
                            </p>
                            <div className="mt-2 space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Motorista:</span>
                                <span className="font-medium text-foreground">{reserva.motorista}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Placa:</span>
                                <span className="font-medium text-foreground">{reserva.placa}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">Período:</span>
                                <span className="text-foreground">{reserva.dataInicio} → {reserva.dataFim}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">R$ {reserva.valorTotal}</div>
                            <div className={`text-xs mt-1 ${
                              pagStatus === 'liberado' ? 'text-green-400' : 
                              pagStatus === 'disputa' ? 'text-amber-400' : 'text-muted-foreground'
                            }`}>
                              {pagStatus === 'liberado' ? '✓ Liberado' : 
                               pagStatus === 'disputa' ? '⚠ Em análise' : '🔒 Retido'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {podeLiberar && podeConcluir && (
                        <div className="border-t border-border px-4 py-3 bg-secondary/30 space-y-2">
                          <p className="text-xs text-muted-foreground mb-2">
                            Período encerrado. Confirme a liberação do pagamento:
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              className="flex-1"
                              onClick={() => handleLiberarPagamento(reserva.id)}
                            >
                              <DollarSign className="w-4 h-4 mr-1" />
                              Liberar Pagamento
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => setAvaliacaoModal({ reservaId: reserva.id })}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDisputar(reserva.id)}
                            >
                              <AlertTriangle className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {reserva.status === 'concluida' && (
                        <div className="border-t border-border px-4 py-3 bg-green-500/10">
                          <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircle className="w-4 h-4" />
                            <span>Reserva concluída e pagamento liberado</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

          </div>
        </main>

        {/* Avaliação Modal */}
        <Dialog open={!!avaliacaoModal} onOpenChange={() => setAvaliacaoModal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Avaliar Locatário</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm text-muted-foreground mb-3">Como foi a experiência?</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNota(n)}
                      className="p-2 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${n <= nota ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Textarea
                  placeholder="Comentário (opcional)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  maxLength={200}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setAvaliacaoModal(null)}>
                Cancelar
              </Button>
              <Button onClick={handleAvaliar}>
                Enviar Avaliação
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default VagasReservasRecebidas;
