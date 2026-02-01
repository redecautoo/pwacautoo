import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, MapPin, Calendar, Clock, Car, CreditCard, Award, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import SealRequiredNotice from "@/components/SealRequiredNotice";

const ReportStolen = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const {
    vehicles,
    markAsStolen,
    currentUser,
    hasGreenSealFreeStolenAlert,
    useGreenSealStolenAlert,
    getGreenSealStolenAlertsRemaining,
    cauCashBalance,
    addTransaction,
    showAlert
  } = useApp();

  const { saldo: saldoVagas, pagarComCauCash } = useVagas();

  const saldoTotal = cauCashBalance + saldoVagas;

  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [gpsStatus, setGpsStatus] = useState("Não detectado");
  const [referencia, setReferencia] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [isLoadingGps, setIsLoadingGps] = useState(false);

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
  };

  const handleGetGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus("GPS não suportado");
      return;
    }
    setIsLoadingGps(true);
    setGpsStatus("Buscando...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsStatus(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
        setIsLoadingGps(false);
      },
      () => {
        setGpsStatus("Não detectado");
        setIsLoadingGps(false);
      },
      { timeout: 10000 }
    );
  };

  const vehicle = vehicles.find(v => v.id === vehicleId);
  const isVerified = currentUser?.isVerified || false;
  const hasFreeAlert = hasGreenSealFreeStolenAlert();
  const freeAlertsRemaining = getGreenSealStolenAlertsRemaining();

  useEffect(() => {
    if (vehicle?.isStolen) {
      showAlert(
        "Alerta de Roubo Já Ativo",
        "Este veículo já está com alerta de roubo ativo. Você pode visualizar os alertas existentes na lista de roubos.",
        "warning",
        vehicle.plate
      );
      navigate("/stolen");
    }
  }, [vehicle, showAlert, navigate]);

  if (!isVerified) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Alerta de Roubo</h1>
            </div>
          </header>
          <SealRequiredNotice featureReason="Alertas de roubo exigem verificação para garantir a veracidade das denúncias." />
        </div>
      </PageTransition>
    );
  }

  if (!vehicle) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Veículo não encontrado</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleRequestPayment = () => {
    if (endereco && referencia && date && time) {
      if (hasFreeAlert) {
        handleConfirmPayment();
      } else {
        setShowPaymentConfirm(true);
      }
    }
  };

  const handleConfirmPayment = () => {
    if (hasFreeAlert) {
      useGreenSealStolenAlert();
    } else {
      const valor = 10;
      if (saldoTotal < valor) {
        showAlert("Saldo Insuficiente", "Recarregue seu CauCash para reportar o roubo clicando abaixo.", "error");
        setShowPaymentConfirm(false);
        return;
      }

      if (cauCashBalance >= valor) {
        addTransaction({
          type: 'debit',
          amount: valor,
          description: `Alerta de roubo - Placa: ${vehicle.plate}`,
          category: 'Segurança'
        });
      } else {
        const restante = valor - cauCashBalance;
        if (cauCashBalance > 0) {
          addTransaction({
            type: 'debit',
            amount: cauCashBalance,
            description: `Alerta de roubo - Placa: ${vehicle.plate} (parcial)`,
            category: 'Segurança'
          });
        }
        pagarComCauCash(restante, `Alerta de roubo - Placa: ${vehicle.plate} (parcial)`);
      }
    }

    const locationData = `${endereco}${cep ? ` - CEP: ${cep}` : ''}${gpsStatus !== 'Não detectado' ? ` - GPS: ${gpsStatus}` : ''} - Ref: ${referencia}${observacoes ? ` - Obs: ${observacoes}` : ''}`;
    markAsStolen(vehicle.id, { location: locationData, date, time });
    setShowPaymentConfirm(false);
    showAlert(
      "Alerta de Roubo Ativado!",
      "Seu veículo agora está marcado como roubado na Rede Cautoo. Todos os usuários da rede foram notificados.",
      "success",
      vehicle.plate
    );
    navigate("/stolen");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-[#D32F2F]/40 bg-[#D32F2F]/10 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Reportar Roubo</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div
              className="bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55 rounded-xl p-4 shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.35)]"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#D32F2F]/30 flex items-center justify-center"><Car className="w-7 h-7 text-white" /></div>
                <div><span className="text-xl font-bold text-white tracking-wider">{vehicle.plate}</span><p className="text-sm text-white/[0.78]">{vehicle.model} • {vehicle.color}</p></div>
              </div>
            </motion.div>

            {hasFreeAlert ? (
              <motion.div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-start gap-3"><Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" /><div className="text-sm text-muted-foreground"><p className="font-medium text-green-600 mb-1">🎉 Alerta Gratuito Disponível!</p><p>Você conquistou <span className="font-bold text-foreground">{freeAlertsRemaining} alerta(s) gratuito(s)</span> com o Selo Verde.</p><p className="mt-1 text-xs">Este benefício renova a cada 6 meses se você mantiver o Selo Verde ativo.</p></div></div>
              </motion.div>
            ) : (
              <motion.div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <div className="flex items-start gap-3"><CreditCard className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" /><div className="text-sm text-muted-foreground"><p className="font-medium text-blue-600 mb-1">Custo do Alerta</p><p><span className="font-bold text-foreground">R$ 10,00</span> por ativação. O alerta ficará ativo por <span className="font-medium text-foreground">7 dias</span>.</p><p className="mt-1 text-xs">Após 7 dias, você pode renovar gratuitamente por mais 3 dias (1x).</p></div></div>
              </motion.div>
            )}

            <div className="bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55 rounded-xl p-4 flex items-start gap-3 shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.35)]">
              <AlertTriangle className="w-5 h-5 text-[#E53935] shrink-0 mt-0.5" />
              <div className="space-y-1"><p className="text-sm font-bold text-white">Aviso Importante</p><p className="text-xs text-white/[0.78] leading-relaxed">Ao reportar o roubo, seu veículo será exibido para toda a rede Cautoo. Usuários verificados poderão enviar avistamentos para ajudar na localização.</p></div>
            </div>

            <motion.div className="bg-card border border-border rounded-2xl p-6 space-y-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="text-sm font-bold text-white mb-4">Informações do Roubo</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Localização *</label>
                  <button
                    onClick={handleGetGps}
                    disabled={isLoadingGps}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Navigation className="w-4 h-4" />
                    GPS
                  </button>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Endereço completo *</label>
                  <Input 
                    value={endereco} 
                    onChange={(e) => setEndereco(e.target.value)} 
                    placeholder="Rua, número, bairro..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">CEP</label>
                    <Input 
                      value={cep} 
                      onChange={(e) => setCep(formatCep(e.target.value))} 
                      placeholder="00000-000" 
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">GPS</label>
                    <p className="text-sm text-muted-foreground py-2">{gpsStatus}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Referência *</label>
                  <Input 
                    value={referencia} 
                    onChange={(e) => setReferencia(e.target.value)} 
                    placeholder="Ex: Próximo ao posto..." 
                  />
                </div>

                <div>
                  <label className="block text-xs text-muted-foreground mb-2">Observações facilitadoras</label>
                  <Textarea 
                    value={observacoes} 
                    onChange={(e) => setObservacoes(e.target.value)} 
                    placeholder="Cor do portão, local exato (calçada, meio da via)..." 
                    className="resize-none"
                    rows={2}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
                <div><label className="block text-xs text-muted-foreground mb-2">Data *</label><div className="relative"><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" /></div></div>
                <div><label className="block text-xs text-muted-foreground mb-2">Horário *</label><div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-10" /></div></div>
              </div>

              <Button
                onClick={handleRequestPayment}
                disabled={!endereco || !referencia || !date || !time}
                className="w-full h-12 text-white font-bold bg-[#E53935] hover:bg-[#D32F2F] shadow-lg"
              >
                {hasFreeAlert ? (
                  <><Award className="w-5 h-5 mr-1" />Ativar Alerta Gratuito (Selo Verde)</>
                ) : (
                  <><AlertTriangle className="w-5 h-5 mr-1" />Ativar Alerta de Roubo — R$ 10,00</>
                )}
              </Button>
            </motion.div>

            {showPaymentConfirm && (
              <motion.div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="bg-[#1a1a1a] border border-[#D32F2F]/55 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.5)]" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <div className="text-center mb-6"><div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(211,47,47,0.4)]"><CreditCard className="w-8 h-8 text-white" /></div><h3 className="text-lg font-bold text-white mb-2">Confirmar Pagamento</h3><p className="text-sm text-gray-300">Este alerta custa <span className="font-bold text-white">R$ 10,00</span> e ficará ativo por <span className="font-bold text-white">7 dias</span>.</p></div>
                  <div className="bg-[#252525] rounded-lg p-3 mb-6 border border-[#D32F2F]/40">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Veículo:</span><span className="font-bold text-white">{vehicle.plate}</span></div>
                    <div className="flex justify-between text-sm mt-1"><span className="text-gray-400">Total:</span><span className="font-bold text-[#E53935]">R$ 10,00</span></div>
                  </div>
                  <div className="space-y-3"><Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold" onClick={handleConfirmPayment}>Confirmar e Pagar</Button><Button variant="outline" className="w-full border-gray-600 text-gray-300" onClick={() => setShowPaymentConfirm(false)}>Cancelar</Button></div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ReportStolen;
