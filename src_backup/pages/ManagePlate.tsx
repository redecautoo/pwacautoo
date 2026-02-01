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
    currentUser,
    showAlert
  } = useApp();

  const [activeTab, setActiveTab] = useState<"actions" | "status">("actions");
  const [actionType, setActionType] = useState<ActionType>("transfer");

  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  const [claimPlate, setClaimPlate] = useState("");
  const [claimReason, setClaimReason] = useState("");

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

  const totalPendingActions = pendingSentTransfers.length + pendingReceivedTransfers.length + pendingClaims.length;
  const hasVerifiedSeal = !!currentUser?.isVerified;

  const handleInitiateTransfer = () => {
    if (selectedVehicle && selectedVehicleData && cpf.length >= 14) {
      initiateTransfer(selectedVehicle, selectedVehicleData.plate, cpf);
      showAlert(
        "Transferência Enviada!",
        "O novo dono receberá a solicitação para aceitar.",
        "success",
        selectedVehicleData.plate
      );
      setSelectedVehicle(null);
      setCpf("");
    }
  };

  const handleAcceptTransfer = (transferId: string) => {
    respondToTransfer(transferId, true);
    showAlert("Transferência Aceita!", "A placa agora pertence a você.", "success");
  };

  const handleRejectTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    showAlert("Transferência Recusada", "A solicitação foi recusada com sucesso.", "warning");
  };

  const handleCancelTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    showAlert("Transferência Cancelada", "A solicitação foi cancelada com sucesso.", "warning");
  };

  const handleSubmitClaim = () => {
    if (claimIsValid) {
      submitClaim(claimPlate, claimReason);
      showAlert(
        "Reivindicação Enviada!",
        "Sua solicitação está em análise. Você será notificado sobre o resultado.",
        "success",
        claimPlate
      );
      setClaimPlate("");
      setClaimReason("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> Em análise</span>;
      case 'approved': return <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aprovada</span>;
      case 'rejected': return <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> Recusada</span>;
      default: return null;
    }
  };

  const getTransferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> Pendente</span>;
      case 'accepted': return <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Aceita</span>;
      case 'rejected': return <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1"><XCircle className="w-3 h-3" /> Recusada</span>;
      default: return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-semibold text-foreground">Gerenciar Placa</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {!hasVerifiedSeal ? (
              <SealRequiredNotice featureReason="Gerenciar placas requer verificação para garantir a segurança nas transferências e reivindicações." />
            ) : (
              <>
                <motion.div className="bg-primary/5 border border-primary/20 rounded-xl p-4" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <h3 className="font-medium text-foreground mb-2 flex items-center gap-2"><Car className="w-4 h-4 text-primary" />Gerencie a posse das suas placas</h3>
                  <p className="text-sm text-muted-foreground">Transfira placas para novos donos ou reivindique a posse de placas que pertencem a você.</p>
                </motion.div>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "actions" | "status")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="actions" className="flex items-center gap-2"><Send className="w-4 h-4" />Ações</TabsTrigger>
                    <TabsTrigger value="status" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />Status
                      {totalPendingActions > 0 && <span className="ml-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">{totalPendingActions}</span>}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="actions" className="space-y-6 mt-6">
                    <div className="grid grid-cols-2 gap-3">
                      <button className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${actionType === "transfer" ? "border-cyan-500 bg-cyan-500/15 text-cyan-400" : "border-border text-muted-foreground"}`} onClick={() => setActionType("transfer")}><RefreshCw className="w-5 h-5" /><span className="font-medium">Transferir</span></button>
                      <button className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${actionType === "claim" ? "border-pink-500 bg-pink-500/15 text-pink-400" : "border-border text-muted-foreground"}`} onClick={() => setActionType("claim")}><Flag className="w-5 h-5" /><span className="font-medium">Reivindicar</span></button>
                    </div>

                    {actionType === "transfer" ? (
                      <motion.div key="transfer" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3"><p className="text-sm text-cyan-400">Transfira a posse de uma placa sua para outro CPF.</p></div>
                        <div><label className="block text-sm text-muted-foreground mb-2">Selecione a placa</label><div className="space-y-2">{vehicles.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">Nenhuma placa cadastrada</p> : vehicles.map((v) => <button key={v.id} onClick={() => setSelectedVehicle(v.id)} className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedVehicle === v.id ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"}`}><span className="font-bold tracking-wider">{v.plate}</span><span className="text-sm ml-2">• {v.model}</span></button>)}</div></div>
                        {selectedVehicle && (
                          <div className="space-y-4">
                            <div><label className="block text-sm text-muted-foreground mb-2">CPF do novo dono</label><Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" /></div>
                            <Button onClick={handleInitiateTransfer} disabled={cpf.length < 14} className="w-full py-6 bg-cyan-600 hover:bg-cyan-700" size="lg"><Send className="w-4 h-4 mr-2" />Enviar Transferência</Button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="claim" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-2xl p-6 space-y-4">
                        <div className="bg-pink-500/10 border border-pink-500/30 rounded-lg p-3"><p className="text-sm text-pink-400">Reivindique a posse de uma placa que já está cadastrada em outro CPF.</p></div>
                        <LicensePlateInput value={claimPlate} onChange={setClaimPlate} />
                        <div><label className="block text-sm text-muted-foreground mb-2">Motivo</label><Textarea value={claimReason} onChange={(e) => setClaimReason(e.target.value)} placeholder="Mínimo 20 caracteres" rows={4} /></div>
                        <Button onClick={handleSubmitClaim} disabled={!claimIsValid} className="w-full py-6 bg-pink-600 hover:bg-pink-700" size="lg"><Flag className="w-4 h-4 mr-2" />Enviar Reivindicação</Button>
                      </motion.div>
                    )}
                  </TabsContent>

                  <TabsContent value="status" className="space-y-6 mt-6">
                    {/* Sections for Received, Sent, Claims, History */}
                    {pendingReceivedTransfers.length > 0 && (
                      <section><h2 className="text-sm font-bold text-orange-400 mb-3 flex items-center gap-2"><Inbox className="w-4 h-4" />Recebidas</h2><div className="space-y-3">{pendingReceivedTransfers.map((t) => <div key={t.id} className="bg-card border border-orange-500/20 rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{t.plate}</span>{getStatusBadge('pending')}</div><p className="text-xs mb-3">De: {t.fromUserName}</p><div className="flex gap-2"><Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAcceptTransfer(t.id)}>Aceitar</Button><Button variant="outline" size="sm" className="flex-1 border-destructive/50 text-destructive" onClick={() => handleRejectTransfer(t.id)}>Recusar</Button></div></div>)}</div></section>
                    )}
                    {/* ... other sections condensed ... */}
                    {pendingSentTransfers.length > 0 && (
                      <section><h2 className="text-sm font-bold text-yellow-500 mb-3 flex items-center gap-2"><Send className="w-4 h-4" />Enviadas</h2><div className="space-y-3">{pendingSentTransfers.map((t) => <div key={t.id} className="bg-card border border-yellow-500/20 rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{t.plate}</span><span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Aguardando</span></div><p className="text-xs mb-3">Para: {t.toUserCpf}</p><Button variant="outline" size="sm" className="w-full border-destructive/50 text-destructive" onClick={() => handleCancelTransfer(t.id)}>Cancelar</Button></div>)}</div></section>
                    )}
                    {pendingClaims.length > 0 && (
                      <section><h2 className="text-sm font-bold text-pink-400 mb-3 flex items-center gap-2"><Flag className="w-4 h-4" />Reivindicações</h2><div className="space-y-3">{pendingClaims.map((c) => <div key={c.id} className="bg-card border border-pink-500/20 rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{c.plate}</span>{getStatusBadge('pending')}</div><p className="text-xs line-clamp-2">{c.reason}</p></div>)}</div></section>
                    )}
                    {(completedSentTransfers.length > 0 || completedReceivedTransfers.length > 0 || completedClaims.length > 0) && (
                      <section><h2 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2"><Clock className="w-4 h-4" />Histórico</h2><div className="space-y-3">
                        {completedSentTransfers.map((t) => <div key={t.id} className="bg-card border border-border rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{t.plate}</span>{getTransferStatusBadge(t.status)}</div><p className="text-xs text-muted-foreground">Para: {t.toUserCpf}</p></div>)}
                        {completedReceivedTransfers.map((t) => <div key={t.id} className="bg-card border border-border rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{t.plate}</span>{getTransferStatusBadge(t.status)}</div><p className="text-xs text-muted-foreground">De: {t.fromUserName}</p></div>)}
                        {completedClaims.map((c) => <div key={c.id} className="bg-card border border-border rounded-xl p-4"><div className="flex items-center justify-between mb-2"><span className="font-bold tracking-wider">{c.plate}</span>{getStatusBadge(c.status)}</div><p className="text-xs text-muted-foreground line-clamp-2">{c.reason}</p></div>)}
                      </div></section>
                    )}
                    {totalPendingActions === 0 && completedSentTransfers.length === 0 && completedReceivedTransfers.length === 0 && completedClaims.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground"><Search className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Nenhuma solicitação encontrada</p></div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default ManagePlate;
