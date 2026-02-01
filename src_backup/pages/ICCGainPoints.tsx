import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

const ICCGainPoints = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">Como ganhar pontos no ICC</h1>
                    </div>
                </header>

                <main className="px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-6">
                        <motion.section
                            className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start gap-3">
                                <Star className="w-6 h-6 text-purple-500 flex-shrink-0" />
                                <div>
                                    <h2 className="font-bold text-lg mb-2">Aumente seu ICC</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Seu ICC cresce quando você contribui positivamente para a rede Cautoo.
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Faixas de Pontuação do ICC</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                {[
                                    { icon: '🔴', label: 'Contribuidor Negativo', range: '< 0' },
                                    { icon: '⚪', label: 'Iniciante', range: '0 - 199' },
                                    { icon: '🔵', label: 'Colaborador Ativo', range: '200 - 399' },
                                    { icon: '🟣', label: 'Cauteloso Engajado', range: '400 - 649' },
                                    { icon: '🟡', label: 'Protetor da Rede', range: '650 - 849' },
                                    { icon: '🟢', label: 'Embaixador Cautoo', range: '850 - 1000' },
                                    { icon: '💎', label: 'Guardião Elite', range: '1001+' }
                                ].map((cat, idx) => (
                                    <div key={idx} className="p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xl">{cat.icon}</span>
                                            <span className="text-sm font-medium">{cat.label}</span>
                                        </div>
                                        <span className="text-xs text-muted-foreground font-mono font-bold">{cat.range}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Ações Positivas</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                {[
                                    { action: 'Enviar elogio válido', points: '+1', desc: 'Reconheça bons motoristas' },
                                    { action: 'Criar alerta útil', points: '+2 a +5', desc: 'Alertas que ajudam outros' },
                                    { action: 'Avistar veículo roubado', points: '+15', desc: 'Reporte avistamentos' },
                                    { action: 'Avistamento confirmado', points: '+20', desc: 'Quando dono confirma' },
                                    { action: 'Indicar usuário válido', points: '+5', desc: 'Convide amigos' },
                                    { action: 'Comprar Selo Azul', points: '+10', desc: 'Verificação de perfil' },
                                    { action: 'Resolver socorro', points: '+25', desc: 'Ajude em emergências' },
                                    { action: 'Atividade mensal', points: '+2', desc: 'Use regularmente' }
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-medium">{item.action}</span>
                                            <span className="text-emerald-500 font-bold text-sm">{item.points}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.section>

                        <motion.section
                            className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-semibold mb-2 text-sm">💡 Dicas para Aumentar seu ICC:</h3>
                            <ul className="space-y-2 text-xs text-muted-foreground">
                                <li>• Seja ativo: use o app regularmente (+2/mês)</li>
                                <li>• Ajude outros: envie alertas úteis e elogios</li>
                                <li>• Contribua para segurança: reporte veículos roubados</li>
                                <li>• Participe de socorros solidários</li>
                                <li>• Indique amigos para a rede</li>
                            </ul>
                        </motion.section>

                        <div className="pt-4">
                            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
                                Voltar
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
        </PageTransition>
    );
};

export default ICCGainPoints;
