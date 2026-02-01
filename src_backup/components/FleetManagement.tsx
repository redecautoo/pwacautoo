import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Check, 
  Shield, 
  Car, 
  ChevronRight,
  Phone,
  X,
  Crown,
  Truck,
  MessageCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import { FleetSealBadge } from "@/components/FleetSealBadge";
import { FleetChat } from "@/components/FleetChat";
import SuccessModal from "@/components/SuccessModal";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useApp } from "@/contexts/AppContext";
import { 
  CautooFleet, 
  FleetMember,
  FleetAssistance,
  isAssistanceInCarence,
  isAssistanceOperational,
  hasAssistanceAvailableCalls,
  getAssistanceAvailableCalls,
  getActiveAssistance,
  hasActiveAssistance,
  isFleetAdmin,
  getAssistanceDaysRemaining,
  isFleetSealValid,
  getCarenceDaysRemaining,
  canContractAssistance,
  calculateAssistanceCost,
  getPricingTier,
  PRICING_TIERS,
} from "@/lib/fleetTypes";

interface FleetManagementProps {
  currentUserId: string;
  currentUserName: string;
  userPlates: { plate: string; model: string; color: string }[];
  onBack: () => void;
  initialSelectedFleet?: CautooFleet | null;
}

export function FleetManagement({ currentUserId, currentUserName, userPlates, onBack, initialSelectedFleet = null }: FleetManagementProps) {
  const navigate = useNavigate();
  const { 
    userFleets: contextFleets, 
    createFleet: contextCreateFleet,
    deleteFleet: contextDeleteFleet,
    updateFleet, 
    sendFleetChatMessage,
    addFleetHelpRequest,
    updateFleetHelpRequest,
    sendFleetInvite,
    cancelFleetInvite,
    getCurrentCauCashBalance,
    purchaseFleetVerifiedSeal,
    purchaseFleetAssistance,
  } = useApp();
  
  const [selectedFleet, setSelectedFleet] = useState<CautooFleet | null>(initialSelectedFleet);
  const [showCreateFleet, setShowCreateFleet] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [showContractAssistance, setShowContractAssistance] = useState(false);
  const [showHelpRequest, setShowHelpRequest] = useState(false);
  const [showVerifySeal, setShowVerifySeal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "", highlight: "" });
  
  // Flags para prevenir cliques duplos durante operações de compra
  const [isPurchasingSeal, setIsPurchasingSeal] = useState(false);
  const [isPurchasingAssistance, setIsPurchasingAssistance] = useState(false);

  // Form states - Criação de Frota (simples, sem datas/valores)
  const [newFleetName, setNewFleetName] = useState("");
  const [newFleetDescription, setNewFleetDescription] = useState("");
  
  // Form states - Contratação de Assistência
  const [assistanceStartDate, setAssistanceStartDate] = useState("");
  const [assistanceDays, setAssistanceDays] = useState("5");
  const [assistanceMultiplier, setAssistanceMultiplier] = useState("1");
  
  const [invitePlate, setInvitePlate] = useState("");
  const [selectedHelpPlate, setSelectedHelpPlate] = useState("");

  // User's fleets (as member or admin) - usar do contexto
  const myFleets = contextFleets.filter(f => 
    f.creatorId === currentUserId || 
    f.adminIds.includes(currentUserId) ||
    f.members.some(m => m.ownerId === currentUserId)
  );

  // Sincronizar selectedFleet com as alterações do contexto
  const currentFleet = selectedFleet 
    ? contextFleets.find(f => f.id === selectedFleet.id) || selectedFleet 
    : null;

  // Verificar se nome está reservado por frota verificada
  const isNameReservedByVerifiedFleet = (name: string): boolean => {
    const normalizedName = name.trim().toLowerCase();
    return contextFleets.some(f => 
      f.name.toLowerCase() === normalizedName && 
      isFleetSealValid(f)
    );
  };

  const fleetNameError = newFleetName.trim() 
    ? isNameReservedByVerifiedFleet(newFleetName) 
      ? "Este nome está reservado por uma Frota Verificada" 
      : null
    : null;

  // Criar Frota (GRATUITO - apenas nome e descrição)
  const handleCreateFleet = () => {
    if (!newFleetName.trim() || fleetNameError) return;

    const newFleet = contextCreateFleet(newFleetName, newFleetDescription);
    
    setShowCreateFleet(false);
    setNewFleetName("");
    setNewFleetDescription("");
    
    setSuccessMessage({
      title: "Frota Criada!",
      description: "Adicione veículos à sua comunidade. Com 10+ veículos você poderá contratar assistência.",
      highlight: newFleet.name
    });
    setShowSuccess(true);
    setSelectedFleet(newFleet);
  };

  const handleAddMember = () => {
    if (!currentFleet || !isValidPlate(invitePlate)) return;

    // Criar convite pendente em vez de adicionar diretamente
    sendFleetInvite(currentFleet.id, invitePlate);
    
    setShowInviteMember(false);
    setInvitePlate("");
    
    setSuccessMessage({
      title: "Convite Enviado!",
      description: "O dono da placa receberá o convite nos alertas e poderá aceitar ou recusar.",
      highlight: invitePlate.toUpperCase()
    });
    setShowSuccess(true);
  };

  const handleCancelInvite = (inviteId: string) => {
    if (!currentFleet) return;
    cancelFleetInvite(currentFleet.id, inviteId);
  };

  // Excluir frota (apenas criador)
  const handleDeleteFleet = () => {
    if (!selectedFleet) return;
    contextDeleteFleet(selectedFleet.id);
    setSelectedFleet(null);
    setShowDeleteConfirm(false);
    onBack();
  };

  // Contratar Assistência (com valores e carência) - OPERAÇÃO ATÔMICA via CauCash
  const handleContractAssistance = () => {
    // Prevenir cliques duplos
    if (isPurchasingAssistance) return;
    if (!currentFleet || !assistanceStartDate) return;

    // Verificar saldo antes de prosseguir
    const currentBalance = getCurrentCauCashBalance();
    const vehicleCount = currentFleet.members.length;
    const days = parseInt(assistanceDays);
    const multiplier = parseInt(assistanceMultiplier);

    const pricing = calculateAssistanceCost(vehicleCount, days, multiplier);
    if (!pricing) return;

    if (currentBalance < pricing.totalPrice) {
      setShowContractAssistance(false);
      navigate('/garagem/caucash');
      return;
    }

    // Marcar como processando para prevenir cliques duplos
    setIsPurchasingAssistance(true);

    const startDate = new Date(assistanceStartDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = addDays(startDate, days - 1);
    endDate.setHours(23, 59, 59, 999);

    const carenceEnd = addDays(new Date(), 3);

    const newAssistance: FleetAssistance = {
      id: `assist-${Date.now()}`,
      fleetId: currentFleet.id,
      validFrom: startDate.toISOString(),
      validUntil: endDate.toISOString(),
      daysCount: days,
      vehicleCount,
      pricePerVehiclePerDay: pricing.pricePerVehiclePerDay,
      callsBasePerDay: pricing.callsBasePerDay,
      multiplier,
      totalPrice: pricing.totalPrice,
      callsTotal: pricing.callsTotal,
      callsUsed: 0,
      callsReserved: 0,
      carenceEndsAt: carenceEnd.toISOString(),
      contractedAt: new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    // Operação ATÔMICA: verifica saldo, debita e atualiza frota em uma única operação
    const result = purchaseFleetAssistance(
      currentFleet.id, 
      pricing.totalPrice, 
      `Assistência Frota ${currentFleet.name} (${days} dias)`,
      newAssistance
    );

    setIsPurchasingAssistance(false);

    if (!result.success) {
      setShowContractAssistance(false);
      navigate('/garagem/caucash');
      return;
    }

    setShowContractAssistance(false);
    setAssistanceStartDate("");
    setAssistanceDays("5");
    setAssistanceMultiplier("1");
    
    setSuccessMessage({
      title: "Assistência Contratada!",
      description: `${pricing.callsTotal} chamados por ${days} dias. Carência de 3 dias iniciada.`,
      highlight: `R$ ${pricing.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    });
    setShowSuccess(true);
  };

  // Comprar Selo de Frota Verificada (R$50) - OPERAÇÃO ATÔMICA via CauCash
  const handlePurchaseVerifiedSeal = () => {
    // Prevenir cliques duplos
    if (isPurchasingSeal) return;
    if (!currentFleet) return;

    // Verificar saldo antes de prosseguir
    const currentBalance = getCurrentCauCashBalance();
    if (currentBalance < 50) {
      setShowVerifySeal(false);
      navigate('/garagem/caucash');
      return;
    }

    // Marcar como processando para prevenir cliques duplos
    setIsPurchasingSeal(true);

    // Operação ATÔMICA: verifica saldo, debita e atualiza frota em uma única operação
    const result = purchaseFleetVerifiedSeal(currentFleet.id);

    setIsPurchasingSeal(false);

    if (!result.success) {
      setShowVerifySeal(false);
      navigate('/garagem/caucash');
      return;
    }

    setShowVerifySeal(false);
    
    setSuccessMessage({
      title: "Frota Verificada!",
      description: "O Selo de Frota Verificada está ativo por 12 meses.",
      highlight: "R$ 50,00"
    });
    setShowSuccess(true);
  };

  const handleRequestHelp = () => {
    if (!currentFleet || !selectedHelpPlate) return;

    const activeAssistance = getActiveAssistance(currentFleet);
    if (!activeAssistance) return;

    const newHelpRequest = {
      id: `hr-${Date.now()}`,
      fleetId: currentFleet.id,
      assistanceId: activeAssistance.id,
      requesterId: currentUserId,
      requesterName: currentUserName,
      plate: selectedHelpPlate,
      status: 'pending_approval' as const,
      createdAt: new Date().toISOString(),
    };

    addFleetHelpRequest(currentFleet.id, newHelpRequest);
    sendFleetChatMessage(currentFleet.id, `🆘 ${currentUserName} (${selectedHelpPlate}) precisa de socorro!`, 'help_request', newHelpRequest.id);

    setShowHelpRequest(false);
    setSelectedHelpPlate("");
    
    setSuccessMessage({
      title: "Socorro Solicitado!",
      description: "Aguarde a aprovação de um administrador da frota.",
      highlight: selectedHelpPlate
    });
    setShowSuccess(true);
  };

  const handleApproveHelp = (requestId: string) => {
    if (!currentFleet) return;
    
    const activeAssistance = getActiveAssistance(currentFleet);
    if (!activeAssistance || !hasAssistanceAvailableCalls(activeAssistance)) return;

    // Update assistance and help request
    const updatedAssistances = currentFleet.assistances.map(a => 
      a.id === activeAssistance.id 
        ? { ...a, callsReserved: a.callsReserved + 1 }
        : a
    );
    const updatedHelpRequests = currentFleet.helpRequests.map(hr => 
      hr.id === requestId 
        ? { ...hr, status: 'approved' as const, approvedBy: currentUserId, approvedAt: new Date().toISOString() }
        : hr
    );

    updateFleet(currentFleet.id, { 
      assistances: updatedAssistances,
      helpRequests: updatedHelpRequests,
    });
    sendFleetChatMessage(currentFleet.id, `✅ ${currentUserName} aprovou o pedido de socorro.`, 'system');
  };

  const handleRejectHelp = (requestId: string) => {
    if (!currentFleet) return;

    const request = currentFleet.helpRequests.find(hr => hr.id === requestId);
    if (!request) return;

    const updatedHelpRequests = currentFleet.helpRequests.map(hr => 
      hr.id === requestId 
        ? { ...hr, status: 'rejected' as const }
        : hr
    );

    updateFleet(currentFleet.id, { helpRequests: updatedHelpRequests });
    sendFleetChatMessage(currentFleet.id, `❌ Pedido de socorro de ${request.requesterName} foi recusado.`, 'system');
  };

  const handleSendChatMessage = (text: string) => {
    if (!currentFleet || !text.trim()) return;
    sendFleetChatMessage(currentFleet.id, text);
  };

  // Fleet detail view
  if (currentFleet) {
    const isAdmin = isFleetAdmin(currentFleet, currentUserId);
    const activeAssistance = getActiveAssistance(currentFleet);
    const isOperational = activeAssistance && isAssistanceOperational(activeAssistance);
    const inCarence = activeAssistance && isAssistanceInCarence(activeAssistance);
    const daysRemaining = activeAssistance ? getAssistanceDaysRemaining(activeAssistance) : 0;
    const availableCalls = activeAssistance ? getAssistanceAvailableCalls(activeAssistance) : 0;
    const carenceDays = activeAssistance ? getCarenceDaysRemaining(activeAssistance) : 0;
    const userMemberPlates = selectedFleet.members.filter(m => m.ownerId === currentUserId);
    const pendingHelpRequests = selectedFleet.helpRequests.filter(hr => hr.status === 'pending_approval');
    const myApprovedRequest = selectedFleet.helpRequests.find(hr => hr.requesterId === currentUserId && hr.status === 'approved');
    const canContract = canContractAssistance(selectedFleet);

    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">{selectedFleet.name}</h1>
                {isFleetSealValid(selectedFleet) && <FleetSealBadge size="sm" />}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500">
                  <Crown className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {/* Botão de excluir - apenas para o criador */}
              {selectedFleet.creatorId === currentUserId && (
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Veículos</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{selectedFleet.members.length}</p>
                <p className="text-xs text-muted-foreground">
                  {!canContract ? `Faltam ${10 - selectedFleet.members.length} para contratar` : "Pode contratar assistência"}
                </p>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Chamados</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {activeAssistance ? `${availableCalls}/${activeAssistance.callsTotal}` : "0"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeAssistance ? "Disponíveis" : "Sem assistência"}
                </p>
              </div>
            </div>

            {/* Alerts */}
            {inCarence && activeAssistance && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-500">Período de Carência</p>
                    <p className="text-sm text-yellow-500/80">
                      {carenceDays} dia(s) restantes. Chamados não podem ser usados durante a carência.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Active Assistance Info */}
            {activeAssistance && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Assistência Ativa</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período:</span>
                    <span className="text-foreground">
                      {format(new Date(activeAssistance.validFrom), "dd/MM/yyyy", { locale: ptBR })} - {format(new Date(activeAssistance.validUntil), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Veículos cobertos:</span>
                    <span className="text-foreground">{activeAssistance.vehicleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chamados:</span>
                    <span className="text-foreground">{availableCalls} de {activeAssistance.callsTotal}</span>
                  </div>
                  {isOperational && (
                    <div className="flex items-center gap-1 text-green-500 mt-2">
                      <Check className="w-3 h-3" />
                      <span className="text-xs">{daysRemaining} dia(s) restantes</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No Assistance */}
            {!activeAssistance && (
              <div className="bg-muted/50 border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Sem Assistência Ativa</p>
                    <p className="text-sm text-muted-foreground">
                      {canContract 
                        ? "Contrate assistência para seu próximo evento ou viagem."
                        : `Adicione mais ${10 - selectedFleet.members.length} veículo(s) para poder contratar.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Pending Help Requests - Agora exibido no chat */}
            {isAdmin && pendingHelpRequests.length > 0 && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-sm text-red-500">
                  🆘 {pendingHelpRequests.length} solicitação(ões) pendente(s) no chat abaixo
                </p>
              </div>
            )}

            {/* My Approved Request */}
            {myApprovedRequest && activeAssistance && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
              >
                <p className="font-medium text-green-500 mb-2">✅ Socorro Aprovado!</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Seu pedido de socorro foi aprovado. Clique abaixo para usar o chamado da Frota.
                </p>
                <Button
                  onClick={() => {
                    const updatedAssistances = currentFleet.assistances.map(a => 
                      a.id === activeAssistance.id 
                        ? { ...a, callsUsed: a.callsUsed + 1, callsReserved: Math.max(0, a.callsReserved - 1) }
                        : a
                    );
                    const updatedHelpRequests = currentFleet.helpRequests.map(hr => 
                      hr.id === myApprovedRequest.id 
                        ? { ...hr, status: 'used' as const, usedAt: new Date().toISOString() }
                        : hr
                    );
                    updateFleet(currentFleet.id, { assistances: updatedAssistances, helpRequests: updatedHelpRequests });
                    navigate(`/request-help/${myApprovedRequest.plate}?fleet=${currentFleet.id}`);
                  }}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Usar Chamado da Frota
                </Button>
                <p className="text-xs text-center text-green-500/70 mt-2">
                  Este atendimento será pago pela Frota Cautoo
                </p>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {isAdmin && (
                <Button
                  onClick={() => setShowInviteMember(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Veículo
                </Button>
              )}

              {isAdmin && canContract && (
                <Button
                  onClick={() => setShowContractAssistance(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Contratar Assistência para Evento
                </Button>
              )}

              {userMemberPlates.length > 0 && isOperational && !myApprovedRequest && (
                <Button
                  onClick={() => setShowHelpRequest(true)}
                  className="w-full bg-red-500 hover:bg-red-600"
                  disabled={!activeAssistance || !hasAssistanceAvailableCalls(activeAssistance) || inCarence}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Preciso de Socorro
                </Button>
              )}

              {isAdmin && !selectedFleet.isVerified && (
                <Button
                  onClick={() => setShowVerifySeal(true)}
                  variant="outline"
                  className="w-full border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10"
                  disabled={selectedFleet.members.length < 10}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {selectedFleet.members.length < 10 
                    ? `Selo de Frota Verificada (mínimo 10 veículos)` 
                    : `Selo de Frota Verificada (R$ 50 por 12 meses)`}
                </Button>
              )}
            </div>

            {/* Fleet Chat - OBRIGATÓRIO */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-medium text-foreground">Chat da Frota</h3>
              </div>
              <FleetChat
                fleet={selectedFleet}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                onSendMessage={handleSendChatMessage}
                onApproveHelp={handleApproveHelp}
                onRejectHelp={handleRejectHelp}
              />
            </div>

            {/* Pending Invites - Convites Aguardando Aprovação */}
            {isAdmin && currentFleet.invites.filter(inv => inv.status === 'pending').length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Convites Pendentes ({currentFleet.invites.filter(inv => inv.status === 'pending').length})
                </h3>
                <div className="space-y-2">
                  {currentFleet.invites.filter(inv => inv.status === 'pending').map(invite => (
                    <div 
                      key={invite.id} 
                      className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-mono font-medium text-foreground">{invite.plate}</p>
                        <p className="text-xs text-yellow-500">Aguardando aprovação do dono</p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleCancelInvite(invite.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Members List */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Membros ({currentFleet.members.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {currentFleet.members.map(member => (
                  <div 
                    key={member.id} 
                    className="bg-card border border-border rounded-xl p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-mono font-medium text-foreground">{member.plate}</p>
                      <p className="text-xs text-muted-foreground">{member.ownerName}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{member.model}</p>
                  </div>
                ))}
                {currentFleet.members.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Car className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum veículo na frota</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Dialogs */}
        <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Veículo</DialogTitle>
              <DialogDescription>
                O dono da placa receberá o convite nos alertas e poderá aceitar ou recusar.
              </DialogDescription>
            </DialogHeader>
            <LicensePlateInput value={invitePlate} onChange={setInvitePlate} />
            <DialogFooter>
              <Button onClick={handleAddMember} disabled={!isValidPlate(invitePlate)}>
                Enviar Convite
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contract Assistance Dialog */}
        <Dialog open={showContractAssistance} onOpenChange={setShowContractAssistance}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Contratar Assistência para Evento</DialogTitle>
              <DialogDescription>
                Configure a assistência para sua frota. A carência de 3 dias será iniciada após a contratação.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Pricing Info */}
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-2">Sua faixa de preço ({selectedFleet.members.length} veículos):</p>
                {(() => {
                  const tier = getPricingTier(selectedFleet.members.length);
                  if (!tier) return <p className="text-sm text-destructive">Mínimo de 10 veículos necessário</p>;
                  return (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">R$ {tier.pricePerVehiclePerDay}/veículo/dia</p>
                      <p className="text-xs text-muted-foreground">{tier.callsBasePerDay} chamado(s) base por dia</p>
                    </div>
                  );
                })()}
              </div>

              {/* All Pricing Tiers */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Tabela de preços:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {PRICING_TIERS.map((tier, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded border ${
                        selectedFleet.members.length >= tier.minVehicles && selectedFleet.members.length <= tier.maxVehicles
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <p className="font-medium">{tier.minVehicles}{tier.maxVehicles === Infinity ? '+' : `-${tier.maxVehicles}`} veículos</p>
                      <p className="text-muted-foreground">R$ {tier.pricePerVehiclePerDay}/veículo/dia</p>
                      <p className="text-muted-foreground">{tier.callsBasePerDay} chamado(s)/dia</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Data de Início *</Label>
                <Input
                  type="date"
                  value={assistanceStartDate}
                  onChange={(e) => setAssistanceStartDate(e.target.value)}
                  min={format(addDays(new Date(), 3), 'yyyy-MM-dd')}
                />
                <p className="text-xs text-muted-foreground mt-1">Mínimo 3 dias a partir de hoje (carência)</p>
              </div>

              <div>
                <Label>Quantidade de Dias *</Label>
                <Select value={assistanceDays} onValueChange={setAssistanceDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 7, 10, 14, 30].map(d => (
                      <SelectItem key={d} value={d.toString()}>{d} dia(s)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Multiplicador de Chamados</Label>
                <Select value={assistanceMultiplier} onValueChange={setAssistanceMultiplier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(m => (
                      <SelectItem key={m} value={m.toString()}>{m}x (mais chamados)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">Aumenta proporcionalmente preço e chamados</p>
              </div>

              {/* Calculated Total */}
              {(() => {
                const pricing = calculateAssistanceCost(
                  selectedFleet.members.length, 
                  parseInt(assistanceDays), 
                  parseInt(assistanceMultiplier)
                );
                if (!pricing) return null;
                return (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Veículos:</span>
                      <span className="text-sm font-medium">{selectedFleet.members.length}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Dias:</span>
                      <span className="text-sm font-medium">{assistanceDays}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Multiplicador:</span>
                      <span className="text-sm font-medium">{assistanceMultiplier}x</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Chamados totais:</span>
                      <span className="text-sm font-bold text-primary">{pricing.callsTotal}</span>
                    </div>
                    <div className="border-t border-primary/30 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium">Total:</span>
                        <span className="text-xl font-bold text-primary">
                          R$ {pricing.totalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-600">
                  ⚠️ Após a contratação, há carência de 3 dias. Se os chamados acabarem durante o evento, 
                  não será possível comprar mais (use plano individual ou avulso).
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleContractAssistance} 
                disabled={!assistanceStartDate || !canContract || isPurchasingAssistance}
              >
                {isPurchasingAssistance ? "Processando..." : "Confirmar Contratação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showVerifySeal} onOpenChange={setShowVerifySeal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FleetSealBadge size="md" />
                Selo de Frota Verificada
              </DialogTitle>
              <DialogDescription>
                Garanta nome exclusivo e selo visual para sua frota.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Nome exclusivo garantido</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Selo visual de verificação</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Validade de 12 meses</span>
              </div>
            </div>
            <div className="bg-emerald-500/10 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">R$ 50,00</p>
              <p className="text-xs text-emerald-500 mt-1">válido por 12 meses</p>
            </div>
            <DialogFooter>
              <Button 
                onClick={handlePurchaseVerifiedSeal} 
                className="bg-emerald-500 hover:bg-emerald-600"
                disabled={isPurchasingSeal}
              >
                {isPurchasingSeal ? "Processando..." : "Verificar Frota"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showHelpRequest} onOpenChange={setShowHelpRequest}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Solicitar Socorro</DialogTitle>
              <DialogDescription>
                Selecione o veículo que precisa de socorro. Um administrador precisará aprovar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {userMemberPlates.map(member => (
                <button
                  key={member.id}
                  onClick={() => setSelectedHelpPlate(member.plate)}
                  className={`w-full p-3 rounded-xl border transition-colors ${
                    selectedHelpPlate === member.plate
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-secondary/50'
                  }`}
                >
                  <p className="font-mono font-medium">{member.plate}</p>
                  <p className="text-xs text-muted-foreground">{member.model}</p>
                </button>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={handleRequestHelp} disabled={!selectedHelpPlate}>
                Solicitar Socorro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Fleet Confirmation Dialog */}
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-500">
                <Trash2 className="w-5 h-5" />
                Excluir Frota
              </DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir a frota <strong>{selectedFleet.name}</strong>? 
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-500">
                ⚠️ Todos os membros serão removidos e a assistência contratada será perdida.
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteFleet}
                className="bg-red-500 hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Frota
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title={successMessage.title}
          description={successMessage.description}
          highlightText={successMessage.highlight}
          variant="success"
        />
      </div>
    );
  }

  // Fleet list view
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Frota Cautoo</h1>
          </div>
          <Button size="sm" onClick={() => setShowCreateFleet(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Criar
          </Button>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          
          {/* Info Card */}
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">O que é Frota Cautoo?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Uma comunidade permanente de veículos, como um grupo de WhatsApp. 
                  Crie gratuitamente e contrate assistência quando precisar para eventos e viagens.
                </p>
              </div>
            </div>
          </div>

          {/* User's Fleets */}
          <div>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Minhas Frotas</h2>
            
            {myFleets.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Nenhuma frota encontrada</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Crie uma nova frota gratuitamente
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myFleets.map(fleet => {
                  const activeAssistance = getActiveAssistance(fleet);
                  const availableCalls = activeAssistance ? getAssistanceAvailableCalls(activeAssistance) : 0;
                  const isOperational = activeAssistance && isAssistanceOperational(activeAssistance);
                  const inCarence = activeAssistance && isAssistanceInCarence(activeAssistance);
                  
                  return (
                    <motion.button
                      key={fleet.id}
                      onClick={() => setSelectedFleet(fleet)}
                      className="w-full bg-card border border-border rounded-xl p-4 text-left hover:bg-secondary/50 transition-colors"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-emerald-500" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-foreground">{fleet.name}</p>
                              {isFleetSealValid(fleet) && <FleetSealBadge size="sm" />}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {fleet.members.length} veículos
                              {activeAssistance && ` • ${availableCalls} chamados`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      
                      {!activeAssistance && fleet.members.length < 10 && (
                        <div className="mt-2 flex items-center gap-1 text-muted-foreground">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="text-xs">Precisa de {10 - fleet.members.length} veículo(s)</span>
                        </div>
                      )}
                      {!activeAssistance && fleet.members.length >= 10 && (
                        <div className="mt-2 flex items-center gap-1 text-blue-500">
                          <Truck className="w-3 h-3" />
                          <span className="text-xs">Pode contratar assistência</span>
                        </div>
                      )}
                      {inCarence && (
                        <div className="mt-2 flex items-center gap-1 text-yellow-500">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">Assistência em carência</span>
                        </div>
                      )}
                      {isOperational && (
                        <div className="mt-2 flex items-center gap-1 text-green-500">
                          <Check className="w-3 h-3" />
                          <span className="text-xs">Assistência ativa</span>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Fleet Dialog - SIMPLES, SEM VALORES */}
      <Dialog open={showCreateFleet} onOpenChange={setShowCreateFleet}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Nova Frota</DialogTitle>
            <DialogDescription>
              Crie gratuitamente uma comunidade de veículos. Adicione membros e contrate assistência quando precisar.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground font-medium">Nome da Frota *</Label>
              <Input
                value={newFleetName}
                onChange={(e) => setNewFleetName(e.target.value)}
                placeholder="Ex: Amigos da Serra"
                maxLength={50}
                className={`mt-1.5 focus-visible:ring-offset-0 focus-visible:border-transparent ${fleetNameError 
                  ? 'border-red-500 focus-visible:ring-2 focus-visible:ring-red-500' 
                  : 'focus-visible:ring-2 focus-visible:ring-primary'
                }`}
              />
              {fleetNameError && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Shield className="w-3.5 h-3.5 text-red-500" />
                  <p className="text-xs text-red-500">{fleetNameError}</p>
                </div>
              )}
            </div>
            <div>
              <Label className="text-foreground font-medium">Descrição (opcional)</Label>
              <Textarea
                value={newFleetDescription}
                onChange={(e) => setNewFleetDescription(e.target.value)}
                placeholder="Descrição da sua comunidade"
                maxLength={200}
                className="mt-1.5 min-h-[80px] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-0 focus-visible:border-transparent"
              />
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-sm text-emerald-500">
                ✓ Criar frota é <strong>gratuito</strong>. Você só paga quando contratar assistência para um evento.
              </p>
            </div>
            <div className="bg-muted/50 border border-border rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Dica:</strong> Com o Selo de Frota Verificada (R$50/ano), você garante exclusividade do nome da sua frota.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={handleCreateFleet} 
              disabled={!newFleetName.trim() || !!fleetNameError}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Criar Frota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successMessage.title}
        description={successMessage.description}
        highlightText={successMessage.highlight}
        variant="success"
      />
    </div>
  );
}

export default FleetManagement;
