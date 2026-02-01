import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Lock, Shield, Info, Gift, RefreshCw, AlertTriangle, Car, Clock, Zap, Star, Crown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useVagas } from "@/contexts/VagasContext";
import { motion } from "framer-motion";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { canAchieveYellowSeal, canAchieveGreenSeal, shouldLoseYellowSeal, shouldLoseGreenSeal } from "@/lib/types";

const Seals = () => {
  const navigate = useNavigate();
  const {
    vehicles,
    currentUser,
    purchaseVerifiedSeal,
    canActivateFreeSeal,
    isVerifiedSealExpired,
    cauCashBalance,
    addTransaction,
    showAlert
  } = useApp();

  const { saldo: saldoVagas, pagarComCauCash } = useVagas();

  const [activeTab, setActiveTab] = useState("selos");

  // Plano ativo do cliente (se for cliente CAUTOO)
  const activePlanName = currentUser?.activePlanType || null;

  // Estados do selo
  const isFreeEligible = canActivateFreeSeal();
  const isExpired = isVerifiedSealExpired();
  const isActive = currentUser?.isVerified && !isExpired;
  const usedFreeActivation = currentUser?.verifiedFreeActivationUsed || false;

  // Status dos selos conquistáveis
  const hasYellowSeal = canAchieveYellowSeal(currentUser);
  const hasGreenSeal = canAchieveGreenSeal(currentUser, vehicles);
  const isLosingYellowSeal = shouldLoseYellowSeal(currentUser);
  const isLosingGreenSeal = shouldLoseGreenSeal(currentUser);

  const isClient = currentUser?.isCautooClient || false;

  // Saldo total = cauCashBalance (AppContext) + saldoVagas (VagasContext)
  const saldoTotal = cauCashBalance + saldoVagas;

  const handleActivateSeal = (isFree: boolean) => {
    const valor = 50;
    if (!isFree) {
      // Verificar saldo total
      if (saldoTotal < valor) {
        showAlert("Saldo Insuficiente", "Seu saldo CauCash é insuficiente. Adicione créditos para continuar.", "error");
        return;
      }

      // Debitar: primeiro do cauCashBalance, depois do saldo de vagas se necessário
      if (cauCashBalance >= valor) {
        // Tem saldo suficiente no AppContext, usa a função normal
        addTransaction({
          type: 'debit',
          amount: valor,
          description: 'Aquisição de Selo Verificado',
          category: 'Selo'
        });
      } else {
        // Precisa combinar os dois saldos
        const restante = valor - cauCashBalance;

        // Debita o que tem no cauCashBalance
        if (cauCashBalance > 0) {
          addTransaction({
            type: 'debit',
            amount: cauCashBalance,
            description: 'Aquisição de Selo Verificado (parcial)',
            category: 'Selo'
          });
        }

        // Debita o restante do saldo de vagas
        pagarComCauCash(restante, 'Aquisição de Selo Verificado (parcial)');
      }
    }

    // Ativa o selo
    if (isFree) {
      // Ativação gratuita
      purchaseVerifiedSeal(true);
    } else {
      // Já debitamos acima, então skipDebit = true
      purchaseVerifiedSeal(false, true);
    }

    if (isFree) {
      showAlert("Selo Verificado Ativado!", "Benefício de cliente CAUTOO. Válido por 12 meses.", "success");
    } else {
      showAlert("Selo Verificado Ativado!", "Seu perfil está verificado por 12 meses.", "success");
    }
  };

  const handlePurchasePlan = (planName: string, value: number) => {
    const planNames: Record<string, string> = {
      'cautela': 'Modo Cautela',
      'certo': 'Modo Certo',
      'ciente': 'Modo Ciente'
    };

    if (saldoTotal < value) {
      showAlert(
        "Saldo Insuficiente",
        `Você precisa de R$ ${value.toFixed(2).replace('.', ',')} para contratar o plano ${planNames[planName]}. Recarregue seu CauCash para continuar.`,
        "error"
      );
      navigate("/garagem/caucash");
      return;
    }

    if (cauCashBalance >= value) {
      addTransaction({
        type: 'debit',
        amount: value,
        description: `Contratação ${planNames[planName]}`,
        category: 'Planos'
      });
    } else {
      const restante = value - cauCashBalance;
      if (cauCashBalance > 0) {
        addTransaction({
          type: 'debit',
          amount: cauCashBalance,
          description: `Contratação ${planNames[planName]} (parcial)`,
          category: 'Planos'
        });
      }
      pagarComCauCash(restante, `Contratação ${planNames[planName]} (parcial)`);
    }

    showAlert(
      `Plano ${planNames[planName]} Contratado!`,
      `Seu plano está ativo. Carência de 7 dias para uso dos serviços.`,
      "success"
    );
  };

  // ===== BENEFÍCIOS SELO AZUL (Perfil Verificado) =====
  const blueBenefits = [
    "Identidade validada na Rede Cautoo",
    "Perfil marcado como Verificado",
    "Todas as placas herdam status verificado",
    "Enviar e receber alertas completos",
    "Enviar elogios e críticas",
    "Participar de rankings ICC",
    "1 placa gratuita por CPF",
    "Placas adicionais: R$ 5 (grátis se placa tiver plano CAUTOO)",
    "Informações completas da placa: R$ 25",
  ];

  // ===== BENEFÍCIOS SELO AMARELO (Guardião Viário) =====
  const yellowBenefitsClient = [
    "Todos os benefícios do Selo Azul",
    "1 alerta de roubo gratuito a cada 30 dias",
    "5% a 15% de desconto em parceiros",
    "25% de desconto na renovação do plano",
  ];

  const yellowBenefitsNonClient = [
    "Todos os benefícios do Selo Azul",
    "1 alerta de roubo gratuito a cada 30 dias",
    "5% a 15% de desconto em parceiros",
    "10% de desconto em planos CAUTOO",
    "10% de desconto em serviços avulsos",
  ];

  const yellowRequirements = [
    { label: "Selo Azul (Perfil Verificado) ativo", met: currentUser?.isVerified && !isExpired },
    { label: "ICC ≥ 650 pontos", met: (currentUser?.icc || 0) >= 650 },
    { label: "Pelo menos 10 alertas úteis enviados", met: (currentUser?.usefulAlertsSent || 0) >= 10 },
    { label: "No máximo 3 críticas válidas recebidas", met: (currentUser?.validCritiquesReceived || 0) <= 3 },
    { label: "Nenhum abuso confirmado", met: (currentUser?.confirmedAbuses || 0) === 0 },
  ];

  // ===== BENEFÍCIOS SELO VERDE (Referência Cautoo) =====
  const greenBenefitsClient = [
    "Todos os benefícios do Selo Amarelo",
    "1 chamado completo de assistência veicular GRATUITO a cada 6 meses (plano Modo Cautela)",
    "2 alertas de roubo GRATUITOS a cada 30 dias",
    "20% de desconto em novas placas e informações completas",
  ];

  const greenBenefitsNonClient = [
    "Todos os benefícios do Selo Amarelo",
    "2 alertas de roubo GRATUITOS a cada 30 dias",
    "20% de desconto em novas placas e informações completas",
    "15% de desconto em serviços avulsos",
    "15% de desconto em planos CAUTOO",
  ];

  // Calcular média do score
  const avgScore = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + v.score, 0) / vehicles.length)
    : 0;

  const greenRequirements = [
    { label: "Selo Azul (Perfil Verificado) ativo", met: currentUser?.isVerified && !isExpired },
    { label: "Selo Amarelo (Guardião Viário) conquistado", met: hasYellowSeal },
    { label: "ICC ≥ 850 pontos", met: (currentUser?.icc || 0) >= 850 },
    { label: "Pelo menos 30 alertas úteis enviados", met: (currentUser?.usefulAlertsSent || 0) >= 30 },
    { label: "Pelo menos 3 ajudas reais prestadas", met: (currentUser?.realHelpsGiven || 0) >= 3 },
    { label: `Média do score das placas ≥ 80 (atual: ${avgScore})`, met: avgScore >= 80 },
    { label: "No máximo 3 críticas válidas recebidas", met: (currentUser?.validCritiquesReceived || 0) <= 3 },
    { label: "Nenhum abuso confirmado", met: (currentUser?.confirmedAbuses || 0) === 0 },
  ];

  // Renderiza o conteúdo do card do Selo Azul baseado no estado
  const renderBlueSeaLContent = () => {
    // Estado 4.3: Selo ativo
    if (isActive) {
      return (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <VerifiedBadge isVerified={true} size="lg" />
            <div>
              <p className="font-medium text-green-600">Selo Verificado Ativo</p>
              <p className="text-xs text-muted-foreground">
                Válido até {currentUser?.verifiedExpiresAt ? new Date(currentUser.verifiedExpiresAt).toLocaleDateString('pt-BR') : '---'}
              </p>
            </div>
          </div>
        </div>
      );
    }

    // Estado 4.4: Selo expirado (após 12 meses)
    if (currentUser?.verifiedAt && isExpired) {
      return (
        <>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Seu selo expirou. A gratuidade vale apenas na primeira ativação com plano ativo.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold text-foreground mb-1">R$ 50,00</p>
            <p className="text-xs text-muted-foreground">por CPF / 12 meses</p>
          </div>

          <div className="space-y-2 mb-6">
            {blueBenefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            onClick={() => handleActivateSeal(false)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Renovar Selo Verificado — R$ 50,00
          </Button>
        </>
      );
    }

    // Estado 4.2: Cliente Cautoo com plano ativo E primeira ativação elegível
    if (isFreeEligible) {
      return (
        <>
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Gift className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong className="text-green-600">Gratuito para cliente CAUTOO!</strong>
                <br />O app identificou automaticamente pelo seu CPF.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-2xl font-bold text-green-600 mb-1">Gratuito</p>
            <p className="text-xs text-muted-foreground">para cliente CAUTOO / 12 meses</p>
          </div>

          <div className="space-y-2 mb-6">
            {blueBenefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>

          <Button
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            onClick={() => handleActivateSeal(true)}
          >
            <Gift className="w-4 h-4 mr-2" />
            Ativar Selo Verificado — Gratuito
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-3">
            Após 12 meses, renovação por R$ 50,00
          </p>
        </>
      );
    }

    // Estado 4.1: NÃO cliente (padrão)
    return (
      <>
        <div className="mb-4">
          <p className="text-2xl font-bold text-foreground mb-1">R$ 50,00</p>
          <p className="text-xs text-muted-foreground">por CPF / 12 meses</p>
        </div>

        <div className="space-y-2 mb-6">
          {blueBenefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
              {benefit}
            </div>
          ))}
        </div>

        {/* Informação sobre gratuidade para clientes */}
        <div className="bg-secondary/50 rounded-lg p-3 mb-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Clientes CAUTOO:</strong> primeira ativação gratuita com plano ativo. Após 12 meses, renovação paga.
          </p>
        </div>

        <Button
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          onClick={() => handleActivateSeal(false)}
        >
          <Shield className="w-4 h-4 mr-2" />
          Ativar Selo Verificado — R$ 50,00
        </Button>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Selos e Planos</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-secondary/50">
              <TabsTrigger value="selos" data-testid="tab-selos">Selos</TabsTrigger>
              <TabsTrigger value="planos" data-testid="tab-planos">Planos</TabsTrigger>
            </TabsList>

            {/* ========== ABA SELOS ========== */}
            <TabsContent value="selos" className="space-y-6">

              {/* Selo Azul - Perfil Verificado (CPF) */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="bg-card border border-blue-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Selo Azul</h2>
                      <p className="text-sm text-muted-foreground">Perfil Verificado</p>
                    </div>
                  </div>

                  {/* Info box */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        O Selo Azul é vinculado ao seu <strong className="text-foreground">CPF</strong>, não às placas.
                        Garante sua identidade validada na Rede Cautoo. Cliente CAUTOO ativa gratuitamente, não cliente paga R$ 50.
                      </p>
                    </div>
                  </div>

                  {renderBlueSeaLContent()}
                </div>
              </motion.section>

              {/* Selo Amarelo - Guardião Viário */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-card border border-yellow-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Selo Amarelo</h2>
                      <p className="text-sm text-muted-foreground">Guardião Viário</p>
                    </div>
                    {hasYellowSeal && !hasGreenSeal && (
                      <span className="ml-auto text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded-full font-medium">
                        ✓ Conquistado
                      </span>
                    )}
                  </div>

                  {/* Info box */}
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Motorista <strong className="text-foreground">ativo e colaborador</strong> da Rede Cautoo.
                        <br /><br />
                        <strong className="text-yellow-600">Não é comprável</strong> — conquistado por mérito baseado no seu ICC e contribuições.
                      </p>
                    </div>
                  </div>

                  {/* Aviso de perda */}
                  {isLosingYellowSeal && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-400">
                          Atenção: você acumulou mais de 10 críticas válidas e perdeu o Selo Amarelo.
                          Para reconquistar, os contadores de mérito foram reiniciados.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Benefícios baseados no status de cliente */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Benefícios {isClient ? "(Cliente CAUTOO)" : "(Não Cliente)"}
                    </h4>
                    <div className="space-y-2">
                      {(isClient ? yellowBenefitsClient : yellowBenefitsNonClient).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Requisitos para conquistar
                    </h4>
                    <div className="space-y-2">
                      {yellowRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {req.met ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0" />
                          )}
                          <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Regra de perda */}
                    <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-amber-500">Regra de perda:</strong> Se acumular mais de 10 críticas válidas,
                        perde o Selo Amarelo e volta para o Selo Azul. Os contadores reiniciam.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Selo Verde - Referência Cautoo */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-card border border-green-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Selo Verde</h2>
                      <p className="text-sm text-muted-foreground">Referência Cautoo</p>
                    </div>
                    {hasGreenSeal && (
                      <span className="ml-auto text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded-full font-medium">
                        ✓ Conquistado
                      </span>
                    )}
                  </div>

                  {/* Info box */}
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Nível máximo de confiança</strong> da Rede Cautoo.
                        Motorista com excelente conduta, que ajuda outros e mantém alto padrão.
                        <br /><br />
                        <strong className="text-green-600">Não é comprável</strong> — conquistado por excelência.
                      </p>
                    </div>
                  </div>

                  {/* Aviso de perda */}
                  {isLosingGreenSeal && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-red-400">
                          Atenção: você acumulou mais de 10 críticas válidas e retornou ao Selo Amarelo.
                          Será necessário cumprir novamente todos os critérios para reconquistar.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Benefícios baseados no status de cliente */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Benefícios {isClient ? "(Cliente CAUTOO)" : "(Não Cliente)"}
                    </h4>
                    <div className="space-y-2">
                      {(isClient ? greenBenefitsClient : greenBenefitsNonClient).map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Requisitos para conquistar
                    </h4>
                    <div className="space-y-2">
                      {greenRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          {req.met ? (
                            <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-muted-foreground flex-shrink-0" />
                          )}
                          <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Regra de perda */}
                    <div className="mt-4 p-3 bg-amber-500/10 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-amber-500">Regra de perda:</strong> Se acumular mais de 10 críticas válidas,
                        retorna ao Selo Amarelo. Precisa cumprir novamente todos os critérios para reconquistar.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Resumo */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-sm font-medium text-foreground mb-4">Resumo dos Selos</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Azul — Perfil Verificado</span>
                        <p className="text-muted-foreground mt-1">
                          Identidade validada. Cliente CAUTOO: grátis. Não cliente: R$ 50.
                          1 placa grátis, adicionais R$ 5 (ou grátis com plano).
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Amarelo — Guardião Viário</span>
                        <p className="text-muted-foreground mt-1">
                          Motorista ativo e colaborador. ICC ≥ 650, 10+ alertas úteis, máx. 3 críticas.
                          1 alerta roubo/mês grátis, descontos em parceiros e planos.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/10">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-foreground">Verde — Referência Cautoo</span>
                        <p className="text-muted-foreground mt-1">
                          Nível máximo de confiança. ICC ≥ 850, 30+ alertas, 3+ ajudas, score ≥ 80.
                          Cliente: 1 chamado grátis/6 meses + 2 alertas roubo/mês.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ICC Info */}
                  <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                    <h4 className="text-xs font-medium text-foreground mb-1">O que é ICC?</h4>
                    <p className="text-xs text-muted-foreground">
                      <strong>Índice de Contribuição Cautelar</strong> — mede quanto você contribui positivamente para a Rede.
                      Aumenta com alertas úteis, elogios, ajudas e indicações. Diminui com críticas, denúncias e abusos.
                      O valor exato é privado.
                    </p>
                  </div>
                </div>
              </motion.section>

            </TabsContent>

            {/* ========== ABA PLANOS ========== */}
            <TabsContent value="planos" className="space-y-6">

              {/* Banner do plano ativo (se cliente CAUTOO) */}
              {isClient && activePlanName && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Seu plano ativo</p>
                      <p className="text-lg font-bold text-emerald-500">
                        {activePlanName === 'cautela' && 'Modo Cautela'}
                        {activePlanName === 'certo' && 'Modo Certo'}
                        {activePlanName === 'ciente' && 'Modo Ciente'}
                      </p>
                    </div>
                    {currentUser?.cautooClientPlanExpiresAt && (
                      <div className="ml-auto text-right">
                        <p className="text-xs text-muted-foreground">Válido até</p>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(currentUser.cautooClientPlanExpiresAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-foreground mb-2">Planos CAUTOO</h2>
                  <p className="text-sm text-muted-foreground">Assistência completa para seu veículo</p>
                </div>

                {/* Modo Cautela - Azul (como Selo Azul) */}
                <div className="bg-card border border-blue-500/30 rounded-2xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Car className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Modo Cautela</h3>
                      <p className="text-sm text-muted-foreground">1 chamado completo</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-foreground">R$ 31,50<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                    <p className="text-sm text-blue-500 font-medium">ou R$ 189,00 por 6 meses</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Serviços inclusos:</p>
                    {["Guincho Km Livre", "Veículo Reserva", "Auxílio Mecânico", "Auxílio Pane Seca", "Recarga de Bateria", "Chaveiro Automotivo", "Troca de Pneu", "Estadia Veicular", "Transporte Alternativo"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 bg-blue-500/10 rounded-xl p-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Benefícios adicionais:</p>
                    {["Selo Azul (Perfil Verificado)", "Uma placa adicional", "Um alerta de veículo roubado (6 meses)", "Cashback de R$ 30", "+100 pontos adicionais no ICC"].map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    Carência de 7 dias após a compra
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600"
                    onClick={() => handlePurchasePlan('cautela', 189)}
                    data-testid="button-purchase-cautela"
                  >
                    Quero este plano
                  </Button>
                </div>

                {/* Modo Certo - Amarelo (como Selo Amarelo) */}
                <div className="bg-card border border-yellow-500/30 rounded-2xl p-6 mb-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Modo Certo</h3>
                      <p className="text-sm text-muted-foreground">2 chamados + 1 proteção</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-foreground">R$ 43,50<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                    <p className="text-sm text-yellow-500 font-medium">ou R$ 391,50 por 9 meses</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Serviços inclusos:</p>
                    {["Todos do Modo Cautela", "Hospedagem / Pernoite"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Proteções:</p>
                    {[
                      { name: "Proteção de Vidro", value: "Até R$ 1.000" },
                      { name: "Proteção de Pneu", value: "Até R$ 500" },
                      { name: "Pagamento de Multa", value: "Até R$ 200" }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                          {s.name}
                        </div>
                        <span className="text-xs font-medium text-yellow-600">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 bg-yellow-500/10 rounded-xl p-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Benefícios adicionais:</p>
                    {["Selo Azul (Perfil Verificado)", "Duas placas adicionais", "Três alertas de veículo roubado (9 meses)", "Cashback de R$ 45", "+200 pontos adicionais no ICC"].map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    Carência de 7 dias após a compra
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-500"
                    onClick={() => handlePurchasePlan('certo', 391.50)}
                    data-testid="button-purchase-certo"
                  >
                    Quero este plano
                  </Button>
                </div>

                {/* Modo Ciente - Verde (como Selo Verde) */}
                <div className="bg-card border border-green-500/30 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PREMIUM
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Modo Ciente</h3>
                      <p className="text-sm text-muted-foreground">3 chamados + 2 proteções</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-foreground">R$ 65,50<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                    <p className="text-sm text-green-500 font-medium">ou R$ 786,00 por 12 meses</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Serviços inclusos:</p>
                    {["Todos do Modo Certo", "Assistência Pet"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Proteções:</p>
                    {[
                      { name: "Proteção de Roda", value: "Até R$ 1.000" },
                      { name: "Pagamento de Franquia", value: "Até R$ 2.000" },
                      { name: "Indenização por Acidente", value: "Até R$ 3.000" }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {s.name}
                        </div>
                        <span className="text-xs font-medium text-green-600">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 bg-green-500/10 rounded-xl p-4">
                    <p className="text-xs font-medium text-foreground uppercase tracking-wider">Benefícios adicionais:</p>
                    {["Selo Azul (Perfil Verificado)", "Três placas adicionais", "Seis alertas de veículo roubado (12 meses)", "Cashback de R$ 60", "+300 pontos adicionais no ICC"].map((b, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Gift className="w-4 h-4 text-green-500 flex-shrink-0" />
                        {b}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                    <Clock className="w-4 h-4" />
                    Carência de 7 dias após a compra
                  </div>

                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600"
                    onClick={() => handlePurchasePlan('ciente', 786)}
                    data-testid="button-purchase-ciente"
                  >
                    Quero este plano
                  </Button>
                </div>
              </motion.section>

            </TabsContent>
          </Tabs>
        </div>
      </main>

    </div>
  );
};

export default Seals;
