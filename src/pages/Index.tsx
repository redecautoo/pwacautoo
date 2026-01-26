import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import LicensePlateInput from "@/components/LicensePlateInput";
import ModeToggle from "@/components/ModeToggle";
import AlertCategories from "@/components/AlertCategories";
import VisitorAlertFlow from "@/components/VisitorAlertFlow";
import VehicleRegistrationForm, { VehicleFormData } from "@/components/VehicleRegistrationForm";
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
    addVehicle,
    submitClaim,
    isPlateRegistered,
    stolenVehicles,
    reportSighting
  } = useApp();
  const [plateValue, setPlateValue] = useState("");
  const [isMyPlate, setIsMyPlate] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlate, setSuccessPlate] = useState("");
  const [showVisitorFlow, setShowVisitorFlow] = useState(false);
  const [visitorAlertData, setVisitorAlertData] = useState<{categoryId: string, messageId: string} | null>(null);

  // Verificar se a placa digitada está com alerta de roubo
  const stolenVehicle = useMemo(() => {
    if (plateValue.length < 7) return null;
    const normalizedPlate = plateValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return stolenVehicles.find(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate && v.isStolen) || null;
  }, [plateValue, stolenVehicles]);

  const handleReportSighting = (location: string, date: string, time: string) => {
    if (stolenVehicle) {
      reportSighting(stolenVehicle.id, location, date, time);
      toast.success("Avistamento reportado!", {
        description: "O dono do veículo foi notificado. Obrigado por colaborar!"
      });
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
  const handleRegisterVehicle = (data: VehicleFormData) => {
    if (!isLoggedIn) {
      toast.info("Faça login para cadastrar seu veículo");
      navigate("/login");
      return;
    }

    // If it's a claim, submit claim instead of adding vehicle
    if (data.isClaim && data.claimObservation) {
      submitClaim(plateValue, data.claimObservation);
      toast.success("Reivindicação enviada com sucesso!", {
        description: `Placa: ${plateValue} - Aguarde análise em até 48h`
      });
      setPlateValue("");
      navigate("/claim");
      return;
    }
    addVehicle({
      plate: plateValue,
      model: data.vehicleModel,
      color: data.vehicleColor,
      hasActivePlan: false
    });
    toast.success("Veículo cadastrado com sucesso!", {
      description: `Placa: ${plateValue} - ${data.vehicleModel}`
    });
    setPlateValue("");
    navigate("/dashboard");
  };
  return <PageTransition>
      <div className="min-h-[100dvh] bg-background flex flex-col">
        <Header />

        <main className="flex-1 px-4 pb-6 safe-area-bottom overflow-y-auto">
          <div className="w-full max-w-lg mx-auto border-0">
            {/* Zona de contexto - selo separado do header */}
            <motion.div 
              className="flex justify-center mt-2 mb-6" 
              variants={slideUp} 
              initial="hidden" 
              animate="visible"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-primary font-medium text-sm">Rede de Alertas Cautoo</span>
              </div>
            </motion.div>

            {/* Zona de ação - título e subtítulo */}
            <motion.div 
              className="text-center mb-8" 
              variants={slideUp} 
              initial="hidden" 
              animate="visible" 
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2 sm:text-5xl">
                Alertas e socorro para
                <br />
                <span className="text-primary">qualquer veículo</span>
              </h2>
              <p className="text-sm text-muted-foreground px-2 text-center mt-3 sm:text-xl">
                Alertas anônimos entre veículos e ajuda para o seu quando precisar.
              </p>
            </motion.div>

            <motion.div className="bg-card border border-border rounded-2xl p-4 sm:p-6 space-y-4" variants={scaleIn} initial="hidden" animate="visible" transition={{
            delay: 0.2
          }}>
              <LicensePlateInput value={plateValue} onChange={setPlateValue} isStolen={!!stolenVehicle} />
              
              {/* Alerta de veículo roubado - prioridade visual */}
              {stolenVehicle && <StolenVehicleAlert stolenVehicle={stolenVehicle} onReportSighting={handleReportSighting} />}
              
              <ModeToggle isMyPlate={isMyPlate} onToggle={setIsMyPlate} />

              {isMyPlate ? <motion.div key="register" initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.3
            }}>
                  <VehicleRegistrationForm plateValue={plateValue} onRegister={handleRegisterVehicle} />
                </motion.div> : <motion.div key="alerts" initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: 20
            }} transition={{
              duration: 0.3
            }}>
                  <AlertCategories plateValue={plateValue} onSendAlert={handleSendAlert} />
                </motion.div>}
            </motion.div>

            <motion.p className="text-center text-xs text-muted-foreground mt-4 px-4" variants={slideUp} initial="hidden" animate="visible" transition={{
            delay: 0.3
          }}>
              Tem um veículo?{" "}
              <button onClick={() => setIsMyPlate(true)} className="text-primary hover:underline font-medium">
                Cadastre-se
              </button>{" "}
              para receber alertas.
            </motion.p>
          </div>
        </main>

        {/* Success Confirmation */}
        <SuccessConfirmation isOpen={showSuccess} onClose={() => setShowSuccess(false)} title="Alerta Enviado!" description="O proprietário do veículo" highlightText={successPlate} duration={2500} />
        
        {/* Visitor Alert Flow Modal */}
        <div className="relative z-[100]">
          <VisitorAlertFlow 
            isOpen={showVisitorFlow} 
            onClose={() => setShowVisitorFlow(false)} 
            onSuccess={handleVisitorSuccess}
            plate={plateValue}
          />
        </div>
      </div>
    </PageTransition>;
};
export default Index;