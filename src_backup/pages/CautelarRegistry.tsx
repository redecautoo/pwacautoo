import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  Shield,
  FileCheck,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { 
  getCautelarStatusName, 
  getCautelarStatusColor, 
  getOccurrenceTypeName 
} from "@/lib/types";
import SealRequiredNotice from "@/components/SealRequiredNotice";

const CautelarRegistry = () => {
  const navigate = useNavigate();
  const { getCautelarRegistriesForUser, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  
  const registries = getCautelarRegistriesForUser();
  
  const activeRegistries = registries.filter(r => 
    ['aguardando_confirmacao', 'em_andamento', 'mediacao_pendente', 'mediacao_pagamento'].includes(r.status)
  );
  
  const historyRegistries = registries.filter(r => 
    ['resolvido_acordo', 'sem_resolucao', 'mediacao_concluida'].includes(r.status)
  );

  const hasBlueOrHigherSeal = currentUser?.seal === 'blue' || currentUser?.seal === 'yellow' || currentUser?.seal === 'green';
  const hasGreenSeal = currentUser?.seal === 'green';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'aguardando_confirmacao':
        return <Clock className="w-4 h-4" />;
      case 'em_andamento':
      case 'mediacao_pendente':
      case 'mediacao_pagamento':
        return <AlertTriangle className="w-4 h-4" />;
      case 'resolvido_acordo':
      case 'mediacao_concluida':
        return <CheckCircle className="w-4 h-4" />;
      case 'sem_resolucao':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (!hasBlueOrHigherSeal) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Registro Cautelar</h1>
            </div>
          </header>
          
          <SealRequiredNotice featureReason="Registros de ocorrência exigem verificação para garantir autenticidade e segurança." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Registro Cautelar</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Registros validados pela Cautoo
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Registre e resolva ocorrências entre veículos de forma segura, com emissão de certidão digital.
                  </p>
                </motion.div>

                {hasGreenSeal && (
                  <motion.div
                    className="bg-green-500/10 border border-green-500/30 rounded-xl p-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-600 dark:text-green-400 mb-1">Selo Verde Ativo</h4>
                        <p className="text-sm text-muted-foreground">
                          Como motorista com Selo Verde, você tem acesso ao suporte da Cautoo em mediações e facilidades de pagamento para ocorrências registradas.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={() => navigate("/cautelar-registry/new")}
                  className="w-full py-6 bg-gradient-to-r from-primary to-primary/80"
                  size="lg"
                  data-testid="button-new-registry"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Nova Ocorrência
                </Button>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "active" | "history")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="active" className="flex items-center gap-2" data-testid="tab-active">
                  <Clock className="w-4 h-4" />
                  Em Andamento
                  {activeRegistries.length > 0 && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                      {activeRegistries.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2" data-testid="tab-history">
                  <FileCheck className="w-4 h-4" />
                  Histórico
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="mt-4">
                {activeRegistries.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhuma ocorrência ativa</p>
                    <p className="text-sm text-muted-foreground">
                      Inicie um novo registro quando houver uma ocorrência
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {activeRegistries.map((registry) => (
                      <motion.div
                        key={registry.id}
                        className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                        variants={staggerItemVariants}
                        onClick={() => navigate(`/cautelar-registry/${registry.id}`)}
                        data-testid={`registry-${registry.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">{registry.registryNumber}</span>
                            <h4 className="font-medium text-foreground">{getOccurrenceTypeName(registry.occurrenceType)}</h4>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getCautelarStatusColor(registry.status)}`}>
                            {getStatusIcon(registry.status)}
                            {getCautelarStatusName(registry.status)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{registry.location}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {registry.participants.slice(0, 3).map((p, i) => (
                              <span key={i} className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                                {p.plate}
                              </span>
                            ))}
                            {registry.participants.length > 3 && (
                              <span className="text-xs text-muted-foreground">+{registry.participants.length - 3}</span>
                            )}
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                {historyRegistries.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-8 text-center">
                    <FileCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">Nenhum registro finalizado</p>
                    <p className="text-sm text-muted-foreground">
                      Seus registros resolvidos aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {historyRegistries.map((registry) => (
                      <motion.div
                        key={registry.id}
                        className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
                        variants={staggerItemVariants}
                        onClick={() => navigate(`/cautelar-registry/${registry.id}`)}
                        data-testid={`registry-history-${registry.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="font-mono text-sm text-muted-foreground">{registry.registryNumber}</span>
                            <h4 className="font-medium text-foreground">{getOccurrenceTypeName(registry.occurrenceType)}</h4>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getCautelarStatusColor(registry.status)}`}>
                            {getStatusIcon(registry.status)}
                            {getCautelarStatusName(registry.status)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{formatDate(registry.createdAt)}</span>
                          {registry.certificate && (
                            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
                              <FileCheck className="w-3 h-3" />
                              Certidão
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default CautelarRegistry;
