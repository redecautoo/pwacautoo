import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Car,
  MapPin,
  AlertTriangle,
  Phone,
  CheckCircle2,
  Heart,
  Loader2,
  ChevronDown,
  ExternalLink,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";

type WellbeingState = "safe" | "risk" | "danger";
type PriorityLevel = "NORMAL" | "HIGH" | "MAX" | "PPINK";
type ProblemType =
  | "pane_mecanica"
  | "acidente"
  | "pneu_furado"
  | "bateria"
  | "combustivel"
  | "chave"
  | "outro";
type AccessType = "sim" | "nao" | "nao_sei";

interface HelpRequestData {
  vehicleId: string;
  plate: string;
  model: string;
  color: string;
  wellbeingState: WellbeingState;
  priority: PriorityLevel;
  problemType: ProblemType;
  address: string;
  cep: string;
  reference: string;
  accessForTow: AccessType;
  latitude: string;
  longitude: string;
  observations: string;
  hasActivePlan: boolean;
  isPPinkActive: boolean;
  createdAt: string;
}

const problemLabels: Record<ProblemType, string> = {
  pane_mecanica: "Pane mecânica",
  acidente: "Acidente",
  pneu_furado: "Pneu furado",
  bateria: "Bateria descarregada",
  combustivel: "Ficou sem combustível",
  chave: "Chave trancada / Perda de chave",
  outro: "Outro",
};

const wellbeingLabels: Record<WellbeingState, string> = {
  safe: "Seguro(a)",
  risk: "Em local de risco",
  danger: "Em perigo imediato",
};

const accessLabels: Record<AccessType, string> = {
  sim: "Sim",
  nao: "Não",
  nao_sei: "Não sei",
};

