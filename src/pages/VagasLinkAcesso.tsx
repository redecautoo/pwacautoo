import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  MapPin, 
  Car, 
  User, 
  AlertTriangle,
  LogIn,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { useVagas } from "@/contexts/VagasContext";
import { toast } from "sonner";
import { useState } from "react";

const VagasLinkAcesso = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { reservas, confirmarEntrada, vagas, condominios } = useVagas();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Buscar reserva pelo linkAcesso ou pelo código
  const reserva = reservas.find(r => r.linkAcesso.includes(code || "")) || 
                  reservas.find(r => r.id.includes(code || "")) ||
                  (reservas.length > 0 ? reservas[reservas.length - 1] : null);
  const vaga = reserva ? vagas.find(v => v.id === reserva.vagaId) : null;
  const condominio = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;

  // Verificar expiração (se a data fim já passou)
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dataFim = reserva ? new Date(reserva.dataFim) : null;
  const expirado = dataFim ? dataFim < hoje : false;

  const handleCheckIn = async () => {
    if (!reserva) return;
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    confirmarEntrada(reserva.id);
    setIsProcessing(false);
    toast.success("Entrada confirmada com sucesso!");
  };

  if (!reserva) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
          <p className="text-muted-foreground mb-6">Este comprovante de acesso não foi encontrado ou foi removido.</p>
          <Button onClick={() => navigate("/")} className="w-full max-w-xs">
            Ir para Tela Inicial
          </Button>
        </div>
      </PageTransition>
    );
  }

  if (expirado) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Link Expirado</h2>
          <p className="text-muted-foreground mb-8">
            Este comprovante de acesso expirou em {new Date(reserva.dataFim).toLocaleDateString()}.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <Button onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Acessar App Cauto
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <header className="p-4 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Controle de Portaria</h1>
        </header>

        <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            {/* Status Header */}
            <div className={`p-6 text-center border-b border-border ${
              reserva.status === 'concluida' ? 'bg-blue-500/10' : 'bg-green-500/10'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                reserva.status === 'concluida' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {reserva.status === 'concluida' ? (
                  <CheckCircle2 className="w-10 h-10 text-white" />
                ) : (
                  <QrCode className="w-10 h-10 text-white" />
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {reserva.status === 'concluida' ? 'Veículo em Uso' : 'Acesso Autorizado'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {reserva.status === 'concluida' 
                  ? 'O veículo já realizou a entrada' 
                  : 'Valide os dados e confirme a entrada'}
              </p>
            </div>

            {/* Main Info */}
            <div className="p-6 space-y-4">
              {/* Identificação da Reserva */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Home className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Identificação da Reserva</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Condomínio</p>
                    <p className="text-sm font-semibold truncate">{condominio?.nome}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Vaga</p>
                    <p className="text-sm font-semibold">Vaga {vaga?.numero}</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Período de Uso</p>
                  <p className="text-sm font-semibold">
                    {new Date(reserva.dataInicio).toLocaleDateString()} até {new Date(reserva.dataFim).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Responsável pela Vaga */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <User className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Responsável pela Vaga</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Nome</p>
                    <p className="text-sm font-semibold truncate">Proprietário</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Apto</p>
                    <p className="text-sm font-semibold">---</p>
                  </div>
                </div>
              </div>

              {/* Responsável pela Reserva */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Responsável pela Reserva</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Nome</p>
                    <p className="text-sm font-semibold truncate">{reserva.userName || "Morador"}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Apto</p>
                    <p className="text-sm font-semibold">{reserva.userApartment || "---"}</p>
                  </div>
                </div>
              </div>

              {/* Responsável pelo Veículo */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Car className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Responsável pelo Veículo</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Motorista</p>
                    <p className="text-sm font-semibold truncate">{reserva.motorista}</p>
                  </div>
                  <div className="p-3 bg-secondary/30 rounded-xl">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Placa</p>
                    <p className="text-sm font-semibold">{reserva.placa}</p>
                  </div>
                </div>
                <div className="p-3 bg-secondary/30 rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Tipo de Uso</p>
                  <p className="text-sm font-semibold capitalize">{reserva.tipoUso}</p>
                </div>
              </div>
            </div>

            {/* Check-in Action */}
            <div className="p-6 bg-secondary/10 border-t border-border">
              {reserva.status !== 'concluida' ? (
                <Button 
                  onClick={handleCheckIn} 
                  disabled={isProcessing}
                  className="w-full h-14 text-lg font-bold gap-2 shadow-lg"
                >
                  {isProcessing ? (
                    <motion.div
                      className="w-6 h-6 border-3 border-primary-foreground border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                  ) : (
                    <>
                      <LogIn className="w-6 h-6" />
                      Confirmar Entrada
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-400 font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Entrada confirmada na portaria
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs text-muted-foreground">
              ID da Reserva: {reserva.id.toUpperCase()}
            </p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground">
              Voltar para o Início
            </Button>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasLinkAcesso;
