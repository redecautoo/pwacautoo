import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Car,
  Shield,
  Lock,
  AlertTriangle,
  Calendar,
  Palette,
  FileText,
  Cog,
  Fuel,
  Weight,
  Users,
  MapPin,
  Clock,
  ChevronRight,
  Phone,
  Flag,
  Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useApp } from "@/contexts/AppContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SealBadge } from "@/components/SealBadge";
import { PageTransition } from "@/components/PageTransition";

// Dados mockados para veículos com selo azul (simulando dados da API)
const mockVehicleDetails = {
  "ABC1D23": {
    renavam: "12345678901",
    chassi: "9BWZZZ377VT004251",
    tipoVeiculo: "Automóvel",
    especieVeiculo: "Passageiro",
    categoriaVeiculo: "Particular",
    anoModelo: 2022,
    anoFabricacao: 2021,
    indicadorRenajud: "Sem Restrição",
    indicadorMultasRenainf: "Sem Multas",
    pendenciaReceitaFederal: "Regular",
    // Características técnicas
    numeroMotor: "ABC1234567890",
    numeroCambio: "CB123456",
    numeroCarroceria: "CR789012",
    numeroEixoTraseiro: "ET345678",
    numeroEixoAuxiliar: "N/A",
    potencia: "155 CV",
    cilindradas: "2000 cc",
    combustivel: "Flex",
    cmt: "N/A",
    pbt: "1.850 kg",
    cmc: "N/A",
    quantidadeEixos: 2,
    lotacao: 5,
    procedencia: "Nacional",
  },
  "XYZ4E56": {
    renavam: "98765432101",
    chassi: "9BRTT59M1E3456789",
    tipoVeiculo: "Automóvel",
    especieVeiculo: "Passageiro",
    categoriaVeiculo: "Particular",
    anoModelo: 2021,
    anoFabricacao: 2020,
    indicadorRenajud: "Sem Restrição",
    indicadorMultasRenainf: "Sem Multas",
    pendenciaReceitaFederal: "Regular",
    numeroMotor: "XYZ9876543210",
    numeroCambio: "CB987654",
    numeroCarroceria: "CR210987",
    numeroEixoTraseiro: "ET876543",
    numeroEixoAuxiliar: "N/A",
    potencia: "177 CV",
    cilindradas: "2000 cc",
    combustivel: "Flex",
    cmt: "N/A",
    pbt: "1.920 kg",
    cmc: "N/A",
    quantidadeEixos: 2,
    lotacao: 5,
    procedencia: "Nacional",
  },
};

const generateMockDetails = (plate: string) => {
  const hash = plate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return {
    renavam: String(10000000000 + hash).slice(0, 11),
    chassi: `9BR${plate.replace(/[^A-Z0-9]/g, '')}${String(hash).slice(0, 5)}`,
    tipoVeiculo: "Automóvel",
    especieVeiculo: "Passageiro",
    categoriaVeiculo: "Particular",
    anoModelo: 2020 + (hash % 5),
    anoFabricacao: 2019 + (hash % 5),
    indicadorRenajud: "Sem Restrição",
    indicadorMultasRenainf: "Sem Multas",
    pendenciaReceitaFederal: "Regular",
    numeroMotor: `MOT${plate}${String(hash).slice(0, 6)}`,
    numeroCambio: `CB${String(hash).slice(0, 6)}`,
    numeroCarroceria: `CR${String(hash).slice(0, 6)}`,
    numeroEixoTraseiro: `ET${String(hash).slice(0, 6)}`,
    numeroEixoAuxiliar: "N/A",
    potencia: `${140 + (hash % 60)} CV`,
    cilindradas: `${1600 + (hash % 600)} cc`,
    combustivel: "Flex",
    cmt: "N/A",
    pbt: `${1700 + (hash % 400)} kg`,
    cmc: "N/A",
    quantidadeEixos: 2,
    lotacao: 5,
    procedencia: "Nacional",
  };
};

