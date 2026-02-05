import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Star,
  AlertTriangle,
  Users,
  Award,
  Trophy,
  Gift,
  Settings,
  LogOut,
  Disc,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Clock,
  ParkingCircle,
  Wallet,
  FileText,
  Shield,
  Building2,
  HandHeart,
  MessageSquare,
  ThumbsUp,
  HeartHandshake,
  LayoutGrid,
  Lock,
  Layers,
  Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApp, getScoreCategoryInfo } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants, cardVariants } from "@/components/PageTransition";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SealBadge } from "@/components/SealBadge";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import { LicensePlateDisplay } from "@/components/LicensePlateDisplay";

// Modules
import RatingForm from "@/components/modules/RatingForm";
import SolidaryForm from "@/components/modules/SolidaryForm";
import ReportForm from "@/components/modules/ReportForm";
import { canSendMessageToPlate, recordMessageSent } from "@/lib/plateInteractionControl";
import { DashboardGrid } from "@/components/DashboardGrid";

type InteractionMode = "rate" | "solidary" | "report" | null;

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, vehicles, alerts, logout, showAlert, getVehicleByPlate } = useApp();
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);
  const [plateSearch, setPlateSearch] = useState("");

  // New Dashboard State
  const [plateValue, setPlateValue] = useState("");
  const [activeMode, setActiveMode] = useState<InteractionMode>(null);
  const [showLegacyActions, setShowLegacyActions] = useState(() => {
    // Usa sessionStorage: começa oculto em cada novo login, mas mantém estado durante navegação
    return sessionStorage.getItem("cautoo_show_legacy_actions") === "true";
  });
  const [chatMessage, setChatMessage] = useState("");
  const legacyActionsRef = useRef<HTMLDivElement>(null);

  // Sync showLegacyActions with sessionStorage (persiste apenas durante a sessão)
  useEffect(() => {
    sessionStorage.setItem("cautoo_show_legacy_actions", showLegacyActions.toString());
  }, [showLegacyActions]);

  const { getPlateSkinInfo } = useApp();
  const skinInfo = getPlateSkinInfo(plateValue);

  // Mock fixo para o veículo pesquisado (será dinâmico futuramente)
  const vehicleInfo = {
    marca: "Volkswagen",
    modelo: "Gol 1.0",
    cor: "Prata",
    ano: "2019/2020"
  };

  // Scroll to dashboard grid when returning from a functionality
  useEffect(() => {
    if (showLegacyActions && legacyActionsRef.current) {
      // Pequeno delay para garantir que o DOM está renderizado
      setTimeout(() => {
        legacyActionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  // Filtrar veículos pela busca
  const filteredVehicles = vehicles.filter(v =>
    v.plate.toUpperCase().includes(plateSearch.toUpperCase())
  );

  // Definindo itens do menu - REMOVENDO os duplicados conforme solicitado
  const menuItems = [
    { icon: Bell, label: "Meus Alertas", path: "/alerts", badge: unreadAlerts, color: "text-sky-400", bg: "bg-sky-500/20" },
    { icon: Wallet, label: "CauCash", path: "/garagem/caucash", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { icon: ParkingCircle, label: "Garagem", path: "/garagem", color: "text-blue-400", bg: "bg-blue-500/20" },
    // REMOVIDO: Avisar Motorista (Send)
    // REMOVIDO: Alerta Solidário (HandHeart)
    // REMOVIDO: Avaliar Motorista (Star)
    { icon: AlertTriangle, label: "Veículo Roubado", path: "/stolen", color: "text-red-400", bg: "bg-red-500/20" },
    { icon: Shield, label: "Registro Cautelar", path: "/cautelar-registry", color: "text-indigo-400", bg: "bg-indigo-500/20" },
    // { icon: Users, label: "Frota de Amigos", path: "/friends", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { icon: FileText, label: "Gerenciar Placa", path: "/manage-plate", color: "text-cyan-400", bg: "bg-cyan-500/20" },
    { icon: Award, label: "Selos e Planos", path: "/seals", color: "text-amber-400", bg: "bg-amber-500/20" },
    { icon: Trophy, label: "Meu Ranking ICC", path: "/ranking", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  ];

  // Botão de indicação especial (destacado)
  const referralItem = {
    icon: Gift,
    label: "Indique a Cautoo",
    path: "/referrals",
    color: "text-white",
    bg: "bg-gradient-to-r from-emerald-500 to-teal-500",
    isHighlighted: true
  };



  const skinsItem = {
    icon: Palette,
    label: "Skins & Coleção",
    path: "/skins-collection",
    color: "text-white",
    bg: "bg-gradient-to-r from-purple-600 to-pink-600",
    isHighlighted: true
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSendMessage = () => {
    if (chatMessage.trim().length === 0) return;

    // Check if can send message to this plate
    const { canSend, reason } = canSendMessageToPlate(plateValue, currentUser?.id || '');
    if (!canSend) {
      showAlert("Ação Bloqueada", reason || 'Não é possível enviar mensagem para esta placa', "error");
      return;
    }

    showAlert(
      "Mensagem Enviada!",
      `Sua mensagem foi entregue com segurança para o motorista da placa`,
      "success",
      plateValue
    );

    // Record the message and reset
    recordMessageSent(plateValue, currentUser?.id || '');
    setChatMessage("");
    setPlateValue("");
  };

  const handleInteractionSuccess = () => {
    // Reset plate and return to default message mode
    setPlateValue("");
    setActiveMode(null);
  };

  // Renderizar veículo individual
  const renderVehicle = (vehicle: typeof vehicles[0], index: number) => {
    const isBlocked = vehicle.claimStatus === 'pending';

    return (
      <motion.div
        key={vehicle.id}
        className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${isBlocked
          ? 'border-amber-500/50 bg-amber-500/5'
          : 'border-border hover:bg-secondary/50'
          }`}
        variants={staggerItemVariants}
        custom={index}
        onClick={() => navigate(`/vehicle/${vehicle.id}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isBlocked ? (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-amber-500/20">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
            ) : (
              <LicensePlateDisplay
                plate={vehicle.plate}
                size="sm"
                isStolen={vehicle.isStolen}
                skinId={vehicle.skinId}
              />
            )}
            <div className="flex flex-col gap-1">
              {isBlocked && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground tracking-wider">
                    {vehicle.plate}
                  </span>
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Em análise
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 flex-wrap">
                <p className="text-sm text-muted-foreground">
                  {isBlocked ? (
                    <span className="text-amber-500">Reivindicação pendente</span>
                  ) : (
                    <>{vehicle.model} • {vehicle.color}</>
                  )}
                </p>
                {!isBlocked && vehicle.ownershipType === 'assinatura' && vehicle.subscriptionInfo && (
                  <span
                    className="text-[10px] bg-blue-500/15 text-blue-400 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                    title={`Veículo em uso por assinatura até ${new Date(vehicle.subscriptionInfo.contractEndDate).toLocaleDateString('pt-BR')}`}
                  >
                    <Building2 className="w-2.5 h-2.5" />
                    Assinatura
                  </span>
                )}
                {!isBlocked && vehicle.insuranceInfo && (
                  <span
                    className="text-[10px] bg-green-500/15 text-green-400 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                    title={`Veículo segurado pela ${vehicle.insuranceInfo.companyName}`}
                  >
                    <Shield className="w-2.5 h-2.5" />
                    Seguro
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isBlocked && (
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
            )}
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">

        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 flex items-center justify-center">
                  <SealBadge seal={currentUser?.seal || 'none'} size="lg" variant="simple" animated={false} />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    Olá, {currentUser?.name?.split(' ')[0]}!
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.ranking}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                  <Settings className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-8">


            {/* 1. MEUS VEÍCULOS (TOPO) */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Meus Veículos</h2>
                {currentUser?.isVerified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary h-7 px-2"
                    onClick={() => navigate("/add-plate")}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                )}
              </div>
              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {vehicles.length === 0 ? (
                  <motion.div
                    className="bg-card border border-border rounded-xl p-6 text-center"
                    variants={cardVariants}
                  >
                    <Disc className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => navigate("/")}
                    >
                      Cadastrar Veículo
                    </Button>
                  </motion.div>
                ) : vehicles.length === 1 ? (
                  renderVehicle(vehicles[0], 0)
                ) : (
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                      onClick={() => setVehiclesExpanded(!vehiclesExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Disc className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-left">
                          <span className="font-medium text-foreground">
                            {vehicles.length} veículos cadastrados
                          </span>
                          <p className="text-xs text-muted-foreground">
                            Toque para {vehiclesExpanded ? 'recolher' : 'expandir'}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: vehiclesExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {vehiclesExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border"
                        >
                          {vehicles.length >= 10 && (
                            <div className="p-3 border-b border-border">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                  placeholder="Buscar placa..."
                                  value={plateSearch}
                                  onChange={(e) => setPlateSearch(e.target.value)}
                                  className="pl-9 h-9"
                                />
                              </div>
                            </div>
                          )}

                          <div className="divide-y divide-border max-h-80 overflow-y-auto">
                            {filteredVehicles.map((vehicle) => (
                              <div
                                key={vehicle.id}
                                className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                                onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <LicensePlateDisplay
                                      plate={vehicle.plate}
                                      size="sm"
                                      isStolen={vehicle.isStolen}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                      {vehicle.model} • {vehicle.color}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                </div>
                              </div>
                            ))}
                            {filteredVehicles.length === 0 && plateSearch && (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Nenhuma placa encontrada
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </section>

            {/* 2. BLOCO DE AÇÃO (MEIO) */}
            <section className="space-y-4 pt-2">
              <h2 className="text-sm font-medium text-muted-foreground px-1">Ações Rápidas</h2>

              {/* Plate Input */}
              <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <label className="text-sm font-medium text-foreground mb-2 block ml-1">
                  Qual placa você quer contatar?
                </label>
                <LicensePlateInput value={plateValue} onChange={setPlateValue} />
              </div>

              {/* Vehicle Info Card - appears when plate is valid */}
              {/* Vehicle Info Card - appears when plate is valid */}
              <AnimatePresence>
                {isValidPlate(plateValue) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300"
                  >
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-primary blur-3xl" />
                    </div>

                    <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <Disc className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dados do Veículo</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-medium">
                        Verificado
                      </span>
                    </div>

                    <div className="relative z-10">
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-secondary/30 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Marca</p>
                            <p className="text-sm font-bold text-foreground">{vehicleInfo.marca}</p>
                          </div>
                          <div className="bg-secondary/30 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Modelo</p>
                            <p className="text-sm font-bold text-foreground">{vehicleInfo.modelo}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-secondary/30 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Cor</p>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-gray-400 border border-white/20" />
                              <p className="text-sm font-bold text-foreground">{vehicleInfo.cor}</p>
                            </div>
                          </div>
                          <div className="bg-secondary/30 rounded-xl p-3">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Ano</p>
                            <p className="text-sm font-bold text-foreground">{vehicleInfo.ano}</p>
                          </div>
                        </div>
                      </div>

                      {/* DADOS DA SKIN (SE HOUVER) */}
                      {skinInfo && (
                        <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 space-y-4">
                          <div className="flex items-center justify-between border-b border-primary/10 pb-2 mb-1">
                            <div className="flex items-center gap-2">
                              <Palette className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-wider text-primary">Dados da Skin</span>
                            </div>
                            <Badge className={cn(
                              "text-[8px] font-bold uppercase px-2 h-4 border-none shrink-0",
                              skinInfo.rarity === 'lendaria' ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                                skinInfo.rarity === 'epica' ? "bg-purple-500 text-white" : "bg-primary text-white"
                            )}>
                              {skinInfo.rarity}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-0.5">
                              <p className="text-[9px] text-muted-foreground uppercase font-medium tracking-widest leading-none opacity-70">Design da Placa</p>
                              <p className="text-sm font-bold text-foreground uppercase tracking-tighter truncate">{skinInfo.skin.name}</p>
                            </div>
                            <div className="space-y-0.5 text-right">
                              <p className="text-[9px] text-muted-foreground uppercase font-medium tracking-widest leading-none opacity-70">Coleção Oficial</p>
                              <p className="text-xs font-bold text-primary uppercase">{skinInfo.categoryName}</p>
                            </div>
                          </div>

                          {/* Benefícios */}
                          {skinInfo.skin.benefitType !== 'none' && (
                            <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                              <p className="text-[9px] text-primary/80 uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Shield className="w-3 h-3" /> Benefício Ativo
                              </p>
                              <p className="text-xs font-bold text-foreground/90">
                                {skinInfo.skin.benefitDescription || (skinInfo.skin.benefitType === 'coverage' ? `Cobertura Assistencial R$ ${skinInfo.skin.benefitValue?.toLocaleString()}` : 'Vantagem Exclusiva')}
                              </p>
                            </div>
                          )}

                          {/* DNA para Lendárias */}
                          {skinInfo.rarity === 'lendaria' && (
                            <div className="grid grid-cols-3 gap-2 py-1 border-t border-primary/10 pt-3">
                              <div className="text-center p-2 bg-black/30 rounded-lg border border-white/5">
                                <p className="text-[7px] text-muted-foreground uppercase font-medium mb-1">Gênesis</p>
                                <p className="text-[10px] font-mono font-bold text-amber-500 tracking-tight">#1234</p>
                              </div>
                              <div className="text-center p-2 bg-black/30 rounded-lg border border-white/5">
                                <p className="text-[7px] text-muted-foreground uppercase font-medium mb-1">Serial</p>
                                <p className="text-[10px] font-mono font-bold text-amber-500 tracking-tight">LEG-26</p>
                              </div>
                              <div className="text-center p-2 bg-black/30 rounded-lg border border-white/5">
                                <p className="text-[7px] text-muted-foreground uppercase font-medium mb-1">Genes</p>
                                <div className="flex justify-center gap-0.5 mt-0.5">
                                  <div className="w-1 h-2.5 bg-red-500 rounded-full animate-pulse" />
                                  <div className="w-1 h-2.5 bg-blue-500 rounded-full" />
                                  <div className="w-1 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-2 pt-2 border-t border-primary/10">
                            <div className="flex justify-between items-end">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/20 rounded-md border border-primary/20 tracking-tighter">LVL {skinInfo.level}</span>
                                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Evolução</span>
                              </div>
                              <span className="text-[9px] font-medium text-muted-foreground tabular-nums opacity-80">{skinInfo.xp} / 1000 XP</span>
                            </div>
                            <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner p-[1px]">
                              <motion.div
                                className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (skinInfo.xp / 1000) * 100)}%` }}
                                transition={{ duration: 1.5, ease: "circOut" }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="px-4 pb-4">
                        <p className="text-[10px] text-center text-muted-foreground/60">
                          Confirme se as informações correspondem ao veículo visualizado
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mode Selector - Only 3 buttons */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/30 rounded-xl">
                <button
                  onClick={() => setActiveMode(activeMode === "rate" ? null : "rate")}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all ${activeMode === "rate" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                >
                  <ThumbsUp className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium leading-tight text-center">Avaliar Motorista</span>
                </button>
                <button
                  onClick={() => setActiveMode(activeMode === "solidary" ? null : "solidary")}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all ${activeMode === "solidary" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                >
                  <HeartHandshake className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium leading-tight text-center">Alerta Solidário</span>
                </button>
                <button
                  onClick={() => setActiveMode(activeMode === "report" ? null : "report")}
                  className={`flex flex-col items-center justify-center py-3 px-1 rounded-lg transition-all ${activeMode === "report" ? "bg-destructive text-destructive-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/50"
                    }`}
                >
                  <AlertTriangle className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium leading-tight text-center">Denunciar Placa</span>
                </button>
              </div>

              {/* Interaction Area */}
              <AnimatePresence mode="wait">
                {/* Default: Message to Driver (when no mode is selected) */}
                {activeMode === null && (
                  <motion.div
                    key="default-message"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    <div className={`bg-card border rounded-xl p-4 transition-all ${isValidPlate(plateValue) ? 'border-border' : 'border-border/50 opacity-60'}`}>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Mensagem para o motorista
                      </label>
                      <Textarea
                        placeholder={isValidPlate(plateValue) ? "Escreva uma mensagem..." : "Digite uma placa válida acima para enviar mensagem"}
                        className="resize-none min-h-[100px] text-base"
                        maxLength={140}
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        disabled={!isValidPlate(plateValue)}
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {chatMessage.length}/140
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full h-12 font-bold"
                      onClick={handleSendMessage}
                      disabled={!isValidPlate(plateValue) || chatMessage.trim().length === 0}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar mensagem
                    </Button>
                  </motion.div>
                )}

                {activeMode === "rate" && (
                  <motion.div
                    key="rate"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="bg-card border border-border rounded-xl p-4">
                      <RatingForm plateValue={plateValue} onSuccess={handleInteractionSuccess} />
                    </div>
                  </motion.div>
                )}

                {activeMode === "solidary" && (
                  <motion.div
                    key="solidary"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="bg-card border border-border rounded-xl p-4">
                      <SolidaryForm plateValue={plateValue} onSuccess={handleInteractionSuccess} />
                    </div>
                  </motion.div>
                )}

                {activeMode === "report" && (
                  <motion.div
                    key="report"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="bg-card border border-border rounded-xl p-4">
                      <ReportForm plateValue={plateValue} onSuccess={handleInteractionSuccess} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* 3. GRID COLAPSÁVEL (BAIXO) */}
            <div className="pt-4 border-t border-border" ref={legacyActionsRef}>
              <button
                onClick={() => setShowLegacyActions(!showLegacyActions)}
                className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                style={{ marginBottom: showLegacyActions ? '1rem' : 0 }}
              >
                <LayoutGrid className="w-4 h-4" />
                {showLegacyActions ? "Ocultar outras funcionalidades" : "Ver outras funcionalidades"}
                <ChevronDown className={`w-4 h-4 transition-transform ${showLegacyActions ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showLegacyActions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <DashboardGrid
                      menuItems={menuItems}
                      referralItem={referralItem}
                      skinsItem={skinsItem}
                      isVerified={currentUser?.isVerified || false}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </main>
      </div >
    </PageTransition >
  );
};

export default Dashboard;