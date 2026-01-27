import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import AlertCategories from "@/components/AlertCategories";
import VisitorAlertFlow from "@/components/VisitorAlertFlow";
import StolenVehicleAlert from "@/components/StolenVehicleAlert";
import SuccessConfirmation from "@/components/SuccessConfirmation";
import { useApp } from "@/contexts/AppContext";
import { alertCategories } from "@/lib/alertCategories";
import { PageTransition, slideUp, scaleIn } from "@/components/PageTransition";

const Index = () => {
  const navigate = useNavigate();
  const {
    isLoggedIn,
    sendAlert,
    submitClaim,
    stolenVehicles,
    reportSighting,
    showAlert,
    getPlateMetrics
  } = useApp();
  const [plateValue, setPlateValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlate, setSuccessPlate] = useState("");
  const [showVisitorFlow, setShowVisitorFlow] = useState(false);
  const [visitorAlertData, setVisitorAlertData] = useState<{ categoryId: string, messageId: string } | null>(null);

  const stolenVehicle = useMemo(() => {
    if (plateValue.length < 7) return null;
    const normalizedPlate = plateValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return stolenVehicles.find(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate && v.isStolen) || null;
  }, [plateValue, stolenVehicles]);

  const handleReportSighting = (location: string, date: string, time: string) => {
    if (stolenVehicle) {
      reportSighting(stolenVehicle.id, location, date, time);
      showAlert("Avistamento Reportado!", "O proprietário do veículo foi notificado. Sua colaboração é fundamental!", "success");
    }
  };

  const handleSendAlert = (categoryId: string, messageId: string) => {
    if (!isLoggedIn) {
      setVisitorAlertData({ categoryId, messageId });
      setShowVisitorFlow(true);
      return;
    }

    const category = alertCategories.find(c => c.id === categoryId);
    const message = category?.messages.find(m => m.id === messageId);
    if (category && message) {
      sendAlert(plateValue, categoryId, category.name, messageId, message.text);
      setSuccessPlate(plateValue);
      setShowSuccess(true);
      setPlateValue("");
    }
  };

  const handleVisitorSuccess = () => {
    if (visitorAlertData) {
      const category = alertCategories.find(c => c.id === visitorAlertData.categoryId);
      const message = category?.messages.find(m => m.id === visitorAlertData.messageId);
      if (category && message) {
        sendAlert(plateValue, visitorAlertData.categoryId, category.name, visitorAlertData.messageId, message.text);
        setSuccessPlate(plateValue);
        setShowSuccess(true);
        setPlateValue("");
      }
    }
    setShowVisitorFlow(false);
    setVisitorAlertData(null);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-8">
        <Header />
        <main className="px-4 pb-20">
          <div className="w-full max-w-lg mx-auto">
            <motion.div className="flex justify-center mt-0 mb-6" variants={slideUp} initial="hidden" animate="visible">
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#1A1F2C]/60 border border-[#10B981]/20 backdrop-blur-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span className="text-[#10B981] font-medium text-[13px] tracking-tight">Rede de Alertas Cautoo</span>
              </div>
            </motion.div>

            <motion.div className="text-center mb-6 px-4" variants={slideUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <h1 className="text-2xl sm:text-[40px] font-bold text-white leading-tight tracking-tight">
                Alertas e socorro para <span className="text-[#10B981]">qualquer veículo</span>
              </h1>
              <p className="text-xs sm:text-base text-muted-foreground mt-2 max-w-[320px] mx-auto leading-relaxed opacity-60">
                Alertas anônimos entre veículos e ajuda para o seu quando precisar.
              </p>
            </motion.div>
            <motion.div className="bg-card border-none shadow-2xl rounded-[2.5rem] p-6 sm:p-8 space-y-6 relative overflow-hidden" variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
              <LicensePlateInput value={plateValue} onChange={setPlateValue} isStolen={!!stolenVehicle} />
              {stolenVehicle && <StolenVehicleAlert stolenVehicle={stolenVehicle} onReportSighting={handleReportSighting} />}

              <AnimatePresence mode="wait">
                {isValidPlate(plateValue) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden"
                  >
                    {/* Bloco de Score Público */}
                    {((): React.ReactNode => {
                      const metrics = getPlateMetrics(plateValue);
                      const getStatusStr = () => {
                        if (metrics.score >= 50) return { label: "Confiável", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
                        if (metrics.score >= 0) return { label: "Neutro", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
                        return { label: "Risco", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
                      };
                      const status = getStatusStr();

                      return (
                        <div className="space-y-4 pt-4 border-t border-border/50">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Score da Placa</h3>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 border border-border/50">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">Score Cautoo</span>
                              <span className={`text-3xl font-black ${status.color}`}>{metrics.score}</span>
                            </div>
                            <div className={`px-4 py-2 rounded-xl border ${status.bg} ${status.border} ${status.color} font-black text-[10px] uppercase tracking-widest`}>
                              {status.label}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-secondary/20 border border-border/30 rounded-2xl transition-all">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 opacity-60">Elogios</span>
                              <span className="text-lg font-black text-foreground">{metrics.compliments}</span>
                            </div>
                            <div className="p-3 bg-secondary/20 border border-border/30 rounded-2xl transition-all">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 opacity-60">Críticas</span>
                              <span className="text-lg font-black text-foreground">{metrics.critiques}</span>
                            </div>
                            <div className="p-3 bg-secondary/20 border border-border/30 rounded-2xl transition-all">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 opacity-60">Alertas</span>
                              <span className="text-lg font-black text-foreground">{metrics.alerts}</span>
                            </div>
                            <div className="p-3 bg-secondary/20 border border-border/30 rounded-2xl transition-all">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1 opacity-60">Solidárias</span>
                              <span className="text-lg font-black text-foreground">{metrics.solidaryActions}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="pt-4 border-t border-border/50">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-4">Enviar Alerta</h3>
                      <AlertCategories plateValue={plateValue} onSendAlert={handleSendAlert} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
        <SuccessConfirmation isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Alerta Enviado!" description="O proprietário do veículo" highlightText={successPlate} duration={2500} />
        <div className="relative z-[100]"><VisitorAlertFlow isOpen={showVisitorFlow} onClose={() => setShowVisitorFlow(false)} onSuccess={handleVisitorSuccess} plate={plateValue} /></div>
      </div>
    </PageTransition>
  );
};

export default Index;