const RequestHelp = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { vehicles, currentUser, addHelpRequest, useGreenSealCall, hasGreenSealFreeCall, showAlert } = useApp();

  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<HelpRequestData | null>(null);
  const [usedGreenSealCall, setUsedGreenSealCall] = useState(false);

  const [wellbeingState, setWellbeingState] = useState<WellbeingState>("safe");
  const [problemType, setProblemType] = useState<ProblemType | "">("");
  const [address, setAddress] = useState("");
  const [cep, setCep] = useState("");
  const [reference, setReference] = useState("");
  const [accessForTow, setAccessForTow] = useState<AccessType>("sim");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [observations, setObservations] = useState("");

  const vehicle = vehicles.find((v) => v.id === vehicleId);

  const isPPinkActive =
    currentUser?.gender === "feminino" && wellbeingState === "danger";

  const getPriority = (): PriorityLevel => {
    if (isPPinkActive) return "PPINK";
    if (wellbeingState === "danger") return "MAX";
    if (wellbeingState === "risk") return "HIGH";
    return "NORMAL";
  };

  const hasActivePlan = vehicle?.hasActivePlan || false;
  const hasGreenSealCall = hasGreenSealFreeCall();

  useEffect(() => {
    const handleClick = () => setShowProblemDropdown(false);
    if (showProblemDropdown) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showProblemDropdown]);

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLatitude("-23.5505");
    setLongitude("-46.6333");
    setAddress("Av. Paulista, 1578 - Bela Vista, São Paulo - SP");
    setCep("01310-200");
    setIsLoadingLocation(false);
    showAlert("Localização Obtida", "Sua localização foi preenchida automaticamente via GPS.", "info");
  };

  const isFormValid = () => {
    return (
      wellbeingState &&
      problemType &&
      address.trim() !== "" &&
      reference.trim() !== "" &&
      accessForTow
    );
  };

  const handleSubmit = () => {
    if (!vehicle || !isFormValid()) return;

    if (hasGreenSealCall) {
      useGreenSealCall();
      setUsedGreenSealCall(true);
    }

    const requestData: HelpRequestData = {
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      model: vehicle.model,
      color: vehicle.color,
      wellbeingState,
      priority: getPriority(),
      problemType: problemType as ProblemType,
      address,
      cep,
      reference,
      accessForTow,
      latitude,
      longitude,
      observations,
      hasActivePlan,
      isPPinkActive,
      createdAt: new Date().toISOString(),
    };

    addHelpRequest(requestData);
    setSubmittedRequest(requestData);
    setStep("success");
    showAlert(
      "Socorro Solicitado",
      "Sua solicitação foi enviada para a central. Por favor, aguarde o contato ou use o botão do WhatsApp para agilizar.",
      "success",
      vehicle.plate
    );
  };

  const generateWhatsAppMessage = (): string => {
    if (!submittedRequest) return "";
    const lines = [];
    if (submittedRequest.isPPinkActive) {
      lines.push("🩷 PROTOCOLO PINK ATIVO — PRIORIDADE MÁXIMA");
      lines.push("");
    }
    if (usedGreenSealCall) {
      lines.push("🟢 CHAMADO GRATUITO — SELO VERDE");
      lines.push("");
    }
    lines.push("🚨 SOLICITAÇÃO DE SOCORRO — REDE CAUTOO");
    lines.push("");
    lines.push(`Placa: ${submittedRequest.plate}`);
    lines.push(`Veículo: ${submittedRequest.model} - ${submittedRequest.color}`);
    lines.push("");
    lines.push("Localização:");
    lines.push(submittedRequest.address);
    if (submittedRequest.cep) lines.push(`CEP: ${submittedRequest.cep}`);
    lines.push(`Ponto de referência: ${submittedRequest.reference}`);
    lines.push(`Acesso para guincho: ${accessLabels[submittedRequest.accessForTow]}`);
    lines.push("");
    if (submittedRequest.latitude && submittedRequest.longitude) {
      lines.push("Localização GPS:");
      lines.push(`Lat: ${submittedRequest.latitude}`);
      lines.push(`Lng: ${submittedRequest.longitude}`);
      lines.push("");
    }
    lines.push("Estado do motorista:");
    lines.push(wellbeingLabels[submittedRequest.wellbeingState]);
    lines.push(`Prioridade: ${submittedRequest.priority}`);
    lines.push("");
    lines.push("Tipo de problema:");
    lines.push(problemLabels[submittedRequest.problemType]);
    lines.push("");
    if (submittedRequest.observations) {
      lines.push("Observações:");
      lines.push(submittedRequest.observations);
      lines.push("");
    }
    lines.push("Status do cliente:");
    if (usedGreenSealCall) {
      lines.push("CHAMADO GRATUITO (SELO VERDE)");
    } else {
      lines.push(submittedRequest.hasActivePlan ? "PLANO ATIVO" : "SOCORRO AVULSO");
    }
    return encodeURIComponent(lines.join("\n"));
  };

  const handleWhatsAppClick = () => {
    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/5511955968868?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

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

  if (step === "success") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate(`/vehicle/${vehicleId}`)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
              <h1 className="text-lg font-semibold text-foreground">Socorro Solicitado</h1>
            </div>
          </header>
          <main className="px-4 py-6">
            <div className="max-w-lg mx-auto space-y-6">
              <motion.div className={`rounded-2xl p-6 text-center ${isPPinkActive ? "bg-pink-500/20" : "bg-green-500/20"}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isPPinkActive ? "bg-pink-500/20" : "bg-green-500/20"}`}><CheckCircle2 className={`w-10 h-10 ${isPPinkActive ? "text-pink-500" : "text-green-500"}`} /></div>
                {isPPinkActive && <div className="mb-4 bg-pink-500/30 text-pink-200 px-4 py-2 rounded-full inline-block"><span className="flex items-center gap-2"><Heart className="w-4 h-4" />PPink ativo — prioridade máxima</span></div>}
                {usedGreenSealCall && <div className="mb-4 bg-green-500/30 text-green-200 px-4 py-2 rounded-full inline-block"><span className="flex items-center gap-2"><Award className="w-4 h-4" />Chamado gratuito (Selo Verde)</span></div>}
                <h2 className="text-xl font-bold text-foreground mb-2">Solicitação Enviada!</h2>
                <div className="bg-card/50 rounded-xl p-4 text-left mb-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Placa:</span><span className="font-medium">{vehicle.plate}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Problema:</span><span className="font-medium">{problemLabels[problemType as ProblemType]}</span></div>
                </div>
              </motion.div>
              <Button onClick={handleWhatsAppClick} className="w-full bg-green-600 hover:bg-green-500 text-white h-12 font-bold gap-3">WhatsApp Cautoo <ExternalLink className="w-4 h-4" /></Button>
              <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => navigate(`/vehicle/${vehicleId}`)}>Voltar ao veículo</Button>
            </div>
          </main>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate(`/vehicle/${vehicleId}`)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Solicitar Socorro</h1>
              <p className="text-xs text-muted-foreground">Informe sua localização e o que aconteceu</p>
            </div>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div className={`rounded-xl p-4 ${hasGreenSealCall ? "bg-green-600/20 border-green-500/40" : hasActivePlan ? "bg-green-500/10 border-green-500/20" : "bg-yellow-500/10 border-yellow-500/20"}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${hasGreenSealCall ? "bg-green-500/30" : hasActivePlan ? "bg-green-500/20" : "bg-yellow-500/20"}`}>{hasGreenSealCall ? <Award className="w-5 h-5 text-green-400" /> : hasActivePlan ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-yellow-500" />}</div>
                <div><span className={`text-sm font-bold ${hasGreenSealCall || hasActivePlan ? "text-green-500" : "text-yellow-500"}`}>{hasGreenSealCall ? "🎉 Chamado gratuito!" : hasActivePlan ? "Plano ativo" : "Socorro avulso"}</span><p className="text-xs text-muted-foreground">{hasGreenSealCall ? "Você conquistou 1 chamado gratuito!" : hasActivePlan ? "Atendimento incluído." : "Guincho a partir de R$299"}</p></div>
              </div>
            </motion.div>
            {isPPinkActive && <motion.div className="bg-pink-500/20 border border-pink-500/30 rounded-xl p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-pink-500/30 flex items-center justify-center"><Heart className="w-5 h-5 text-pink-400" /></div><div><span className="text-sm font-bold text-pink-400">PPink ativo — prioridade máxima</span></div></div></motion.div>}
            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Car className="w-6 h-6 text-primary" /></div><div><p className="text-lg font-bold tracking-wider">{vehicle.plate}</p><p className="text-sm text-muted-foreground">{vehicle.model} • {vehicle.color}</p></div></div>
            <div className={`bg-card border rounded-xl p-4 ${wellbeingState === "danger" ? "border-red-500/50 bg-red-500/5" : "border-border"}`}><Label className="text-sm font-semibold mb-3 block">Como você está agora? *</Label><RadioGroup value={wellbeingState} onValueChange={(val) => setWellbeingState(val as WellbeingState)} className="space-y-2">
              {["safe", "risk", "danger"].map((st) => (
                <div key={st} className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer ${wellbeingState === st ? "border-primary bg-primary/5" : "border-border"}`} onClick={() => setWellbeingState(st as WellbeingState)}><RadioGroupItem value={st} id={st} /><Label htmlFor={st} className="cursor-pointer flex-1 capitalize">{wellbeingLabels[st as WellbeingState]}</Label></div>
              ))}
            </RadioGroup></div>
            <div className="bg-card border border-border rounded-xl p-4"><Label className="text-sm font-semibold mb-3 block">Qual o problema? *</Label><div className="relative"><button type="button" className="w-full flex items-center justify-between p-3 rounded-lg border bg-background text-left" onClick={(e) => { e.stopPropagation(); setShowProblemDropdown(!showProblemDropdown); }}><span>{problemType ? problemLabels[problemType] : "Selecione o problema"}</span><ChevronDown className={`w-5 h-5 transition-transform ${showProblemDropdown ? "rotate-180" : ""}`} /></button>
              <AnimatePresence>{showProblemDropdown && <motion.div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-xl z-50 overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{(Object.keys(problemLabels) as ProblemType[]).map((key) => (<button key={key} type="button" className="w-full p-3 text-left hover:bg-muted" onClick={() => { setProblemType(key); setShowProblemDropdown(false); }}>{problemLabels[key]}</button>))}</motion.div>}</AnimatePresence></div></div>
            <div className="bg-card border border-border rounded-xl p-4 space-y-4"><div className="flex items-center justify-between"><Label className="text-sm font-semibold">Localização *</Label><Button variant="outline" size="sm" onClick={handleGetLocation} disabled={isLoadingLocation} className="gap-2">{isLoadingLocation ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />} GPS</Button></div><div><Label className="text-xs">Endereço completo *</Label><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro..." className="mt-1" /></div><div className="grid grid-cols-2 gap-3"><div><Label className="text-xs">CEP</Label><Input value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" className="mt-1" /></div><div><Label className="text-xs">GPS</Label><p className="text-sm text-muted-foreground mt-2">{latitude ? `${latitude}, ${longitude}` : "Não detectado"}</p></div></div><div><Label className="text-xs">Referência *</Label><Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Ex: Próximo ao posto..." className="mt-1" /></div><div><Label className="text-xs">Observações facilitadoras</Label><Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Cor do portão, local exato (calçada, meio da via)..." className="mt-1 resize-none" rows={2} /></div></div>
            <Button
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg mt-4"
              onClick={handleSubmit}
              disabled={!isFormValid()}
            >
              Solicitar Socorro Agora
            </Button>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default RequestHelp;

