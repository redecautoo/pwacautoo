import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, MapPin, Calendar, Eye, CheckCircle, Search, Phone, Shield, Clock, RefreshCw, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { getStolenAlertDaysRemaining, canRenewStolenAlertFree, isStolenAlertActive } from "@/lib/types";

const Stolen = () => {
  const navigate = useNavigate();
  const { vehicles, stolenVehicles, markAsRecovered, currentUser, renewStolenAlert, reactivateStolenAlert, showAlert } = useApp();
  const [plateFilter, setPlateFilter] = useState("");
  const [showReactivateModal, setShowReactivateModal] = useState<string | null>(null);

  const myVehicles = vehicles;
  const myStolenVehicles = myVehicles.filter(v => v.isStolen);
  const allStolenVehicles = stolenVehicles;
  const filteredStolenVehicles = plateFilter
    ? allStolenVehicles.filter(v => v.plate.toUpperCase().includes(plateFilter.toUpperCase()))
    : allStolenVehicles;

  const userIsVerified = currentUser?.isVerified || false;

  const handleRecovery = (vehicleId: string, confirmedByRede = false) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    markAsRecovered(vehicleId);
    showAlert(
      confirmedByRede ? "Recuperação Confirmada!" : "Alerta Encerrado",
      confirmedByRede
        ? "Parabéns! Seu veículo foi recuperado com a ajuda da rede Cautoo."
        : "O alerta de roubo para este veículo foi encerrado com sucesso.",
      "success",
      v?.plate
    );
  };

  const handleRenewFree = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    const success = renewStolenAlert(vehicleId);
    if (success) {
      showAlert("Alerta Renovado!", "O alerta foi estendido por mais 3 dias gratuitamente.", "success", v?.plate);
    } else {
      showAlert("Não foi possível renovar", "Você já utilizou a renovação gratuita para este alerta.", "warning");
    }
  };

  const handleReactivate = (vehicleId: string) => {
    const v = vehicles.find(veh => veh.id === vehicleId);
    reactivateStolenAlert(vehicleId);
    setShowReactivateModal(null);
    showAlert("Alerta Reativado!", "O alerta de roubo ficará ativo por mais 7 dias.", "success", v?.plate);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-[#D32F2F]/40 bg-[#D32F2F]/10 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold text-white">Veículos Roubados</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {myStolenVehicles.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-[#E53935] mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />Meus Alertas Ativos</h2>
                <div className="space-y-3">
                  {myStolenVehicles.map((vehicle) => {
                    const daysRemaining = getStolenAlertDaysRemaining(vehicle.stolenAlert);
                    const canRenew = canRenewStolenAlertFree(vehicle.stolenAlert);
                    const isActive = isStolenAlertActive(vehicle.stolenAlert);
                    const isExpired = vehicle.stolenAlert && !isActive;

                    return (
                      <motion.div key={vehicle.id} className={`rounded-xl p-4 shadow-lg ${isExpired ? 'bg-muted/50' : 'bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55'}`} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="flex items-center justify-between mb-3"><span className="font-bold text-white tracking-wider">{vehicle.plate}</span> {isExpired ? <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">EXPIRADO</span> : <span className="text-xs bg-[#D32F2F] px-2 py-1 rounded font-bold uppercase">ROUBADO</span>}</div>
                        <p className="text-sm text-white/[0.78] mb-2">{vehicle.model} • {vehicle.color}</p>
                        {vehicle.stolenAlert && (
                          <div className={`rounded-lg p-3 mb-3 ${isExpired ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-black/30 border border-[#D32F2F]/30'}`}><div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-white/[0.62]" />{isExpired ? <span className="text-amber-500">Alerta expirado</span> : <span className="text-white">{daysRemaining} dias restantes</span>}</div></div>
                        )}
                        <div className="flex flex-col gap-2 mt-4">
                          {isExpired ? (
                            <>
                              <Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold" onClick={() => setShowReactivateModal(vehicle.id)}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Reativar — R$ 5,00
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleRecovery(vehicle.id)}>
                                Encerrar Alerta
                              </Button>
                            </>
                          ) : canRenew ? (
                            <>
                              <Button className="w-full bg-primary" onClick={() => handleRenewFree(vehicle.id)}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Renovar +3 dias (grátis)
                              </Button>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleRecovery(vehicle.id)}>
                                  Encerrar
                                </Button>
                                <Button size="sm" className="flex-1" onClick={() => handleRecovery(vehicle.id, true)}>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Recuperado
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1" onClick={() => handleRecovery(vehicle.id)}>Encerrar</Button><Button size="sm" className="flex-1" onClick={() => handleRecovery(vehicle.id, true)}><CheckCircle className="w-4 h-4 mr-1" />Recuperado</Button></div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-sm font-bold text-[#E53935] mb-3 flex items-center gap-2"><Eye className="w-4 h-4" />Alertas na Região</h2>
              {allStolenVehicles.length > 5 && (
                <div className="mb-4 relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Buscar placa..." value={plateFilter} onChange={(e) => setPlateFilter(e.target.value)} className="pl-9" /></div>
              )}
              {filteredStolenVehicles.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>Nenhum alerta de roubo na região</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredStolenVehicles.map((vehicle) => (
                    <motion.div key={vehicle.id} className="bg-gradient-to-br from-[#D32F2F]/16 to-[#D32F2F]/10 border border-[#D32F2F]/55 rounded-xl p-4 shadow-lg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="font-bold text-white tracking-wider">{vehicle.plate}</span> {myVehicles.some(v => v.id === vehicle.id) && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">MEU</span>}</div><span className="text-xs bg-[#D32F2F] text-white px-2 py-0.5 rounded font-bold uppercase">ROUBADO</span></div>
                      <p className="text-sm text-white/[0.78] mb-2">{vehicle.model} • {vehicle.color}</p>
                      {!myVehicles.some(v => v.id === vehicle.id) && (
                        <div className="flex gap-2 mt-3">
                          {userIsVerified ? <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/sighting?plate=${vehicle.plate}`)}><Eye className="w-4 h-4 mr-1" />Avistamento</Button> : <div className="flex-1 flex items-center gap-2 text-xs text-white/[0.62] bg-black/30 rounded-lg px-3 py-2 border border-[#D32F2F]/20"><Shield className="w-4 h-4" /><span>Selo necessário</span></div>}
                          <Button size="sm" className="bg-[#D32F2F] hover:bg-[#B71C1C]" onClick={() => window.location.href = "tel:190"}><Phone className="w-4 h-4 mr-1" />190</Button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>

        <AnimatePresence>
          {showReactivateModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <motion.div className="bg-[#1a1a1a] border border-[#D32F2F]/55 rounded-2xl p-6 max-w-sm w-full" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                <div className="text-center mb-6"><div className="w-16 h-16 rounded-full bg-[#D32F2F] flex items-center justify-center mx-auto mb-4"><CreditCard className="w-8 h-8 text-white" /></div><h3 className="text-lg font-bold text-white mb-2">Reativar Alerta</h3><p className="text-sm text-gray-300">Este alerta custa <span className="font-bold text-white">R$ 5,00</span> e ficará ativo por <span className="font-bold text-white">7 dias</span>.</p></div>
                <div className="space-y-3"><Button className="w-full bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold" onClick={() => handleReactivate(showReactivateModal)}>Confirmar e Pagar</Button><Button variant="outline" className="w-full text-gray-300" onClick={() => setShowReactivateModal(null)}>Cancelar</Button></div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

export default Stolen;