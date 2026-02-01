import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, User, Phone, Mail, FileText, Car, Building2, Shield, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, slideUp, scaleIn } from "@/components/PageTransition";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import StolenVehicleAlert from "@/components/StolenVehicleAlert";
import cautooLogo from "@/assets/cautoo-logo.png";
import { VehicleOwnershipType, VehicleSubscriptionInfo, VehicleInsuranceInfo } from "@/lib/types";

const Login = () => {
  const navigate = useNavigate();
  const { loginWithPassword, register, stolenVehicles, isPlateRegistered, reportSighting, showAlert } = useApp();
  const [isRegister, setIsRegister] = useState(false);

  // Login state
  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [plateValue, setPlateValue] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Register step (for ownership/insurance flow)
  const [registerStep, setRegisterStep] = useState<'info' | 'ownership' | 'subscription' | 'insurance'>('info');

  // Vehicle ownership state
  const [ownershipType, setOwnershipType] = useState<VehicleOwnershipType | null>(null);
  const [subscriptionCompany, setSubscriptionCompany] = useState("");
  const [subscriptionCnpj, setSubscriptionCnpj] = useState("");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState("");
  const [hasInsurance, setHasInsurance] = useState<boolean | null>(null);
  const [insuranceCompany, setInsuranceCompany] = useState("");
  const [insuranceEndDate, setInsuranceEndDate] = useState("");

  // Verificar se a placa digitada está com alerta de roubo
  const stolenVehicle = useMemo(() => {
    if (plateValue.length < 7) return null;
    const normalizedPlate = plateValue.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return stolenVehicles.find(v => v.plate.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedPlate && v.isStolen) || null;
  }, [plateValue, stolenVehicles]);

  // Verificar se a placa já está cadastrada
  const isRegistered = useMemo(() => {
    if (plateValue.length < 7) return false;
    return isPlateRegistered(plateValue);
  }, [plateValue, isPlateRegistered]);

  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);

  const handleReportSighting = (location: string, date: string, time: string) => {
    if (stolenVehicle) {
      reportSighting(stolenVehicle.id, location, date, time);
      showAlert("Avistamento reportado!", "O dono do veículo foi notificado. Obrigado por colaborar!", "success");
    }
  };

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    return cleaned
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  const isTestCpf = (cpf: string) => {
    const cleanCpf = cpf.replace(/\D/g, '');
    return (
      cleanCpf === '00000000000' ||
      cleanCpf === '11111111111' ||
      cleanCpf === '22222222222' ||
      cleanCpf === '33333333333'
    );
  };

  const handleLogin = () => {
    if (cpf.length >= 14 && password.length === 6) {
      const success = loginWithPassword(cpf, password);
      if (success) {
        navigate("/dashboard");
      } else {
        showAlert("Erro de Login", "CPF ou senha incorretos. Verifique seus dados e tente novamente.", "error");
      }
    }
  };

  const handleRegister = () => {
    if (name && cpf.length >= 14 && phone.length >= 14 && registerPassword.length === 6 && registerPassword === confirmPassword && acceptTerms && plateIsValid && ownershipType) {
      const subscriptionInfo: VehicleSubscriptionInfo | undefined =
        ownershipType === 'assinatura' && subscriptionCompany && subscriptionEndDate
          ? { companyName: subscriptionCompany, companyCnpj: subscriptionCnpj || undefined, contractEndDate: subscriptionEndDate }
          : undefined;

      const insuranceInfo: VehicleInsuranceInfo | undefined =
        ownershipType === 'proprio' && hasInsurance && insuranceCompany && insuranceEndDate
          ? { companyName: insuranceCompany, endDate: insuranceEndDate }
          : undefined;

      register({
        name,
        cpf,
        phone,
        email: email || undefined,
        password: registerPassword,
        plate: plateValue,
        plateAlreadyRegistered: isRegistered,
        ownershipType,
        subscriptionInfo,
        insuranceInfo,
      });

      if (isRegistered) {
        showAlert("Cadastro realizado!", `A placa ${plateValue} foi adicionada mas está em análise de reivindicação.`, "warning", plateValue);
      } else {
        showAlert("Cadastro realizado com sucesso!", `Veículo ${plateValue} vinculado ao seu perfil.`, "success", plateValue);
      }
      navigate("/dashboard");
    }
  };

  const handleInfoContinue = () => {
    if (name && cpf.length >= 14 && phone.length >= 14 && registerPassword.length === 6 && registerPassword === confirmPassword && acceptTerms && plateIsValid) {
      setRegisterStep('ownership');
    } else if (registerPassword.length !== 6) {
      showAlert("Senha Inválida", "A senha deve ter exatamente 6 dígitos.", "error");
    } else if (registerPassword !== confirmPassword) {
      showAlert("Senhas Divergentes", "As senhas digitadas não conferem.", "error");
    }
  };

  const handleOwnershipContinue = () => {
    if (ownershipType === 'assinatura') {
      setRegisterStep('subscription');
    } else if (ownershipType === 'proprio') {
      setRegisterStep('insurance');
    }
  };

  const handleSubscriptionContinue = () => {
    if (subscriptionCompany && subscriptionEndDate) {
      handleRegister();
    }
  };

  const handleInsuranceContinue = () => {
    if (hasInsurance === false || (hasInsurance === true && insuranceCompany && insuranceEndDate)) {
      handleRegister();
    }
  };

  const handleRegisterBack = () => {
    switch (registerStep) {
      case 'ownership':
        setRegisterStep('info');
        break;
      case 'subscription':
        setRegisterStep('ownership');
        break;
      case 'insurance':
        setRegisterStep('ownership');
        break;
      default:
        setRegisterStep('info');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">
                {isRegister ? "Criar Conta" : "Entrar"}
              </h1>
            </div>
            <img src={cautooLogo} alt="Cautoo" className="h-6 w-auto" />
          </div>
        </header>

        <main className="px-4 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div className="flex bg-secondary rounded-lg p-1" variants={slideUp} initial="hidden" animate="visible">
              <button onClick={() => setIsRegister(false)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${!isRegister ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Entrar</button>
              <button onClick={() => setIsRegister(true)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${isRegister ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>Cadastrar</button>
            </motion.div>

            <motion.div className="bg-card border border-border rounded-2xl p-6 space-y-4" variants={scaleIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <AnimatePresence mode="wait">
                {isRegister ? (
                  <motion.div key="register" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    <AnimatePresence mode="wait">
                      {registerStep === 'info' && (
                        <motion.div key="info-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                          <div className="mb-2">
                            <LicensePlateInput value={plateValue} onChange={setPlateValue} isStolen={!!stolenVehicle} />
                          </div>

                          {stolenVehicle && <StolenVehicleAlert stolenVehicle={stolenVehicle} onReportSighting={handleReportSighting} />}

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">Nome completo *</label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="pl-10" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">CPF *</label>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="000.000.000-00" className="pl-10" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">Telefone/WhatsApp *</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className="pl-10" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">Email (opcional)</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-10" />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">Crie uma senha (6 dígitos) *</label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="password"
                                value={registerPassword}
                                onChange={(e) => setRegisterPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="******"
                                className="pl-10 text-center text-xl tracking-[0.3em]"
                                maxLength={6}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Apenas números, 6 dígitos</p>
                          </div>

                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">Confirme a senha *</label>
                            <div className="relative">
                              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                placeholder="******"
                                className="pl-10 text-center text-xl tracking-[0.3em]"
                                maxLength={6}
                              />
                            </div>
                            {confirmPassword.length === 6 && registerPassword !== confirmPassword && <p className="text-xs text-destructive mt-1">As senhas não conferem</p>}
                            {confirmPassword.length === 6 && registerPassword === confirmPassword && <p className="text-xs text-green-500 mt-1">Senhas conferem</p>}
                          </div>

                          <div className="flex items-start gap-3 pt-2">
                            <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
                            <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">Li e aceito os <span className="text-primary">Termos de Uso</span> e a <span className="text-primary">Política de Privacidade</span></label>
                          </div>

                          <Button onClick={handleInfoContinue} disabled={!name || cpf.length < 14 || phone.length < 14 || registerPassword.length !== 6 || registerPassword !== confirmPassword || !acceptTerms || !plateIsValid} className="w-full h-12 mt-4 font-bold">Continuar <ChevronRight className="w-4 h-4 ml-2" /></Button>
                        </motion.div>
                      )}

                      {registerStep === 'ownership' && (
                        <motion.div key="ownership-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <div className="text-center mb-4"><span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{plateValue}</span></div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 text-center">O veículo é próprio ou de assinatura?</h3>
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
                          <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={handleRegisterBack} className="flex-1">Voltar</Button>
                            <Button onClick={handleOwnershipContinue} disabled={!ownershipType} className="flex-1">Continuar <ChevronRight className="w-4 h-4 ml-2" /></Button>
                          </div>
                        </motion.div>
                      )}

                      {registerStep === 'subscription' && (
                        <motion.div key="subscription-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><Building2 className="w-5 h-5 text-blue-500" /></div><div><h3 className="font-semibold text-foreground">Dados da Assinatura</h3><p className="text-xs text-muted-foreground">Placa: {plateValue}</p></div></div>
                          <div className="space-y-4">
                            <Input placeholder="Nome da empresa *" value={subscriptionCompany} onChange={(e) => setSubscriptionCompany(e.target.value)} />
                            <Input placeholder="CNPJ da empresa (opcional)" value={subscriptionCnpj} onChange={(e) => setSubscriptionCnpj(e.target.value)} />
                            <div className="relative">
                              <Input type="date" value={subscriptionEndDate} onChange={(e) => setSubscriptionEndDate(e.target.value)} className="pl-10" />
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={handleRegisterBack} className="flex-1">Voltar</Button>
                            <Button onClick={handleSubscriptionContinue} disabled={!subscriptionCompany || !subscriptionEndDate} className="flex-1">Criar Conta</Button>
                          </div>
                        </motion.div>
                      )}

                      {registerStep === 'insurance' && (
                        <motion.div key="insurance-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                          <div className="text-center mb-4"><span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">{plateValue}</span></div>
                          <h3 className="text-lg font-semibold text-foreground mb-2 text-center">O veículo possui seguro ativo?</h3>
                          <div className="grid grid-cols-1 gap-3">
                            <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === true ? 'border-green-500 bg-green-500/10' : 'border-border'}`} onClick={() => setHasInsurance(true)}><Shield className="w-6 h-6 text-green-500" /><span>Sim, possui seguro</span></button>
                            <button className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${hasInsurance === false ? 'border-primary bg-primary/10' : 'border-border'}`} onClick={() => setHasInsurance(false)}><Shield className="w-6 h-6 text-primary opacity-50" /><span>Não possui seguro</span></button>
                          </div>
                          <AnimatePresence>
                            {hasInsurance === true && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 space-y-4">
                                <Input placeholder="Nome da seguradora *" value={insuranceCompany} onChange={(e) => setInsuranceCompany(e.target.value)} />
                                <div className="relative">
                                  <Input type="date" value={insuranceEndDate} onChange={(e) => setInsuranceEndDate(e.target.value)} className="pl-10" />
                                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex gap-3 mt-4">
                            <Button variant="outline" onClick={handleRegisterBack} className="flex-1">Voltar</Button>
                            <Button onClick={handleInsuranceContinue} disabled={hasInsurance === null || (hasInsurance === true && (!insuranceCompany || !insuranceEndDate))} className="flex-1">Criar Conta</Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="space-y-4">
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder="CPF: 000.000.000-00" className="pl-10" />
                    </div>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Senha (6 dígitos)" className="pl-10 text-center text-xl tracking-[0.3em]" maxLength={6} />
                    </div>
                    {isTestCpf(cpf) && <p className="text-xs text-primary text-center">CPF de teste. Senha: 123456</p>}
                    <Button onClick={handleLogin} disabled={cpf.length < 14 || password.length !== 6} className="w-full h-12 mt-4 font-bold">Entrar</Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Login;

