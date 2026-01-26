import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Mail, ShieldCheck, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface VisitorAlertFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plate: string;
}

type Step = "validation" | "code" | "success";

const VisitorAlertFlow = ({ isOpen, onClose, onSuccess, plate }: VisitorAlertFlowProps) => {
  const [step, setStep] = useState<Step>("validation");
  const [method, setMethod] = useState<"sms" | "email" | null>(null);
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [alertCount, setAlertCount] = useState(0);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Load alert count from localStorage for mock persistence
  useEffect(() => {
    const count = localStorage.getItem("visitor_alert_count");
    if (count) setAlertCount(parseInt(count));
  }, []);

  const handleNext = () => {
    if (step === "validation") {
      if (!method || !contact) {
        toast.error("Selecione o método e informe seu contato");
        return;
      }
      setStep("code");
    } else if (step === "code") {
      if (code.length < 6) {
        toast.error("Informe o código de 6 dígitos");
        return;
      }
      const newCount = alertCount + 1;
      setAlertCount(newCount);
      localStorage.setItem("visitor_alert_count", newCount.toString());
      setStep("success");
    }
  };

  // Skip validation on first alert
  useEffect(() => {
    if (isOpen && alertCount === 0) {
      const newCount = alertCount + 1;
      setAlertCount(newCount);
      localStorage.setItem("visitor_alert_count", newCount.toString());
      onSuccess();
    }
  }, [isOpen, alertCount, onSuccess]);

  if (alertCount === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-6 bg-card border-border shadow-2xl z-[1001] !opacity-100">
        <AnimatePresence mode="wait">
          {step === "validation" && (
            <motion.div 
              key="validation"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <ShieldCheck className="w-12 h-12 mx-auto text-primary" />
                <h2 className="text-xl font-bold">Valide sua identidade</h2>
                <p className="text-sm text-muted-foreground">
                  Para continuar enviando alertas e evitar spam, valide seu contato. É rápido, gratuito e seus dados ficam protegidos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant={method === "sms" ? "default" : "outline"}
                  className="flex-col h-24 gap-2"
                  onClick={() => setMethod("sms")}
                >
                  <Smartphone className="w-6 h-6" />
                  SMS
                </Button>
                <Button 
                  variant={method === "email" ? "default" : "outline"}
                  className="flex-col h-24 gap-2"
                  onClick={() => setMethod("email")}
                >
                  <Mail className="w-6 h-6" />
                  E-mail
                </Button>
              </div>

              {method && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{method === "sms" ? "Telefone" : "E-mail"}</Label>
                    <Input 
                      placeholder={method === "sms" ? "(00) 00000-0000" : "exemplo@email.com"}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                    />
                  </div>

                  <div className="flex items-start gap-3 py-2">
                    <div 
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors mt-0.5 ${
                        acceptedTerms ? "bg-primary border-primary" : "border-muted-foreground"
                      }`}
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                    >
                      {acceptedTerms && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <Label 
                      className="text-sm text-muted-foreground leading-tight cursor-pointer font-normal"
                      onClick={() => setAcceptedTerms(!acceptedTerms)}
                    >
                      Li e aceito os <span className="text-primary hover:underline">Termos de Uso</span> e a <span className="text-primary hover:underline">Política de Privacidade</span>
                    </Label>
                  </div>
                </div>
              )}

              <Button 
                className="w-full h-12" 
                onClick={handleNext}
                disabled={!acceptedTerms}
              >
                Enviar código
              </Button>
            </motion.div>
          )}

          {step === "code" && (
            <motion.div 
              key="code"
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold">Insira o código</h2>
                <p className="text-sm text-muted-foreground">
                  Enviamos um código de 6 dígitos para {contact}
                </p>
              </div>
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center text-3xl font-bold tracking-[0.5em] h-14"
                maxLength={6}
                placeholder="000000"
              />
              <Button className="w-full h-12" onClick={handleNext}>Validar e enviar alerta</Button>
              <Button variant="ghost" className="w-full" onClick={() => setStep("validation")}>Alterar contato</Button>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 py-4"
            >
              <CheckCircle2 className="w-20 h-20 mx-auto text-primary" />
              <div className="space-y-2">
                <h2 className="text-xl font-bold">Validado com sucesso!</h2>
                <p className="text-sm text-muted-foreground">
                  Sua identidade foi confirmada e o alerta para {plate} foi enviado.
                </p>
              </div>
              <Button className="w-full h-12" onClick={onSuccess}>Continuar</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default VisitorAlertFlow;
