import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HandHeart, Car, MapPin, Clock, Phone, AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import PageTransition from "@/components/PageTransition";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import { SolidaryEmergencyType, getEmergencyTypeLabel, SolidaryAlert } from "@/lib/types";

const emergencyTypes: { value: SolidaryEmergencyType; label: string }[] = [
  { value: 'pane_mecanica', label: 'Pane mecânica' },
  { value: 'pneu_furado', label: 'Pneu furado' },
  { value: 'acidente_leve', label: 'Acidente leve' },
  { value: 'falta_combustivel', label: 'Falta de combustível' },
  { value: 'roubo_furto', label: 'Roubo/furto' },
  { value: 'situacao_risco', label: 'Situação de risco / motorista sem sinal' },
  { value: 'outro', label: 'Outro' },
];

const SolidarySocorro = () => {
  const navigate = useNavigate();
  const { currentUser, vehicles, sendSolidaryAlert, getSolidaryAlertsForUser, respondToSolidaryAlert } = useApp();
  
  const [plate, setPlate] = useState("");
  const [emergencyType, setEmergencyType] = useState<SolidaryEmergencyType | "">("");
  const [otherDescription, setOtherDescription] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [approximateTime, setApproximateTime] = useState("");
  const [driverWithoutPhone, setDriverWithoutPhone] = useState(false);
  const [driverWithoutSignal, setDriverWithoutSignal] = useState(false);
  const [additionalPhone, setAdditionalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showEmergencyDropdown, setShowEmergencyDropdown] = useState(false);
  
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  };

  const plateIsValid = isValidPlate(plate);
  
  const canSubmit = 
    plateIsValid && 
    emergencyType !== "" && 
    (emergencyType !== 'outro' || otherDescription.trim()) &&
    description.trim() && 
    location.trim() && 
    approximateTime.trim();

  const checkAlertLimit = () => {
    if (!currentUser) return false;
    const alerts = getSolidaryAlertsForUser?.(currentUser.id) || [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAlerts = alerts.filter(a => new Date(a.createdAt) > oneHourAgo);
    return recentAlerts.length < 2;
  };

  const handleSubmit = async () => {
    if (!currentUser || !canSubmit) return;
    
    if (!checkAlertLimit()) {
      toast.error("Limite atingido", {
        description: "Você pode enviar no máximo 2 alertas solidários por hora."
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const alertData = {
        targetPlate: plate.replace("-", ""),
        emergencyType: emergencyType as SolidaryEmergencyType,
        description: emergencyType === 'outro' ? otherDescription : description,
        location,
        approximateTime,
        driverWithoutSignal,
        additionalPhone: additionalPhone || undefined,
      };
      
      const result = sendSolidaryAlert?.(alertData);
      
      if (result?.success) {
        setShowSuccess(true);
        if (!result.hasCoverage) {
          toast.warning("Alerta registrado", {
            description: "O motorista não possui cobertura Cautoo ativa. O alerta foi registrado mas não será encaminhado até que a cobertura esteja válida."
          });
        } else {
          toast.success("Alerta enviado!", {
            description: "Seu alerta solidário foi registrado com sucesso."
          });
        }
      } else {
        toast.error("Erro ao enviar", {
          description: result?.error || "Não foi possível enviar o alerta."
        });
      }
    } catch (error) {
      toast.error("Erro ao enviar alerta");
    } finally {
      setIsSubmitting(false);
    }
  };

  const receivedAlerts = currentUser ? (getSolidaryAlertsForUser?.(currentUser.id, 'received') || []) : [];

  if (showSuccess) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-6">
              <HandHeart className="w-10 h-10 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Alerta Solidário Registrado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Assim que o motorista Cautoo estiver acessível, ele será notificado. Obrigado por agir com solidariedade!
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowSuccess(false)} className="w-full">
                Enviar Outro Alerta
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full">
                Voltar ao Início
              </Button>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Alerta Solidário</h1>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <Tabs defaultValue="enviar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="enviar" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar Socorro
                </TabsTrigger>
                <TabsTrigger value="recebidos" className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  Recebidos
                  {receivedAlerts.filter(a => a.status === 'entregue').length > 0 && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {receivedAlerts.filter(a => a.status === 'entregue').length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviar" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground font-medium mb-1">
                        Ajude outro motorista
                      </p>
                      <p className="text-xs text-muted-foreground">
                        O alerta será entregue apenas a veículos com cobertura Cautoo ativa (clientes com plano vigente, selo verde ou frotas com assistência contratada).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <LicensePlateInput value={plate} onChange={setPlate} />
                </div>

                <AnimatePresence>
                  {plateIsValid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Tipo de emergência *
                          </label>
                          <div className="relative">
                            <button
                              onClick={() => setShowEmergencyDropdown(!showEmergencyDropdown)}
                              className="w-full flex items-center justify-between p-3 bg-background border border-border rounded-lg text-left"
                              data-testid="select-emergency-type"
                            >
                              <span className={emergencyType ? "text-foreground" : "text-muted-foreground"}>
                                {emergencyType ? getEmergencyTypeLabel(emergencyType) : "Selecione o tipo"}
                              </span>
                              <ChevronDown className={`w-4 h-4 transition-transform ${showEmergencyDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                              {showEmergencyDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden"
                                >
                                  {emergencyTypes.map((type) => (
                                    <button
                                      key={type.value}
                                      onClick={() => {
                                        setEmergencyType(type.value);
                                        setShowEmergencyDropdown(false);
                                      }}
                                      className={`w-full p-3 text-left text-sm hover:bg-secondary/50 transition-colors ${
                                        emergencyType === type.value ? 'bg-blue-500/10 text-blue-500' : 'text-foreground'
                                      }`}
                                    >
                                      {type.label}
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {emergencyType === 'outro' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                          >
                            <label className="block text-sm font-medium text-foreground mb-2">
                              Descreva a emergência *
                            </label>
                            <Input
                              value={otherDescription}
                              onChange={(e) => setOtherDescription(e.target.value)}
                              placeholder="Descreva brevemente"
                              maxLength={50}
                              data-testid="input-other-emergency"
                            />
                          </motion.div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Local do ocorrido *
                          </label>
                          <Textarea
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Rua, ponto de referência e cidade..."
                            className="resize-none"
                            rows={2}
                            maxLength={150}
                            data-testid="input-location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Breve descrição *
                          </label>
                          <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Descreva a situação observada..."
                            className="resize-none"
                            rows={3}
                            maxLength={200}
                            data-testid="input-description"
                          />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {description.length}/200
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            <Clock className="inline w-4 h-4 mr-1" />
                            Horário aproximado *
                          </label>
                          <Input
                            value={approximateTime}
                            onChange={(e) => setApproximateTime(e.target.value)}
                            placeholder="Ex: Há cerca de 30 minutos, desde 14h..."
                            maxLength={50}
                            data-testid="input-time"
                          />
                        </div>

                        <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                          <p className="text-sm font-medium text-foreground">Situação do motorista</p>
                          <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={driverWithoutPhone}
                                onChange={(e) => setDriverWithoutPhone(e.target.checked)}
                                className="w-4 h-4 rounded border-amber-500 text-amber-500"
                                data-testid="checkbox-no-phone"
                              />
                              <span className="text-sm text-foreground">Motorista sem celular</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={driverWithoutSignal}
                                onChange={(e) => setDriverWithoutSignal(e.target.checked)}
                                className="w-4 h-4 rounded border-amber-500 text-amber-500"
                                data-testid="checkbox-no-signal"
                              />
                              <span className="text-sm text-foreground">Local sem sinal</span>
                            </label>
                          </div>
                          {(driverWithoutPhone || driverWithoutSignal) && (
                            <p className="text-xs text-amber-600 mt-1">
                              O alerta será enviado para a equipe Cautoo para acionamento.
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Telefone alternativo para contato (opcional)
                          </label>
                          <Input
                            value={additionalPhone}
                            onChange={(e) => setAdditionalPhone(formatPhone(e.target.value))}
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                            data-testid="input-phone"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ex: telefone fixo do local, celular de acompanhante, etc.
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
                        <div className="flex gap-2 items-start">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-xs text-muted-foreground">
                            Limite de 2 alertas solidários por hora. Uso indevido pode resultar em suspensão.
                          </p>
                        </div>
                      </div>

                      <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                        size="lg"
                        data-testid="button-send-solidary"
                      >
                        {isSubmitting ? "Enviando..." : "Enviar Alerta Solidário"}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              </TabsContent>

              <TabsContent value="recebidos" className="mt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {receivedAlerts.length === 0 ? (
                    <div className="text-center py-12">
                      <HandHeart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhum alerta solidário recebido</p>
                    </div>
                  ) : (
                    receivedAlerts.map((alert) => (
                      <ReceivedAlertCard key={alert.id} alert={alert} />
                    ))
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

const ReceivedAlertCard = ({ alert }: { alert: SolidaryAlert }) => {
  const { respondToSolidaryAlert, markSolidaryAlertAsUseful } = useApp();
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (response: 'acionado' | 'ja_resolvido') => {
    setIsResponding(true);
    try {
      respondToSolidaryAlert?.(alert.id, response);
      toast.success(response === 'acionado' ? "Socorro acionado!" : "Marcado como resolvido");
    } finally {
      setIsResponding(false);
    }
  };

  const handleMarkUseful = (isUseful: boolean) => {
    markSolidaryAlertAsUseful?.(alert.id, isUseful);
    toast.success(isUseful ? "Alerta marcado como útil! O remetente recebeu +2 ICC" : "Marcado como não útil");
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <span className="font-medium text-foreground">
            {getEmergencyTypeLabel(alert.emergencyType)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(alert.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono tracking-wider">{alert.targetPlate}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <span className="text-muted-foreground">{alert.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">{alert.approximateTime}</span>
        </div>
        {alert.additionalPhone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{alert.additionalPhone}</span>
          </div>
        )}
      </div>
      
      <p className="text-sm text-foreground mb-4">{alert.description}</p>
      
      {alert.status === 'entregue' && (
        <div className="flex gap-2">
          <Button
            onClick={() => handleResponse('acionado')}
            disabled={isResponding}
            className="flex-1 bg-blue-500 hover:bg-blue-600"
            size="sm"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Acionar Socorro
          </Button>
          <Button
            onClick={() => handleResponse('ja_resolvido')}
            disabled={isResponding}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <XCircle className="w-4 h-4 mr-1" />
            Já Resolvido
          </Button>
        </div>
      )}
      
      {alert.status === 'acionado' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
          <span className="text-sm text-blue-500 font-medium">Socorro acionado</span>
        </div>
      )}
      
      {alert.status === 'resolvido' && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
          <span className="text-sm text-green-500 font-medium">Resolvido</span>
        </div>
      )}
      
      {(alert.status === 'acionado' || alert.status === 'resolvido') && alert.isUseful === undefined && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Este alerta foi útil?</p>
          <div className="flex gap-2">
            <Button
              onClick={() => handleMarkUseful(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-green-500/50 text-green-500 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Sim, foi útil
            </Button>
            <Button
              onClick={() => handleMarkUseful(false)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <XCircle className="w-4 h-4 mr-1" />
              Não
            </Button>
          </div>
        </div>
      )}
      
      {alert.isUseful === true && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
            <span className="text-xs text-green-500">
              {alert.iccRewardApplied 
                ? "Marcado como útil (+2 ICC aplicado)" 
                : "Marcado como útil (+2 ICC será aplicado quando o remetente acessar)"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolidarySocorro;
