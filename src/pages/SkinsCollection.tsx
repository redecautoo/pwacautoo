import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Palette,
    Grid,
    Hammer,
    Store,
    ArrowLeft,
    Wallet,
    Lock,
    Search,
    Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';

// Componentes Placeholder para as tabs (serão implementados depois)
const SkinsTab = () => {
    const { selectedColor, setSelectedColor, cauCashBalance } = useApp();
    // Importação direta dos mocks para garantir dados
    const { FREE_COLORS, SKIN_CATEGORIES } = require('@/data/mockSkins');

    // Cores livres
    const renderFreeColors = () => (
        <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                Cores Livres
            </h3>
            <div className="grid grid-cols-5 gap-3">
                {FREE_COLORS.map((color: any) => (
                    <button
                        key={color.id}
                        onClick={() => setSelectedColor(color.hex)}
                        className={`aspect-square rounded-xl shadow-sm flex items-center justify-center relative transition-transform active:scale-95 ${selectedColor === color.hex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                            }`}
                        style={{ backgroundColor: color.hex }}
                    >
                        {selectedColor === color.hex && (
                            <div className="bg-black/20 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    // Categorias
    const renderCategories = () => (
        <div className="space-y-8">
            {SKIN_CATEGORIES.slice(1).map((category: any) => ( /* Pula cores livres */
                <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">{category.icon}</span>
                            <div>
                                <h3 className="text-base font-bold text-foreground leading-none">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {category.unlockRules}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scroll-smooth no-scrollbar">
                        {category.skins.length > 0 ? (
                            category.skins.map((skin: any) => (
                                <div
                                    key={skin.id}
                                    className="min-w-[140px] w-[140px] bg-card border border-border rounded-xl overflow-hidden flex flex-col relative group"
                                >
                                    {/* Preview da Skin (Mock visual) */}
                                    <div className="h-20 bg-muted/50 relative flex items-center justify-center">
                                        {skin.status === 'locked' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                                                <Lock className="w-6 h-6 text-white/70" />
                                            </div>
                                        )}
                                        <span className="text-2xl drop-shadow-md">
                                            {skin.icon || category.icon}
                                        </span>

                                        {/* Badge de preço/status */}
                                        <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium backdrop-blur-sm">
                                            {skin.status === 'owned'
                                                ? 'ADQUIRIDO'
                                                : `CC$ ${skin.layoutCost}`}
                                        </div>
                                    </div>

                                    <div className="p-2.5 flex-1 flex flex-col">
                                        <h4 className="text-xs font-semibold text-foreground line-clamp-1 mb-1">
                                            {skin.name}
                                        </h4>

                                        {skin.benefitType !== 'none' && (
                                            <div className="text-[10px] text-emerald-400 font-medium mb-2 line-clamp-2 leading-tight">
                                                {skin.benefitDescription || 'Benefício ativo'}
                                            </div>
                                        )}

                                        <button
                                            className={`mt-auto w-full text-[10px] font-bold py-1.5 rounded transition-colors ${skin.status === 'locked' ? 'bg-muted text-muted-foreground cursor-not-allowed' :
                                                    skin.status === 'owned' ? 'bg-primary text-primary-foreground' :
                                                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 active:bg-emerald-500/20'
                                                }`}
                                        >
                                            {skin.status === 'locked' ? 'BLOQUEADO' :
                                                skin.status === 'owned' ? 'EQUIPAR' :
                                                    'COMPRAR'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full text-center py-6 bg-muted/20 rounded-xl border border-dashed border-border">
                                <p className="text-xs text-muted-foreground">Em breve</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {renderFreeColors()}
            {renderCategories()}

            {/* Footer Padding */}
            <div className="h-20" />
        </div>
    );
};

const CollectionTab = () => (
    <div className="p-6 text-center text-muted-foreground">
        <Grid className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Sua Coleção</h3>
        <p>Complete o puzzle de 7 skins para destravar benefícios.</p>
    </div>
);

const MiningTab = () => (
    <div className="p-6 text-center text-muted-foreground">
        <Hammer className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Mineração</h3>
        <p>Descubra os códigos secretos de 7 caracteres.</p>
    </div>
);

const MarketplaceTab = () => (
    <div className="p-6 text-center text-muted-foreground">
        <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-1">Marketplace</h3>
        <p>Compre e venda skins raras com CauCash.</p>
    </div>
);

type ActiveTab = 'skins' | 'collection' | 'mining' | 'marketplace';

const SkinsCollection = () => {
    const navigate = useNavigate();
    const { cauCashBalance } = useApp();
    const [activeTab, setActiveTab] = useState<ActiveTab>('skins');

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Fixo */}
            <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(-1)}
                            className="rounded-full w-8 h-8"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Skins & Coleção
                        </h1>
                    </div>

                    {/* Saldo CauCash */}
                    <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-emerald-400">
                            CC$ {cauCashBalance.toFixed(2)}
                        </span>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center justify-between px-2 pb-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'skins', icon: Palette, label: 'Skins' },
                        { id: 'collection', icon: Grid, label: 'Coleção' },
                        { id: 'mining', icon: Hammer, label: 'Mineração' },
                        { id: 'marketplace', icon: Store, label: 'Loja' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as ActiveTab)}
                            className={`flex flex-col items-center justify-center min-w-[80px] py-2 px-1 relative transition-colors ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <tab.icon className={`w-6 h-6 mb-1 ${activeTab === tab.id ? 'stroke-[2.5px]' : ''}`} />
                            <span className="text-[10px] font-medium uppercase tracking-wide">{tab.label}</span>

                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTabIndicator"
                                    className="absolute bottom-0 w-full h-0.5 bg-primary rounded-t-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'skins' && <SkinsTab />}
                        {activeTab === 'collection' && <CollectionTab />}
                        {activeTab === 'mining' && <MiningTab />}
                        {activeTab === 'marketplace' && <MarketplaceTab />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SkinsCollection;
