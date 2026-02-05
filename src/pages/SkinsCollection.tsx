
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Palette,
    Layers,
    Pickaxe,
    Store,
    Lock,
    Check,
    ChevronRight,
    Info,
    Gem,
    Sparkles,
    Zap,
    ShoppingBag,
    History,
    Tag,
    Plus,
    X,
    Trophy,
    Target,
    Users,
    Gift,
    AlertTriangle,
    FileText,
    Ghost,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PageTransition } from '@/components/PageTransition';
import { cn } from "@/lib/utils";
import { SKIN_CATEGORIES, INITIAL_COLLECTION, INITIAL_MINING, getSkinById } from '@/data/mockSkins';
import { SkinLevelBadge, SkinLevelIcon } from '@/components/SkinLevelBadge';
import { CollectionPuzzle } from '@/components/CollectionPuzzle';

// Helper component for Standard Plate
const StandardPlate = ({
    skin,
    isLocked: propIsLocked,
    plate = "ABC-1234",
    size = "md",
    className = ""
}: {
    skin: any,
    isLocked?: boolean,
    plate?: string,
    size?: "sm" | "md" | "lg",
    className?: string
}) => {
    const isLocked = propIsLocked !== undefined ? propIsLocked : (skin.status === 'locked');
    const isBaseColor = skin.categoryId === 'base_colors';

    // Size variants
    const sizes = {
        sm: { container: "w-32", text: "text-lg" },
        md: { container: "w-full", text: "text-xl" },
        lg: { container: "w-64", text: "text-3xl" }
    };

    return (
        <div className={cn(
            "relative rounded-xl border-2 border-border shadow-md overflow-hidden bg-white",
            sizes[size].container,
            className
        )}>
            {/* Top Bar (Mercosul Blue) */}
            <div className="h-[20%] w-full bg-[#003399] flex items-center justify-between px-2 py-0.5">
                <div className="flex items-center gap-1">
                    <span className="text-[8px] leading-none">🇧🇷</span>
                    <span className="text-[5px] font-bold text-white tracking-widest leading-none">BRASIL</span>
                </div>
                <div className="flex gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-green-400" />
                    <div className="w-1 h-1 rounded-full bg-yellow-400" />
                </div>
            </div>

            {/* Main Plate Body */}
            <div className={cn(
                "flex-1 aspect-[3/1] flex items-center justify-center relative",
                isBaseColor ? "" : "border-t border-border/10"
            )}
                style={{
                    backgroundColor: isBaseColor ? skin.colorPrimary || '#FFFFFF' : '#FFFFFF'
                }}>
                {/* Visual Ornaments for Non-Base Skins */}
                {!isBaseColor && (
                    <div className={cn(
                        "absolute inset-0 border-[3px]",
                        skin.categoryId === 'score_skins' ? "border-amber-500/20" :
                            skin.categoryId === 'icc_skins' ? "border-blue-500/20" :
                                skin.categoryId === 'value_skins' ? "border-emerald-500/20" :
                                    "border-primary/20"
                    )} />
                )}

                <span className={cn(
                    "font-black tracking-tighter text-black select-none",
                    sizes[size].text
                )} style={{ fontFamily: "monospace" }}>
                    {plate}
                </span>

                {/* Status Overlay */}
                {isLocked && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1">
                        <Lock className="w-5 h-5 text-white/60" />
                        <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">BLOQUEADA</span>
                    </div>
                )}
            </div>
        </div>
    );
};

import { useApp } from '@/contexts/AppContext';

