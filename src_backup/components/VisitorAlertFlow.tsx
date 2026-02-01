import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

interface VisitorAlertFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plate: string;
}

type Step = "validation" | "code" | "success";

const VisitorAlertFlow = ({ isOpen, onClose, onSuccess, plate }: VisitorAlertFlowProps) => {
  const { showAlert } = useApp();
  const [step, setStep] = useState<Step>("validation");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const count = localStorage.getItem("visitor_alert_count");
    if (count) setAlertCount(parseInt(count));
  }, []);

  // First alert is free, others need validation
  useEffect(() => {
    if (isOpen && alertCount === 0) {
      const newCount = alertCount + 1;
      setAlertCount(newCount);
      localStorage.setItem("visitor_alert_count", newCount.toString());
      onSuccess();
    }
  }, [isOpen, alertCount, onSuccess]);

  const handleNext = () => {
    if (step === "validation") {
      if (!contact || !contact.includes("@")) {
        showAlert("E-mail Inválido", "Por favor, informe um e-mail válido para continuar.", "warning");
        return;
      }
      if (!acceptedTerms) {
        showAlert("Termos Necessários", "Você precisa aceitar os termos de uso para continuar.", "warning");
        return;
      }
      setStep("code");
    } else if (step === "code") {
      if (code.length < 6) {
        showAlert("Código Inválido", "O código de validação deve conter 6 dígitos.", "warning");
        return;
      }
      const newCount = alertCount + 1;
      setAlertCount(newCount);
      localStorage.setItem("visitor_alert_count", newCount.toString());
      setStep("success");
    }
  };

  if (alertCount === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-[#0F1115] border border-white/10 shadow-2xl rounded-[2.5rem] z-[1001]">


        <AnimatePresence mode="wait">
          {step === "validation" && (
            <motion.div
              key="validation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-8 pb-10 space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-[#10B981]/10 rounded-3xl flex items-center justify-center mx-auto shadow-inner rotate-3">
                  <ShieldCheck className="w-10 h-10 text-[#10B981]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Validação de Segurança</h2>
                  <p className="text-sm text-white/40 leading-relaxed max-w-[240px] mx-auto">
                    Para garantir a segurança da rede, valide seu e-mail antes de enviar o próximo alerta.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 ml-1">E-mail para validação</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <Input
                      placeholder="seu@email.com"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="h-14 bg-white/[0.03] border-white/10 rounded-2xl pl-12 text-white placeholder:text-white/10 focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20 transition-all"
                    />
                  </div>
                </div>

                <div
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 cursor-pointer hover:bg-white/[0.04] transition-all"
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                >
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${acceptedTerms ? "bg-[#10B981] border-[#10B981]" : "border-white/10"}`}>
                    {acceptedTerms && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-[12px] text-white font-medium leading-tight">Li e aceito os termos</p>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Políticas Cautoo</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 bg-[#10B981] hover:bg-[#0D9A6A] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#10B981]/10 transition-all active:scale-[0.98]"
                onClick={handleNext}
              >
                Enviar Código de Acesso
              </Button>
            </motion.div>
          )}

          {step === "code" && (
            <motion.div
              key="code"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 pb-10 space-y-8 text-center"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-7 h-7 text-[#10B981]" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Verifique seu E-mail</h2>
                  <p className="text-sm text-white/40">
                    Insira o código enviado para:<br />
                    <span className="font-bold text-white/80">{contact}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-4xl font-black tracking-[0.4em] h-20 bg-white/[0.03] border-white/10 rounded-2xl text-[#10B981] shadow-inner focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/20"
                  maxLength={6}
                  placeholder="000000"
                />

                <div className="space-y-4">
                  <Button
                    className="w-full h-14 bg-[#10B981] hover:bg-[#0D9A6A] text-white font-bold text-base rounded-2xl shadow-xl shadow-[#10B981]/10 transition-all active:scale-[0.98]"
                    onClick={handleNext}
                  >
                    Validar e Enviar Alerta
                  </Button>

                  <button
                    className="text-[11px] font-bold uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                    onClick={() => setStep("validation")}
                  >
                    Alterar e-mail de envio
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 pb-12 space-y-10 text-center"
            >
              <div className="relative">
                <div className="w-24 h-24 bg-[#10B981]/10 rounded-[2rem] flex items-center justify-center mx-auto rotate-12">
                  <CheckCircle2 className="w-12 h-12 text-[#10B981]" />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2 w-10 h-10 bg-[#10B981] rounded-full border-4 border-[#0F1115] flex items-center justify-center shadow-lg"
                >
                  <ShieldCheck className="w-5 h-5 text-white" />
                </motion.div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">E-mail Validado!</h2>
                <p className="text-sm text-white/40 leading-relaxed">
                  Sua identidade foi confirmada com sucesso.<br />
                  O alerta para a placa <strong className="text-white">{plate}</strong> foi disparado.
                </p>
              </div>

              <Button
                className="w-full h-14 bg-white/5 hover:bg-white/10 text-white font-bold text-base rounded-2xl border border-white/10 transition-all active:scale-[0.98]"
                onClick={onSuccess}
              >
                Concluir e Voltar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorAlertFlow;
