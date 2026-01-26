import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Car, 
  TrendingUp, 
  TrendingDown,
  Shield,
  AlertTriangle,
  ThumbsUp,
  MessageSquare,
  Clock,
  Info,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { PageTransition } from "@/components/PageTransition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

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

  // Determinar cor do score baseado no valor
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Excelente", color: "bg-green-500", description: "Placa com ótima reputação" };
    if (score >= 60) return { level: "Bom", color: "bg-yellow-500", description: "Placa com boa reputação" };
    if (score >= 40) return { level: "Regular", color: "bg-orange-500", description: "Placa com reputação moderada" };
    return { level: "Baixo", color: "bg-red-500", description: "Placa com reputação comprometida" };
  };

  const scoreInfo = getScoreLevel(vehicle.score);

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
    { action: "Alerta de farol queimado", points: "-1", date: "05/01", icon: MessageSquare, positive: false },
    { action: "Elogio recebido", points: "+2", date: "02/01", icon: ThumbsUp, positive: true },
    { action: "Decaimento mensal", points: "-3", date: "01/01", icon: Clock, positive: false },
    { action: "Elogio recebido", points: "+2", date: "28/12", icon: ThumbsUp, positive: true },
  ];

  // Fatores que compõem o score
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
      impact: "Validação prévia",
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
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground mb-1">O que é o Score do Veículo?</h2>
                  <p className="text-sm text-muted-foreground">
                    O <strong className="text-foreground">Score do Veículo</strong> é um índice 
                    <strong className="text-foreground"> privado</strong> associado à <strong className="text-foreground">placa</strong>, 
                    visível apenas para o proprietário. Reflete a reputação do veículo na Cautoo baseado em alertas e elogios recebidos.
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="diferenca" className="border-primary/20">
                  <AccordionTrigger className="text-sm text-primary hover:no-underline py-2">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Qual a diferença entre Score e ICC?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-3">
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="font-medium text-foreground mb-1">📊 Score do Veículo (PLACA)</p>
                      <p className="text-xs">• Índice PRIVADO da placa</p>
                      <p className="text-xs">• Baseado em alertas e elogios RECEBIDOS</p>
                      <p className="text-xs">• Reflete a reputação do veículo</p>
                      <p className="text-xs">• Visível apenas para o proprietário</p>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="font-medium text-foreground mb-1">🏆 ICC do Usuário (CPF)</p>
                      <p className="text-xs">• Índice PRIVADO do usuário</p>
                      <p className="text-xs">• Baseado em ações REALIZADAS pelo usuário</p>
                      <p className="text-xs">• Mede contribuição para a rede</p>
                      <p className="text-xs">• Visível apenas para o próprio usuário</p>
                    </div>
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
              
              <div className="w-28 h-28 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4 relative">
                <span className={`text-5xl font-bold ${getScoreColor(vehicle.score)}`}>
                  {vehicle.score}
                </span>
                <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${scoreInfo.color} flex items-center justify-center`}>
                  {vehicle.score >= 50 ? (
                    <TrendingUp className="w-4 h-4 text-white" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${scoreInfo.color} text-white text-sm font-medium`}>
                {scoreInfo.level}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{scoreInfo.description}</p>
              
              {/* Barra de progresso */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                </div>
                <Progress value={vehicle.score} className="h-2" />
              </div>
            </motion.section>

            {/* Gráfico de Evolução */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Evolução do Score (últimos 6 meses)</h2>
              <div className="bg-card border border-border rounded-2xl p-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={scoreEvolution}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        stroke="hsl(var(--border))" 
                        vertical={false}
                      />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      />
                      <YAxis 
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        ticks={[0, 25, 50, 75, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 'bold' }}
                        itemStyle={{ color: 'hsl(var(--primary))' }}
                        formatter={(value: number) => [`${value} pontos`, 'Score']}
                      />
                      <ReferenceLine 
                        y={50} 
                        stroke="hsl(var(--muted-foreground))" 
                        strokeDasharray="3 3" 
                        strokeOpacity={0.5}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#scoreGradient)" 
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-center flex-1">
                    <p className="text-xs text-muted-foreground">Mínimo</p>
                    <p className="text-lg font-bold text-foreground">
                      {Math.min(...scoreEvolution.map(s => s.score))}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-muted-foreground">Média</p>
                    <p className="text-lg font-bold text-foreground">
                      {Math.round(scoreEvolution.reduce((a, b) => a + b.score, 0) / scoreEvolution.length)}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-border" />
                  <div className="text-center flex-1">
                    <p className="text-xs text-muted-foreground">Máximo</p>
                    <p className="text-lg font-bold text-foreground">
                      {Math.max(...scoreEvolution.map(s => s.score))}
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Como o Score é calculado */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Como o Score é calculado</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {scoreFactors.map((factor, index) => {
                  const IconComponent = factor.icon;
                  return (
                    <motion.div 
                      key={index}
                      className="p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center flex-shrink-0`}>
                          <IconComponent className={`w-4 h-4 ${factor.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{factor.label}</span>
                            <span className={`text-xs font-medium ${factor.color}`}>{factor.impact}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{factor.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>

            {/* Histórico do Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Histórico de Eventos</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {scoreHistory.map((item, i) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={i} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${item.positive ? 'bg-green-500/10' : 'bg-red-500/10'} flex items-center justify-center`}>
                          <IconComponent className={`w-4 h-4 ${item.positive ? 'text-green-500' : 'text-red-500'}`} />
                        </div>
                        <div>
                          <p className="text-sm text-foreground">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.date}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        item.positive ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {item.points}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Dicas para melhorar o Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Como melhorar o Score</h2>
              <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl p-5">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-green-500 font-bold">1</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Dirija com respeito</strong> — Evite comportamentos que gerem alertas de outros motoristas
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-green-500 font-bold">2</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Mantenha o veículo em dia</strong> — Faróis, luzes e documentação evitam alertas
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-green-500 font-bold">3</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Ative o Selo Azul</strong> — Protege contra alertas inválidos e aumenta credibilidade
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VehicleScore;