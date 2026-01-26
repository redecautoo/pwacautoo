import { useState } from "react";
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
  Car,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Clock,
  Lock,
  ParkingCircle,
  Wallet,
  FileText,
  Shield,
  Building2,
  HandHeart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants, cardVariants } from "@/components/PageTransition";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { SealBadge } from "@/components/SealBadge";
import cautooLogo from "@/assets/cautoo-logo.png";

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser, vehicles, alerts, logout } = useApp();
  const [vehiclesExpanded, setVehiclesExpanded] = useState(false);
  const [plateSearch, setPlateSearch] = useState("");
  
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  
  // Filtrar veículos pela busca
  const filteredVehicles = vehicles.filter(v => 
    v.plate.toUpperCase().includes(plateSearch.toUpperCase())
  );
  
  const menuItems = [
    { icon: Bell, label: "Meus Alertas", path: "/alerts", badge: unreadAlerts, color: "text-sky-400", bg: "bg-sky-500/20" },
    { icon: Wallet, label: "CauCash", path: "/garagem/caucash", color: "text-emerald-400", bg: "bg-emerald-500/20" },
    { icon: ParkingCircle, label: "Garagem", path: "/garagem", color: "text-blue-400", bg: "bg-blue-500/20" },
    { icon: Send, label: "Enviar Alerta", path: "/send-alert", color: "text-orange-400", bg: "bg-orange-500/20" },
    { icon: HandHeart, label: "Alerta Solidário", path: "/solidary-socorro", color: "text-rose-400", bg: "bg-rose-500/20" },
    { icon: Star, label: "Avaliar Motorista", path: "/rate-driver", color: "text-lime-400", bg: "bg-lime-500/20" },
    { icon: AlertTriangle, label: "Veículo Roubado", path: "/stolen", color: "text-red-400", bg: "bg-red-500/20" },
    { icon: Shield, label: "Registro Cautelar", path: "/cautelar-registry", color: "text-indigo-400", bg: "bg-indigo-500/20" },
    { icon: Users, label: "Frota de Amigos", path: "/friends", color: "text-emerald-400", bg: "bg-emerald-500/20" },
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
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Renderizar veículo individual (padrão único para todos os cenários)
  const renderVehicle = (vehicle: typeof vehicles[0], index: number) => {
    const isBlocked = vehicle.claimStatus === 'pending';
    
    return (
      <motion.div
        key={vehicle.id}
        className={`bg-card border rounded-xl p-4 cursor-pointer transition-colors ${
          isBlocked 
            ? 'border-amber-500/50 bg-amber-500/5' 
            : 'border-border hover:bg-secondary/50'
        }`}
        variants={staggerItemVariants}
        custom={index}
        onClick={() => navigate(`/vehicle/${vehicle.id}`)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              isBlocked ? 'bg-amber-500/20' : 'bg-primary/10'
            }`}>
              {isBlocked ? (
                <Clock className="w-6 h-6 text-amber-500" />
              ) : (
                <Car className="w-6 h-6 text-primary" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground tracking-wider">
                  {vehicle.plate}
                </span>
                {isBlocked ? (
                  <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Em análise
                  </span>
                ) : (
                  <>
                    {/* Mostra selo conquistado ou selo azul de verificado */}
                    {(currentUser?.seal && currentUser.seal !== 'none') ? (
                      <SealBadge seal={currentUser.seal} size="sm" animated={false} />
                    ) : (
                      <VerifiedBadge isVerified={currentUser?.isVerified || false} size="sm" />
                    )}
                  </>
                )}
                {vehicle.isStolen && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                    ROUBADO
                  </span>
                )}
              </div>
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
            {isBlocked ? (
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
            ) : (
              <div className="text-right">
                <div className="text-xl font-bold text-primary">{vehicle.score}</div>
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
      <div className="min-h-screen bg-background">
        
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar com selo - mostra o selo conquistado (verde > amarelo > azul) */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <span className="text-lg font-bold text-primary">
                      {currentUser?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {/* Exibe selo conquistado ou selo azul de verificado */}
                  {(currentUser?.seal && currentUser.seal !== 'none') ? (
                    <div className="absolute -bottom-1 -right-1">
                      <SealBadge seal={currentUser.seal} size="sm" />
                    </div>
                  ) : currentUser?.isVerified && (
                    <div className="absolute -bottom-1 -right-1">
                      <VerifiedBadge isVerified={true} size="sm" />
                    </div>
                  )}
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
          <div className="max-w-lg mx-auto space-y-6">
            {/* Vehicles */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">Meus Veículos</h2>
                {/* Botão adicionar placa - só mostra se tem selo */}
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
                    <Car className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
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
                  // Se tem apenas 1 veículo, mostrar diretamente
                  renderVehicle(vehicles[0], 0)
                ) : (
                  // Se tem mais de 1, mostrar botão colapsável
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                      onClick={() => setVehiclesExpanded(!vehiclesExpanded)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary" />
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
                          {/* Filtro de pesquisa para 10+ placas */}
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
                                    <Car className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-foreground tracking-wider">
                                          {vehicle.plate}
                                        </span>
                                        {/* Mostra selo conquistado ou selo azul de verificado */}
                                        {(currentUser?.seal && currentUser.seal !== 'none') ? (
                                          <SealBadge seal={currentUser.seal} size="sm" animated={false} />
                                        ) : (
                                          <VerifiedBadge isVerified={currentUser?.isVerified || false} size="sm" />
                                        )}
                                        {vehicle.ownershipType === 'assinatura' && vehicle.subscriptionInfo && (
                                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded" title={`${vehicle.subscriptionInfo.companyName} - Até ${new Date(vehicle.subscriptionInfo.contractEndDate).toLocaleDateString('pt-BR')}`}>
                                            <Building2 className="w-3 h-3" />
                                            Assinatura
                                          </span>
                                        )}
                                        {vehicle.ownershipType === 'proprio' && vehicle.insuranceInfo && (
                                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded" title={`${vehicle.insuranceInfo.companyName} - Até ${new Date(vehicle.insuranceInfo.endDate).toLocaleDateString('pt-BR')}`}>
                                            <Shield className="w-3 h-3" />
                                            Com seguro
                                          </span>
                                        )}
                                        {vehicle.ownershipType === 'proprio' && !vehicle.insuranceInfo && (
                                          <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                                            <Car className="w-3 h-3" />
                                            Sem seguro
                                          </span>
                                        )}
                                        {vehicle.isStolen && (
                                          <span className="text-xs bg-destructive text-destructive-foreground px-2 py-0.5 rounded">
                                            ROUBADO
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {vehicle.model} • {vehicle.color}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <div className="text-lg font-bold text-primary">{vehicle.score}</div>
                                    </div>
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
            
            {/* Menu Grid */}
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Ações</h2>
              <motion.div 
                className="grid grid-cols-2 gap-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  // Verificar se o item requer verificação e o usuário não tem
                  const isLocked = (item as any).requiresVerified && !currentUser?.isVerified;
                  
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`relative bg-card border border-border rounded-xl p-4 text-left transition-colors ${
                        isLocked ? 'opacity-60' : 'hover:bg-secondary/50'
                      }`}
                      variants={staggerItemVariants}
                      custom={index}
                      whileHover={isLocked ? {} : { scale: 1.03, y: -2 }}
                      whileTap={isLocked ? {} : { scale: 0.97 }}
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                        <IconComponent className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <motion.span 
                          className="absolute top-3 right-3 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
                
                {/* Botão de Indicação - Destaque especial (largura dupla) */}
                <motion.button
                  onClick={() => navigate(referralItem.path)}
                  className="relative col-span-2 rounded-xl p-5 text-left transition-all shadow-lg hover:shadow-xl bg-gradient-to-r from-emerald-500 to-teal-500 border-0"
                  variants={staggerItemVariants}
                  custom={menuItems.length}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-white block">
                        {referralItem.label}
                      </span>
                      <span className="text-sm text-white/80">
                        Ganhe pontos indicando amigos
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80" />
                  </div>
                </motion.button>
              </motion.div>
            </section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Dashboard;