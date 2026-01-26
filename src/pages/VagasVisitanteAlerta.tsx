import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Lightbulb, 
  DoorOpen, 
  CircleDot, 
  MoveRight, 
  Eye, 
  CheckCircle2, 
  ArrowLeft,
  Smartphone,
  Mail,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Step = "plate" | "alert" | "validation" | "code" | "success";

const ALERT_OPTIONS = [
  { id: "farol", label: "Farol aceso", icon: Lightbulb },
  { id: "porta", label: "Porta aberta", icon: DoorOpen },
  { id: "pneu", label: "Pneu murcho", icon: CircleDot },
  { id: "saida", label: "Veículo atrapalhando saída", icon: MoveRight },
  { id: "objeto", label: "Objeto embaixo do carro", icon: Eye },
];

export default function VagasVisitanteAlerta() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("plate");
  const [plate, setPlate] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [method, setMethod] = useState<"sms" | "email" | null>(null);
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [alertCount, setAlertCount] = useState(0);

  const handleNext = () => {
    if (step === "plate") {
      if (!plate || plate.length < 7) {
        toast.error("Informe uma placa válida");
        return;
      }
      setStep("alert");
    } else if (step === "alert") {
      if (!selectedAlert) {
        toast.error("Selecione um tipo de alerta");
        return;
      }
      
      if (alertCount === 0) {
        // Primeiro alerta: envia direto
        setAlertCount(1);
        setStep("success");
      } else {
        // A partir do segundo: validação
        setStep("validation");
      }
    } else if (step === "validation") {
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
      setAlertCount(prev => prev + 1);
      setStep("success");
    }
  };

  const renderStep = () => {
    switch (step) {
      case "plate":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="plate">Digite a placa do veículo</Label>
              <Input 
                id="plate" 
                placeholder="ABC1234" 
                value={plate} 
                onChange={(e) => setPlate(e.target.value.toUpperCase())}
                className="text-center text-2xl font-bold tracking-widest uppercase"
                maxLength={7}
              />
            </div>
            <Button className="w-full" onClick={handleNext}>Continuar</Button>
          </motion.div>
        );

      case "alert":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <Label>O que deseja alertar?</Label>
            <div className="grid gap-2">
              {ALERT_OPTIONS.map((option) => (
                <Button
                  key={option.id}
                  variant={selectedAlert === option.id ? "default" : "outline"}
                  className="justify-start h-auto py-3 px-4 gap-3"
                  onClick={() => setSelectedAlert(option.id)}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-left">{option.label}</span>
                </Button>
              ))}
            </div>
            <Button className="w-full mt-4" onClick={handleNext}>Enviar alerta</Button>
          </motion.div>
        );

      case "validation":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <ShieldCheck className="w-12 h-12 mx-auto text-primary" />
              <CardTitle>Valide sua identidade</CardTitle>
              <CardDescription>
                Para continuar enviando alertas e evitar spam, valide seu contato. É rápido, gratuito e seus dados ficam protegidos.
              </CardDescription>
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
              <div className="space-y-2">
                <Label>{method === "sms" ? "Telefone" : "E-mail"}</Label>
                <Input 
                  placeholder={method === "sms" ? "(00) 00000-0000" : "exemplo@email.com"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </div>
            )}

            <Button className="w-full" onClick={handleNext}>Enviar código</Button>
          </motion.div>
        );

      case "code":
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <CardTitle>Insira o código</CardTitle>
              <CardDescription>
                Enviamos um código de 6 dígitos para {contact}
              </CardDescription>
            </div>
            <Input 
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="text-center text-3xl font-bold tracking-[0.5em]"
              maxLength={6}
              placeholder="000000"
            />
            <Button className="w-full" onClick={handleNext}>Validar e enviar alerta</Button>
            <Button variant="ghost" className="w-full" onClick={() => setStep("validation")}>Alterar contato</Button>
          </motion.div>
        );

      case "success":
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <CheckCircle2 className="w-20 h-20 mx-auto text-primary" />
            <div className="space-y-2">
              <CardTitle>Alerta enviado!</CardTitle>
              <CardDescription>
                O proprietário do veículo {plate} será notificado anonimamente. Obrigado por ajudar a comunidade!
              </CardDescription>
            </div>
            <Button className="w-full" onClick={() => navigate("/")}>Voltar ao início</Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          {step !== "plate" && step !== "success" && (
            <Button variant="ghost" size="icon" onClick={() => setStep(step === "alert" ? "plate" : "alert")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex-1">
            <CardTitle className="text-xl">Rede Cautoo</CardTitle>
            <CardDescription>Alerta rápido para veículos</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