const VehicleDetails = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { vehicles, currentUser, purchasePlateInfo, submitVehicleClaim, claims, cauCashBalance, showAlert } = useApp();

  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimReason, setClaimReason] = useState("");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const vehicle = vehicles.find(v => v.id === vehicleId);

  if (!vehicle) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Veículo não encontrado</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const hasCompleteInfo = vehicle.hasCompleteInfo;
  const details = hasCompleteInfo
    ? (mockVehicleDetails[vehicle.plate as keyof typeof mockVehicleDetails] || generateMockDetails(vehicle.plate))
    : null;

  const isBlocked = vehicle.claimStatus === 'pending';
  const existingClaim = claims.find(c => c.plate === vehicle.plate && c.claimantUserId === currentUser?.id);

  const handleSubmitClaim = () => {
    if (claimReason.length >= 20 && vehicleId) {
      submitVehicleClaim(vehicleId, claimReason);
      setClaimReason("");
      setShowClaimForm(false);
      showAlert("Justificativa Enviada", "Sua solicitação está em análise. Você receberá uma notificação em breve.", "success");
    }
  };

  const handlePurchaseInfo = () => {
    if (!vehicleId) return;

    const valor = 25;
    if (cauCashBalance < valor) {
      showAlert("Saldo Insuficiente", "Seu saldo CauCash é insuficiente. Adicione créditos para continuar.", "error");
      return;
    }

    setIsPurchasing(true);
    purchasePlateInfo(vehicleId, true);
    setTimeout(() => {
      showAlert("Informações Liberadas", "As informações técnicas do veículo foram liberadas com sucesso!", "success", vehicle.plate);
      setIsPurchasing(false);
    }, 100);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Detalhes do Veículo</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">

            {isBlocked && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-medium text-amber-500">Placa em Análise</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Esta placa está sendo analisada pois já pertence a outro usuário.
                      Enquanto a análise está em andamento, as funções de score, socorro e alerta de roubo estão bloqueadas.
                    </p>
                    {!existingClaim && !showClaimForm && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                        onClick={() => setShowClaimForm(true)}
                      >
                        <Flag className="w-4 h-4 mr-2" />
                        Enviar Justificativa
                      </Button>
                    )}
                    {existingClaim && (
                      <p className="text-xs text-amber-500 mt-2">
                        ✓ Justificativa enviada em {new Date(existingClaim.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>

                {showClaimForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 pt-4 border-t border-amber-500/20"
                  >
                    <label className="block text-sm text-muted-foreground mb-2">
                      Por que você é o verdadeiro dono desta placa?
                    </label>
                    <Textarea
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                      placeholder="Explique detalhadamente (mínimo 20 caracteres)"
                      rows={3}
                      className="mb-3"
                    />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowClaimForm(false)}>Cancelar</Button>
                      <Button size="sm" disabled={claimReason.length < 20} onClick={handleSubmitClaim} className="bg-amber-500 hover:bg-amber-600">Enviar Justificativa</Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            <motion.section
              className={`bg-card border rounded-2xl p-6 ${isBlocked ? 'border-amber-500/30' : 'border-border'}`}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isBlocked ? 'bg-amber-500/20' : 'bg-primary/10'}`}>
                  {isBlocked ? <Lock className="w-8 h-8 text-amber-500" /> : <Car className="w-8 h-8 text-primary" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground tracking-wider">{vehicle.plate}</span>
                    {isBlocked ? (
                      <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1"><Clock className="w-3 h-3" /> Em análise</span>
                    ) : (
                      <>
                        {(currentUser?.seal && currentUser.seal !== 'none') ? (
                          <SealBadge seal={currentUser.seal} size="md" />
                        ) : (
                          <VerifiedBadge isVerified={currentUser?.isVerified || false} size="md" />
                        )}
                      </>
                    )}
                  </div>
                  {vehicle.isStolen && <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded mt-1 inline-block">ROUBADO</span>}
                </div>
              </div>

              {isBlocked ? (
                <div className="space-y-3">
                  {[
                    { label: "Score do Veículo", desc: "Bloqueado durante análise" },
                    { label: "Solicitar Socorro", desc: "Bloqueado durante análise" },
                    { label: "Reportar Roubo", desc: "Bloqueado durante análise" }
                  ].map((item, i) => (
                    <div key={i} className="w-full bg-muted/50 border border-border rounded-xl p-4 opacity-60 cursor-not-allowed">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center"><Lock className="w-6 h-6 text-muted-foreground" /></div>
                          <div className="text-left"><p className="text-sm font-medium text-muted-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                        </div>
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <MenuButton
                    onClick={() => navigate(`/vehicle-score/${vehicle.id}`)}
                    icon={<span className="text-2xl font-bold text-primary">{vehicle.score}</span>}
                    label="Score do Veículo"
                    desc="Toque para ver detalhes e histórico"
                    color="primary"
                  />
                  <MenuButton
                    onClick={() => navigate(`/request-help/${vehicle.id}`)}
                    icon={<Phone className="w-6 h-6 text-amber-500" />}
                    label="Solicitar Socorro"
                    desc="Acionar ajuda para este veículo"
                    color="amber"
                  />
                  {!vehicle.isStolen ? (
                    <MenuButton
                      onClick={() => navigate(`/report-stolen/${vehicle.id}`)}
                      icon={<AlertTriangle className="w-6 h-6 text-destructive" />}
                      label="Reportar Roubo"
                      desc="Alertar a rede sobre roubo do veículo"
                      color="destructive"
                    />
                  ) : (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <div><p className="text-sm font-medium text-destructive">Alerta de Roubo Ativo</p><p className="text-xs text-muted-foreground">Seu veículo está sendo monitorado pela rede</p></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.section>

            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Informações Cadastradas</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                <InfoRow icon={Car} label="Modelo" value={vehicle.model} />
                <InfoRow icon={Palette} label="Cor" value={vehicle.color} />
                <InfoRow icon={Calendar} label="Cadastrado em" value={new Date(vehicle.createdAt).toLocaleDateString('pt-BR')} />
                {currentUser?.isVerified && currentUser.verifiedExpiresAt && (
                  <InfoRow icon={Shield} label="Perfil verificado até" value={new Date(currentUser.verifiedExpiresAt).toLocaleDateString('pt-BR')} />
                )}
              </div>
            </motion.section>

            {vehicle.hasCompleteInfo && details ? (
              <div className="space-y-6">
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-blue-500" />Identificação do Veículo</h2>
                  <div className="bg-card border border-blue-500/20 rounded-2xl divide-y divide-border">
                    <InfoRow icon={FileText} label="Renavam" value={details.renavam} />
                    <InfoRow icon={FileText} label="Chassi" value={details.chassi} />
                    <InfoRow icon={Car} label="Tipo" value={details.tipoVeiculo} />
                    <InfoRow icon={Car} label="Espécie" value={details.especieVeiculo} />
                    <InfoRow icon={Car} label="Categoria" value={details.categoriaVeiculo} />
                    <InfoRow icon={Calendar} label="Ano Modelo" value={details.anoModelo.toString()} />
                    <InfoRow icon={Calendar} label="Ano Fabricação" value={details.anoFabricacao.toString()} />
                    <InfoRow icon={AlertTriangle} label="Renajud" value={details.indicadorRenajud} valueColor={details.indicadorRenajud === "Sem Restrição" ? "text-green-500" : "text-destructive"} />
                    <InfoRow icon={AlertTriangle} label="Multas Renainf" value={details.indicadorMultasRenainf} valueColor={details.indicadorMultasRenainf === "Sem Multas" ? "text-green-500" : "text-destructive"} />
                    <InfoRow icon={FileText} label="Receita Federal" value={details.pendenciaReceitaFederal} valueColor={details.pendenciaReceitaFederal === "Regular" ? "text-green-500" : "text-destructive"} />
                  </div>
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2"><Cog className="w-4 h-4 text-blue-500" />Características Técnicas</h2>
                  <div className="bg-card border border-blue-500/20 rounded-2xl divide-y divide-border">
                    <InfoRow icon={Cog} label="Nº do Motor" value={details.numeroMotor} />
                    <InfoRow icon={Cog} label="Nº do Câmbio" value={details.numeroCambio} />
                    <InfoRow icon={Cog} label="Nº da Carroceria" value={details.numeroCarroceria} />
                    <InfoRow icon={Cog} label="Nº Eixo Traseiro" value={details.numeroEixoTraseiro} />
                    <InfoRow icon={Cog} label="Nº Eixo Auxiliar" value={details.numeroEixoAuxiliar} />
                    <InfoRow icon={Fuel} label="Potência" value={details.potencia} />
                    <InfoRow icon={Fuel} label="Cilindradas" value={details.cilindradas} />
                    <InfoRow icon={Fuel} label="Combustível" value={details.combustivel} />
                    <InfoRow icon={Weight} label="PBT" value={details.pbt} />
                    <InfoRow icon={Cog} label="Qtd. Eixos" value={details.quantidadeEixos.toString()} />
                    <InfoRow icon={Users} label="Lotação" value={`${details.lotacao} passageiros`} />
                    <InfoRow icon={MapPin} label="Procedência" value={details.procedencia} />
                  </div>
                </motion.section>
              </div>
            ) : (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-2xl p-6 text-center">
                  <Lock className="w-12 h-12 text-blue-500/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Informações Completas da Placa</h3>
                  <p className="text-sm text-muted-foreground mb-4">Libere acesso a dados completos do veículo: Renavam, Chassi, Restrições, Multas e características técnicas.</p>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-blue-500" /><span className="text-xs text-blue-500 font-medium italic">Taxa: R$ 25,00</span></div>
                    <div className="text-[10px] text-muted-foreground italic">Saldo: R$ {cauCashBalance.toFixed(2)}</div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12" onClick={handlePurchaseInfo} disabled={isPurchasing}>
                    <FileText className="w-4 h-4 mr-2" />
                    {isPurchasing ? "Processando..." : "Liberar Informações — R$ 25,00"}
                  </Button>
                </div>
              </motion.section>
            )}

            {/* Privacy Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                🔓 Privacidade do Score
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                O score da sua placa é <strong className="text-foreground">público</strong> e visível
                para todos os usuários. Porém, os <strong className="text-foreground">detalhes dos
                  alertas são privados</strong> e apenas você pode vê-los.
              </p>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="public" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    O que todos veem
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-1 pl-4">
                    <p>• Número do score (ex: 450)</p>
                    <p>• Categoria (ex: Placa Confiável)</p>
                    <p>• Total de interações (sem detalhes)</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="private" className="border-b-0">
                  <AccordionTrigger className="text-sm hover:no-underline">
                    O que só você vê (privado) 🔒
                  </AccordionTrigger>
                  <AccordionContent className="text-xs text-muted-foreground space-y-1 pl-4">
                    <p>• Alertas específicos recebidos</p>
                    <p>• Mensagens e denúncias</p>
                    <p>• Quem enviou os alertas</p>
                    <p>• Histórico completo de interações</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.section>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate("/dashboard")}>Voltar ao Dashboard</Button>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

const MenuButton = ({ onClick, icon, label, desc, color }: { onClick: () => void, icon: React.ReactNode, label: string, desc: string, color: string }) => {
  const colors = {
    primary: "from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10 border-primary/20 bg-primary/20 text-primary",
    amber: "from-amber-500/10 to-orange-500/5 hover:from-amber-500/20 hover:to-orange-500/10 border-amber-500/20 bg-amber-500/20 text-amber-500",
    destructive: "from-destructive/10 to-destructive/5 hover:from-destructive/20 hover:to-destructive/10 border-destructive/20 bg-destructive/20 text-destructive",
  }[color as 'primary' | 'amber' | 'destructive'];

  return (
    <motion.button
      onClick={onClick}
      className={`w-full bg-gradient-to-r ${colors} border rounded-xl p-4 transition-all`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-current/10`}>{icon}</div>
          <div className="text-left"><p className="text-sm font-medium text-foreground">{label}</p><p className="text-xs text-muted-foreground">{desc}</p></div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>
    </motion.button>
  );
};

const InfoRow = ({ icon: Icon, label, value, valueColor }: { icon: any, label: string, value: string, valueColor?: string }) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-3"><Icon className="w-5 h-5 text-muted-foreground" /><span className="text-sm text-muted-foreground">{label}</span></div>
    <span className={`text-sm font-medium ${valueColor || "text-foreground"}`}>{value}</span>
  </div>
);

export default VehicleDetails;