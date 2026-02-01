import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Unlock, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { getScoreCategoryInfo } from "@/contexts/AppContext";

const ScoreInfo = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">O que é o Score do Veículo?</h1>
                    </div>
                </header>

                <main className="px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-6">
                        <motion.section
                            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <BarChart3 className="w-6 h-6 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-foreground text-xl mb-2">Score da Placa</h2>
                                    <p className="text-sm text-muted-foreground">
                                        O <strong>Score do Veículo</strong> é um índice <strong className="text-blue-500">PÚBLICO 🔓</strong> que reflete
                                        o histórico de interações da placa na rede CAUTOO.
                                    </p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Características</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                <div className="p-4 flex items-start gap-3">
                                    <Unlock className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Público para todos</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Qualquer pessoa pode consultar o score de uma placa, mesmo sem cadastro
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex items-start gap-3">
                                    <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Detalhes privados</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Apenas o proprietário vê os alertas específicos e mensagens recebidas
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">7 Categorias do Score</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                {[
                                    { min: -999, label: 'Placa em Alerta', range: '< 0', description: 'Score negativo' },
                                    { min: 0, label: 'Placa Neutra', range: '0 - 199', description: 'Sem histórico significativo' },
                                    { min: 200, label: 'Placa Conhecida', range: '200 - 399', description: 'Histórico positivo básico' },
                                    { min: 400, label: 'Placa Confiável', range: '400 - 649', description: 'Boa reputação estabelecida' },
                                    { min: 650, label: 'Placa Distinta', range: '650 - 849', description: 'Excelente reputação' },
                                    { min: 850, label: 'Placa Exemplar', range: '850 - 1000', description: 'Reputação impecável' },
                                    { min: 1001, label: 'Placa Ícone Cautoo', range: '1001+', description: 'Máxima excelência' }
                                ].map((cat, idx) => {
                                    const info = getScoreCategoryInfo(cat.min);
                                    return (
                                        <div key={idx} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`badge-capsula ${info.badgeClass} scale-75 -ml-4`} />
                                                <div>
                                                    <span className="text-sm font-medium block">{cat.label}</span>
                                                    <span className="text-xs text-muted-foreground">{cat.description}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono">{cat.range}</span>
                                        </div>
                                    );
                                })}
                            </div>
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

export default ScoreInfo;

