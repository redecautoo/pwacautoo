import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  X,
  Car,
  MapPin,
  Calendar,
  Clock,
  FileText,
  ChevronRight,
  Check,
  AlertCircle,
  UserCheck,
  Link,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import SuccessModal from "@/components/SuccessModal";
import { CautelarOccurrenceType, getOccurrenceTypeName } from "@/lib/types";

const occurrenceTypes: CautelarOccurrenceType[] = [
  'colisao_leve',
  'dano_estacionamento',
  'engavetamento',
  'colisao_traseira',
  'abalroamento',
  'outro'
];

const NewCautelarRegistry = () => {
  const navigate = useNavigate();
  const { createCautelarRegistry, vehicles, isPlateRegistered, currentUser } = useApp();
  
  const [step, setStep] = useState(1);
  const [plates, setPlates] = useState<string[]>([""]);
  const [occurrenceType, setOccurrenceType] = useState<CautelarOccurrenceType | "">("");
  const [occurrenceDate, setOccurrenceDate] = useState("");
  const [occurrenceTime, setOccurrenceTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [showPlateError, setShowPlateError] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdRegistryId, setCreatedRegistryId] = useState("");

  const userPlate = vehicles.length > 0 ? vehicles[0].plate : "";
  const hasGreenSeal = currentUser?.seal === 'green';
  const hasBlueOrHigherSeal = currentUser?.seal === 'blue' || currentUser?.seal === 'yellow' || currentUser?.seal === 'green';

  useEffect(() => {
    if (!hasBlueOrHigherSeal) {
      navigate("/cautelar-registry");
    }
  }, [hasBlueOrHigherSeal, navigate]);

  if (!hasBlueOrHigherSeal) {
    return null;
  }

  const addPlate = () => {
    setPlates([...plates, ""]);
    setShowPlateError(false);
  };

  const removePlate = (index: number) => {
    setPlates(plates.filter((_, i) => i !== index));
    setShowPlateError(false);
  };

  const updatePlate = (index: number, value: string) => {
    const newPlates = [...plates];
    newPlates[index] = value;
    setPlates(newPlates);
    setShowPlateError(false);
  };

  const validOtherPlates = plates.filter(p => isValidPlate(p) && p.toUpperCase() !== userPlate.toUpperCase());
  const allPlatesForRegistry = userPlate ? [userPlate, ...validOtherPlates] : validOtherPlates;
  const canProceedStep1 = validOtherPlates.length >= 1;
  const canProceedStep2 = occurrenceType && occurrenceDate && occurrenceTime && location;
  const canSubmit = canProceedStep1 && canProceedStep2 && description.length >= 10 && description.length <= 120;

  const handleStep1Continue = () => {
    if (!canProceedStep1) {
      setShowPlateError(true);
      return;
    }
    setStep(2);
  };

  const handleSubmit = () => {
    if (!canSubmit || !occurrenceType) return;
    
    const registry = createCautelarRegistry({
      plates: allPlatesForRegistry,
      occurrenceType,
      occurrenceDate,
      occurrenceTime,
      location,
      description,
    });
    
    setCreatedRegistryId(registry.id);
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate(`/cautelar-registry/${createdRegistryId}`);
  };

  const getPlateStatus = (plate: string) => {
    if (!isValidPlate(plate)) return null;
    const isRegistered = isPlateRegistered(plate);
    return isRegistered;
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate("/cautelar-registry")} 
              className="text-muted-foreground hover:text-foreground" 
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Nova Ocorrência</h1>
              <p className="text-xs text-muted-foreground">
                Etapa {step} de 3 — {step === 1 ? 'Veículos Envolvidos' : step === 2 ? 'Dados da Ocorrência' : 'Confirmação'}
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex gap-1 mb-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-primary' : 'bg-secondary'
                }`}
              />
            ))}
          </div>
        </div>
        
        <main className="px-4 pb-6">
          <div className="max-w-lg mx-auto space-y-6">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      Veículos Envolvidos
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Adicione as placas dos veículos que participaram da ocorrência. Caso mais de um veículo tenha se envolvido, inclua todos.
                    </p>
                  </div>

                  {hasGreenSeal && (
                    <motion.div
                      className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-green-600 dark:text-green-400">Motorista com Selo Verde</span> pode solicitar intermediação da Cautoo e parcelar custos do prejuízo diretamente com estabelecimentos parceiros.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {userPlate && (
                    <div className="bg-card border border-border rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">Sua placa (incluída automaticamente)</p>
                          <p className="font-mono font-medium text-foreground">{userPlate}</p>
                        </div>
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Adicione as placas dos veículos envolvidos nesta ocorrência. Sua placa será incluída automaticamente.
                    </p>
                    
                    <div className="space-y-3">
                      {plates.map((plate, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex gap-2 items-start"
                        >
                          <div className="flex-1">
                            <LicensePlateInput
                              value={plate}
                              onChange={(v) => updatePlate(index, v)}
                              data-testid={`input-plate-${index}`}
                            />
                            {isValidPlate(plate) && plate.toUpperCase() !== userPlate.toUpperCase() && (
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                {getPlateStatus(plate) ? (
                                  <>
                                    <UserCheck className="w-3 h-3 text-green-500" />
                                    <span className="text-green-500">Usuário Cautoo</span>
                                  </>
                                ) : (
                                  <>
                                    <Link className="w-3 h-3 text-yellow-500" />
                                    <span className="text-yellow-500">Será convidado</span>
                                  </>
                                )}
                              </div>
                            )}
                            {isValidPlate(plate) && plate.toUpperCase() === userPlate.toUpperCase() && (
                              <p className="mt-1 text-xs text-orange-500">Esta é sua placa (já incluída)</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlate(index)}
                            className="text-destructive"
                            data-testid={`button-remove-plate-${index}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={addPlate}
                    className="w-full"
                    data-testid="button-add-plate"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar outra placa
                  </Button>

                  {showPlateError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-destructive" />
                        <p className="text-sm text-destructive">
                          É necessário adicionar pelo menos uma placa de outro veículo envolvido.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    onClick={handleStep1Continue}
                    className="w-full h-12 font-bold"
                    data-testid="button-next-step1"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Dados da ocorrência
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informe os detalhes da ocorrência para o registro oficial.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        Tipo de ocorrência
                      </label>
                      <Select value={occurrenceType} onValueChange={(v) => setOccurrenceType(v as CautelarOccurrenceType)}>
                        <SelectTrigger data-testid="select-occurrence-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {occurrenceTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {getOccurrenceTypeName(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Data
                        </label>
                        <Input
                          type="date"
                          value={occurrenceDate}
                          onChange={(e) => setOccurrenceDate(e.target.value)}
                          data-testid="input-date"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Hora
                        </label>
                        <Input
                          type="time"
                          value={occurrenceTime}
                          onChange={(e) => setOccurrenceTime(e.target.value)}
                          data-testid="input-time"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Local aproximado
                      </label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ex: Av. Paulista, próximo ao MASP"
                        data-testid="input-location"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                    className="w-full h-12 font-bold"
                    data-testid="button-next-step2"
                  >
                    Continuar
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" />
                      Confirmação do registro
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Revise os dados e adicione uma breve descrição.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{occurrenceType ? getOccurrenceTypeName(occurrenceType) : '-'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Data/Hora:</span>
                      <span className="font-medium">{occurrenceDate} às {occurrenceTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Local:</span>
                      <span className="font-medium text-right max-w-[60%] truncate">{location}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <span className="text-sm text-muted-foreground">Veículos ({allPlatesForRegistry.length}):</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {allPlatesForRegistry.map((plate, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded font-mono ${plate === userPlate ? 'bg-primary/20 text-primary' : 'bg-secondary'}`}>
                            {plate}{plate === userPlate && ' (você)'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">
                      Descrição breve (10-120 caracteres)
                    </label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 120))}
                      placeholder="Descreva brevemente o que aconteceu..."
                      rows={3}
                      data-testid="input-description"
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {description.length}/120
                    </p>
                  </div>

                  {validOtherPlates.some(p => !isPlateRegistered(p)) && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Convites pendentes</p>
                          <p className="text-xs text-muted-foreground">
                            Alguns veículos não estão cadastrados e receberão um link de convite para confirmar participação.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 font-bold"
                    data-testid="button-submit"
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Registrar Ocorrência
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <SuccessModal
          isOpen={showSuccess}
          onClose={handleSuccessClose}
          title="Registro Criado!"
          description="Os envolvidos serão notificados para confirmar participação."
          variant="success"
        />
      </div>
    </PageTransition>
  );
};

export default NewCautelarRegistry;

