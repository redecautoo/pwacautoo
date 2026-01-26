import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, MapPin, Calendar, Eye, CheckCircle, Search, Phone, Shield, Clock, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { getStolenAlertDaysRemaining, canRenewStolenAlertFree, isStolenAlertActive } from "@/lib/types";

const Stolen = () => {
  const navigate = useNavigate();
  const { vehicles, stolenVehicles, markAsRecovered, currentUser, renewStolenAlert, reactivateStolenAlert } = useApp();
  const [plateFilter, setPlateFilter] = useState("");
  const [showReactivateModal, setShowReactivateModal] = useState<string | null>(null);
  
  // Meus veículos roubados (do usuário)
  const myVehicles = vehicles;
  const myStolenVehicles = myVehicles.filter(v => v.isStolen);
  
  // Todos veículos roubados na região (incluindo de outros usuários)
  const allStolenVehicles = stolenVehicles;
  
  // Filtrar por placa
  const filteredStolenVehicles = plateFilter 
    ? allStolenVehicles.filter(v => v.plate.toUpperCase().includes(plateFilter.toUpperCase()))
    : allStolenVehicles;
  
  const userIsVerified = currentUser?.isVerified || false;
  
  const handleRecovery = (vehicleId: string) => {
    markAsRecovered(vehicleId);
    toast.success("Alerta de roubo encerrado!");
  };
  
  const handleRenewFree = (vehicleId: string) => {
    const success = renewStolenAlert(vehicleId);
    if (success) {
      toast.success("Alerta renovado!", {
        description: "O alerta foi estendido por mais 3 dias gratuitamente.",
      });
    } else {
      toast.error("Não foi possível renovar", {
        description: "Você já utilizou a renovação gratuita.",
      });
    }
  };
  
  const handleReactivate = (vehicleId: string) => {
    // Mock: simular pagamento
    reactivateStolenAlert(vehicleId);
    setShowReactivateModal(null);
    toast.success("Alerta reativado!", {
      description: "O alerta ficará ativo por mais 7 dias.",
    });
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header - Modo Alerta Máximo */}
        <header className="border-b border-[#D32F2F]/40 bg-[#D32F2F]/10 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-white">Veículos Roubados</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Meus alertas ativos (do usuário) */}
            {myStolenVehicles.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[#E53935] mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Meus Alertas Ativos
                </h2>
                <div className="space-y-3">
                  {myStolenVehicles.map((vehicle) => {
                    const daysRemaining = getStolenAlertDaysRemaining(vehicle.stolenAlert);
                    const canRenew = canRenewStolenAlertFree(vehicle.stolenAlert);
                    const isActive = isStolenAlertActive(vehicle.stolenAlert);
                    const isExpired = vehicle.stolenAlert && !isActive;
                    const renewalUsed = vehicle.stolenAlert?.renewalUsed || false;
                    
                    return (
                      <motion.div 
                        key={vehicle.id} 
                        className={`rounded-xl p-4 shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.35)] ${isExpired ? 'bg-muted/50 border border-muted' : 'bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55'}`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-white tracking-wider">
                            {vehicle.plate}
                          </span>
                          <div className="flex items-center gap-2">
                            {isExpired ? (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded font-medium">
                                EXPIRADO
                              </span>
                            ) : (
                              <span className="text-xs bg-[#D32F2F] text-white px-2 py-1 rounded font-bold uppercase shadow-[0_0_10px_rgba(211,47,47,0.4)]">
                                ROUBADO
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-white/[0.78] mb-2">
                          {vehicle.model} • {vehicle.color}
                        </p>
                        
                        {/* Status do alerta */}
                        {vehicle.stolenAlert && (
                          <div className={`rounded-lg p-3 mb-3 ${isExpired ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-black/30 border border-[#D32F2F]/30'}`}>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-white/[0.62]" />
                              {isExpired ? (
                                <span className="text-amber-500 font-medium">
                                  Alerta expirado
                                </span>
                              ) : (
                                <span className="text-white">
                                  <span className="font-medium">{daysRemaining}</span> {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}
                                </span>
                              )}
                            </div>
                            {renewalUsed && !isExpired && (
                              <p className="text-xs text-white/[0.62] mt-1">
                                Renovação gratuita já utilizada
                              </p>
                            )}
                          </div>
                        )}
                        
                        {vehicle.stolenInfo && (
                          <div className="text-xs text-white/[0.62] mb-3">
                            <p><MapPin className="w-3 h-3 inline mr-1" />{vehicle.stolenInfo.location}</p>
                            <p><Calendar className="w-3 h-3 inline mr-1" />{vehicle.stolenInfo.date} às {vehicle.stolenInfo.time}</p>
                          </div>
                        )}
                        
                        {/* Sightings */}
                        {vehicle.stolenInfo?.sightings && vehicle.stolenInfo.sightings.length > 0 && (
                          <div className="border-t border-[#D32F2F]/30 pt-3 mt-3">
                            <p className="text-xs font-medium text-white mb-2">
                              <Eye className="w-3 h-3 inline mr-1" />
                              Avistamentos ({vehicle.stolenInfo.sightings.length})
                            </p>
                            <div className="space-y-2">
                              {vehicle.stolenInfo.sightings.map((sighting) => (
                                <div key={sighting.id} className="bg-black/30 border border-[#D32F2F]/20 rounded-lg p-2 text-xs">
                                  <p className="text-white/[0.78]">{sighting.location}</p>
                                  <p className="text-white/[0.62]">{sighting.date} às {sighting.time}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Ações baseadas no estado */}
                        <div className="flex flex-col gap-2 mt-4">
                          {isExpired ? (
                            <>
                              {/* Alerta expirado - mostrar opção de reativar */}
                              <Button
                                className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_4px_16px_rgba(211,47,47,0.3)]"
                                onClick={() => setShowReactivateModal(vehicle.id)}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Reativar Alerta — R$ 5,00
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => handleRecovery(vehicle.id)}
                              >
                                Encerrar Alerta
                              </Button>
                            </>
                          ) : canRenew ? (
                            <>
                              {/* Pode renovar gratuitamente */}
                              <Button
                                className="w-full bg-primary hover:bg-primary/90"
                                onClick={() => handleRenewFree(vehicle.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renovar +3 dias (grátis)
                              </Button>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleRecovery(vehicle.id)}
                                >
                                  Encerrar
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    handleRecovery(vehicle.id);
                                    toast.success("Recuperação confirmada com ajuda da rede!");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Recuperado
                                </Button>
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Alerta ativo normal */}
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => handleRecovery(vehicle.id)}
                                >
                                  Encerrar Alerta
                                </Button>
                                <Button
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => {
                                    handleRecovery(vehicle.id);
                                    toast.success("Recuperação confirmada com ajuda da rede!");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Recuperado
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
            
            {/* Alertas de roubo na região */}
            <section>
              <h2 className="text-sm font-bold text-[#E53935] mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Alertas na Região ({allStolenVehicles.length})
              </h2>
              
              {/* Filtro de placa */}
              {allStolenVehicles.length > 5 && (
                <div className="mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar placa..."
                      value={plateFilter}
                      onChange={(e) => setPlateFilter(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              )}
              
              {filteredStolenVehicles.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {plateFilter ? "Nenhuma placa encontrada" : "Nenhum alerta de roubo na região"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStolenVehicles.map((vehicle, index) => {
                    const isMyVehicle = myVehicles.some(v => v.id === vehicle.id);
                    
                    return (
                      <motion.div
                        key={vehicle.id}
                        className="bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55 rounded-xl p-4 shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.35)]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white tracking-wider">
                              {vehicle.plate}
                            </span>
                            {isMyVehicle && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded font-medium">
                                MEU
                              </span>
                            )}
                          </div>
                          <span className="text-xs bg-[#D32F2F] text-white px-2 py-0.5 rounded font-bold uppercase shadow-[0_0_10px_rgba(211,47,47,0.4)]">
                            ROUBADO
                          </span>
                        </div>
                        <p className="text-sm text-white/[0.78] mb-2">
                          {vehicle.model} • {vehicle.color}
                        </p>
                        {vehicle.stolenInfo && (
                          <div className="text-xs text-white/[0.62] mb-3">
                            <p><MapPin className="w-3 h-3 inline mr-1" />{vehicle.stolenInfo.location}</p>
                            <p><Calendar className="w-3 h-3 inline mr-1" />{vehicle.stolenInfo.date} às {vehicle.stolenInfo.time}</p>
                          </div>
                        )}
                        
                        {/* Ações - baseado no selo */}
                        {!isMyVehicle && (
                          <div className="flex gap-2 mt-3">
                            {userIsVerified ? (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-[#D32F2F]/50 text-white/[0.78] hover:bg-[#D32F2F]/20 hover:text-white"
                                onClick={() => navigate(`/sighting?plate=${vehicle.plate}`)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Reportar Avistamento
                              </Button>
                            ) : (
                              <div className="flex-1 flex items-center gap-2 text-xs text-white/[0.62] bg-black/30 rounded-lg px-3 py-2 border border-[#D32F2F]/20">
                                <Shield className="w-4 h-4" />
                                <span>Selo necessário para reportar</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_4px_16px_rgba(211,47,47,0.3)]"
                              onClick={() => {
                                window.location.href = "tel:190";
                              }}
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              190
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
            
          </div>
        </main>
        
        {/* Modal de Reativação - Fundo Opaco */}
        <AnimatePresence>
          {showReactivateModal && (
            <motion.div 
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-[#1a1a1a] border border-[#D32F2F]/55 rounded-2xl p-6 max-w-sm w-full shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_10px_30px_rgba(0,0,0,0.5)]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(211,47,47,0.4)]">
                    <CreditCard className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Reativar Alerta
                  </h3>
                  <p className="text-sm text-gray-300">
                    Este alerta custa <span className="font-bold text-white">R$ 5,00</span> e ficará ativo por <span className="font-bold text-white">7 dias</span>.
                  </p>
                </div>
                
                <div className="bg-[#252525] rounded-lg p-3 mb-6 border border-[#D32F2F]/40">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Duração:</span>
                    <span className="text-gray-200">7 dias + 3 dias (renovação grátis)</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Total:</span>
                    <span className="font-bold text-[#E53935]">R$ 5,00</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold shadow-[0_0_0_1px_rgba(211,47,47,0.25),0_4px_16px_rgba(211,47,47,0.3)]"
                    onClick={() => handleReactivate(showReactivateModal)}
                  >
                    Confirmar e Pagar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    onClick={() => setShowReactivateModal(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Stolen;