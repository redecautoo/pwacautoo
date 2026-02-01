import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Car, 
  Calendar as CalendarIcon, 
  Users, 
  Home as HomeIcon,
  MapPin,
  Clock,
  Wallet,
  ArrowLeft,
  Star,
  Building2,
  CalendarDays,
  ParkingCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";

const VagasHome = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();
  const { meusCondominios, minhasVagas, minhasReservas, reservasRecebidas, getIRCV, saldo } = useVagas();
  const [searchTerm, setSearchTerm] = useState("");

  const ircv = currentUser ? getIRCV(currentUser.id) : 50;
  const isVinculado = meusCondominios.length > 0;
  
  const menuItems = [
    { 
      icon: Building2, 
      label: "Meus Condomínios", 
      description: `${meusCondominios.length} condomínio(s)`,
      path: "/garagem/condominios",
      color: "text-blue-400", 
      bg: "bg-blue-500/20" 
    },
    { 
      icon: ParkingCircle, 
      label: "Minha Garagem", 
      description: `${minhasVagas.length} garagem(ns) cadastrada(s)`,
      path: "/garagem/minhas-vagas",
      color: "text-green-400", 
      bg: "bg-green-500/20" 
    },
    { 
      icon: CalendarDays, 
      label: "Minhas Reservas", 
      description: `${minhasReservas.length} reserva(s) ativa(s)`,
      path: "/garagem/minhas-reservas",
      color: "text-emerald-400", 
      bg: "bg-emerald-500/20" 
    },
    { 
      icon: CalendarDays, 
      label: "Reservas Recebidas", 
      description: `${reservasRecebidas.length} reserva(s)`,
      path: "/garagem/reservas-recebidas",
      color: "text-orange-400", 
      bg: "bg-orange-500/20" 
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/dashboard")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Garagem</h1>
                <p className="text-sm text-muted-foreground">Alugue garagens no seu condomínio</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Empty State - Quando não está vinculado a nenhum condomínio */}
            {!isVinculado ? (
              <motion.div
                className="flex flex-col items-center justify-center py-12 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Você não está vinculado a nenhum condomínio
                </h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Para alugar ou oferecer uma vaga de estacionamento, você precisa estar vinculado a um condomínio.
                </p>
                
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button 
                    onClick={() => navigate("/garagem/buscar")}
                    className="w-full"
                    size="lg"
                    data-testid="button-search-condominio"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Condomínio
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/garagem/novo-condominio")}
                    className="w-full"
                    size="lg"
                    data-testid="button-create-condominio"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Condomínio
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* IRC-V Score Card */}
                <motion.div 
                  className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Seu IRC-V</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Índice de Reputação de Vagas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-2xl font-bold text-primary">{ircv}</span>
                      <span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </motion.div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar condomínio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => navigate(`/garagem/buscar?q=${encodeURIComponent(searchTerm)}`)}
                    >
                      Buscar
                    </Button>
                  )}
                </div>

                {/* Menu Items */}
                <motion.div 
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {menuItems.map((item, index) => (
                    <motion.button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className="w-full bg-card border border-border rounded-xl p-4 text-left transition-colors hover:bg-secondary/50"
                      variants={staggerItemVariants}
                      custom={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg ${item.bg} flex items-center justify-center`}>
                            <item.icon className={`w-6 h-6 ${item.color}`} />
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{item.label}</span>
                            <span className="text-sm text-muted-foreground">{item.description}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </motion.button>
                  ))}
                </motion.div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-sm text-blue-400">
                    <strong>Como funciona:</strong> Cadastre seu condomínio, adicione suas garagens e 
                    disponibilize para outros moradores alugarem. Você define o preço!
                  </p>
                </div>
              </>
            )}

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasHome;

