import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, MapPin, Calendar, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";

const Sighting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { stolenVehicles, reportSighting, currentUser, showAlert } = useApp();

  const plateFromUrl = searchParams.get("plate") || "";

  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const stolenVehicle = stolenVehicles.find(v => v.plate === plateFromUrl);
  const userIsVerified = currentUser?.isVerified || false;

  const isValid = stolenVehicle && location && date && time;

  const handleReportSighting = () => {
    if (isValid && stolenVehicle) {
      reportSighting(stolenVehicle.id, location, date, time);
      showAlert(
        "Avistamento Reportado!",
        "O dono do veículo foi notificado sobre o avistamento.",
        "success",
        stolenVehicle.plate
      );
      navigate("/stolen");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Avistamento de Veículo Roubado</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-card border border-border rounded-2xl p-6 space-y-6">

            {!plateFromUrl && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Acesse esta página pela lista de veículos roubados.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/stolen")}>
                  Ver Veículos Roubados
                </Button>
              </div>
            )}

            {plateFromUrl && !stolenVehicle && (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">
                  Placa <span className="font-bold">{plateFromUrl}</span> não está marcada como roubada no sistema.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/stolen")}>
                  Ver Veículos Roubados
                </Button>
              </div>
            )}

            {stolenVehicle && (
              <>
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                      VEÍCULO ROUBADO
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium">
                    {stolenVehicle.model} • {stolenVehicle.color}
                  </p>
                </div>

                {!userIsVerified ? (
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Você precisa ter Perfil Verificado para reportar avistamentos privados ao dono.
                    </p>
                    <a href="tel:190">
                      <Button variant="outline" className="w-full">
                        <Phone className="w-4 h-4 mr-2" />
                        Ligar para 190
                      </Button>
                    </a>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Local do avistamento
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="Ex: Rua Augusta, 500 - São Paulo"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Data
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Horário
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleReportSighting}
                      disabled={!isValid}
                      className="w-full py-6"
                      size="lg"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Reportar Avistamento
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Sighting;
