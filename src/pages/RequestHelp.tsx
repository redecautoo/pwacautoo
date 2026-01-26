import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";

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
  const { vehicles, currentUser, addHelpRequest, useGreenSealCall, hasGreenSealFreeCall } = useApp();
  const { toast } = useToast();

  const [step, setStep] = useState<"form" | "success">("form");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<HelpRequestData | null>(null);
  const [usedGreenSealCall, setUsedGreenSealCall] = useState(false); // Se usou chamado gratuito neste pedido

  // Form state
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

  // Check if user is female and in danger - activate PPink
  const isPPinkActive =
    currentUser?.gender === "feminino" && wellbeingState === "danger";

  // Calculate priority level
  const getPriority = (): PriorityLevel => {
    if (isPPinkActive) return "PPINK";
    if (wellbeingState === "danger") return "MAX";
    if (wellbeingState === "risk") return "HIGH";
    return "NORMAL";
  };

  // Check if vehicle has active plan
  const hasActivePlan = vehicle?.hasActivePlan || false;
  
  // Check if user has green seal free call available
  const hasGreenSealCall = hasGreenSealFreeCall();

  useEffect(() => {
    // Reset dropdown when clicking outside
    const handleClick = () => setShowProblemDropdown(false);
    if (showProblemDropdown) {
      document.addEventListener("click", handleClick);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [showProblemDropdown]);

  const handleGetLocation = async () => {
    setIsLoadingLocation(true);

    // Simulate GPS location (mock)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock location data
    setLatitude("-23.5505");
    setLongitude("-46.6333");
    setAddress("Av. Paulista, 1578 - Bela Vista, São Paulo - SP");
    setCep("01310-200");

    setIsLoadingLocation(false);
    toast({
      title: "Localização obtida",
      description: "Sua localização foi preenchida automaticamente.",
    });
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

    // Se tem chamado gratuito do selo verde, usar
    const usingGreenSealCall = hasGreenSealCall;
    if (usingGreenSealCall) {
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

    // Save to context/mock admin
    addHelpRequest(requestData);
    setSubmittedRequest(requestData);
    setStep("success");
  };

  const generateWhatsAppMessage = (): string => {
    if (!submittedRequest) return "";

    const lines = [];

    if (submittedRequest.isPPinkActive) {
      lines.push("🩷 PROTOCOLO PINK ATIVO — PRIORIDADE MÁXIMA");
      lines.push("");
    }

    // Indicar se é chamado gratuito do selo verde
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
    if (submittedRequest.cep) {
      lines.push(`CEP: ${submittedRequest.cep}`);
    }
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
      lines.push(
        submittedRequest.hasActivePlan ? "PLANO ATIVO" : "SOCORRO AVULSO"
      );
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
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate("/dashboard")}
            >
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  // Success screen
  if (step === "success") {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button
                onClick={() => navigate(`/vehicle/${vehicleId}`)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                Socorro Solicitado
              </h1>
            </div>
          </header>

          <main className="px-4 py-6">
            <div className="max-w-lg mx-auto space-y-6">
              {/* Success Banner */}
              <motion.div
                className={`rounded-2xl p-6 text-center ${
                  isPPinkActive
                    ? "bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30"
                    : "bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30"
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div
                  className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                    isPPinkActive ? "bg-pink-500/20" : "bg-green-500/20"
                  }`}
                >
                  <CheckCircle2
                    className={`w-10 h-10 ${
                      isPPinkActive ? "text-pink-500" : "text-green-500"
                    }`}
                  />
                </div>

                {isPPinkActive && (
                  <div className="mb-4 bg-pink-500/30 text-pink-200 px-4 py-2 rounded-full inline-block">
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      PPink ativo — prioridade máxima
                    </span>
                  </div>
                )}

                {/* Badge de chamado gratuito do selo verde */}
                {usedGreenSealCall && (
                  <div className="mb-4 bg-green-500/30 text-green-200 px-4 py-2 rounded-full inline-block">
                    <span className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Chamado gratuito utilizado (Selo Verde)
                    </span>
                  </div>
                )}

                <h2 className="text-xl font-bold text-foreground mb-2">
                  Solicitação Enviada!
                </h2>
                <p className="text-muted-foreground mb-4">
                  {usedGreenSealCall
                    ? "Chamado gratuito utilizado! Nossa equipe entrará em contato em breve."
                    : hasActivePlan
                    ? "Sua solicitação foi registrada. Nossa equipe entrará em contato em breve."
                    : "Sua solicitação foi registrada. Entre em contato para agilizar o atendimento."}
                </p>

                {/* Request summary */}
                <div className="bg-card/50 rounded-xl p-4 text-left mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placa:</span>
                      <span className="font-medium text-foreground">
                        {vehicle.plate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Problema:</span>
                      <span className="font-medium text-foreground">
                        {problemLabels[problemType as ProblemType]}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span
                        className={`font-medium ${
                          usedGreenSealCall
                            ? "text-green-400"
                            : hasActivePlan
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        {usedGreenSealCall
                          ? "Chamado gratuito (Selo Verde)"
                          : hasActivePlan
                          ? "Plano ativo"
                          : "Socorro avulso"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* WhatsApp Button */}
              <motion.button
                onClick={handleWhatsAppClick}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-semibold rounded-xl p-4 flex items-center justify-center gap-3 transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Enviar também para Cautoo no WhatsApp
                <ExternalLink className="w-4 h-4" />
              </motion.button>

              {/* Back button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/vehicle/${vehicleId}`)}
              >
                Voltar aos detalhes do veículo
              </Button>
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
            <button
              onClick={() => navigate(`/vehicle/${vehicleId}`)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Solicitar Socorro
              </h1>
              <p className="text-xs text-muted-foreground">
                Informe sua localização e o que aconteceu
              </p>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Plan Status Badge - Prioridade: Selo Verde > Plano Ativo > Socorro Avulso */}
            <motion.div
              className={`rounded-xl p-4 ${
                hasGreenSealCall
                  ? "bg-gradient-to-r from-green-600/20 to-emerald-500/10 border border-green-500/40"
                  : hasActivePlan
                  ? "bg-gradient-to-r from-green-500/10 to-green-600/5 border border-green-500/20"
                  : "bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/20"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    hasGreenSealCall
                      ? "bg-green-500/30"
                      : hasActivePlan
                      ? "bg-green-500/20"
                      : "bg-yellow-500/20"
                  }`}
                >
                  {hasGreenSealCall ? (
                    <Award className="w-5 h-5 text-green-400" />
                  ) : hasActivePlan ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  {hasGreenSealCall ? (
                    <>
                      <span className="text-sm font-bold text-green-400">
                        🎉 Chamado gratuito disponível!
                      </span>
                      <p className="text-xs text-green-300/80">
                        Você conquistou 1 chamado gratuito com o Selo Verde!
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        Este chamado não consome seu plano (se tiver).
                      </p>
                    </>
                  ) : (
                    <>
                      <span
                        className={`text-sm font-semibold ${
                          hasActivePlan ? "text-green-500" : "text-yellow-500"
                        }`}
                      >
                        {hasActivePlan
                          ? "Plano ativo — atendimento incluído"
                          : "Socorro avulso"}
                      </span>
                      <p className="text-xs text-muted-foreground">
                        {hasActivePlan
                          ? "Você será atendido pela equipe Cautoo."
                          : "Guincho a partir de R$299"}
                      </p>
                      {!hasActivePlan && (
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          Valores variam conforme local e ocorrência.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* PPink Alert (when active) */}
            <AnimatePresence>
              {isPPinkActive && (
                <motion.div
                  className="bg-gradient-to-r from-pink-500/20 to-pink-600/10 border border-pink-500/30 rounded-xl p-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-pink-500/30 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-pink-400" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-pink-400">
                        PPink ativo — prioridade máxima
                      </span>
                      <p className="text-xs text-pink-300/80">
                        Fique em local seguro e aguarde contato.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vehicle Info (readonly) */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground tracking-wider">
                    {vehicle.plate}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {vehicle.model} • {vehicle.color}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Wellbeing Status (PRIORITY SECTION) */}
            <motion.div
              className={`bg-card border rounded-xl p-4 ${
                wellbeingState === "danger"
                  ? isPPinkActive
                    ? "border-pink-500/50 bg-pink-500/5"
                    : "border-red-500/50 bg-red-500/5"
                  : wellbeingState === "risk"
                  ? "border-yellow-500/30 bg-yellow-500/5"
                  : "border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Label className="text-sm font-semibold text-foreground mb-3 block">
                Como você está agora? *
              </Label>
              <RadioGroup
                value={wellbeingState}
                onValueChange={(val) => setWellbeingState(val as WellbeingState)}
                className="space-y-2"
              >
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    wellbeingState === "safe"
                      ? "border-green-500 bg-green-500/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setWellbeingState("safe")}
                >
                  <RadioGroupItem value="safe" id="safe" />
                  <Label htmlFor="safe" className={`cursor-pointer flex-1 ${wellbeingState === "safe" ? "text-green-500" : ""}`}>
                    Seguro(a)
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    wellbeingState === "risk"
                      ? "border-yellow-500 bg-yellow-500/5"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setWellbeingState("risk")}
                >
                  <RadioGroupItem value="risk" id="risk" />
                  <Label
                    htmlFor="risk"
                    className={`cursor-pointer flex-1 ${wellbeingState === "risk" ? "text-yellow-500" : ""}`}
                  >
                    Em local de risco
                  </Label>
                </div>
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    wellbeingState === "danger"
                      ? isPPinkActive
                        ? "border-pink-500 bg-pink-500/10"
                        : "border-red-500 bg-red-500/10"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                  onClick={() => setWellbeingState("danger")}
                >
                  <RadioGroupItem value="danger" id="danger" />
                  <Label
                    htmlFor="danger"
                    className={`cursor-pointer flex-1 font-semibold ${
                      wellbeingState === "danger"
                        ? isPPinkActive
                          ? "text-pink-500"
                          : "text-red-500"
                        : ""
                    }`}
                  >
                    Em perigo imediato
                  </Label>
                </div>
              </RadioGroup>
            </motion.div>

            {/* Problem Type */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label className="text-sm font-semibold text-foreground mb-3 block">
                Qual o problema com o veículo? *
              </Label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 rounded-lg border border-border bg-background hover:border-muted-foreground/30 transition-all text-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowProblemDropdown(!showProblemDropdown);
                  }}
                >
                  <span
                    className={
                      problemType ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {problemType
                      ? problemLabels[problemType]
                      : "Selecione o problema"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      showProblemDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProblemDropdown && (
                    <motion.div
                      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(Object.keys(problemLabels) as ProblemType[]).map(
                        (key) => (
                          <button
                            key={key}
                            type="button"
                            className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                              problemType === key
                                ? "bg-primary/10 text-primary"
                                : "text-foreground"
                            }`}
                            onClick={() => {
                              setProblemType(key);
                              setShowProblemDropdown(false);
                            }}
                          >
                            {problemLabels[key]}
                          </button>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Location Section */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold text-foreground">
                  Localização *
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isLoadingLocation}
                  className="gap-2"
                >
                  {isLoadingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                  Usar GPS
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label
                    htmlFor="address"
                    className="text-xs text-muted-foreground"
                  >
                    Endereço completo *
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label
                      htmlFor="cep"
                      className="text-xs text-muted-foreground"
                    >
                      CEP (opcional)
                    </Label>
                    <Input
                      id="cep"
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                      placeholder="00000-000"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">GPS</Label>
                    <p className="text-sm text-muted-foreground mt-2">
                      {latitude && longitude
                        ? `${latitude}, ${longitude}`
                        : "Não detectado"}
                    </p>
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="reference"
                    className="text-xs text-muted-foreground"
                  >
                    Ponto de referência *
                  </Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Próximo ao posto de gasolina"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Local de fácil acesso para guincho? *
                  </Label>
                  <RadioGroup
                    value={accessForTow}
                    onValueChange={(val) => setAccessForTow(val as AccessType)}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sim" id="access-sim" />
                      <Label htmlFor="access-sim" className="cursor-pointer">
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao" id="access-nao" />
                      <Label htmlFor="access-nao" className="cursor-pointer">
                        Não
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_sei" id="access-naosei" />
                      <Label
                        htmlFor="access-naosei"
                        className="cursor-pointer"
                      >
                        Não sei
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </motion.div>

            {/* Observations */}
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label
                htmlFor="observations"
                className="text-sm font-semibold text-foreground mb-2 block"
              >
                Observações (opcional)
              </Label>
              <Textarea
                id="observations"
                value={observations}
                onChange={(e) => setObservations(e.target.value.slice(0, 300))}
                placeholder="Informações adicionais sobre a situação..."
                className="resize-none"
                rows={3}
              />
              <p className="text-xs text-muted-foreground text-right mt-1">
                {observations.length}/300
              </p>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className={`w-full h-14 text-lg font-semibold ${
                  isPPinkActive
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                }`}
              >
                <Phone className="w-5 h-5 mr-2" />
                Solicitar Socorro
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default RequestHelp;
