import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

const ScoreVsICC = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">Score vs ICC</h1>
                    </div>
                </header>

                <main className="px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-6">
                        <motion.div
                            className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h2 className="font-bold text-xl mb-3">Qual a diferença?</h2>
                            <p className="text-sm text-muted-foreground">
                                Score e ICC são dois índices diferentes que medem aspectos distintos da sua participação na rede Cautoo.
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    📊 Score do Veículo (PLACA)
                                </h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>✓ Índice <strong className="text-blue-500">PÚBLICO 🔓</strong></p>
                                    <p>✓ Vinculado à <strong>placa</strong></p>
                                    <p>✓ Baseado em alertas/elogios <strong>RECEBIDOS</strong></p>
                                    <p>✓ Reflete reputação do veículo</p>
                                    <p>✓ Visível para todos</p>
                                    <p>✓ Detalhes privados (só dono vê)</p>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    🏆 ICC do Usuário (CPF)
                                </h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>✓ Índice <strong className="text-red-500">PRIVADO 🔒</strong></p>
                                    <p>✓ Vinculado ao <strong>CPF</strong></p>
                                    <p>✓ Baseado em ações <strong>REALIZADAS</strong></p>
                                    <p>✓ Mede contribuição para rede</p>
                                    <p>✓ Invisível para outros</p>
                                    <p>✓ 100% confidencial</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="bg-card border border-border rounded-xl p-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="font-semibold mb-3">Exemplo Prático:</h3>
                            <div className="space-y-3 text-sm">
                                <div className="bg-secondary/50 rounded-lg p-3">
                                    <p className="text-muted-foreground">
                                        <strong className="text-foreground">Score da sua placa ABC1234:</strong> Aumenta quando outros motoristas te enviam elogios. Diminui quando recebe alertas.
                                    </p>
                                </div>
                                <div className="bg-secondary/50 rounded-lg p-3">
                                    <p className="text-muted-foreground">
                                        <strong className="text-foreground">Seu ICC pessoal:</strong> Aumenta quando VOCÊ envia alertas úteis, ajuda outros motoristas, ou indica amigos.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

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

export default ScoreVsICC;
