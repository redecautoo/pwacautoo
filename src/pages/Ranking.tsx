import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, TrendingUp, Star, HelpCircle, Info } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
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
  
  const rankingLevels = [
    { name: 'Iniciante', min: 0, max: 199, color: 'bg-gray-500', description: 'Iniciando sua contribuição na Cautoo' },
    { name: 'Condutor Consciente', min: 200, max: 399, color: 'bg-blue-500', description: 'Contribui regularmente para a comunidade' },
    { name: 'Apoiador Urbano', min: 400, max: 649, color: 'bg-purple-500', description: 'Participação ativa e constante' },
    { name: 'Guardião Viário', min: 650, max: 849, color: 'bg-yellow-500', description: 'Alto nível de contribuição' },
    { name: 'Referência Cautoo', min: 850, max: 1000, color: 'bg-green-500', description: 'Máximo engajamento no ecossistema' },
  ];
  
  const currentLevel = rankingLevels.find(
    l => (currentUser?.icc || 0) >= l.min && (currentUser?.icc || 0) <= l.max
  ) || rankingLevels[0];
  
  const currentLevelIndex = rankingLevels.findIndex(l => l.name === currentLevel.name);
  const nextLevel = rankingLevels[currentLevelIndex + 1];
  
  const progressInLevel = nextLevel 
    ? (((currentUser?.icc || 0) - currentLevel.min) / (currentLevel.max - currentLevel.min + 1)) * 100
    : 100;
  
  const iccHistory = [
    { action: 'Elogio enviado', points: '+1', date: '28/12' },
    { action: 'Alerta útil confirmado', points: '+2', date: '27/12' },
    { action: 'Indicação com cadastro', points: '+5', date: '25/12' },
    { action: 'Decaimento mensal (5%)', points: '-23', date: '01/12' },
    { action: 'Avistamento de roubado', points: '+10', date: '28/11' },
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
                    O <strong className="text-foreground">Índice de Contribuição Cautelar</strong> (ICC) é um índice 
                    <strong className="text-foreground"> interno e privado</strong> que mede exclusivamente o seu nível 
                    de contribuição positiva para a Cautoo. Apenas você pode ver seu ICC.
                  </p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="beneficios" className="border-primary/20">
                  <AccordionTrigger className="text-sm text-primary hover:no-underline py-2">
                    <span className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Para que serve o ICC?
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground space-y-2">
                    <p>• Determina seu nível de ranking dentro da plataforma</p>
                    <p>• Habilita conquistas de selos (Amarelo e Verde)</p>
                    <p>• Libera benefícios e recompensas exclusivas</p>
                    <p>• Mede seu engajamento útil e responsável no ecossistema</p>
                    <p className="text-xs pt-2 border-t border-border mt-2">
                      <strong className="text-foreground">Importante:</strong> O ICC NÃO avalia veículos, 
                      NÃO classifica motoristas publicamente e NÃO mostra reputação para outros usuários.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.section>

            {/* Current ICC */}
            <motion.section 
              className="bg-card border border-border rounded-2xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Seu ICC (privado)</p>
              <p className="text-5xl font-bold text-foreground mb-2">{currentUser?.icc || 0}</p>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${currentLevel.color} text-white text-sm`}>
                <Star className="w-4 h-4" />
                {currentLevel.name}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{currentLevel.description}</p>
            </motion.section>
            
            {/* Progress to next level */}
            {nextLevel && (
              <motion.section 
                className="bg-card border border-border rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">Progresso para {nextLevel.name}</span>
                  <span className="text-sm font-medium text-foreground">
                    {currentUser?.icc || 0} / {nextLevel.min}
                  </span>
                </div>
                <Progress value={progressInLevel} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  Faltam {nextLevel.min - (currentUser?.icc || 0)} pontos
                </p>
              </motion.section>
            )}
            
            {/* Ranking levels */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Níveis do Ranking</h2>
              <div className="space-y-2">
                {rankingLevels.map((level, index) => (
                  <motion.div
                    key={level.name}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      level.name === currentLevel.name
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-secondary/50'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${level.color}`} />
                      <div>
                        <span className={`text-sm ${level.name === currentLevel.name ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                          {level.name}
                        </span>
                        {level.name === currentLevel.name && (
                          <p className="text-xs text-primary">← Você está aqui</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {level.min} - {level.max}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.section>
            
            {/* ICC History */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Histórico de Pontos</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {iccHistory.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className={`text-sm font-medium ${
                      item.points.startsWith('+') ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {item.points}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
            
            {/* How to earn points */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Como ganhar pontos</h2>
              <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Enviar elogio válido</span>
                  <span className="text-green-500 font-medium">+1</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Alerta útil confirmado</span>
                  <span className="text-green-500 font-medium">+2</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avistamento de veículo roubado</span>
                  <span className="text-green-500 font-medium">+10</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avistamento confirmado pelo dono</span>
                  <span className="text-green-500 font-medium">+15</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Indicação com cadastro válido</span>
                  <span className="text-green-500 font-medium">+5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Indicado compra selo azul</span>
                  <span className="text-green-500 font-medium">+10</span>
                </div>
                <div className="flex items-center justify-between text-sm border-t border-border pt-3">
                  <span className="text-muted-foreground">Decaimento mensal</span>
                  <span className="text-red-500 font-medium">-5%</span>
                </div>
              </div>
            </motion.section>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default Ranking;
