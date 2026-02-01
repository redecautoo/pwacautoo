import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Car,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  Shield,
  Clock,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { getScoreCategoryInfo } from "@/contexts/AppContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PageTransition } from "@/components/PageTransition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const VehicleScore = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { vehicles, currentUser } = useApp();

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

  // Usar novo sistema de 7 categorias
  const scoreInfo = getScoreCategoryInfo(vehicle.score);

  // 7 categorias do Score
  const scoreCategories = [
    { icon: '🔴', label: 'Placa em Alerta', min: -999, max: -1, description: 'Score negativo - atenção necessária' },
    { icon: '⚪', label: 'Placa Neutra', min: 0, max: 199, description: 'Sem histórico significativo' },
    { icon: '🔵', label: 'Placa Conhecida', min: 200, max: 399, description: 'Histórico positivo básico' },
    { icon: '🟣', label: 'Placa Confiável', min: 400, max: 649, description: 'Boa reputação estabelecida' },
    { icon: '🟡', label: 'Placa Distinta', min: 650, max: 849, description: 'Excelente reputação' },
    { icon: '🟢', label: 'Placa Exemplar', min: 850, max: 1000, description: 'Reputação impecável' },
    { icon: '💎', label: 'Placa Ícone Cautoo', min: 1001, max: 9999, description: 'Referência máxima' }
  ];

  const currentCategory = scoreCategories.find(
    cat => vehicle.score >= cat.min && vehicle.score <= cat.max
  ) || scoreCategories[1]; // Default to Neutra

  const currentCategoryIndex = scoreCategories.findIndex(c => c.label === currentCategory.label);
  const nextCategory = scoreCategories[currentCategoryIndex + 1];

  // Progresso dentro da categoria atual
  const progressInCategory = nextCategory
    ? ((vehicle.score - currentCategory.min) / (currentCategory.max - currentCategory.min + 1)) * 100
    : 100;

  // Dados de evolução do score nos últimos 6 meses
  const scoreEvolution = [
    { month: "Ago", score: 72 },
    { month: "Set", score: 75 },
    { month: "Out", score: 78 },
    { month: "Nov", score: 74 },
    { month: "Dez", score: 80 },
    { month: "Jan", score: vehicle.score },
  ];

  // Histórico mockado de eventos que afetaram o score
  const scoreHistory = [
    { action: "Elogio recebido", points: "+2", date: "08/01", icon: ThumbsUp, positive: true },
    { action: "Alerta recebido", points: "-1", date: "05/01", icon: AlertTriangle, positive: false },
    { action: "Selo Azul (mensal)", points: "+5", date: "01/01", icon: Shield, positive: true },
    { action: "Decaimento mensal", points: "-2", date: "01/12", icon: Clock, positive: false },
  ];

  // Fatores que afetam o score
  const scoreFactors = [
    {
      label: "Elogios recebidos",
      description: "Cada elogio válido aumenta o score",
      impact: "+2 pontos",
      icon: ThumbsUp,
      color: "text-green-500"
    },
    {
      label: "Alertas recebidos",
      description: "Alertas válidos de outros usuários",
      impact: "-1 a -5 pontos",
      icon: MessageSquare,
      color: "text-orange-500"
    },
    {
      label: "Críticas convergentes",
      description: "Múltiplos alertas do mesmo tipo",
      impact: "-5 a -15 pontos",
      icon: AlertTriangle,
      color: "text-red-500"
    },
    {
      label: "Selo Azul ativo",
      description: "Proteção contra alertas inválidos",
      impact: "+5/mês",
      icon: Shield,
      color: "text-blue-500"
    },
    {
      label: "Decaimento mensal",
      description: "Score decai 3% se não houver atividade",
      impact: "-3% ao mês",
      icon: Clock,
      color: "text-muted-foreground"
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate(`/vehicle/${vehicleId}`)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Score do Veículo</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">

            {/* O que é o Score */}
            <motion.section
              className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-1">O que é o Score da Placa?</h2>
                  <p className="text-sm text-muted-foreground">
                    O <strong className="text-foreground">Score do Veículo</strong> é um índice <strong className="text-blue-500">público 🔓</strong> vinculado à <strong className="text-foreground">placa</strong>,
                    visível para todos os usuários. Reflete a reputação do veículo na Cautoo com base em <strong className="text-foreground">interações RECEBIDAS</strong> (elogios e alertas).
                    Os detalhes específicos dos alertas são <strong className="text-foreground">privados</strong> e apenas o proprietário pode vê-los.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="purpose" className="border-blue-500/20">
                  <AccordionTrigger className="text-sm text-blue-500 hover:no-underline py-2">
                    Para que serve o Score?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Indica a confiabilidade de um veículo na plataforma</p>
                    <p>• Alerta outros usuários sobre possíveis problemas ou comportamentos</p>
                    <p>• Valoriza veículos com bom histórico (Selo Azul)</p>
                    <p>• Promove a segurança e transparência nas ruas</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.section>

            {/* Score atual */}
            <motion.section
              className="bg-card border border-border rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-lg font-bold text-foreground tracking-wider">
                  {vehicle.plate}
                </span>
                <VerifiedBadge isVerified={currentUser?.isVerified || false} size="sm" />
              </div>

              <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl">{scoreInfo.icon}</span>
                  <span className={`text-4xl font-bold ${scoreInfo.color}`}>
                    {vehicle.score}
                  </span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${scoreInfo.bg} border ${scoreInfo.border} text-sm font-medium mb-1`}>
                <span className={scoreInfo.color}>{scoreInfo.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{currentCategory.description}</p>

              {/* Barra de progresso dentro da categoria */}
              {nextCategory && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{currentCategory.min < 0 ? '< 0' : currentCategory.min}</span>
                    <span>Próximo nível: {nextCategory.min}</span>
                    <span>{currentCategory.max >= 9999 ? `${currentCategory.min}+` : currentCategory.max}</span>
                  </div>
                  <Progress value={progressInCategory} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Faltam {nextCategory.min - vehicle.score} pontos para {nextCategory.label}
                  </p>
                </div>
              )}
            </motion.section>

            {/* 7 Categories List */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">7 Categorias do Score</h2>
              <div className="space-y-2">
                {scoreCategories.map((cat, index) => {
                  const isCurrentLevel = cat.label === currentCategory.label;
                  return (
                    <motion.div
                      key={cat.label}
                      className={`flex items-center justify-between p-4 rounded-xl ${isCurrentLevel
                        ? `${scoreInfo.bg} border ${scoreInfo.border}`
                        : 'bg-card border border-border'
                        }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{cat.icon}</span>
                        <div>
                          <span className={`text-sm font-medium block ${isCurrentLevel ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {cat.label}
                          </span>
                          {isCurrentLevel && (
                            <p className={`text-xs ${scoreInfo.color} font-medium`}>← Sua placa está aqui</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {cat.min < 0 ? '< 0' : cat.max >= 9999 ? `${cat.min}+` : `${cat.min}-${cat.max}`}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Histórico de Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Histórico Recente</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {scoreHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className={`text-sm font-medium ${item.positive ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Fatores que afetam o Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Como funciona o Score</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {scoreFactors.map((factor, i) => (
                  <div key={i} className="p-4">
                    <div className="flex items-start gap-3">
                      <factor.icon className={`w-5 h-5 ${factor.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{factor.label}</span>
                          <span className={`text-sm font-bold ${factor.color}`}>{factor.impact}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VehicleScore;