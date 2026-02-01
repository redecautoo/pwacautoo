import React, { useState } from "react";
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
import { useApp } from "@/contexts/AppContext";

const VagasLinkAcesso = () => {
  const navigate = useNavigate();
  const { code } = useParams<{ code: string }>();
  const { reservas, confirmarEntrada, vagas, condominios } = useVagas();
  const { showAlert } = useApp();
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
    showAlert("Entrada Confirmada", "A entrada do veículo foi registrada com sucesso na portaria.", "success");
  };

  if (!reserva) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Link Inválido</h2>
          <p className="text-muted-foreground mb-6">Este comprovante de acesso não foi encontrado ou foi removido.</p>
          <Button onClick={() => navigate("/")} className="w-full max-w-xs h-12 rounded-xl">Ir para Início</Button>
        </div>
      </PageTransition>
    );
  }

  if (expirado) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-4"><Clock className="w-10 h-10 text-amber-500" /></div>
          <h2 className="text-xl font-bold mb-2">Link Expirado</h2>
          <p className="text-muted-foreground mb-8">Este comprovante expirou em {new Date(reserva.dataFim).toLocaleDateString()}.</p>
          <Button onClick={() => navigate("/")} className="w-full max-w-xs h-12 rounded-xl flex items-center justify-center gap-2"><Home className="w-4 h-4" />Voltar ao App</Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <header className="p-4 flex items-center gap-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="text-lg font-semibold">Controle de Portaria</h1>
        </header>
        <main className="px-4 py-6 max-w-lg mx-auto space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
            <div className={`p-6 text-center border-b border-border ${reserva.status === 'concluida' ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${reserva.status === 'concluida' ? 'bg-blue-500' : 'bg-green-500'}`}>{reserva.status === 'concluida' ? <CheckCircle2 className="w-10 h-10 text-white" /> : <QrCode className="w-10 h-10 text-white" />}</div>
              <h2 className="text-xl font-bold">{reserva.status === 'concluida' ? 'Veículo em Uso' : 'Acesso Autorizado'}</h2>
              <p className="text-sm text-muted-foreground">{reserva.status === 'concluida' ? 'O veículo já realizou a entrada' : 'Valide os dados e confirme a entrada'}</p>
            </div>
            <div className="p-6 space-y-4">
              <Section title="Identificação da Reserva" icon={<Home className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBox label="Condomínio" value={condominio?.nome} />
                  <InfoBox label="Vaga" value={`Vaga ${vaga?.numero}`} />
                </div>
                <InfoBox label="Endereço" value={condominio ? `${condominio.endereco}, ${condominio.bairro}` : undefined} />
                <InfoBox label="Período Autorizado" value={`${new Date(reserva.dataInicio).toLocaleDateString()} - ${new Date(reserva.dataFim).toLocaleDateString()}`} />
              </Section>
              <Section title="Proprietário da Vaga" icon={<User className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBox label="Reservado por" value={reserva.userName || "Morador"} />
                  <InfoBox label="Apartamento" value={reserva.userApartment || "---"} />
                </div>
              </Section>
              <Section title="Veículo Autorizado" icon={<Car className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  <InfoBox label="Motorista" value={reserva.motorista} />
                  <InfoBox label="Placa" value={reserva.placa} />
                </div>
                <InfoBox label="Tipo de Uso" value={reserva.tipoUso === 'morador' ? 'Morador' : 'Visitante'} capital />
              </Section>
            </div>
            <div className="p-6 bg-secondary/10 border-t border-border space-y-3">
              {reserva.status !== 'concluida' ? (
                <Button onClick={handleCheckIn} disabled={isProcessing} className="w-full h-12 font-bold gap-2 shadow-lg" data-testid="button-confirm-entry">{isProcessing ? <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} /> : <><LogIn className="w-5 h-5" />Confirmar Entrada</>}</Button>
              ) : (
                <div className="text-center p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 font-bold flex items-center justify-center gap-2 font-medium"><CheckCircle2 className="w-5 h-5" />Entrada Confirmada</div>
              )}
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                onClick={() => showAlert("Problema Reportado", "O administrador do condomínio será notificado sobre este problema.", "warning")}
                data-testid="button-report-issue"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Reportar Problema
              </Button>
            </div>
          </div>
          <div className="text-center space-y-4"><p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">ID: {reserva.id.toUpperCase()}</p><Button variant="ghost" onClick={() => navigate("/")} className="text-muted-foreground">Voltar ao Início</Button></div>
        </main>
      </div>
    </PageTransition>
  );
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 text-primary">{icon}<span className="text-[10px] font-bold uppercase tracking-wider">{title}</span></div>
    {children}
  </div>
);

const InfoBox = ({ label, value, capital }: { label: string, value?: string, capital?: boolean }) => (
  <div className="p-3 bg-secondary/30 rounded-xl">
    <p className="text-[9px] text-muted-foreground uppercase font-bold">{label}</p>
    <p className={`text-sm font-semibold truncate ${capital ? 'capitalize' : ''}`}>{value || "---"}</p>
  </div>
);

export default VagasLinkAcesso;
