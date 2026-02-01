import React, { useState, useMemo } from "react";
import { User, Phone, Car, Palette, Save, AlertTriangle, FileWarning, Building2, Shield, ChevronRight, ArrowLeft, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { isValidPlate } from "@/components/LicensePlateInput";
import { motion, AnimatePresence } from "framer-motion";
import { VehicleOwnershipType, VehicleSubscriptionInfo, VehicleInsuranceInfo } from "@/lib/types";

interface VehicleRegistrationFormProps {
  plateValue: string;
  onRegister: (data: VehicleFormData) => void;
}

export interface VehicleFormData {
  ownerName: string;
  phone: string;
  vehicleModel: string;
  vehicleColor: string;
  isClaim?: boolean;
  claimObservation?: string;
  ownershipType?: VehicleOwnershipType;
  subscriptionInfo?: VehicleSubscriptionInfo;
  insuranceInfo?: VehicleInsuranceInfo;
}

type RegistrationStep = 'ownership' | 'subscription' | 'insurance' | 'details';

const VehicleRegistrationForm = ({ plateValue, onRegister }: VehicleRegistrationFormProps) => {
  const { isPlateRegistered } = useApp();
  const [step, setStep] = useState<RegistrationStep>('ownership');
  const [ownershipType, setOwnershipType] = useState<VehicleOwnershipType | null>(null);
  const [subscriptionCompany, setSubscriptionCompany] = useState("");
  const [subscriptionCnpj, setSubscriptionCnpj] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceEndDate, setInsuranceEndDate] = useState("");
  
  const [formData, setFormData] = useState<VehicleFormData>({
    ownerName: "",
    phone: "",
    vehicleModel: "",
    vehicleColor: "",
  });
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimObservation, setClaimObservation] = useState("");

  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);
  const plateAlreadyRegistered = plateIsValid && isPlateRegistered(plateValue);

  const handleChange = (field: keyof VehicleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    handleChange("phone", formatted);
  };

  const handleOwnershipContinue = () => {
    if (ownershipType === 'assinatura') {
      setStep('subscription');
    } else if (ownershipType === 'proprio') {
      setStep('insurance');
    }
  };

  const handleSubscriptionContinue = () => {
    if (subscriptionCompany && subscriptionEndDate) {
      setStep('details');
    }
  };

  const handleInsuranceContinue = () => {
    if (hasInsurance === false || (hasInsurance === true && insuranceCompany && insuranceEndDate)) {
      setStep('details');
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'subscription':
      case 'insurance':
        setStep('ownership');
        break;
      case 'details':
        if (ownershipType === 'assinatura') {
          setStep('subscription');
        } else {
          setStep('insurance');
        }
        break;
      default:
        setStep('ownership');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      const subscriptionInfo: VehicleSubscriptionInfo | undefined = 
        ownershipType === 'assinatura' && subscriptionCompany && subscriptionEndDate
          ? { companyName: subscriptionCompany, companyCnpj: subscriptionCnpj || undefined, contractEndDate: subscriptionEndDate }
          : undefined;
      
      const insuranceInfo: VehicleInsuranceInfo | undefined =
        ownershipType === 'proprio' && hasInsurance && insuranceCompany && insuranceEndDate
          ? { companyName: insuranceCompany, endDate: insuranceEndDate }
          : undefined;
      
      onRegister({
        ...formData,
        isClaim: isClaiming,
        claimObservation: isClaiming ? claimObservation : undefined,
        ownershipType: ownershipType || undefined,
        subscriptionInfo,
        insuranceInfo,
      });
    }
  };

  const baseValid =
    plateIsValid &&
    formData.ownerName.trim() &&
    formData.phone.replace(/\D/g, "").length >= 10 &&
    formData.vehicleModel.trim() &&
    formData.vehicleColor.trim();

  const isValid = plateAlreadyRegistered 
    ? (isClaiming && claimObservation.trim().length >= 20 && baseValid)
    : baseValid;

  return (
    <div className="w-full">
      <div className="border-t border-border pt-4">
        <div className="text-center mb-4">
          <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{plateValue}</span>
          <h3 className="text-base font-semibold text-foreground mt-2">Cadastrar meu veículo</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Preencha os dados para receber alertas sobre seu veículo
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'ownership' && (
            <motion.div
              key="ownership-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="text-sm font-medium text-foreground mb-2 text-center">O veículo é próprio ou de assinatura?</h4>
              
              <div className="space-y-3">
                <button
                  type="button"
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${ownershipType === 'proprio' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                  onClick={() => setOwnershipType('proprio')}
                >
                  <Car className={`w-6 h-6 ${ownershipType === 'proprio' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Veículo próprio</p>
                    <p className="text-xs text-muted-foreground">O veículo está no meu nome</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${ownershipType === 'assinatura' ? 'border-blue-500 bg-blue-500/10' : 'border-border hover:border-blue-500/50'}`}
                  onClick={() => setOwnershipType('assinatura')}
                >
                  <Building2 className={`w-6 h-6 ${ownershipType === 'assinatura' ? 'text-blue-500' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Veículo por assinatura</p>
                    <p className="text-xs text-muted-foreground">Uso temporário via empresa de assinatura</p>
                  </div>
                </button>
              </div>
              
              <Button 
                onClick={handleOwnershipContinue} 
                disabled={!ownershipType} 
                className="w-full py-6 mt-4" 
                size="lg"
              >
                Continuar <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 'subscription' && (
            <motion.div
              key="subscription-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="text-sm font-medium text-foreground mb-4 text-center">Dados da assinatura</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Nome da empresa *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      value={subscriptionCompany} 
                      onChange={(e) => setSubscriptionCompany(e.target.value)} 
                      placeholder="Ex: Localiza, Unidas, Movida" 
                      className="pl-10" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">CNPJ da empresa (opcional)</label>
                  <Input 
                    value={subscriptionCnpj} 
                    onChange={(e) => setSubscriptionCnpj(formatCNPJ(e.target.value))} 
                    placeholder="00.000.000/0000-00" 
                    maxLength={18}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Término do contrato *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      type="date" 
                      value={subscriptionEndDate} 
                      onChange={(e) => setSubscriptionEndDate(e.target.value)} 
                      className="pl-10" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button 
                  onClick={handleSubscriptionContinue} 
                  disabled={!subscriptionCompany || !subscriptionEndDate} 
                  className="flex-1"
                >
                  Continuar <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'insurance' && (
            <motion.div
              key="insurance-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h4 className="text-sm font-medium text-foreground mb-4 text-center">O veículo possui seguro?</h4>
              
              <div className="space-y-3 mb-4">
                <button
                  type="button"
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === true ? 'border-green-500 bg-green-500/10' : 'border-border hover:border-green-500/50'}`}
                  onClick={() => setHasInsurance(true)}
                >
                  <Shield className={`w-6 h-6 ${hasInsurance === true ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Sim, possui seguro</p>
                    <p className="text-xs text-muted-foreground">Veículo segurado por uma seguradora</p>
                  </div>
                </button>
                
                <button
                  type="button"
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === false ? 'border-muted-foreground bg-muted/30' : 'border-border hover:border-muted-foreground/50'}`}
                  onClick={() => setHasInsurance(false)}
                >
                  <Car className={`w-6 h-6 ${hasInsurance === false ? 'text-muted-foreground' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className="font-medium text-foreground">Não possui seguro</p>
                    <p className="text-xs text-muted-foreground">Veículo sem cobertura de seguro</p>
                  </div>
                </button>
              </div>
              
              {hasInsurance === true && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mb-4"
                >
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Nome da seguradora *</label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        value={insuranceCompany} 
                        onChange={(e) => setInsuranceCompany(e.target.value)} 
                        placeholder="Ex: Porto Seguro, Bradesco Seguros" 
                        className="pl-10" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-muted-foreground mb-2">Validade do seguro *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        type="date" 
                        value={insuranceEndDate} 
                        onChange={(e) => setInsuranceEndDate(e.target.value)} 
                        className="pl-10" 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                </Button>
                <Button 
                  onClick={handleInsuranceContinue} 
                  disabled={hasInsurance === null || (hasInsurance === true && (!insuranceCompany || !insuranceEndDate))} 
                  className="flex-1"
                >
                  Continuar <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div
              key="details-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {plateAlreadyRegistered && !isClaiming && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-amber-500">Placa já cadastrada</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Esta placa já está vinculada a outro usuário. Se você é o verdadeiro proprietário, 
                        pode reivindicar a propriedade desta placa.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                        onClick={() => setIsClaiming(true)}
                      >
                        <FileWarning className="w-4 h-4 mr-2" />
                        Reivindicar esta placa
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {plateAlreadyRegistered && isClaiming && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FileWarning className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-primary">Reivindicação de placa</h4>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Preencha seus dados e descreva por que você é o verdadeiro proprietário.
                      </p>
                      <Textarea
                        placeholder="Descreva a situação (mín. 20 caracteres)"
                        value={claimObservation}
                        onChange={(e) => setClaimObservation(e.target.value)}
                        className="bg-input border-border text-sm min-h-[80px]"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {claimObservation.length}/20 caracteres mínimos
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setIsClaiming(false);
                          setClaimObservation("");
                        }}
                      >
                        Cancelar reivindicação
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Nome do proprietário
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.ownerName}
                      onChange={(e) => handleChange("ownerName", e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="(00) 00000-0000"
                      value={formData.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="pl-10 bg-input border-border"
                      maxLength={16}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Modelo do veículo
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ex: Honda Civic 2020"
                      value={formData.vehicleModel}
                      onChange={(e) => handleChange("vehicleModel", e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-1.5">
                    Cor do veículo
                  </label>
                  <div className="relative">
                    <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Ex: Prata"
                      value={formData.vehicleColor}
                      onChange={(e) => handleChange("vehicleColor", e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isClaiming ? "Enviar" : "Cadastrar"}
                  </Button>
                </div>

                {isClaiming && (
                  <p className="text-xs text-center text-muted-foreground">
                    Sua solicitação será analisada em até 48 horas.
                  </p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VehicleRegistrationForm;

