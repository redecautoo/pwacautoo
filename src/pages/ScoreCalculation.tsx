import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { getScoreCategoryInfo } from "@/contexts/AppContext";

const ScoreCalculation = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">Como é calculado o Score?</h1>
                    </div>
                </header>

                <main className="px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-6">
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Faixas de Pontuação</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                {[
                                    { min: -999, label: 'Placa em Alerta', range: '< 0', type: 'score' },
                                    { min: 0, label: 'Placa Neutra', range: '0 - 199', type: 'score' },
                                    { min: 200, label: 'Placa Conhecida', range: '200 - 399', type: 'score' },
                                    { min: 400, label: 'Placa Confiável', range: '400 - 649', type: 'score' },
                                    { min: 650, label: 'Placa Distinta', range: '650 - 849', type: 'score' },
                                    { min: 850, label: 'Placa Exemplar', range: '850 - 1000', type: 'score' },
                                    { min: 1001, label: 'Placa Ícone', range: '1001+', type: 'score' }
                                ].map((cat, idx) => {
                                    const info = getScoreCategoryInfo(cat.min);
                                    return (
                                        <div key={idx} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`badge-capsula ${info.badgeClass} scale-75 -ml-4`} />
                                                <span className="text-sm font-medium">{cat.label}</span>
                                            </div>
                                            <span className="text-xs text-muted-foreground font-mono font-bold">{cat.range}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                Como Ganhar Pontos
                            </h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Elogio válido recebido</span>
                                        <span className="text-emerald-500 font-bold">+2</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Quando outro motorista te envia um elogio e você valida</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Alerta útil (1º do tipo)</span>
                                        <span className="text-emerald-500 font-bold">+1</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Primeiro alerta de um tipo específico que você recebe</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Selo Azul ativo</span>
                                        <span className="text-emerald-500 font-bold">+5/mês</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Bônus mensal por ter perfil verificado</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Veículo indicado (1ª vez)</span>
                                        <span className="text-emerald-500 font-bold">+3</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Quando alguém indica seu veículo pela primeira vez</p>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
                                <TrendingDown className="w-4 h-4 text-red-500" />
                                Como Perder Pontos
                            </h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Alerta repetido</span>
                                        <span className="text-red-500 font-bold">-1 a -5</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Múltiplos alertas do mesmo tipo</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Crítica convergente</span>
                                        <span className="text-red-500 font-bold">-5 a -15</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">3+ alertas similares em 24h</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Denúncia grave confirmada</span>
                                        <span className="text-red-500 font-bold">-20 a -50</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Denúncia séria validada por outros usuários</p>
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-medium">Inatividade mensal</span>
                                        <span className="text-orange-500 font-bold">-3%</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Decaimento automático sem atividade (não se aplica com Selo Azul)</p>
                                </div>
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

export default ScoreCalculation;

