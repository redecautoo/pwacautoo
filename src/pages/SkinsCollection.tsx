
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
    Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PageTransition } from '@/components/PageTransition';
import { cn } from "@/lib/utils";

// Skins & Coleção Page
export default function SkinsCollection() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('skins');
    const [selectedSkin, setSelectedSkin] = useState<any>(null);

    // Mock colors for free skins
    const freeColors = [
        { name: 'Azul Padrão', color: 'bg-blue-600', active: true },
        { name: 'Vermelho Fúria', color: 'bg-red-600' },
        { name: 'Verde Nature', color: 'bg-green-600' },
        { name: 'Amarelo Gold', color: 'bg-yellow-500' },
        { name: 'Laranja Sunset', color: 'bg-orange-500' },
        { name: 'Roxo Deep', color: 'bg-purple-600' },
        { name: 'Rosa Neon', color: 'bg-pink-500' },
        { name: 'Cinza Graphite', color: 'bg-slate-600' },
        { name: 'Preto Blackout', color: 'bg-black' },
    ];

    // Categories and their skins
    const skinCategories = [
        {
            title: "Skins de Score",
            description: "Desbloqueie com seu score mensal",
            skins: [
                { id: 1, name: "Score Bronze", status: "disponivel", color: "from-amber-700 to-amber-900", icon: "ABC" },
                { id: 2, name: "Score Prata", status: "colecao", color: "from-slate-300 to-slate-500", icon: "ABC" },
                { id: 3, name: "Score Ouro", status: "bloqueada", color: "from-yellow-400 to-yellow-600" },
                { id: 4, name: "Score Platina", status: "bloqueada", color: "from-cyan-300 to-cyan-500" },
            ]
        },
        {
            title: "Skins de ICC",
            description: "Baseadas no seu ranking ICC",
            skins: [
                { id: 5, name: "ICC Iniciante", status: "disponivel", color: "from-blue-400 to-blue-600", icon: "ABC" },
                { id: 6, name: "ICC Avançado", status: "bloqueada", color: "from-blue-600 to-blue-800" },
                { id: 7, name: "ICC Expert", status: "bloqueada", color: "from-blue-800 to-indigo-900" },
                { id: 8, name: "ICC Master", status: "bloqueada", color: "from-indigo-900 to-purple-900" },
            ]
        },
        {
            title: "Skins Raras",
            description: "Edições limitadas e exclusivas",
            skins: [
                { id: 9, name: "Neon City", status: "bloqueada", color: "from-emerald-400 to-emerald-600" },
                { id: 10, name: "Midnight", status: "bloqueada", color: "from-slate-800 to-slate-950" },
                { id: 11, name: "Aurora", status: "colecao", color: "from-pink-400 to-indigo-500", icon: "ABC" },
                { id: 12, name: "Cosmic", status: "bloqueada", color: "from-purple-800 to-black" },
            ]
        }
    ];

    const renderPlateThumbnail = (skin: any) => (
        <div
            className={cn(
                "relative w-full aspect-[2/1] rounded-lg flex items-center justify-center overflow-hidden border border-white/10 shadow-lg",
                skin.color.startsWith('bg') ? skin.color : `bg-gradient-to-br ${skin.color}`
            )}
        >
            {skin.status === "bloqueada" ? (
                <>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white/50" />
                    </div>
                </>
            ) : (
                <span className="text-white font-bold tracking-tighter text-sm uppercase">ABC-1234</span>
            )}
        </div>
    );

    return (
        <PageTransition>
            <div className="min-h-screen bg-background pb-20">
                <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-foreground">Skins & Coleção</h1>
                            <p className="text-xs text-muted-foreground">Sua placa é sua identidade</p>
                        </div>
                    </div>
                </header>

                <main className="max-w-lg mx-auto">
                    <Tabs defaultValue="skins" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-4 py-4 bg-background sticky top-[69px] z-40">
                            <TabsList className="grid w-full grid-cols-4 h-12 bg-card border border-border rounded-xl p-1">
                                <TabsTrigger value="skins" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-xs gap-1">
                                    <Palette className="w-4 h-4" /> Skins
                                </TabsTrigger>
                                <TabsTrigger value="colecao" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-xs gap-1">
                                    <Layers className="w-4 h-4" /> Coleção
                                </TabsTrigger>
                                <TabsTrigger value="mineracao" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-xs gap-1">
                                    <Pickaxe className="w-4 h-4" /> Minerar
                                </TabsTrigger>
                                <TabsTrigger value="marketplace" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg text-xs gap-1">
                                    <Store className="w-4 h-4" /> Loja
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB CONTENT: SKINS */}
                        <TabsContent value="skins" className="mt-0 space-y-8 pb-8 focus-visible:outline-none">
                            {/* Skins Livres */}
                            <section className="px-4">
                                <div className="mb-4">
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Cores Livres</span>
                                    <p className="text-xs text-muted-foreground leading-tight">Troque a cor da sua placa a qualquer momento</p>
                                </div>

                                <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-3 pb-2 pt-1 px-1">
                                        {freeColors.map((item, idx) => (
                                            <button
                                                key={idx}
                                                className={cn(
                                                    "w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center border-2 border-transparent transition-all",
                                                    item.color,
                                                    item.active ? "border-primary scale-110 ring-4 ring-primary/20" : "hover:scale-105"
                                                )}
                                            >
                                                {item.active && <Check className="w-6 h-6 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" className="hidden" />
                                </ScrollArea>
                            </section>

                            {/* Central Preview Plate */}
                            <div className="px-4">
                                <div className="bg-card/50 border border-border rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                                    <div className="w-full max-w-[240px] aspect-[2.5/1] bg-blue-600 rounded-xl shadow-2xl flex items-center justify-center border-4 border-white/10 ring-4 ring-black/20">
                                        <span className="text-white text-3xl font-black tracking-tighter uppercase">ABC-1234</span>
                                    </div>
                                </div>
                            </div>

                            {/* Grid Categories Style Netflix */}
                            {skinCategories.map((category, catIdx) => (
                                <section key={catIdx} className="space-y-4">
                                    <div className="px-4 flex items-end justify-between">
                                        <div>
                                            <h3 className="text-base font-bold text-foreground leading-none mb-1">{category.title}</h3>
                                            <p className="text-xs text-muted-foreground">{category.description}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] gap-1 text-muted-foreground uppercase font-bold tracking-wider hover:bg-white/5">
                                            <Info className="w-3 h-3" /> Regras
                                        </Button>
                                    </div>

                                    <ScrollArea className="w-full">
                                        <div className="flex gap-4 pb-4 px-4 overflow-visible">
                                            {category.skins.map((skin) => (
                                                <div
                                                    key={skin.id}
                                                    className="w-36 flex-shrink-0 cursor-pointer group"
                                                    onClick={() => setSelectedSkin(skin)}
                                                >
                                                    {renderPlateThumbnail(skin)}
                                                    <div className="mt-2 text-center">
                                                        <span className="text-xs font-semibold text-foreground block truncate">{skin.name}</span>
                                                        <span
                                                            className={cn(
                                                                "text-[9px] font-bold uppercase tracking-tight",
                                                                skin.status === "disponivel" ? "text-emerald-500" :
                                                                    skin.status === "colecao" ? "text-blue-500" : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {skin.status === "disponivel" ? "Disponível" :
                                                                skin.status === "colecao" ? "Na coleção" : "Bloqueada"}
                                                        </span>
                                                    </div>
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
                            <section>
                                <div className="mb-6 pt-2">
                                    <h3 className="text-lg font-bold text-foreground leading-tight">Sua Coleção</h3>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        Organize suas skins favoritas. Desbloqueie todos os slots para bônus exclusivos.
                                    </p>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {[1, 2, 3, 4, 5, 6, 7].map((slot) => (
                                        <div
                                            key={slot}
                                            className={cn(
                                                "aspect-square rounded-2xl border-2 border-dashed flex items-center justify-center transition-all bg-card/30 border-border",
                                                slot === 1 ? "bg-primary/5 border-primary/30" : ""
                                            )}
                                        >
                                            {slot === 1 ? (
                                                <div className="w-full h-full p-2">
                                                    <div className="w-full h-full bg-blue-600 rounded-lg shadow-inner flex items-center justify-center text-[7px] font-bold text-white leading-none uppercase text-center px-0.5">
                                                        Padrão
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center opacity-30">
                                                    <span className="text-lg font-bold text-muted-foreground">{slot}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="aspect-square rounded-2xl border-2 border-dashed border-border/20 bg-card/5 flex items-center justify-center">
                                        <Lock className="w-5 h-5 text-muted-foreground/10" />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Minhas Skins</h4>
                                    <Badge variant="secondary" className="text-[9px] h-5">3 ADQUIRIDAS</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {skinCategories.flatMap(c => c.skins).filter(s => s.status !== "bloqueada").map(skin => (
                                        <Card key={skin.id} className="bg-card border-border overflow-hidden shadow-sm hover:border-primary/30 transition-colors">
                                            <div className="p-3">
                                                {renderPlateThumbnail(skin)}
                                                <div className="mt-2 flex items-center justify-between gap-2 overflow-hidden">
                                                    <span className="text-xs font-semibold truncate flex-1">{skin.name}</span>
                                                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                    <div className="aspect-video rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center bg-card/10 cursor-pointer hover:bg-card/30 transition-colors">
                                        <Plus className="w-6 h-6 text-muted-foreground/30" />
                                    </div>
                                </div>
                            </section>
                        </TabsContent>

                        {/* TAB CONTENT: MINERAÇÃO */}
                        <TabsContent value="mineracao" className="mt-0 px-4 space-y-8 pb-8 focus-visible:outline-none">
                            <Card className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black border-indigo-500/30 overflow-hidden relative mt-2 pt-2 shadow-2xl shadow-indigo-500/10">
                                <div className="absolute top-0 right-0 p-4">
                                    <Sparkles className="w-10 h-10 text-indigo-400 opacity-20" />
                                </div>
                                <CardContent className="p-8 flex flex-col items-center text-center">
                                    <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 ring-1 ring-indigo-500/30">
                                        <Pickaxe className="w-10 h-10 text-indigo-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Mineração de Skins</h3>
                                    <p className="text-xs text-indigo-200/60 mb-8 max-w-[240px] leading-relaxed">
                                        Combine fragmentos e decifre códigos para forjar novas skins raras.
                                    </p>

                                    <div className="w-full space-y-4">
                                        <div className="flex gap-2 justify-center">
                                            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                                                <div key={i} className="w-9 h-12 bg-black/60 border border-white/10 rounded-md flex items-center justify-center text-indigo-500 font-mono text-xl shadow-inner">
                                                    _
                                                </div>
                                            ))}
                                        </div>
                                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
                                            Começar Mineração
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <section className="space-y-4">
                                <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-4">Progresso de Desafio</h4>
                                <div className="space-y-3">
                                    {[
                                        { name: "Skin 10k", progress: 65, goal: "10.000 pts" },
                                        { name: "Skin 20k", progress: 30, goal: "20.000 pts" },
                                        { name: "Skin Surpresa", progress: 10, goal: "Nível 50" },
                                    ].map((job, idx) => (
                                        <Card key={idx} className="bg-card border-border overflow-hidden">
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold">{job.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{job.goal}</span>
                                                </div>
                                                <Progress value={job.progress} className="h-2 bg-secondary" />
                                                <div className="mt-2 text-[10px] text-muted-foreground text-right flex justify-between items-center">
                                                    <span className="italic opacity-50">Exploração ativa...</span>
                                                    <span>Progresso mensal: {job.progress}%</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </section>
                        </TabsContent>

                        {/* TAB CONTENT: MARKETPLACE */}
                        <TabsContent value="marketplace" className="mt-0 px-4 space-y-6 pb-8 focus-visible:outline-none">
                            <div className="flex items-center gap-2 pt-2">
                                <Tabs defaultValue="venda" className="w-full">
                                    <TabsList className="w-full bg-card/50 h-10 p-1 border border-border rounded-xl">
                                        <TabsTrigger value="venda" className="text-[10px] flex-1 rounded-lg">À VENDA</TabsTrigger>
                                        <TabsTrigger value="minhas-vendas" className="text-[10px] flex-1 rounded-lg">MEUS ANÚNCIOS</TabsTrigger>
                                        <TabsTrigger value="compras" className="text-[10px] flex-1 rounded-lg">COMPRAS</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3].map((item) => (
                                    <Card key={item} className="bg-card border-border overflow-hidden group hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5">
                                        <CardContent className="p-0">
                                            <div className="flex">
                                                <div className="w-[35%] p-4 bg-secondary/10 flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-blue-500/5 rotate-12 translate-x-10 translate-y-10" />
                                                    <div className="w-full aspect-[2/1] bg-gradient-to-br from-indigo-500 to-purple-600 rounded shadow-md flex items-center justify-center scale-110 z-10 border border-white/20">
                                                        <span className="text-white text-[7px] font-black uppercase tracking-tighter">ABC-1234</span>
                                                    </div>
                                                </div>
                                                <div className="w-[65%] p-4">
                                                    <div className="flex items-start justify-between mb-1">
                                                        <div>
                                                            <h4 className="text-sm font-bold leading-none mb-1 group-hover:text-primary transition-colors">Aurora Neon vX</h4>
                                                            <p className="text-[10px] text-muted-foreground uppercase tracking-tight">Rara • #4421</p>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest leading-none mb-1">Preço</span>
                                                            <Badge variant="outline" className="text-[10px] text-emerald-500 font-black border-emerald-500/20 bg-emerald-500/5 h-5 px-1.5">C$ 450</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-4">
                                                        <Button size="sm" className="h-8 flex-1 text-xs font-bold rounded-lg group-hover:bg-primary/90">VER DETALHES</Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/10 rounded-lg">
                                                            <Tag className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>

                {/* SKIN MODAL */}
                <AnimatePresence>
                    {selectedSkin && (
                        <Dialog open={!!selectedSkin} onOpenChange={() => setSelectedSkin(null)}>
                            <DialogContent className="max-w-[400px] w-[90vw] rounded-[32px] border-border bg-card overflow-hidden p-0 gap-0 shadow-2xl">
                                <div
                                    className={cn(
                                        "h-56 flex items-center justify-center p-12 relative overflow-hidden",
                                        selectedSkin.color.startsWith('bg') ? selectedSkin.color : `bg-gradient-to-br ${selectedSkin.color}`
                                    )}
                                >
                                    {/* Patterns/Glass Effects */}
                                    <div className="absolute inset-0 bg-black/10" />
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full" />

                                    <div className="w-full max-w-[220px] aspect-[2.5/1] bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-2xl flex items-center justify-center z-10 scale-110">
                                        <span className="text-white text-3xl font-black tracking-tighter uppercase">ABC-1234</span>
                                    </div>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-3">
                                            <Badge variant="outline" className="text-[9px] uppercase font-bold tracking-[0.2em] text-primary border-primary/20 bg-primary/5 px-3 h-6">
                                                SKINS DE COLEÇÃO
                                            </Badge>
                                        </div>
                                        <h2 className="text-2xl font-black truncate leading-tight">{selectedSkin.name}</h2>
                                        <p className="text-[11px] text-muted-foreground mt-2 uppercase tracking-wide font-medium">Colecionável Exclusivo Cautoo</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-secondary/20 rounded-2xl p-4 text-center border border-border/50">
                                            <span className="text-[9px] text-muted-foreground block uppercase font-black tracking-widest mb-1 opacity-50">Categoria</span>
                                            <span className="text-xs font-black uppercase tracking-tight">Rara</span>
                                        </div>
                                        <div className="bg-secondary/20 rounded-2xl p-4 text-center border border-border/50">
                                            <span className="text-[9px] text-muted-foreground block uppercase font-black tracking-widest mb-1 opacity-50">Status</span>
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-tight",
                                                selectedSkin.status === "colecao" ? "text-blue-500" :
                                                    selectedSkin.status === "disponivel" ? "text-emerald-500" : "text-muted-foreground"
                                            )}>
                                                {selectedSkin.status === "colecao" ? "Na coleção" :
                                                    selectedSkin.status === "disponivel" ? "Disponível" : "Bloqueada"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {selectedSkin.status === "colecao" ? (
                                            <Button className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl font-black gap-2 tracking-tight transition-all active:scale-95 shadow-xl shadow-blue-500/20">
                                                <Check className="w-5 h-5" /> VINCULAR À PLACA
                                            </Button>
                                        ) : selectedSkin.status === "disponivel" ? (
                                            <Button className="w-full bg-primary hover:bg-primary/90 h-14 rounded-2xl font-black gap-2 tracking-tight transition-all active:scale-95 shadow-xl shadow-primary/20">
                                                <ShoppingBag className="w-5 h-5" /> COMPRAR LAYOUT
                                            </Button>
                                        ) : (
                                            <Button disabled className="w-full bg-secondary h-14 rounded-2xl font-black gap-2 tracking-tight opacity-50 cursor-not-allowed">
                                                <Lock className="w-5 h-5" /> SKIN BLOQUEADA
                                            </Button>
                                        )}
                                        <Button variant="ghost" className="w-full h-12 rounded-2xl font-bold text-muted-foreground hover:bg-secondary/50 text-xs">
                                            NEGOCIAR NO MARKETPLACE
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </AnimatePresence>
            </div>
        </PageTransition>
    );
}


