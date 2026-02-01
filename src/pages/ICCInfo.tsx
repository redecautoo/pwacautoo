import React from 'react';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { getICCCategoryInfo } from "@/contexts/AppContext";

const ICCInfo = () => {
    const navigate = useNavigate();

    return (
        <PageTransition>
            <div className="min-h-screen bg-background">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-foreground">O que é o ICC?</h1>
                    </div>
                </header>

                <main className="px-4 py-6">
                    <div className="max-w-lg mx-auto space-y-6">
                        <motion.section
                            className="bg-gradient-to-br from-red-500/10 to-purple-500/10 border border-red-500/20 rounded-2xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-foreground text-xl mb-2">ICC - Índice de Contribuição Cautelar</h2>
                                    <p className="text-sm text-muted-foreground">
                                        O ICC é um índice <strong className="text-red-500">100% PRIVADO 🔒</strong> vinculado ao seu CPF que
                                        mede quanto você contribui positivamente para a Rede Cautoo.
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
                                    <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">100% Privado</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Apenas você pode ver seu ICC. Nenhum outro usuário tem acesso.
                                        </p>
                                    </div>
                                </div>
                                <div className="p-4 flex items-start gap-3">
                                    <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Vinculado ao CPF</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Segue você, não o veículo. Mede suas contribuições pessoais.
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
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">7 Categorias</h3>
                            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                                {[
                                    { min: -999, label: 'Contribuidor Negativo', range: '< 0' },
                                    { min: 0, label: 'Iniciante', range: '0 - 199' },
                                    { min: 200, label: 'Colaborador Ativo', range: '200 - 399' },
                                    { min: 400, label: 'Cauteloso Engajado', range: '400 - 649' },
                                    { min: 650, label: 'Protetor da Rede', range: '650 - 849' },
                                    { min: 850, label: 'Embaixador Cautoo', range: '850 - 1000' },
                                    { min: 1001, label: 'Guardião Elite', range: '1001+' }
                                ].map((cat, idx) => {
                                    const info = getICCCategoryInfo(cat.min);
                                    return (
                                        <div key={idx} className="p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`badge-capsula ${info.badgeClass} scale-75 -ml-4`} />
                                                <span className="text-sm font-medium">{cat.label}</span>
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

export default ICCInfo;

