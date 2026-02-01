import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, HelpCircle } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { getICCCategoryInfo } from "@/contexts/AppContext";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Ranking = () => {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  // Usar novo sistema de 7 categorias ICC
  const iccInfo = getICCCategoryInfo(currentUser?.icc || 0);

  // Novas 7 categorias ICC
  const iccCategories = [
    { icon: '🔴', label: 'Contribuidor Negativo', min: -999, max: -1, description: 'Comportamento prejudicial à rede' },
    { icon: '⚪', label: 'Iniciante', min: 0, max: 199, description: 'Iniciando sua contribuição' },
    { icon: '🔵', label: 'Colaborador Ativo', min: 200, max: 399, description: 'Contribuições regulares' },
    { icon: '🟣', label: 'Cauteloso Engajado', min: 400, max: 649, description: 'Alto nível de participação' },
    { icon: '🟡', label: 'Protetor da Rede', min: 650, max: 849, description: 'Contribuições significativas' },
    { icon: '🟢', label: 'Embaixador Cautoo', min: 850, max: 1000, description: 'Máximo engajamento' },
    { icon: '💎', label: 'Guardião Elite', min: 1001, max: 9999, description: 'Elite da comunidade' }
  ];

  const currentCategory = iccCategories.find(
    cat => (currentUser?.icc || 0) >= cat.min && (currentUser?.icc || 0) <= cat.max
  ) || iccCategories[1]; // Default to Iniciante

  const currentCategoryIndex = iccCategories.findIndex(c => c.label === currentCategory.label);
  const nextCategory = iccCategories[currentCategoryIndex + 1];

  // Progresso dentro da categoria atual
  const progressInCategory = nextCategory
    ? (((currentUser?.icc || 0) - currentCategory.min) / (currentCategory.max - currentCategory.min + 1)) * 100
    : 100;

  const iccHistory = [
    { action: 'Elogio enviado', points: '+1', date: '28/12' },
    { action: 'Alerta útil confirmado', points: '+2', date: '27/12' },
    { action: 'Indicação com cadastro', points: '+5', date: '25/12' },
    { action: 'Atividade mensal', points: '+2', date: '01/12' },
    { action: 'Avistamento de roubado', points: '+15', date: '28/11' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Meu Ranking ICC</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            {/* O que é ICC */}
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
                  <h2 className="font-semibold text-foreground mb-1">O que é o ICC?</h2>
                  <p className="text-sm text-muted-foreground">
                    O <strong className="text-foreground">Índice de Contribuição Cautelar</strong> (ICC) é um índice <strong className="text-primary">privado 🔒</strong> vinculado ao seu <strong className="text-foreground">CPF</strong>,
                    visível apenas para você. Reflete seu nível de contribuição positiva para a Cautoo com base em <strong className="text-foreground">ações REALIZADAS</strong> por você no ecossistema.
                    Nenhum outro usuário pode ver seu ICC.
                  </p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="beneficios" className="border-primary/20">
                  <AccordionTrigger className="text-sm text-primary hover:no-underline py-2">
                    Para que serve o ICC?
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Determina seu nível de ranking dentro da plataforma</p>
                    <p>• Habilita conquistas de selos (Amarelo e Verde)</p>
                    <p>• Libera benefícios e recompensas exclusivas</p>
                    <p>• Mede seu engajamento útil e responsável no ecossistema</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.section>

            {/* Current ICC Card */}
            <motion.section
              className="bg-card border border-border rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-32 h-32 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-5xl">{iccInfo.icon}</span>
                  <span className={`text-4xl font-bold ${iccInfo.color}`}>
                    {currentUser?.icc || 0}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Seu ICC (privado) 🔒</p>
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${iccInfo.bg} border ${iccInfo.border} text-sm font-medium mb-1`}>
                <span className={iccInfo.color}>{iccInfo.label}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{currentCategory.description}</p>

              {/* Progress bar within category */}
              {nextCategory && (
                <div className="mt-6">
                  <div className="flex justify-between text-xs text-muted-foreground mb-2">
                    <span>{currentCategory.min}</span>
                    <span>Próximo nível: {nextCategory.min}</span>
                    <span>{currentCategory.max}</span>
                  </div>
                  <Progress value={progressInCategory} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    Faltam {nextCategory.min - (currentUser?.icc || 0)} pontos para {nextCategory.label}
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
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">7 Níveis do ICC</h2>
              <div className="space-y-2">
                {iccCategories.map((cat, index) => {
                  const isCurrentLevel = cat.label === currentCategory.label;
                  return (
                    <motion.div
                      key={cat.label}
                      className={`flex items-center justify-between p-4 rounded-xl ${isCurrentLevel
                        ? `${iccInfo.bg} border ${iccInfo.border}`
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
                            <p className={`text-xs ${iccInfo.color} font-medium`}>← Você está aqui</p>
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

            {/* ICC History */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Histórico de Pontos</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {iccHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className={`text-sm font-medium ${item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'
                      }`}>
                      {item.points}
                    </span>
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

export default Ranking;