export default function SkinsCollection() {
    const navigate = useNavigate();
    const {
        collection,
        miningState,
        ownedSkins, // NOVO: Skins com XP e level
        mineSkin,
        buySkinLayout,
        sellSkin,
        linkSkinToPlate,
        getSkinById,
        cauCashBalance,
        showAlert,
        selectedColor,
        setSelectedColor,
        // Puzzle
        updatePuzzleSlot,
        validatePuzzle,
        useHint,
        completePuzzle,
        // Marketplace
        marketListings,
        createSkinListing,
        purchaseSkin,
        cancelSkinListing
    } = useApp();

    const [activeTab, setActiveTab] = useState('skins');
    const [selectedSkin, setSelectedSkin] = useState<any>(null);
    const [showRules, setShowRules] = useState<any>(null);
    const [miningInput, setMiningInput] = useState("");

    // Marketplace state
    const [sellModalSkin, setSellModalSkin] = useState<any>(null);
    const [listingPrice, setListingPrice] = useState<number>(0);

    // Handlers
    const handleMiningSubmit = () => {
        if (miningInput.length !== 7) return;
        const result = mineSkin(miningInput);
        if (result.success) {
            showAlert("MINERADO!", result.message, "success");
        } else {
            showAlert("OPS!", result.message, "warning");
        }
        setMiningInput("");
    };

    const handleBuyLayout = () => {
        if (!selectedSkin) return;
        const result = buySkinLayout(selectedSkin.id);
        if (result.success) {
            showAlert("SUCESSO", result.message, "success");
            setSelectedSkin(null);
        } else {
            showAlert("ERRO", result.message, "error");
        }
    };

    const handleLinkToPlate = () => {
        if (!selectedSkin) return;
        const result = linkSkinToPlate(selectedSkin.id, "current-plate"); // Exemplo
        if (result.success) {
            showAlert("CONCLUÍDO", result.message, "success");
            setSelectedSkin(null);
        }
    };

    const handleSellSkin = (id: number, price: number) => {
        const result = sellSkin(id, price);
        if (result.success) {
            showAlert("VENDIDO", result.message, "success");
        } else {
            showAlert("ERRO", result.message, "error");
        }
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-background pb-20">
                {/* Header */}
                <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <div className="flex items-center gap-4 max-w-lg mx-auto">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex-1">
                            <h1 className="text-lg font-black tracking-tight uppercase">Skins & Coleção</h1>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Placa personalizada, identidade única</p>
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                            <Zap className="w-3.5 h-3.5 text-primary fill-primary" />
                            <span className="text-xs font-black text-primary uppercase">{cauCashBalance.toLocaleString()} CC</span>
                        </div>
                    </div>
                </header>

                <main className="max-w-lg mx-auto">
                    <Tabs defaultValue="skins" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-4 py-4 bg-background sticky top-[69px] z-40">
                            <TabsList className="grid w-full grid-cols-5 h-12 bg-card border border-border rounded-xl p-1">
                                <TabsTrigger value="skins" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-[10px] gap-1 px-1">
                                    <Palette className="w-3.5 h-3.5" /> SKINS
                                </TabsTrigger>
                                <TabsTrigger value="colecao" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-[10px] gap-1 px-1">
                                    <Layers className="w-3.5 h-3.5" /> COLEÇÃO
                                </TabsTrigger>
                                <TabsTrigger value="puzzle" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-[10px] gap-1 px-1">
                                    <Target className="w-3.5 h-3.5" /> PUZZLE
                                </TabsTrigger>
                                <TabsTrigger value="mineracao" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-[10px] gap-1 px-1">
                                    <Pickaxe className="w-3.5 h-3.5" /> MINERAR
                                </TabsTrigger>
                                <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-[10px] gap-1 px-1">
                                    <Store className="w-3.5 h-3.5" /> MERCADO
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB CONTENT: SKINS */}
                        <TabsContent value="skins" className="mt-0 space-y-8 pb-8 focus-visible:outline-none">
                            {SKIN_CATEGORIES.map((category) => (
                                <section key={category.id} className="space-y-4">
                                    <div className="px-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">
                                                {category.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight">{category.name}</h3>
                                                <p className="text-[10px] text-muted-foreground">{category.description}</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-[9px] font-black rounded-full px-3 gap-1"
                                            onClick={() => setShowRules(category)}
                                        >
                                            <Info className="w-3 h-3" /> REGRAS
                                        </Button>
                                    </div>

                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="flex gap-4 px-4 pb-4">
                                            {category.skins.map((skin) => (
                                                <div
                                                    key={skin.id}
                                                    className="inline-block"
                                                    onClick={() => {
                                                        if (skin.categoryId === 'base_colors' && skin.colorPrimary) {
                                                            setSelectedColor(skin.colorPrimary);
                                                            showAlert("SUCESSO", `Cor alterada para ${skin.name}`, "success");
                                                        } else {
                                                            setSelectedSkin(skin);
                                                        }
                                                    }}
                                                >
                                                    <StandardPlate
                                                        skin={skin}
                                                        isLocked={skin.categoryId !== 'base_colors' && !collection.ownedSkins.includes(skin.id)}
                                                        size="sm"
                                                        className="hover:scale-105 transition-transform"
                                                    />
                                                    <p className="mt-2 text-[10px] font-bold text-center uppercase truncate w-32">{skin.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </section>
                            ))}
                        </TabsContent>

                        {/* TAB CONTENT: COLEÇÃO */}
                        <TabsContent value="colecao" className="mt-0 px-4 space-y-8 pb-8 focus-visible:outline-none">
                            <div className="space-y-4">
                                <div className="flex items-end justify-between px-1">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black uppercase tracking-tight italic">Meu Inventário</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Gerencie e evolua suas skins</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-black border-primary/20 bg-primary/5 text-primary h-6 px-2 uppercase">
                                        Total: {collection.ownedSkins.length}
                                    </Badge>
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Minhas Skins Adquiridas</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {collection.ownedSkins.length > 0 ? (
                                        collection.ownedSkins.map(skinId => {
                                            const skin = getSkinById(skinId);
                                            const ownedSkin = ownedSkins.find(s => s.id === skinId);

                                            return skin ? (
                                                <div key={skin.id} className="space-y-2 group">
                                                    <div className="relative group cursor-pointer" onClick={() => setSelectedSkin(skin)}>
                                                        <StandardPlate skin={skin} size="md" className="group-hover:scale-[1.02] transition-transform" />
                                                        {ownedSkin && ownedSkin.level > 1 && (
                                                            <div className="absolute top-2 right-2">
                                                                <SkinLevelIcon level={ownedSkin.level} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase text-center">{skin.name}</p>
                                                        {ownedSkin && (
                                                            <SkinLevelBadge
                                                                level={ownedSkin.level || 1}
                                                                xp={ownedSkin.xp || 0}
                                                                showProgress={true}
                                                                className="flex justify-center"
                                                            />
                                                        )}
                                                        <Button
                                                            variant="outline"
                                                            className="w-full h-7 text-[8px] font-black rounded-lg border-primary/20 hover:bg-primary/5 uppercase gap-1"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSellModalSkin(skin);
                                                            }}
                                                        >
                                                            <Tag className="w-3 h-3" /> ANUNCIAR
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : null;
                                        })
                                    ) : (
                                        <div className="col-span-2 py-12 text-center border-2 border-dashed border-border rounded-[32px] opacity-50">
                                            <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-xs font-bold uppercase">Sua coleção está vazia</p>
                                            <p className="text-[10px] text-muted-foreground">Minere ou adquira skins para começar</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* TAB CONTENT: PUZZLE */}
                        <TabsContent value="puzzle" className="mt-0 px-4 space-y-6 pb-8 focus-visible:outline-none">
                            <CollectionPuzzle
                                slots={collection.slots}
                                ownedSkins={collection.ownedSkins}
                                availableHints={collection.hintsEarned || []}
                                onSlotChange={updatePuzzleSlot}
                                onUseHint={useHint}
                                onComplete={completePuzzle}
                                getSkinById={getSkinById}
                                correctCount={collection.correctCount}
                                isCompleted={collection.correctCount === 7}
                            />
                        </TabsContent>

                        {/* TAB CONTENT: MINERAÇÃO */}
                        <TabsContent value="mineracao" className="mt-0 px-4 space-y-8 pb-8 focus-visible:outline-none">
                            <div className="bg-card border-border rounded-[32px] overflow-hidden">
                                <div className="p-8 space-y-6 bg-gradient-to-b from-primary/5 to-transparent">
                                    <div className="text-center space-y-2">
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-black px-4 uppercase">Explotação Ativa</Badge>
                                        <h3 className="text-3xl font-black tracking-tighter uppercase italic">Algoritmo de Mineração</h3>
                                        <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">Tente combinar os 7 caracteres do código mensal para liberar skins e prêmios de valor.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex gap-2 justify-center">
                                            <Input
                                                value={miningInput}
                                                onChange={(e) => setMiningInput(e.target.value.toUpperCase().slice(0, 7))}
                                                placeholder="7 DÍGITOS (A-Z, 0-9)"
                                                className="h-16 text-center text-3xl font-black tracking-[0.4em] uppercase rounded-2xl border-2 border-primary/20 bg-background shadow-inner"
                                            />
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full h-16 rounded-2xl font-black text-xl gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95"
                                            onClick={handleMiningSubmit}
                                            disabled={miningInput.length !== 7}
                                        >
                                            <Pickaxe className="w-6 h-6" /> MINERAR CÓDIGO
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border/50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <Zap className="w-5 h-5 fill-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-muted-foreground">Tentativas Restantes</p>
                                                <p className="text-sm font-black uppercase">{miningState.attemptsThisWeek} / {miningState.maxAttemptsPerWeek}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black uppercase text-muted-foreground">Reseta em</p>
                                            <p className="text-[10px] font-black uppercase text-primary">5 DIAS 12H</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Prêmios da Temporada</h3>
                                    <Badge variant="outline" className="text-[9px] font-bold">CICLO FEV/2026</Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {miningState.prizes.map((prize) => {
                                        // Destaque visual (Decisão Final)
                                        const isClose = prize.correctChars >= 5;
                                        const isMedium = prize.correctChars >= 3;

                                        return (
                                            <Card
                                                key={prize.id}
                                                className={cn(
                                                    "bg-card border-border overflow-hidden transition-all",
                                                    isClose && "border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20 animate-pulse"
                                                )}
                                            >
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-black uppercase italic">{prize.name}</span>
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "h-4 text-[8px] font-black px-1 uppercase",
                                                                    isClose ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500" :
                                                                        isMedium ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-500" :
                                                                            "border-primary/20 bg-primary/5 text-primary"
                                                                )}
                                                            >
                                                                {isClose ? "🔥 QUASE!" : "Mineração"}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Progress
                                                                value={prize.progress}
                                                                className={cn(
                                                                    "h-1.5 flex-1",
                                                                    isClose ? "bg-emerald-500/20" : "bg-secondary"
                                                                )}
                                                            />
                                                            <span className={cn(
                                                                "text-[10px] font-black min-w-[30px]",
                                                                isClose ? "text-emerald-500" :
                                                                    isMedium ? "text-yellow-500" :
                                                                        "text-muted-foreground"
                                                            )}>
                                                                {prize.correctChars}/7
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[9px] text-muted-foreground uppercase font-black">
                                                                Melhor: {prize.bestGuess || "---"}
                                                            </span>
                                                            <span className="text-[9px] text-primary uppercase font-black">
                                                                Dicas: {prize.hintsUnlocked}/{prize.maxHints}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </section>
                        </TabsContent>

                        {/* TAB CONTENT: MARKETPLACE */}
                        <TabsContent value="marketplace" className="mt-0 px-4 space-y-6 pb-8 focus-visible:outline-none">
                            <div className="space-y-4">
                                <div className="flex items-end justify-between">
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black uppercase tracking-tight italic">Mercado de Skins</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black">Trade seguro com saldo CauCash</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-right">
                                            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none">Ativos</p>
                                            <p className="text-xs font-black">{marketListings.filter(l => l.status === 'active').length}</p>
                                        </div>
                                        <div className="text-right border-l border-border pl-2">
                                            <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none">Suas Vendas</p>
                                            <p className="text-xs font-black text-primary">{marketListings.filter(l => l.sellerId === 'user-male-green-nonclient' && l.status === 'active').length}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input placeholder="BUSCAR SKIN POR NOME OU ID..." className="h-10 pl-10 bg-card border-border rounded-xl text-[10px] font-black uppercase" />
                                </div>

                                <div className="grid gap-3">
                                    {marketListings.filter(l => l.status === 'active').length === 0 ? (
                                        <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-black uppercase tracking-tight">Mercado Vazio</p>
                                                <p className="text-[10px] text-muted-foreground uppercase font-bold max-w-[200px]">Nenhuma skin anunciada no momento. Seja o primeiro a vender!</p>
                                            </div>
                                        </div>
                                    ) : (
                                        marketListings.filter(l => l.status === 'active').map((listing) => {
                                            const skinData = getSkinById(listing.skinId);
                                            if (!skinData) return null;

                                            return (
                                                <Card key={listing.id} className="overflow-hidden border-border bg-card group hover:border-primary/50 transition-all duration-300">
                                                    <CardContent className="p-0">
                                                        <div className="flex h-28">
                                                            <div className="w-[35%] p-4 bg-secondary/10 flex items-center justify-center relative overflow-hidden">
                                                                <div className="absolute inset-0 bg-blue-500/5 rotate-12 translate-x-10 translate-y-10" />
                                                                <StandardPlate
                                                                    skin={skinData}
                                                                    size="sm"
                                                                    className="scale-90"
                                                                />
                                                            </div>
                                                            <div className="w-[65%] p-4 flex flex-col justify-between">
                                                                <div className="flex items-start justify-between">
                                                                    <div>
                                                                        <h4 className="text-xs font-black mb-0.5 group-hover:text-primary transition-colors uppercase italic">{skinData.name}</h4>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Badge className="h-4 text-[7px] font-black uppercase px-1 px-1 bg-primary/10 text-primary border-0">Level {listing.level}</Badge>
                                                                            <span className="text-[10px] text-muted-foreground uppercase tracking-tight font-black">{listing.rarity}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end">
                                                                        <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mb-1">Preço</span>
                                                                        <span className="text-xs font-black text-emerald-500">{listing.price.toLocaleString()} CC</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    {listing.sellerId === 'user-male-green-nonclient' ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 flex-1 text-[10px] font-black rounded-lg border-red-500/20 text-red-500 hover:bg-red-500/5 uppercase"
                                                                            onClick={() => cancelSkinListing(listing.id)}
                                                                        >
                                                                            CANCELAR VENDA
                                                                        </Button>
                                                                    ) : (
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-8 flex-1 text-[10px] font-black rounded-lg group-hover:bg-primary/90 uppercase"
                                                                            onClick={() => {
                                                                                if (confirm(`Comprar ${skinData.name} por ${listing.price} CC?`)) {
                                                                                    purchaseSkin(listing.id);
                                                                                }
                                                                            }}
                                                                            disabled={cauCashBalance < listing.price}
                                                                        >
                                                                            COMPRAR AGORA
                                                                        </Button>
                                                                    )}
                                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-muted-foreground border-border rounded-lg">
                                                                        <Info className="w-3.5 h-3.5" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase text-amber-500">Regras do Mercado de Skins</p>
                                    <p className="text-[9px] text-amber-500/80 leading-snug">
                                        - Taxas Dinâmicas de Venda: 15% (L1) até 3% (L5).<br />
                                        - O XP das skins é resetado para Level 1 ao mudar de dono.<br />
                                        - Transações são instantâneas e irreversíveis.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>

                {/* SKIN MODAL */}
                <AnimatePresence>
                    {selectedSkin && (
                        <Dialog open={!!selectedSkin} onOpenChange={() => setSelectedSkin(null)}>
                            <DialogContent className="max-w-[400px] w-[95vw] rounded-[32px] border-border bg-card overflow-hidden p-0 gap-0 shadow-2xl">
                                <div className="h-56 flex items-center justify-center p-8 relative overflow-hidden bg-secondary/5">
                                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-30" />
                                    <StandardPlate
                                        skin={selectedSkin}
                                        isLocked={selectedSkin.categoryId !== 'base_colors' && !collection.ownedSkins.includes(selectedSkin.id)}
                                        size="lg"
                                        className="scale-110 shadow-2xl border-none"
                                    />
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-3">
                                            <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest text-primary border-primary/20 bg-primary/5 px-4 h-6">
                                                CATEGORIA: {selectedSkin.categoryId.toUpperCase().replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-tight">{selectedSkin.name}</h2>
                                        <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-widest font-bold">Colecionável Exclusivo Cautoo</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary/20 rounded-2xl p-4 text-center border border-border/50">
                                            <span className="text-[9px] text-muted-foreground block uppercase font-black tracking-widest mb-1 opacity-50">Layout</span>
                                            <span className="text-xs font-black uppercase tracking-tight">{selectedSkin.layoutCost > 0 ? `CC ${selectedSkin.layoutCost}` : 'GRÁTIS'}</span>
                                        </div>
                                        <div className="bg-secondary/20 rounded-2xl p-4 text-center border border-border/50">
                                            <span className="text-[9px] text-muted-foreground block uppercase font-black tracking-widest mb-1 opacity-50">Status</span>
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tight",
                                                collection.ownedSkins.includes(selectedSkin.id) ? "text-emerald-500" : "text-muted-foreground"
                                            )}>
                                                {collection.ownedSkins.includes(selectedSkin.id) ? 'NA COLEÇÃO' : 'BLOQUEADA'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {collection.ownedSkins.includes(selectedSkin.id) ? (
                                            <Button
                                                className="w-full bg-primary h-14 rounded-2xl font-black gap-2 tracking-tighter uppercase transition-all shadow-xl shadow-primary/20"
                                                onClick={handleLinkToPlate}
                                            >
                                                <Check className="w-5 h-5" /> VINCULAR À PLACA
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full bg-primary h-14 rounded-2xl font-black gap-2 tracking-tighter uppercase transition-all shadow-xl shadow-primary/20"
                                                onClick={handleBuyLayout}
                                            >
                                                <Store className="w-5 h-5" /> COMPRAR LAYOUT
                                            </Button>
                                        )}
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                className="flex-1 h-12 rounded-2xl font-black text-muted-foreground hover:bg-secondary/50 text-[10px] uppercase"
                                                onClick={() => {
                                                    // Simulação de venda simplificada para o usuário
                                                    handleSellSkin(selectedSkin.id, selectedSkin.layoutCost || 50);
                                                    setSelectedSkin(null);
                                                }}
                                            >
                                                VENDER
                                            </Button>
                                            <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black text-muted-foreground hover:bg-secondary/50 text-[10px] uppercase" onClick={() => {
                                                setShowRules(SKIN_CATEGORIES.find(c => c.id === selectedSkin.categoryId));
                                            }}>
                                                VER REGRAS
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </AnimatePresence>

                {/* RULES MODAL */}
                <AnimatePresence>
                    {showRules && (
                        <Dialog open={!!showRules} onOpenChange={() => setShowRules(null)}>
                            <DialogContent className="max-w-[400px] w-[95vw] rounded-[32px] border-border bg-card overflow-hidden p-8 gap-6 shadow-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl">
                                        {showRules.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black uppercase italic leading-none">{showRules.name}</h2>
                                        <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">Regras e Condições de Uso</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-secondary/10 rounded-2xl border border-border/50 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">COMO DESBLOQUEAR</p>
                                            <p className="text-xs font-bold leading-snug">{showRules.unlockRules || 'Não informado'}</p>
                                        </div>
                                        {showRules.benefitRules && (
                                            <div className="space-y-1">
                                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">CARÊNCIA / MANUTENÇÃO</p>
                                                <p className="text-xs font-bold leading-snug">{showRules.benefitRules}</p>
                                            </div>
                                        )}
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">PERDA DE BENEFÍCIO</p>
                                            <p className="text-xs font-bold leading-snug">Se o requisito parar de ser cumprido, a skin estética permanece, mas os benefícios são pausados imediatamente.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-center">
                                        <div className="p-3 bg-card border border-border rounded-xl">
                                            <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">LAYOUT</p>
                                            <p className="text-[10px] font-black uppercase">{showRules.allowLayoutPurchase ? 'PODE COMPRAR' : 'INTRANSFERÍVEL'}</p>
                                        </div>
                                        <div className="p-3 bg-card border border-border rounded-xl">
                                            <p className="text-[7px] font-black text-muted-foreground uppercase mb-1">REVENDA</p>
                                            <p className="text-[10px] font-black uppercase">{showRules.allowSell ? 'PERMITIDA' : 'BLOQUEADA'}</p>
                                        </div>
                                    </div>
                                </div>

                                <Button className="w-full h-12 rounded-2xl font-black uppercase" onClick={() => setShowRules(null)}>
                                    ENTENDIDO
                                </Button>
                            </DialogContent>
                        </Dialog>
                    )}
                    {/* SELL SKIN MODAL */}
                    {sellModalSkin && (
                        <Dialog open={!!sellModalSkin} onOpenChange={() => setSellModalSkin(null)}>
                            <DialogContent className="max-w-[400px] w-[95vw] rounded-[32px] border-border bg-card overflow-hidden p-8 gap-6 shadow-2xl">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-black uppercase tracking-tighter italic">Anunciar Skin</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Defina o preço em CauCash</p>
                                </div>

                                <div className="flex justify-center py-4">
                                    <StandardPlate skin={sellModalSkin} size="md" />
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 italic">Preço de Venda (CC)</label>
                                        <div className="relative">
                                            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary fill-primary" />
                                            <Input
                                                type="number"
                                                value={listingPrice || ""}
                                                onChange={(e) => setListingPrice(Number(e.target.value))}
                                                placeholder="Ex: 500"
                                                className="h-14 pl-10 text-xl font-black rounded-2xl border-2 border-border focus:border-primary bg-background"
                                            />
                                        </div>
                                    </div>

                                    <div className="p-4 bg-secondary/10 rounded-2xl border border-border/50 space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tight">
                                            <span className="text-muted-foreground">Taxa de Venda (L{ownedSkins.find(s => s.id === sellModalSkin.id)?.level || 1})</span>
                                            <span className="text-red-500">
                                                -{Math.round((ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 5 ? 0.03 :
                                                    ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 4 ? 0.06 :
                                                        ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 3 ? 0.09 :
                                                            ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 2 ? 0.12 : 0.15) * 100)}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-black uppercase tracking-tight pt-2 border-t border-border/50">
                                            <span>Você receberá</span>
                                            <span className="text-emerald-500">
                                                {Math.floor(listingPrice * (1 - (ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 5 ? 0.03 :
                                                    ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 4 ? 0.06 :
                                                        ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 3 ? 0.09 :
                                                            ownedSkins.find(s => s.id === sellModalSkin.id)?.level === 2 ? 0.12 : 0.15))).toLocaleString()} CC
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="outline" className="h-12 rounded-2xl font-black uppercase" onClick={() => setSellModalSkin(null)}>
                                        CANCELAR
                                    </Button>
                                    <Button
                                        className="h-12 rounded-2xl font-black uppercase"
                                        disabled={listingPrice <= 0}
                                        onClick={() => {
                                            const res = createSkinListing(sellModalSkin.id, listingPrice);
                                            if (res.success) {
                                                setSellModalSkin(null);
                                                setListingPrice(0);
                                                setActiveTab('marketplace');
                                            }
                                        }}
                                    >
                                        CONFIRMAR
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}


