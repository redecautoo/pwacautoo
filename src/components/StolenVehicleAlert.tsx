import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, Clock, Calendar, Send, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Vehicle } from "@/lib/types";
import { useApp } from "@/contexts/AppContext";

interface StolenVehicleAlertProps {
  stolenVehicle: Vehicle;
  onReportSighting: (location: string, date: string, time: string) => void;
}

const StolenVehicleAlert = ({ stolenVehicle, onReportSighting }: StolenVehicleAlertProps) => {
  const { isLoggedIn, currentUser, vehicles } = useApp();
  const [showSightingForm, setShowSightingForm] = useState(false);
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));

  // Verificar se usuário tem perfil verificado
  const userIsVerified = currentUser?.isVerified || false;

  const handleCall190 = () => {
    window.location.href = "tel:190";
  };

  const handleSubmitSighting = () => {
    if (location.trim()) {
      onReportSighting(location, date, time);
      setShowSightingForm(false);
      setLocation("");
    }
  };

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Banner vermelho de alerta */}
      <div className="bg-red-600 text-white rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">⚠️ ALERTA: VEÍCULO ROUBADO</h3>
            <p className="text-white/90 text-sm mt-1">
              Esta placa está com alerta de roubo ativo.
            </p>
            {stolenVehicle.stolenInfo && (
              <div className="mt-3 space-y-1 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{stolenVehicle.stolenInfo.location}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(stolenVehicle.stolenInfo.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{stolenVehicle.stolenInfo.time}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão Ligar 190 - sempre visível */}
      <div className="bg-card border-2 border-red-500/50 rounded-lg p-4">
        {isMobile ? (
          <Button
            onClick={handleCall190}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Ligar 190
          </Button>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground mb-2">
              Use o celular para ligar para a polícia:
            </p>
            <div className="text-3xl font-bold text-red-600">190</div>
          </div>
        )}
      </div>

      {/* Ações baseadas no status do usuário */}
      {isLoggedIn && userIsVerified ? (
        // Usuário logado COM perfil verificado
        <div className="bg-card border border-border rounded-lg p-4">
          <AnimatePresence mode="wait">
            {!showSightingForm ? (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button
                  onClick={() => setShowSightingForm(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5"
                  size="lg"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Informar avistamento ao dono
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Seu Selo Azul permite notificar o dono diretamente
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground">Informar Avistamento</h4>
                  <button
                    onClick={() => setShowSightingForm(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    Local do avistamento *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Av. Paulista, 1000 - São Paulo"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Data
                    </label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Horário
                    </label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSubmitSighting}
                  disabled={!location.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Avistamento
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : isLoggedIn && !userIsVerified ? (
        // Usuário logado SEM perfil verificado
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield className="w-5 h-5 text-blue-500" />
            <p className="text-sm">
              Para avisar o dono pelo app, <span className="text-blue-500 font-medium">ative o Selo Verificado</span>.
            </p>
          </div>
        </div>
      ) : (
        // Usuário NÃO logado
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Você ainda pode enviar alertas normais para esta placa.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default StolenVehicleAlert;