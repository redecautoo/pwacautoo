import React, { useState } from "react";
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
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
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
  const { showAlert } = useApp();

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
    showAlert("Pagamento Liberado", "O valor foi transferido para sua conta CauCash com sucesso.", "success");
  };

  const handleDisputar = (reservaId: string) => {
    disputarPagamento(reservaId);
    showAlert("Disputa Aberta", "A central Cautoo foi notificada e irá analisar a ocorrência em até 48h.", "warning");
  };

  const handleAvaliar = () => {
    if (!avaliacaoModal) return;
    avaliarLocatario(avaliacaoModal.reservaId, nota, comentario.trim() || undefined);
    showAlert("Feedback Enviado", "Obrigado por sua avaliação! Isso ajuda a manter a rede segura.", "success");
    setAvaliacaoModal(null);
    setNota(5);
    setComentario("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/garagem")}><ArrowLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-lg font-semibold">Reservas Recebidas</h1><p className="text-sm text-muted-foreground">{reservasRecebidas.length} reserva(s)</p></div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            {reservasRecebidas.length === 0 ? (
              <motion.div className="bg-card border border-border rounded-xl p-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhuma reserva</h3>
                <p className="text-sm text-muted-foreground">Suas garagens ainda não receberam reservas.</p>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                {reservasRecebidas.map((reserva, index) => {
                  const vaga = vagas.find(v => v.id === reserva.vagaId);
                  const cond = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;
                  const statusInfo = getStatusInfo(reserva.status);
                  const StatusIcon = statusInfo.icon;
                  const pagStatus = getPagamentoStatus(reserva.id);
                  const podeLiberar = reserva.status === 'confirmada' && pagStatus === 'retido';
                  const podeConcluir = new Date(reserva.dataFim) <= new Date();

                  return (
                    <motion.div key={reserva.id} className="bg-card border border-border rounded-xl overflow-hidden" variants={staggerItemVariants} custom={index}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2"><span className="font-bold">Vaga {vaga?.numero}</span><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}><StatusIcon className="w-3 h-3" />{statusInfo.label}</span></div>
                            <p className="text-xs text-muted-foreground">{cond?.nome}</p>
                            <div className="mt-3 space-y-1 text-xs text-muted-foreground uppercase font-bold">
                              <p className="text-foreground">Motorista: {reserva.motorista}</p>
                              <p>Placa: {reserva.placa}</p>
                              <p>{reserva.dataInicio} — {reserva.dataFim}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">R$ {reserva.valorTotal}</div>
                            <div className={`text-[9px] uppercase font-bold mt-1 ${pagStatus === 'liberado' ? 'text-green-500' : pagStatus === 'disputa' ? 'text-amber-500' : 'text-muted-foreground'}`}>{pagStatus === 'liberado' ? '✓ Liberado' : pagStatus === 'disputa' ? '⚠ Em Análise' : '🔒 Retido'}</div>
                          </div>
                        </div>
                      </div>
                      {podeLiberar && podeConcluir && (
                        <div className="border-t border-border px-4 py-3 bg-secondary/20 flex gap-2">
                          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => handleLiberarPagamento(reserva.id)}><DollarSign className="w-4 h-4 mr-1" />Liberar R$ {reserva.valorTotal}</Button>
                          <Button size="sm" variant="outline" onClick={() => setAvaliacaoModal({ reservaId: reserva.id })}><Star className="w-4 h-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDisputar(reserva.id)}><AlertTriangle className="w-4 h-4" /></Button>
                        </div>
                      )}
                      {reserva.status === 'concluida' && <div className="border-t border-border px-4 py-2 bg-green-500/10 text-center"><span className="text-[10px] uppercase font-bold text-green-500">Reserva Concluída</span></div>}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>
        <Dialog open={!!avaliacaoModal} onOpenChange={() => setAvaliacaoModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Avaliar Motorista</DialogTitle></DialogHeader>
            <div className="space-y-6 py-4">
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setNota(n)} className="p-1 transition-transform hover:scale-125"><Star className={`w-8 h-8 ${n <= nota ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground opacity-30'}`} /></button>
                ))}
              </div>
              <Textarea placeholder="Como foi o uso da vaga? (opcional)" value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={200} className="min-h-[100px] resize-none" />
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setAvaliacaoModal(null)}>Cancelar</Button><Button onClick={handleAvaliar} className="font-bold">Enviar Avaliação</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default VagasReservasRecebidas;

