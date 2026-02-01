import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Send, Inbox, Users, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { FleetInvite } from "@/lib/fleetTypes";

const Alerts = () => {
  const navigate = useNavigate();
  const { 
    alerts, 
    sentAlerts, 
    vehicles, 
    markAlertAsRead,
    userFleets,
    respondToFleetInvite,
  } = useApp();
  const [filterPlate, setFilterPlate] = useState<string | null>(null);
  
  // Obter convites de frota pendentes para as placas do usuário
  const userPlatesList = vehicles.map(v => v.plate.toUpperCase());
  const pendingFleetInvites: (FleetInvite & { fleetId: string })[] = [];
  
  (userFleets || []).forEach(fleet => {
    (fleet.invites || [])
      .filter(inv => inv.status === 'pending' && userPlatesList.includes(inv.plate.toUpperCase()))
      .forEach(inv => pendingFleetInvites.push({ ...inv, fleetId: fleet.id }));
  });
  
  const filteredAlerts = filterPlate 
    ? alerts.filter(a => a.plate === filterPlate)
    : alerts;
  
  const sortedAlerts = [...filteredAlerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const sortedSentAlerts = [...sentAlerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const unreadCount = alerts.filter(a => !a.isRead).length;
  const totalReceivedCount = unreadCount + pendingFleetInvites.length;

  const handleAcceptInvite = (fleetId: string, inviteId: string) => {
    respondToFleetInvite(fleetId, inviteId, true);
  };

  const handleRejectInvite = (fleetId: string, inviteId: string) => {
    respondToFleetInvite(fleetId, inviteId, false);
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Meus Alertas</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            <Tabs defaultValue="received" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="received" className="flex items-center gap-2">
                  <Inbox className="w-4 h-4" />
                  Recebidos
                  {totalReceivedCount > 0 && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {totalReceivedCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviados
                  {sentAlerts.length > 0 && (
                    <span className="w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center">
                      {sentAlerts.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Alertas Recebidos */}
              <TabsContent value="received" className="space-y-4 mt-4">
                
                {/* Convites de Frota Pendentes */}
                {pendingFleetInvites.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Convites de Frota ({pendingFleetInvites.length})
                    </h3>
                    {pendingFleetInvites.map((invite, index) => (
                      <motion.div
                        key={invite.id}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" />
                            <span className="font-medium text-foreground">
                              Convite para Frota
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(invite.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        
                        <p className="text-sm text-foreground mb-1">
                          <span className="font-semibold text-emerald-500">{invite.invitedByName}</span> convidou sua placa{" "}
                          <span className="font-mono font-bold">{invite.plate}</span> para participar da frota:
                        </p>
                        <p className="text-lg font-semibold text-emerald-500 mb-3">
                          {invite.fleetName}
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectInvite(invite.fleetId, invite.id)}
                            className="flex-1 border-red-500/50 text-red-500 hover:bg-red-500/10"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Recusar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAcceptInvite(invite.fleetId, invite.id)}
                            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aceitar
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button
                    variant={filterPlate === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterPlate(null)}
                  >
                    Todos
                  </Button>
                  {vehicles.map((v) => (
                    <Button
                      key={v.id}
                      variant={filterPlate === v.plate ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterPlate(v.plate)}
                    >
                      {v.plate}
                    </Button>
                  ))}
                </div>
                
                {/* Alerts List */}
                {sortedAlerts.length === 0 && pendingFleetInvites.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum alerta recebido</p>
                  </div>
                ) : sortedAlerts.length === 0 ? null : (
                  <div className="space-y-3">
                    {sortedAlerts.length > 0 && pendingFleetInvites.length > 0 && (
                      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mt-4">
                        <Bell className="w-4 h-4" />
                        Alertas de Placa
                      </h3>
                    )}
                    {sortedAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        className={`bg-card border rounded-xl p-4 transition-colors cursor-pointer ${
                          alert.isRead ? "border-border" : "border-primary bg-primary/5"
                        }`}
                        onClick={() => !alert.isRead && markAlertAsRead(alert.id)}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground tracking-wider text-sm">
                              {alert.plate}
                            </span>
                            {!alert.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-primary mb-1 font-medium">{alert.categoryName}</p>
                        <p className="text-sm text-foreground">{alert.messageText}</p>
                        {alert.senderHasSeal && (
                          <span className="inline-flex items-center gap-1 text-xs text-blue-400 mt-2">
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                            Enviado por usuário verificado
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Alertas Enviados */}
              <TabsContent value="sent" className="space-y-4 mt-4">
                {sortedSentAlerts.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhum alerta enviado</p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/send-alert")}
                    >
                      Enviar primeiro alerta
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedSentAlerts.map((alert, index) => (
                      <motion.div
                        key={alert.id}
                        className="bg-card border border-border rounded-xl p-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-primary" />
                            <span className="font-bold text-foreground tracking-wider text-sm">
                              {alert.targetPlate}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(alert.createdAt), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-xs text-primary mb-1 font-medium">{alert.categoryName}</p>
                        <p className="text-sm text-foreground">{alert.messageText}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Alerts;
