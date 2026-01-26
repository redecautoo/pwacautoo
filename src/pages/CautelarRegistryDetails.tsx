import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  MapPin,
  Calendar,
  Car,
  UserCheck,
  Link,
  Copy,
  Download,
  Shield,
  Handshake,
  XCircle,
  DollarSign,
  Building,
  CreditCard,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";
import SuccessModal from "@/components/SuccessModal";
import CautelarCertificateView from "@/components/CautelarCertificateView";
import { 
  getCautelarStatusName, 
  getCautelarStatusColor, 
  getOccurrenceTypeName,
  canUseCautelarMediation,
  getMaxInstallments,
  CautelarDamage
} from "@/lib/types";

const CautelarRegistryDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    cautelarRegistries, 
    currentUser, 
    confirmCautelarParticipation, 
    resolveCautelarRegistry,
    addCautelarDamage,
    payMediationInstallment
  } = useApp();
  
  const registry = cautelarRegistries.find(r => r.id === id);
  
  const [showResolveOptions, setShowResolveOptions] = useState(false);
  const [showDamageForm, setShowDamageForm] = useState(false);
  const [damageValue, setDamageValue] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [establishmentCnpj, setEstablishmentCnpj] = useState("");
  const [installments, setInstallments] = useState("2");
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: "", description: "" });

  if (!registry) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Registro não encontrado</p>
            <Button className="mt-4" onClick={() => navigate("/cautelar-registry")}>
              Voltar
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const myParticipation = registry.participants.find(p => p.userId === currentUser?.id);
  const canConfirm = myParticipation && !myParticipation.confirmed;
  const isCreator = registry.creatorId === currentUser?.id;
  const canResolve = registry.status === 'em_andamento' && isCreator;
  const canMediate = canUseCautelarMediation(currentUser);
  const maxInstallments = getMaxInstallments(currentUser);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 14);
    return cleaned
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  };

  const handleConfirm = () => {
    if (myParticipation) {
      confirmCautelarParticipation(registry.id, myParticipation.id);
      setSuccessMessage({
        title: "Participação Confirmada!",
        description: "Sua participação foi registrada oficialmente."
      });
      setShowSuccess(true);
    }
  };

  const handleResolve = (type: 'acordo' | 'sem_resolucao' | 'mediacao') => {
    if (type === 'mediacao') {
      setShowDamageForm(true);
      setShowResolveOptions(false);
    } else {
      resolveCautelarRegistry(registry.id, type);
      setSuccessMessage({
        title: type === 'acordo' ? "Ocorrência Resolvida!" : "Status Atualizado",
        description: type === 'acordo' 
          ? "Certidão de Resolução foi gerada automaticamente."
          : "A ocorrência foi registrada como não resolvida."
      });
      setShowSuccess(true);
      setShowResolveOptions(false);
    }
  };

  const handleSubmitDamage = () => {
    const value = parseFloat(damageValue.replace(/\D/g, '')) / 100;
    if (value <= 0 || !establishmentName || establishmentCnpj.length < 18) return;

    const damage: CautelarDamage = {
      value,
      establishmentName,
      establishmentCnpj,
      installments: parseInt(installments),
      paidInstallments: 0
    };

    addCautelarDamage(registry.id, damage);
    setSuccessMessage({
      title: "Mediação Iniciada!",
      description: "O pagamento parcelado foi configurado."
    });
    setShowSuccess(true);
    setShowDamageForm(false);
  };

  const handlePayInstallment = () => {
    const success = payMediationInstallment(registry.id);
    if (success) {
      setSuccessMessage({
        title: "Parcela Paga!",
        description: "O pagamento foi processado via CauCash."
      });
      setShowSuccess(true);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/cautelar-registry")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">Detalhes do Registro</h1>
              <p className="text-xs font-mono text-muted-foreground">{registry.registryNumber}</p>
            </div>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-medium text-foreground">{getOccurrenceTypeName(registry.occurrenceType)}</h2>
                  <p className="text-sm text-muted-foreground">Criado por {registry.creatorName}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1 ${getCautelarStatusColor(registry.status)}`}>
                  {getCautelarStatusName(registry.status)}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{registry.occurrenceDate} às {registry.occurrenceTime}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{registry.location}</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4 mt-0.5" />
                  <span>{registry.description}</span>
                </div>
              </div>
            </motion.div>

            <section>
              <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                <Car className="w-4 h-4" />
                Veículos Envolvidos
              </h3>
              <div className="space-y-2">
                {registry.participants.map((participant) => (
                  <div key={participant.id} className="bg-card border border-border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-foreground">{participant.plate}</span>
                        {participant.isRegistered ? (
                          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Cautoo
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded flex items-center gap-1">
                            <Link className="w-3 h-3" />
                            Convidado
                          </span>
                        )}
                      </div>
                      {participant.confirmed ? (
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Confirmado
                        </span>
                      ) : (
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente
                        </span>
                      )}
                    </div>
                    {!participant.isRegistered && participant.inviteLink && (
                      <div className="mt-2 flex items-center gap-2">
                        <Input 
                          value={participant.inviteLink} 
                          readOnly 
                          className="text-xs font-mono"
                        />
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => copyToClipboard(participant.inviteLink!)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {canConfirm && (
              <Button
                onClick={handleConfirm}
                className="w-full py-6 bg-green-600 hover:bg-green-700"
                size="lg"
                data-testid="button-confirm-participation"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirmar Minha Participação
              </Button>
            )}

            {canResolve && !showResolveOptions && !showDamageForm && (
              <Button
                onClick={() => setShowResolveOptions(true)}
                className="w-full py-6"
                size="lg"
                data-testid="button-resolve"
              >
                <Shield className="w-5 h-5 mr-2" />
                Finalizar Ocorrência
              </Button>
            )}

            {showResolveOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h3 className="text-sm font-medium text-foreground">Como deseja finalizar?</h3>
                
                <Button
                  onClick={() => handleResolve('acordo')}
                  variant="outline"
                  className="w-full py-6 border-green-500/30 hover:bg-green-500/10"
                  size="lg"
                  data-testid="button-resolve-acordo"
                >
                  <Handshake className="w-5 h-5 mr-2 text-green-500" />
                  <div className="text-left">
                    <p className="font-medium">Resolvido em Acordo</p>
                    <p className="text-xs text-muted-foreground">Ambas as partes entraram em acordo</p>
                  </div>
                </Button>

                <Button
                  onClick={() => handleResolve('sem_resolucao')}
                  variant="outline"
                  className="w-full py-6 border-red-500/30 hover:bg-red-500/10"
                  size="lg"
                  data-testid="button-resolve-sem"
                >
                  <XCircle className="w-5 h-5 mr-2 text-red-500" />
                  <div className="text-left">
                    <p className="font-medium">Sem Resolução</p>
                    <p className="text-xs text-muted-foreground">Não houve acordo entre as partes</p>
                  </div>
                </Button>

                {canMediate ? (
                  <Button
                    onClick={() => handleResolve('mediacao')}
                    variant="outline"
                    className="w-full py-6 border-emerald-500/30 hover:bg-emerald-500/10"
                    size="lg"
                    data-testid="button-resolve-mediacao"
                  >
                    <DollarSign className="w-5 h-5 mr-2 text-emerald-500" />
                    <div className="text-left">
                      <p className="font-medium">Mediação Cautelar</p>
                      <p className="text-xs text-muted-foreground">Pagamento parcelado via Cautoo</p>
                    </div>
                  </Button>
                ) : (
                  <div className="bg-muted/50 border border-border rounded-xl p-4 text-center">
                    <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Mediação Cautelar disponível apenas para usuários com Selo Verde
                    </p>
                  </div>
                )}

                <Button
                  variant="ghost"
                  onClick={() => setShowResolveOptions(false)}
                  className="w-full"
                >
                  Cancelar
                </Button>
              </motion.div>
            )}

            {showDamageForm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-emerald-500/30 rounded-xl p-4 space-y-4"
              >
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Configurar Mediação
                </h3>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Valor do prejuízo</label>
                  <Input
                    value={damageValue}
                    onChange={(e) => {
                      const num = e.target.value.replace(/\D/g, '');
                      const formatted = (parseInt(num || '0') / 100).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      });
                      setDamageValue(formatted);
                    }}
                    placeholder="R$ 0,00"
                    data-testid="input-damage-value"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <Building className="w-4 h-4 inline mr-1" />
                    Nome do estabelecimento
                  </label>
                  <Input
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    placeholder="Ex: Auto Mecânica Silva"
                    data-testid="input-establishment"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">CNPJ</label>
                  <Input
                    value={establishmentCnpj}
                    onChange={(e) => setEstablishmentCnpj(formatCnpj(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    data-testid="input-cnpj"
                  />
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">
                    <CreditCard className="w-4 h-4 inline mr-1" />
                    Parcelamento
                  </label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger data-testid="select-installments">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2x</SelectItem>
                      <SelectItem value="3">3x</SelectItem>
                      {maxInstallments >= 6 && <SelectItem value="6">6x</SelectItem>}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Até {maxInstallments}x conforme seu ICC
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDamageForm(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSubmitDamage}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-submit-damage"
                  >
                    Confirmar
                  </Button>
                </div>
              </motion.div>
            )}

            {registry.damage && registry.status === 'mediacao_pagamento' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-card border border-emerald-500/30 rounded-xl p-4 space-y-4"
              >
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  Pagamento em Andamento
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor total:</span>
                    <span className="font-medium">{formatCurrency(registry.damage.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parcelas pagas:</span>
                    <span className="font-medium">{registry.damage.paidInstallments}/{registry.damage.installments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor da parcela:</span>
                    <span className="font-medium">{formatCurrency(registry.damage.value / registry.damage.installments)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estabelecimento:</span>
                    <span className="font-medium">{registry.damage.establishmentName}</span>
                  </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(registry.damage.paidInstallments / registry.damage.installments) * 100}%` }}
                  />
                </div>

                {registry.damage.paidInstallments < registry.damage.installments && (
                  <Button
                    onClick={handlePayInstallment}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-pay-installment"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Pagar Parcela ({formatCurrency(registry.damage.value / registry.damage.installments)})
                  </Button>
                )}
              </motion.div>
            )}

            {registry.certificate && (
              <CautelarCertificateView registry={registry} />
            )}
          </div>
        </main>

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title={successMessage.title}
          description={successMessage.description}
          variant="success"
        />
      </div>
    </PageTransition>
  );
};

export default CautelarRegistryDetails;
