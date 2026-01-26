import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CalendarDays, 
  ChevronRight,
  QrCode,
  Copy,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { toast } from "sonner";

const VagasMinhasReservas = () => {
  const navigate = useNavigate();
  const { minhasReservas, vagas, condominios, excluirReserva } = useVagas();
  const [reservaToDelete, setReservaToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (reservaToDelete) {
      excluirReserva(reservaToDelete);
      toast.success("Reserva removida");
      setReservaToDelete(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendente':
        return { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pendente' };
      case 'confirmada':
        return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Confirmada' };
      case 'concluida':
        return { icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Concluída' };
      case 'cancelada':
        return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Cancelada' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-secondary', label: status };
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
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
                <h1 className="text-lg font-semibold text-foreground">Minhas Reservas</h1>
                <p className="text-sm text-muted-foreground">{minhasReservas.length} reserva(s)</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            
            {minhasReservas.length === 0 ? (
              <motion.div 
                className="bg-card border border-border rounded-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nenhuma reserva</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você ainda não fez nenhuma reserva de vaga.
                </p>
                <Button onClick={() => navigate("/garagem/buscar")}>
                  Buscar Vagas
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {minhasReservas.map((reserva, index) => {
                  const vaga = vagas.find(v => v.id === reserva.vagaId);
                  const cond = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;
                  const statusInfo = getStatusInfo(reserva.status);
                  const StatusIcon = statusInfo.icon;

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
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{reserva.dataInicio} → {reserva.dataFim}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <span className="text-muted-foreground">Placa:</span>
                              <span className="font-medium text-foreground">{reserva.placa}</span>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="text-lg font-bold text-primary">R$ {reserva.valorTotal}</div>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setReservaToDelete(reserva.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      {(reserva.status === 'confirmada' || reserva.status === 'pendente') && (
                        <div className="border-t border-border px-4 py-3 bg-secondary/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <QrCode className="w-4 h-4 text-primary" />
                              <span className="text-muted-foreground truncate max-w-[180px]">
                                {reserva.linkAcesso}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => copyLink(reserva.linkAcesso)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" asChild>
                                <Link to={`/v/${reserva.linkAcesso.split('/').pop()}`}>
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
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

        {/* Confirm Delete Dialog */}
        <AlertDialog open={!!reservaToDelete} onOpenChange={() => setReservaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir reserva?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação removerá o registro da reserva da sua lista.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default VagasMinhasReservas;
