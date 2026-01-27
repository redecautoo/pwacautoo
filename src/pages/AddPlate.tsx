import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Car, Info, Building2, Shield, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import SealRequiredNotice from "@/components/SealRequiredNotice";
import { VehicleOwnershipType, VehicleSubscriptionInfo, VehicleInsuranceInfo } from "@/lib/types";

const MAX_PLATES_PER_USER = 5;
const PLATE_PRICE = 5;

type AddPlateStep = 'list' | 'plate' | 'ownership' | 'subscription' | 'insurance' | 'details';

const AddPlate = () => {
  const navigate = useNavigate();
  const { vehicles, currentUser, addAdditionalPlate, cauCashBalance, showAlert } = useApp();

  const [step, setStep] = useState<AddPlateStep>('list');
  const [newPlate, setNewPlate] = useState("");
  const [newModel, setNewModel] = useState("");
  const [newColor, setNewColor] = useState("");

  const [ownershipType, setOwnershipType] = useState<VehicleOwnershipType | null>(null);

  const [subscriptionCompany, setSubscriptionCompany] = useState("");
  const [subscriptionCnpj, setSubscriptionCnpj] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");

  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceEndDate, setInsuranceEndDate] = useState("");

  const hasVerifiedSeal = !!currentUser?.isVerified;
  const currentPlateCount = vehicles.length;
  const isFirstPlate = currentPlateCount === 0;

  if (!hasVerifiedSeal && currentPlateCount >= 1) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Adicionar Placa</h1>
          </div>
        </header>
        <SealRequiredNotice featureReason="Placas adicionais exigem verificação para garantir que pertencem ao mesmo proprietário." />
      </div>
    );
  }

  const resetForm = () => {
    setStep('list');
    setNewPlate("");
    setNewModel("");
    setNewColor("");
    setOwnershipType(null);
    setSubscriptionCompany("");
    setSubscriptionCnpj("");
    setSubscriptionEndDate("");
    setHasInsurance(null);
    setInsuranceCompany("");
    setInsuranceEndDate("");
  };

  const handleAddPlate = () => {
    if (newPlate.length >= 7 && newModel && newColor) {
      if (currentPlateCount >= MAX_PLATES_PER_USER) {
        showAlert("Limite de placas atingido", `Você pode cadastrar no máximo ${MAX_PLATES_PER_USER} placas por CPF.`, "error");
        return;
      }

      if (!isFirstPlate) {
        const valor = PLATE_PRICE;
        if (cauCashBalance < valor) {
          showAlert("Saldo insuficiente na CauCash", `Adicione créditos para cadastrar uma placa adicional (R$ ${valor},00).`, "error");
          return;
        }
      }

      const subscriptionInfo: VehicleSubscriptionInfo | undefined =
        ownershipType === 'assinatura' && subscriptionCompany && subscriptionEndDate
          ? { companyName: subscriptionCompany, companyCnpj: subscriptionCnpj || undefined, contractEndDate: subscriptionEndDate }
          : undefined;

      const insuranceInfo: VehicleInsuranceInfo | undefined =
        ownershipType === 'proprio' && hasInsurance && insuranceCompany && insuranceEndDate
          ? { companyName: insuranceCompany, endDate: insuranceEndDate }
          : undefined;

      addAdditionalPlate({
        plate: newPlate,
        model: newModel,
        color: newColor,
        hasActivePlan: false,
        ownershipType: ownershipType || 'proprio',
        subscriptionInfo,
        insuranceInfo,
      }, !isFirstPlate);

      showAlert(
        isFirstPlate ? "Placa adicionada!" : "Placa adicional paga e cadastrada!",
        `${newPlate} foi adicionada ao seu perfil com sucesso.`,
        "success",
        newPlate
      );
      resetForm();
    }
  };

  const isPlateValid = newPlate.length >= 7;
  const remainingSlots = MAX_PLATES_PER_USER - currentPlateCount;

  const handleBack = () => {
    switch (step) {
      case 'plate': resetForm(); break;
      case 'ownership': setStep('plate'); break;
      case 'subscription': setStep('ownership'); break;
      case 'insurance': setStep('ownership'); break;
      case 'details':
        if (ownershipType === 'assinatura') setStep('subscription');
        else if (hasInsurance) setStep('insurance');
        else setStep('ownership');
        break;
      default: navigate("/dashboard");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={handleBack} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-semibold text-foreground">{step === 'list' ? 'Adicionar Placa' : 'Cadastrar Veículo'}</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <AnimatePresence mode="wait">
            {step === 'list' && (
              <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground mb-1">Regras de cadastro:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Máximo de {MAX_PLATES_PER_USER} placas por CPF</li>
                        <li>• 1ª placa é gratuita</li>
                        <li>• Placas adicionais: R$ {PLATE_PRICE},00 cada</li>
                        <li>• Selo Verificado necessário para placas adicionais</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <section>
                  <div className="bg-card border border-border rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">Placas cadastradas</span><span className="font-bold text-foreground">{currentPlateCount} / {MAX_PLATES_PER_USER}</span></div>
                    <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Slots disponíveis</span><span className="font-bold text-foreground">{remainingSlots}</span></div>
                  </div>
                </section>

                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3">Minhas Placas</h2>
                  <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                    {vehicles.map((vehicle, index) => (
                      <div key={vehicle.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-foreground">{vehicle.plate}</span>
                                <VerifiedBadge isVerified={true} size="sm" />
                                {vehicle.ownershipType === 'assinatura' && vehicle.subscriptionInfo && (
                                  <span className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Building2 className="w-3 h-3" />Por Assinatura</span>
                                )}
                                {vehicle.insuranceInfo && (
                                  <span className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-1"><Shield className="w-3 h-3" />Com Seguro</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{vehicle.model}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${index === 0 ? 'bg-green-500/10 text-green-600' : 'bg-blue-500/10 text-blue-600'}`}>
                            {index === 0 ? "Grátis" : `R$ ${PLATE_PRICE},00`}
                          </span>
                        </div>
                      </div>
                    ))}
                    {remainingSlots > 0 && (hasVerifiedSeal || isFirstPlate) && (
                      <button className="w-full p-4 flex items-center justify-center gap-2 text-primary hover:bg-secondary/50 transition-colors" onClick={() => setStep('plate')}>
                        <Plus className="w-4 h-4" /><span className="text-sm font-medium">{isFirstPlate ? "Adicionar primeira placa (Grátis)" : `Adicionar placa – R$ ${PLATE_PRICE},00`}</span>
                      </button>
                    )}
                  </div>
                </section>
              </motion.div>
            )}

            {step === 'plate' && (
              <motion.div key="plate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Informe a placa do veículo</h2>
                  <Input placeholder="Placa (ex: ABC1D23)" value={newPlate} onChange={(e) => setNewPlate(e.target.value.toUpperCase())} maxLength={7} className="text-center text-xl font-bold tracking-wider" />
                  <p className="text-xs text-muted-foreground text-center mt-2">Formato: ABC1D23 (Mercosul) ou ABC1234 (antigo)</p>
                </div>
                <Button className="w-full" onClick={() => setStep('ownership')} disabled={!isPlateValid}>Continuar<ChevronRight className="w-4 h-4 ml-2" /></Button>
              </motion.div>
            )}

            {step === 'ownership' && (
              <motion.div key="ownership" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="text-center mb-6"><span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{newPlate}</span></div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 text-center">O veículo é próprio ou de assinatura?</h2>
                  <p className="text-sm text-muted-foreground text-center mb-6">Selecione o tipo de propriedade do veículo</p>
                  <div className="space-y-3">
                    <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${ownershipType === 'proprio' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} onClick={() => setOwnershipType('proprio')}>
                      <Car className={`w-6 h-6 ${ownershipType === 'proprio' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-left"><p className="font-medium text-foreground">Veículo próprio</p><p className="text-xs text-muted-foreground">O veículo está no meu nome</p></div>
                    </button>
                    <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${ownershipType === 'assinatura' ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-500/50'}`} onClick={() => setOwnershipType('assinatura')}>
                      <Building2 className={`w-6 h-6 ${ownershipType === 'assinatura' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                      <div className="text-left"><p className="font-medium text-foreground">Veículo por assinatura</p><p className="text-xs text-muted-foreground">Uso temporário via empresa de assinatura</p></div>
                    </button>
                  </div>
                </div>
                <Button className="w-full" onClick={() => ownershipType === 'assinatura' ? setStep('subscription') : setStep('insurance')} disabled={!ownershipType}>Continuar<ChevronRight className="w-4 h-4 ml-2" /></Button>
              </motion.div>
            )}

            {/* Steps subscription, insurance, details follow the same pattern - skipping for brevity if possible, but I should be complete */}
            {step === 'subscription' && (
              <motion.div key="subscription" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-500" /></div><div><h2 className="text-lg font-semibold text-foreground">Dados da Assinatura</h2><p className="text-xs text-muted-foreground">Placa: {newPlate}</p></div></div>
                  <div className="space-y-4">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Nome da empresa *</label><Input placeholder="Ex: Flua!, Movida, Kinto, etc." value={subscriptionCompany} onChange={(e) => setSubscriptionCompany(e.target.value)} /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">CNPJ (opcional)</label><Input placeholder="00.000.000/0000-00" value={subscriptionCnpj} onChange={(e) => setSubscriptionCnpj(e.target.value)} /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Término do contrato *</label><div className="relative"><Input type="date" value={subscriptionEndDate} onChange={(e) => setSubscriptionEndDate(e.target.value)} className="pl-10" /><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div></div>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setStep('details')} disabled={!subscriptionCompany || !subscriptionEndDate}>Continuar<ChevronRight className="w-4 h-4 ml-2" /></Button>
              </motion.div>
            )}

            {step === 'insurance' && (
              <motion.div key="insurance" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6">
                  <div className="text-center mb-6"><span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{newPlate}</span></div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 text-center">O veículo possui seguro ativo?</h2>
                  <div className="space-y-3">
                    <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === true ? 'border-green-500 bg-green-500/10' : 'border-border hover:border-green-500/50'}`} onClick={() => setHasInsurance(true)}>
                      <Shield className={`w-6 h-6 ${hasInsurance === true ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <div className="text-left"><p className="font-medium text-foreground">Sim, possui seguro</p></div>
                    </button>
                    <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === false ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`} onClick={() => setHasInsurance(false)}>
                      <Car className={`w-6 h-6 ${hasInsurance === false ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-left"><p className="font-medium text-foreground">Não possui seguro</p></div>
                    </button>
                  </div>
                </div>
                {hasInsurance === true && (
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Seguradora *</label><Input placeholder="Ex: Porto Seguro, Porto, etc." value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} /></div>
                    <div><label className="text-sm font-medium text-foreground mb-2 block">Validade *</label><div className="relative"><Input type="date" value={insuranceEndDate} onChange={(e) => setInsuranceEndDate(e.target.value)} className="pl-10" /><Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /></div></div>
                  </div>
                )}
                <Button className="w-full" onClick={() => setStep('details')} disabled={hasInsurance === null || (hasInsurance === true && (!insuranceCompany || !insuranceEndDate))}>Continuar<ChevronRight className="w-4 h-4 ml-2" /></Button>
              </motion.div>
            )}

            {step === 'details' && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                  <div className="text-center mb-6"><span className="text-lg font-bold text-primary">{newPlate}</span></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">Modelo *</label><Input placeholder="Ex: Honda Civic, etc." value={newModel} onChange={(e) => setNewModel(e.target.value)} /></div>
                  <div><label className="text-sm font-medium text-foreground mb-2 block">Cor *</label><Input placeholder="Ex: Prata, etc." value={newColor} onChange={(e) => setNewColor(e.target.value)} /></div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={resetForm}>Cancelar</Button>
                  <Button className="flex-1" onClick={handleAddPlate} disabled={!newModel || !newColor}>{isFirstPlate ? "Adicionar Grátis" : `Adicionar – R$ ${PLATE_PRICE},00`}</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AddPlate;