import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRightLeft, Check, Clock, Send, Inbox, X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

const Transfer = () => {
  const navigate = useNavigate();
  const { vehicles, transfers, initiateTransfer, respondToTransfer, currentUser, showAlert } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [cpf, setCpf] = useState("");

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  // Transferências enviadas (dono atual enviando para novo dono)
  const sentTransfers = transfers.filter(t => t.fromUserId === currentUser?.id);
  const pendingSentTransfers = sentTransfers.filter(t => t.status === 'pending');

  // Transferências recebidas (novo dono recebendo do dono anterior)
  const receivedTransfers = transfers.filter(t => t.toUserCpf === currentUser?.cpf);
  const pendingReceivedTransfers = receivedTransfers.filter(t => t.status === 'pending');

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

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
    showAlert("Transferência Aceita!", "O veículo agora pertence a você.", "success");
  };

  const handleRejectTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    showAlert("Transferência Recusada", "A solicitação foi recusada com sucesso.", "warning");
  };

  const handleCancelTransfer = (transferId: string) => {
    respondToTransfer(transferId, false);
    showAlert("Transferência Cancelada", "A solicitação foi cancelada com sucesso.", "warning");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Transferência de Placa</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* Explicação do fluxo */}
            <motion.div
              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-primary" />
                Como funciona?
              </h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>O dono atual do veículo envia a transferência</li>
                <li>O novo dono (se não tiver cadastro) deve criar uma conta</li>
                <li>O novo dono aceita a transferência recebida</li>
                <li>A placa é transferida com segurança</li>
              </ol>
            </motion.div>

            <Tabs defaultValue="send" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="send" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar
                  {pendingSentTransfers.length > 0 && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {pendingSentTransfers.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="receive" className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  Receber
                  {pendingReceivedTransfers.length > 0 && (
                    <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {pendingReceivedTransfers.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Aba Enviar */}
              <TabsContent value="send" className="space-y-6 mt-6">
                {/* Transferências enviadas pendentes */}
                {pendingSentTransfers.length > 0 && (
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Aguardando Aceitação</h2>
                    <div className="space-y-3">
                      {pendingSentTransfers.map((transfer) => (
                        <motion.div
                          key={transfer.id}
                          className="bg-card border border-yellow-500/20 rounded-xl p-4"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Pendente
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            Enviado para: {transfer.toUserCpf}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => handleCancelTransfer(transfer.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar Transferência
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Iniciar nova transferência */}
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Enviar Transferência</h2>
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Selecione o veículo para transferir
                      </label>
                      <div className="space-y-2">
                        {vehicles.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Você não tem veículos cadastrados
                          </p>
                        ) : (
                          vehicles.map((vehicle) => (
                            <button
                              key={vehicle.id}
                              onClick={() => setSelectedVehicle(vehicle.id)}
                              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedVehicle === vehicle.id
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                                }`}
                            >
                              <span className="font-bold tracking-wider">{vehicle.plate}</span>
                              <span className="text-sm ml-2">• {vehicle.model}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    {selectedVehicle && (
                      <>
                        <div>
                          <label className="block text-sm text-muted-foreground mb-2">
                            CPF do novo dono
                          </label>
                          <Input
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))}
                            placeholder="000.000.000-00"
                          />
                          <p className="text-xs text-muted-foreground mt-2">
                            Se o novo dono não tiver cadastro, ele precisará criar uma conta para aceitar.
                          </p>
                        </div>

                        <Button
                          onClick={handleInitiateTransfer}
                          disabled={cpf.length < 14}
                          className="w-full h-12 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 font-bold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Enviar Transferência
                        </Button>
                      </>
                    )}
                  </div>
                </section>
              </TabsContent>

              {/* Aba Receber */}
              <TabsContent value="receive" className="space-y-6 mt-6">
                {pendingReceivedTransfers.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Inbox className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhuma transferência pendente</p>
                    <p className="text-sm text-muted-foreground">
                      Quando alguém transferir um veículo para você, aparecerá aqui
                    </p>
                  </div>
                ) : (
                  <section>
                    <h2 className="text-sm font-medium text-muted-foreground mb-3">Transferências Recebidas</h2>
                    <div className="space-y-3">
                      {pendingReceivedTransfers.map((transfer) => (
                        <motion.div
                          key={transfer.id}
                          className="bg-card border border-orange-500/20 rounded-xl p-4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-foreground tracking-wider">{transfer.plate}</span>
                            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded flex items-center gap-1">
                              <UserPlus className="w-3 h-3" /> Nova
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
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Aceitar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRejectTransfer(transfer.id)}
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
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Transfer;

