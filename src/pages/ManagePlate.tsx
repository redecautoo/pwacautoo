import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Check, Clock, Send, Inbox, X, UserPlus, Flag, CheckCircle, XCircle, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import SuccessModal from "@/components/SuccessModal";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import SealRequiredNotice from "@/components/SealRequiredNotice";

type ActionType = "transfer" | "claim";

const ManagePlate = () => {
  const navigate = useNavigate();
  const { 
    vehicles, 
    transfers, 
    claims,
    initiateTransfer, 
    respondToTransfer, 
    submitClaim,
    currentUser 
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<"actions" | "status">("actions");
  const [actionType, setActionType] = useState<ActionType>("transfer");
  
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");
  
  const [claimPlate, setClaimPlate] = useState("");
  const [claimReason, setClaimReason] = useState("");
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "", highlight: "" });
  
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };
  
  const sentTransfers = transfers.filter(t => t.fromUserId === currentUser?.id);
  const pendingSentTransfers = sentTransfers.filter(t => t.status === 'pending');
  const completedSentTransfers = sentTransfers.filter(t => t.status !== 'pending');
  
  const receivedTransfers = transfers.filter(t => t.toUserCpf === currentUser?.cpf);
  const pendingReceivedTransfers = receivedTransfers.filter(t => t.status === 'pending');
  const completedReceivedTransfers = receivedTransfers.filter(t => t.status !== 'pending');
  
  const myClaims = claims;
  const pendingClaims = myClaims.filter(c => c.status === 'pending');
  const completedClaims = myClaims.filter(c => c.status !== 'pending');
  
  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
  const claimPlateValid = useMemo(() => isValidPlate(claimPlate), [claimPlate]);
  const claimIsValid = claimPlateValid && claimReason.length >= 20;
  
  const totalPendingActions = pendingSentTransfers.length + pendingReceivedTransfers.length + myClaims.filter(c => c.status === 'pending').length;
  
  const hasVerifiedSeal = !!currentUser?.isVerified;
  
  const handleInitiateTransfer = () => {
    if (selectedVehicle && selectedVehicleData && cpf.length >= 14) {
      initiateTransfer(selectedVehicle, selectedVehicleData.plate, cpf);
      setSuccessMessage({
        title: "Transferência Enviada!",
        description: "O novo dono receberá a solicitação para aceitar.",
        highlight: selectedVehicleData.plate
      });
      setShowSuccess(true);
      setSelectedVehicle(null);
      setCpf("");
    }
  };

  const handleAcceptTransfer = (transferId: string) => {
    respondToTransfer(transferId, true);
    setSuccessMessage({
      title: "Transferência Aceita!",
      description: "A placa agora pertence a você.",
      highlight: ""
    });
    setShowSuccess(true);
  };

  const handleRejectTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    setSuccessMessage({
      title: "Transferência Recusada",
      description: "A solicitação foi recusada com sucesso.",
      highlight: ""
    });
    setShowSuccess(true);
  };

  const handleCancelTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    setSuccessMessage({
      title: "Transferência Cancelada",
      description: "A solicitação foi cancelada com sucesso.",
      highlight: ""
    });
    setShowSuccess(true);
  };
  
  const handleSubmitClaim = () => {
    if (claimIsValid) {
      submitClaim(claimPlate, claimReason);
      setSuccessMessage({
        title: "Reivindicação Enviada!",
        description: "Sua solicitação está em análise.",
        highlight: claimPlate
      });
      setShowSuccess(true);
      setClaimPlate("");
      setClaimReason("");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" /> Em análise
          </span>
        );
      case 'approved':
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Aprovada
          </span>
        );
      case 'rejected':
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Recusada
          </span>
        );
    }
  };

  const getTransferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pendente
          </span>
        );
      case 'accepted':
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Aceita
          </span>
        );
      case 'rejected':
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Recusada
          </span>
        );
      default:
        return null;
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Gerenciar Placa</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {!hasVerifiedSeal ? (
              <SealRequiredNotice featureReason="Gerenciar placas requer verificação para garantir a segurança nas transferências e reivindicações." />
            ) : (
              <>
                <motion.div
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4 text-primary" />
                    Gerencie a posse das suas placas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Transfira placas para novos donos ou reivindique a posse de placas que pertencem a você.
                  </p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "actions" | "status")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actions" className="flex items-center gap-2" data-testid="tab-actions">
                  <Send className="w-4 h-4" />
                  Ações
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2" data-testid="tab-status">
                  <Clock className="w-4 h-4" />
                  Status
                  {totalPendingActions > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {totalPendingActions}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="actions" className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      actionType === "transfer"
                        ? "border-cyan-500 bg-cyan-500/15 text-cyan-400"
                        : "border-border hover:border-cyan-500/50 text-muted-foreground hover:text-cyan-400"
                    }`}
                    onClick={() => setActionType("transfer")}
                    data-testid="button-transfer-tab"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span className="font-medium">Transferir</span>
                  </button>
                  <button
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      actionType === "claim"
                        ? "border-pink-500 bg-pink-500/15 text-pink-400"
                        : "border-border hover:border-pink-500/50 text-muted-foreground hover:text-pink-400"
                    }`}
                    onClick={() => setActionType("claim")}
                    data-testid="button-claim-tab"
                  >
                    <Flag className="w-5 h-5" />
                    <span className="font-medium">Reivindicar</span>
                  </button>
                </div>
                
                {actionType === "transfer" ? (
                  <motion.div
                    key="transfer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-4"
                  >
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                      <p className="text-sm text-cyan-400">
                        Transfira a posse de uma placa sua para outro CPF.
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Selecione a placa para transferir
                      </label>
                      <div className="space-y-2">
                        {vehicles.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Você não tem placas cadastradas
                          </p>
                        ) : (
                          vehicles.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              onClick={() => setSelectedVehicle(vehicle.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                selectedVehicle === vehicle.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                              }`}
                              data-testid={`button-vehicle-${vehicle.id}`}
                            >
                              <span className="font-bold tracking-wider">{vehicle.plate}</span>
                              <span className="text-sm ml-2">• {vehicle.model}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    
                    {selectedVehicle && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">
                            CPF do novo dono
                          </label>
                          <Input
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            data-testid="input-cpf"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Se o novo dono não tiver cadastro, ele precisará criar uma conta para aceitar.
                          </p>
                        </div>
                        
                        <Button
                          onClick={handleInitiateTransfer}
                          disabled={cpf.length < 14}
                          className="w-full py-6 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600"
                          size="lg"
                          data-testid="button-send-transfer"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Transferência
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="claim"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-card border border-border rounded-2xl p-6 space-y-4"
                  >
                    <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3">
                      <p className="text-sm text-pink-400">
                        Use esta opção se você é o verdadeiro dono de uma placa que já está cadastrada em outro CPF.
                      </p>
                    </div>
                    
                    <LicensePlateInput value={claimPlate} onChange={setClaimPlate} />
                    
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Motivo da reivindicação
                      </label>
                      <Textarea
                        value={claimReason}
                        onChange={(e) => setClaimReason(e.target.value)}
                        placeholder="Explique por que você é o verdadeiro dono desta placa (mínimo 20 caracteres)"
                        rows={4}
                        data-testid="input-claim-reason"
                      />
                    </div>
                    
                    <Button
                      onClick={handleSubmitClaim}
                      disabled={!claimIsValid}
                      className="w-full py-6 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-700 hover:to-pink-600"
                      size="lg"
                      data-testid="button-send-claim"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Enviar Reivindicação
                    </Button>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="status" className="space-y-6 mt-6">
                {pendingReceivedTransfers.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      Transferências Recebidas (Pendentes)
                    </h2>
                    <div className="space-y-3">
                      {pendingReceivedTransfers.map((transfer) => (
                        <motion.div 
                          key={transfer.id} 
                          className="bg-card border border-orange-500/20 rounded-xl p-4"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded flex items-center gap-1">
                              <UserPlus className="w-3 h-3" /> Pendente
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            De: {transfer.fromUserName}
                          </p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleAcceptTransfer(transfer.id)}
                              data-testid={`button-accept-${transfer.id}`}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectTransfer(transfer.id)}
                              data-testid={`button-reject-${transfer.id}`}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Recusar
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
                
                {pendingSentTransfers.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-yellow-400 mb-3 flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Transferências Enviadas (Pendentes)
                    </h2>
                    <div className="space-y-3">
                      {pendingSentTransfers.map((transfer) => (
                        <motion.div 
                          key={transfer.id} 
                          className="bg-card border border-yellow-500/20 rounded-xl p-4"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Aguardando
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Para: {transfer.toUserCpf}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelTransfer(transfer.id)}
                            data-testid={`button-cancel-${transfer.id}`}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}
                
                {pendingClaims.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2">
                      <Flag className="w-4 h-4" />
                      Reivindicações Pendentes
                    </h2>
                    <div className="space-y-3">
                      {pendingClaims.map((claim) => (
                        <div key={claim.id} className="bg-card border border-pink-500/20 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{claim.plate}</span>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{claim.reason}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(completedSentTransfers.length > 0 || completedReceivedTransfers.length > 0 || completedClaims.length > 0) && (
                  <section>
                    <h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Histórico
                    </h2>
                    <div className="space-y-3">
                      {completedSentTransfers.map((transfer) => (
                        <div key={transfer.id} className="bg-card border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            {getTransferStatusBadge(transfer.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Transferência enviada para: {transfer.toUserCpf}
                          </p>
                        </div>
                      ))}
                      {completedReceivedTransfers.map((transfer) => (
                        <div key={transfer.id} className="bg-card border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            {getTransferStatusBadge(transfer.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Transferência recebida de: {transfer.fromUserName}
                          </p>
                        </div>
                      ))}
                      {completedClaims.map((claim) => (
                        <div key={claim.id} className="bg-card border border-border rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{claim.plate}</span>
                            {getStatusBadge(claim.status)}
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            Reivindicação: {claim.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                {pendingReceivedTransfers.length === 0 && pendingSentTransfers.length === 0 && myClaims.length === 0 && completedSentTransfers.length === 0 && completedReceivedTransfers.length === 0 && (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhuma solicitação</p>
                    <p className="text-sm text-muted-foreground">
                      Suas transferências e reivindicações aparecerão aqui
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
              </>
            )}
          </div>
        </main>

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title={successMessage.title}
          description={successMessage.description}
          highlightText={successMessage.highlight}
          variant="success"
        />
      </div>
    </PageTransition>
  );
};

export default ManagePlate;
