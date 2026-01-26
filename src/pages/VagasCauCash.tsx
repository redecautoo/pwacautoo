import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Wallet, 
  Plus, 
  History, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2,
  QrCode,
  Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

const VagasCauCash = () => {
  const navigate = useNavigate();
  const { cauCashTransactions, currentUser, cauCashBalance, addTransaction } = useApp();
  const [activeTab, setActiveTab] = useState("saldo");
  const [recharging, setRecharging] = useState<number | null>(null);
  const [showPix, setShowPix] = useState(false);

  const predefinedValues = [30, 50, 100, 200, 400, 800];
  const [filter, setFilter] = useState("todos");

  // Transações unificadas do AppContext
  const allTransactions = useMemo(() => {
    return cauCashTransactions.map(t => ({
      id: t.id,
      tipo: t.type === 'credit' ? 'credito' as const : 'debito' as const,
      valor: t.amount,
      descricao: t.description,
      status: t.category,
      createdAt: t.date,
    })).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [cauCashTransactions]);

  const filteredMovimentacoes = allTransactions.filter(mov => {
    if (filter === "todos") return true;
    if (filter === "entradas") return mov.tipo === 'credito';
    if (filter === "saidas") return mov.tipo === 'debito';
    return true;
  });

  const handleRecharge = (valor: number) => {
    toast.info(`Simulação: Recarga de R$${valor} iniciada`);
    setRecharging(valor);
    setShowPix(true);
  };

  const confirmPayment = () => {
    if (recharging) {
      addTransaction({
        type: 'credit',
        amount: recharging,
        description: 'Recarga CauCash',
        category: 'Recarga'
      });
      toast.success("Recarga realizada com sucesso!");
      setShowPix(false);
      setRecharging(null);
      setActiveTab("saldo");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold text-foreground">CauCash</h1>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="saldo">Saldo</TabsTrigger>
                <TabsTrigger value="recarga">Recarregar</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
              </TabsList>

              {/* ABA: SALDO */}
              <TabsContent value="saldo" className="space-y-6 mt-6">
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-0 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Wallet className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8 text-white relative z-10">
                    <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Saldo Disponível</p>
                    <h2 className="text-5xl font-black mt-2">R$ {cauCashBalance.toFixed(2)}</h2>
                    <p className="mt-4 text-emerald-50 text-sm opacity-90">
                      Use seu CauCash para pagar reservas e serviços com um toque.
                    </p>
                  </CardContent>
                </Card>

                <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Wallet className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">
                    Adicione créditos ao seu CauCash e pague tudo dentro do app com facilidade. Sem precisar fazer PIX a cada transação.
                  </p>
                  <Button className="w-full" onClick={() => setActiveTab("recarga")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Créditos
                  </Button>
                </div>
                
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-muted-foreground"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para o App
                </Button>
              </TabsContent>

              {/* ABA: RECARGA */}
              <TabsContent value="recarga" className="space-y-6 mt-6">
                {!showPix ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold px-1">Escolha um valor</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {predefinedValues.map((valor) => (
                        <Button
                          key={valor}
                          variant="outline"
                          className="h-20 text-xl font-bold hover:border-primary hover:text-primary transition-all bg-card"
                          onClick={() => handleRecharge(valor)}
                        >
                          R$ {valor}
                        </Button>
                      ))}
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Valor mínimo de recarga: R$ 30,00 • Somente via PIX
                    </p>
                    <Button 
                      variant="ghost" 
                      className="w-full mt-4 text-muted-foreground"
                      onClick={() => setActiveTab("saldo")}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Voltar
                    </Button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                  >
                    <div className="bg-card border border-border rounded-xl p-6 text-center space-y-4">
                      <h3 className="text-lg font-semibold">Pagamento via PIX</h3>
                      <p className="text-sm text-muted-foreground">
                        Finalize o pagamento de <strong>R$ {recharging}</strong> para atualizar seu saldo.
                      </p>
                      
                      <div className="w-48 h-48 bg-white p-2 rounded-xl mx-auto border-2 border-secondary shadow-inner">
                        <QrCode className="w-full h-full text-black" />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground uppercase font-bold">PIX Copia e Cola</p>
                        <div className="flex gap-2">
                          <Input 
                            value="00020126580014br.gov.bcb.pix0136..." 
                            readOnly 
                            className="bg-secondary/30 font-mono text-xs"
                          />
                          <Button size="icon" variant="outline" onClick={() => toast.success("Link copiado!")}>
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 space-y-2">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={confirmPayment}>
                          Confirmar Pagamento
                        </Button>
                        <Button variant="ghost" className="w-full" onClick={() => setShowPix(false)}>
                          Voltar para seleção
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              {/* ABA: HISTÓRICO */}
              <TabsContent value="historico" className="mt-6 space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {["todos", "entradas", "saidas"].map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(f)}
                      className="capitalize whitespace-nowrap"
                    >
                      {f}
                    </Button>
                  ))}
                </div>

                {filteredMovimentacoes.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-card border border-dashed border-border rounded-xl">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Nenhuma movimentação registrada ainda.</p>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredMovimentacoes.map((mov, index) => {
                      const isPositive = mov.tipo === 'credito';
                      return (
                        <motion.div
                          key={mov.id}
                          variants={staggerItemVariants}
                          custom={index}
                          className="bg-card border border-border rounded-xl p-4 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              mov.tipo === 'credito' ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-sky-500/10 text-sky-500'
                            }`}>
                              {mov.tipo === 'credito' && <TrendingUp className="w-5 h-5" />}
                              {mov.tipo === 'debito' && <TrendingDown className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-foreground">{mov.descricao}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(mov.createdAt).toLocaleDateString('pt-BR')} • {new Date(mov.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isPositive ? 'text-emerald-500' : 'text-foreground'}`}>
                              {isPositive ? '+' : '-'} R$ {mov.valor.toFixed(2)}
                            </p>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground opacity-60">
                              {mov.status}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
                
                <Button 
                  variant="ghost" 
                  className="w-full mt-4 text-muted-foreground"
                  onClick={() => setActiveTab("saldo")}
                >
                  Voltar para CauCash
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasCauCash;
