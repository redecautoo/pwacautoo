import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/contexts/AppContext";
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
  const { showAlert } = useApp();
  const [step, setStep] = useState<Step>("plate");
  const [plate, setPlate] = useState("");
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [method, setMethod] = useState<"sms" | "email" | null>(null);
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [alertCount, setAlertCount] = useState(0);

  const handleNext = () => {
    if (step === "plate") {
      if (!plate || plate.replace(/[^A-Z0-9]/gi, '').length < 7) {
        showAlert("Placa Inválida", "Por favor, informe uma placa completa com 7 caracteres.", "warning");
        return;
      }
      setStep("alert");
    } else if (step === "alert") {
      if (!selectedAlert) {
        showAlert("Selecione um Alerta", "Escolha o tipo de aviso que deseja enviar ao proprietário.", "warning");
        return;
      }
      if (alertCount === 0) {
        setAlertCount(1);
        setStep("success");
      } else {
        setStep("validation");
      }
    } else if (step === "validation") {
      if (!method || !contact) {
        showAlert("Dados de Contato", "Informe o meio de contato para validar sua identidade.", "warning");
        return;
      }
      setStep("code");
    } else if (step === "code") {
      if (code.length < 6) {
        showAlert("Código Inválido", "O código de validação deve ter 6 dígitos.", "warning");
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
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="plate" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Placa do Veículo</Label>
              <Input id="plate" placeholder="ABC1D23" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} className="text-center text-3xl font-black tracking-[0.2em] h-16 border-2 border-primary/20 focus:border-primary shadow-inner" maxLength={7} />
            </div>
            <Button className="w-full h-14 text-lg font-bold" onClick={handleNext}>Continuar</Button>
          </motion.div>
        );
      case "alert":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">O que está acontecendo?</p>
            <div className="grid gap-2">
              {ALERT_OPTIONS.map((option) => (
                <Button key={option.id} variant={selectedAlert === option.id ? "default" : "outline"} className={`justify-start h-16 px-4 gap-4 transition-all ${selectedAlert === option.id ? 'ring-2 ring-primary ring-offset-2 bg-primary text-white shadow-lg scale-[1.02]' : 'hover:bg-secondary'}`} onClick={() => setSelectedAlert(option.id)}>
                  <option.icon className="w-6 h-6" /><span className="font-bold">{option.label}</span>
                </Button>
              ))}
            </div>
            <Button className="w-full h-14 text-lg font-bold mt-4 shadow-xl" onClick={handleNext}>Enviar Alerta Anonimamente</Button>
          </motion.div>
        );
      case "validation":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-3"><ShieldCheck className="w-16 h-16 mx-auto text-primary" /><h2 className="text-xl font-bold">Proteção Anti-Spam</h2><p className="text-xs text-muted-foreground px-4">Esta é sua segunda mensagem. Valide sua identidade para continuar garantindo a segurança da rede.</p></div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant={method === "sms" ? "default" : "outline"} className="h-28 flex-col gap-3 font-bold" onClick={() => setMethod("sms")}><Smartphone className="w-8 h-8" />SMS</Button>
              <Button variant={method === "email" ? "default" : "outline"} className="h-28 flex-col gap-3 font-bold" onClick={() => setMethod("email")}><Mail className="w-8 h-8" />E-MAIL</Button>
            </div>
            {method && <div className="space-y-2"><Label className="text-[10px] font-bold uppercase tracking-widest">{method === "sms" ? "Celular" : "E-mail"}</Label><Input placeholder={method === "sms" ? "(00) 00000-0000" : "nome@exemplo.com"} value={contact} onChange={(e) => setContact(e.target.value)} className="h-12" /></div>}
            <Button className="w-full h-14 text-lg font-bold shadow-lg" onClick={handleNext}>Enviar Código</Button>
          </motion.div>
        );
      case "code":
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-center space-y-3"><h2 className="text-xl font-bold">Insira o Código</h2><p className="text-xs text-muted-foreground">Código enviado para <strong>{contact}</strong></p></div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} className="text-center text-4xl font-black tracking-[0.6em] h-20 border-2 border-primary" maxLength={6} placeholder="000000" />
            <Button className="w-full h-14 text-lg font-bold shadow-lg" onClick={handleNext}>Validar e Enviar</Button>
            <Button variant="ghost" className="w-full text-muted-foreground text-xs" onClick={() => setStep("validation")}>Alterar forma de contato</Button>
          </motion.div>
        );
      case "success":
        return (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8 py-6">
            <div className="relative mx-auto w-24 h-24"><motion.div initial={{ scale: 0 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-primary/20 rounded-full" /><div className="relative z-10 w-full h-full bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 shadow-2xl"><CheckCircle2 className="w-12 h-12 text-primary" /></div></div>
            <div className="space-y-3 px-4"><h2 className="text-2xl font-black text-foreground">ALERTA ENVIADO!</h2><p className="text-sm text-muted-foreground">A notificação foi disparada anonimamente para o proprietário de <strong>{plate}</strong>.</p></div>
            <Button className="w-full h-14 text-lg font-bold shadow-xl" onClick={() => navigate("/")}>Voltar ao Início</Button>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
      <Card className="w-full max-w-md overflow-hidden border-none shadow-2xl bg-card/80 backdrop-blur-xl">
        <CardHeader className="flex flex-row items-center gap-4 border-b border-border/50 pb-6">
          {step !== "plate" && step !== "success" && <Button variant="ghost" size="icon" className="hover:bg-primary/10 text-primary" onClick={() => setStep(step === "alert" ? "plate" : "alert")}><ArrowLeft className="w-5 h-5" /></Button>}
          <div className="flex-1">
            <div className="flex items-center gap-2"><div className="w-2 h-2 bg-primary rounded-full animate-pulse" /><CardTitle className="text-lg font-black tracking-tighter uppercase">Rede Cautoo</CardTitle></div>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Alerta de Veículos</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-8 pb-10">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
