import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, HandHeart, Car, MapPin, Clock, Phone, AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, Send, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const { currentUser, vehicles, sendSolidaryAlert, getSolidaryAlertsForUser, respondToSolidaryAlert, showAlert } = useApp();

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
      showAlert("Limite Atingido", "Você pode enviar no máximo 2 alertas solidários por hora.", "warning");
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
          showAlert(
            "Alerta Registrado",
            "O motorista não possui cobertura Cautoo ativa. O alerta foi registrado mas não será encaminhado até que a cobertura esteja válida.",
            "warning",
            plate
          );
        } else {
          showAlert(
            "Alerta Enviado!",
            "Seu alerta solidário foi registrado com sucesso e enviado para a rede Cautoo.",
            "success",
            plate
          );
        }
      } else {
        showAlert("Erro ao Enviar", result?.error || "Não foi possível enviar o alerta no momento.", "error");
      }
    } catch (error) {
      showAlert("Erro Fatal", "Ocorreu um erro inesperado ao enviar o alerta.", "error");
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
              Alerta Solidário Enviado!
            </h1>
            <p className="text-muted-foreground mb-6">
              Obrigado por sua atitude! Assim que o motorista Cautoo estiver acessível, ele será notificado da sua ajuda.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setShowSuccess(false)} className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold">
                Enviar Outro Alerta
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full h-12 rounded-xl">
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
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
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
                    <span className="ml-1 w-5 h-5 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                      {receivedAlerts.filter(a => a.status === 'entregue').length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enviar" className="mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">O alerta será entregue apenas a veículos com cobertura Cautoo ativa (planos, selo verde ou frotas assistidas).</p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-6">
                    <LicensePlateInput value={plate} onChange={setPlate} />
                  </div>

                  <AnimatePresence>
                    {plateIsValid && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-4">
                        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                          <div><label className="block text-sm font-medium mb-2">Tipo de emergência *</label>
                            <div className="relative"><button onClick={() => setShowEmergencyDropdown(!showEmergencyDropdown)} className="w-full flex items-center justify-between p-3 bg-background border rounded-lg text-left"><span>{emergencyType ? getEmergencyTypeLabel(emergencyType) : "Selecione o tipo"}</span><ChevronDown className="w-4 h-4" /></button>
                              {showEmergencyDropdown && <div className="absolute top-full left-0 right-0 mt-1 bg-card border rounded-lg shadow-lg z-10">
                                {emergencyTypes.map((type) => (<button key={type.value} onClick={() => { setEmergencyType(type.value); setShowEmergencyDropdown(false); }} className={`w-full p-3 text-left text-sm hover:bg-secondary/50 ${emergencyType === type.value ? 'bg-blue-500/10 text-blue-500' : ''}`}>{type.label}</button>))}
                              </div>}
                            </div>
                          </div>
                          {emergencyType === 'outro' && <Input value={otherDescription} onChange={(e) => setOtherDescription(e.target.value)} placeholder="Descreva brevemente" maxLength={50} />}
                          <div><label className="block text-sm font-medium mb-2"><MapPin className="inline w-4 h-4 mr-1" />Local do ocorrido *</label><Textarea value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Rua, ponto de referência..." className="resize-none" rows={2} maxLength={150} /></div>
                          <div><label className="block text-sm font-medium mb-2">Breve descrição *</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descreva a situação..." className="resize-none" rows={3} maxLength={200} /></div>
                          <div><label className="block text-sm font-medium mb-2"><Clock className="inline w-4 h-4 mr-1" />Horário aproximado *</label><Input value={approximateTime} onChange={(e) => setApproximateTime(e.target.value)} placeholder="Ex: Há 30 min..." maxLength={50} /></div>
                          <div className="space-y-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={driverWithoutPhone} onChange={(e) => setDriverWithoutPhone(e.target.checked)} className="w-4 h-4" /><span className="text-sm">Motorista sem celular</span></label>
                            <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={driverWithoutSignal} onChange={(e) => setDriverWithoutSignal(e.target.checked)} className="w-4 h-4" /><span className="text-sm">Local sem sinal</span></label>
                          </div>
                          <div><label className="block text-sm font-medium mb-2"><Phone className="inline w-4 h-4 mr-1" />Telefone alternativo</label><Input value={additionalPhone} onChange={(e) => setAdditionalPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" maxLength={15} /></div>
                        </div>
                        <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-xl font-bold">{isSubmitting ? "Enviando..." : "Enviar Alerta Solidário"}</Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              <TabsContent value="recebidos" className="mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {receivedAlerts.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground"><HandHeart className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Nenhum alerta recebido</p></div>
                  ) : (
                    receivedAlerts.map((alert) => <ReceivedAlertCard key={alert.id} alert={alert} />)
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
  const { respondToSolidaryAlert, markSolidaryAlertAsUseful, showAlert } = useApp();
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (response: 'acionado' | 'ja_resolvido') => {
    setIsResponding(true);
    try {
      respondToSolidaryAlert?.(alert.id, response);
      showAlert(
        response === 'acionado' ? "Socorro Acionado" : "Visto",
        response === 'acionado' ? "O socorro foi acionado e o motorista será notificado." : "O alerta foi marcado como resolvido.",
        "success"
      );
    } finally {
      setIsResponding(false);
    }
  };

  const handleMarkUseful = (isUseful: boolean) => {
    markSolidaryAlertAsUseful?.(alert.id, isUseful);
    showAlert(
      isUseful ? "Feedback Enviado" : "Feedback Registrado",
      isUseful ? "O alerta foi marcado como útil! O remetente recebeu 2 ICC como recompensa." : "Obrigado pelo seu feedback.",
      isUseful ? "success" : "info"
    );
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /><span className="font-bold">{getEmergencyTypeLabel(alert.emergencyType)}</span></div><span className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString()}</span></div>
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center gap-2"><Car className="w-4 h-4 text-muted-foreground" /><span className="font-mono">{alert.targetPlate}</span></div>
        <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /><span className="text-muted-foreground">{alert.location}</span></div>
        {alert.additionalPhone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><span className="text-muted-foreground">{alert.additionalPhone}</span></div>}
      </div>
      <p className="text-sm mb-4">{alert.description}</p>
      {alert.status === 'entregue' && (
        <div className="flex gap-2"><Button onClick={() => handleResponse('acionado')} disabled={isResponding} className="flex-1 bg-blue-600" size="sm"><CheckCircle className="w-4 h-4 mr-1" />Acionar Socorro</Button><Button onClick={() => handleResponse('ja_resolvido')} disabled={isResponding} variant="outline" className="flex-1" size="sm"><XCircle className="w-4 h-4 mr-1" />Já Resolvido</Button></div>
      )}
      {(alert.status === 'acionado' || alert.status === 'resolvido') && alert.isUseful === undefined && (
        <div className="mt-3 pt-3 border-t"><p className="text-xs text-muted-foreground mb-2">Este alerta foi útil?</p><div className="flex gap-2"><Button onClick={() => handleMarkUseful(true)} variant="outline" size="sm" className="flex-1 text-green-500 border-green-500/30">Sim</Button><Button onClick={() => handleMarkUseful(false)} variant="outline" size="sm" className="flex-1">Não</Button></div></div>
      )}
      {alert.isUseful === true && <div className="mt-3 pt-3 border-t text-center"><span className="text-xs text-green-500 font-bold">✓ Alerta Útil (+2 ICC)</span></div>}
    </div>
  );
};

export default SolidarySocorro;
