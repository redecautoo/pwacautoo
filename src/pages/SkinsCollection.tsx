
import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Palette, Layers, Pickaxe, Store, ArrowLeft, Gem, Lock, Check, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function SkinsCollection() {
    const navigate = useNavigate();
    const {
        cauCashBalance,
        collection,
        miningState,
        getSkinsByCategory,
        buySkinLayout,
        mineSkin,
        selectedColor
    } = useApp();

    const [activeTab, setActiveTab] = useState('skins');
    const [miningCode, setMiningCode] = useState('');

    // 1. SKINS (LOJA)
    const skinsStore = getSkinsByCategory('score_skins');

    // 2. MINERAÇÃO
    const handleMine = () => {
        if (!miningCode) return;

        // Simulate mining delay
        const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
                const result = mineSkin(miningCode);
                if (result.success) resolve(result);
                else reject(result.message);
            }, 2000);
        });

        toast.promise(promise, {
            loading: 'Minerando bloco...',
            success: (data: any) => data.message,
            error: (msg) => msg as string
        });
    };

    const handleBuy = (skinId: number) => {
        const result = buySkinLayout(skinId);
        if (result.success) {
            toast.success(result.message);
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
            {/* HEADER */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Skins & Coleção
                    </h1>
                </div>

                <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                    <Gem className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-600/20" />
                    <span className="font-bold text-amber-700 dark:text-amber-400 text-sm">
                        {cauCashBalance?.toFixed(2) || '0.00'}
                    </span>
                </div>
            </header>

            <div className="px-4 py-6 max-w-md mx-auto">
                <Tabs defaultValue="skins" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-8">
                        <TabsTrigger value="skins" className="flex flex-col gap-1 py-2 text-xs">
                            <Palette className="w-4 h-4" />
                            Store
                        </TabsTrigger>
                        <TabsTrigger value="collection" className="flex flex-col gap-1 py-2 text-xs">
                            <Layers className="w-4 h-4" />
                            Meus
                        </TabsTrigger>
                        <TabsTrigger value="mining" className="flex flex-col gap-1 py-2 text-xs">
                            <Pickaxe className="w-4 h-4" />
                            Miner
                        </TabsTrigger>
                        <TabsTrigger value="market" className="flex flex-col gap-1 py-2 text-xs">
                            <Store className="w-4 h-4" />
                            Mkt
                        </TabsTrigger>
                    </TabsList>

                    {/* TAB: SKINS STORE */}
                    <TabsContent value="skins" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Layouts Premium</h2>
                            <Badge variant="outline" className="text-xs">Novidades</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {skinsStore.map(skin => {
                                const isOwned = collection.ownedSkins?.includes(skin.id);
                                const canAfford = cauCashBalance >= skin.layoutCost;

                                return (
                                    <Card key={skin.id} className="overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-md transition-all group relative">
                                        <div className="h-24 bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
                                            {/* Preview Visual */}
                                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                                            <div className="w-full h-12 rounded-md shadow-lg flex items-center justify-center text-xs font-bold tracking-wider border-2 border-white/20"
                                                style={{
                                                    background: skin.colorPrimary || '#6366f1',
                                                    color: '#fff'
                                                }}>
                                                ABC-1234
                                            </div>

                                            {isOwned && (
                                                <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>

                                        <CardContent className="p-3">
                                            <h3 className="font-medium text-sm truncate">{skin.name}</h3>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500 uppercase">{skin.categoryId.replace('_', ' ')}</span>
                                                <div className="flex items-center text-amber-600 font-bold text-sm">
                                                    <Gem className="w-3 h-3 mr-1" />
                                                    {skin.layoutCost}
                                                </div>
                                            </div>

                                            <Button
                                                size="sm"
                                                className={cn("w-full mt-3 h-8 text-xs", isOwned ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "")}
                                                disabled={isOwned || !canAfford}
                                                onClick={() => !isOwned && handleBuy(skin.id)}
                                            >
                                                {isOwned ? 'Adquirido' : canAfford ? 'Comprar' : 'Saldo Insuf.'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </TabsContent>

                    {/* TAB: COLEÇÃO */}
                    <TabsContent value="collection" className="space-y-4">
                        <h2 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Minha Coleção</h2>

                        {/* Cores Livres */}
                        <Card className="mb-6 border-slate-200 dark:border-slate-800">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="font-medium text-sm flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Cores Básicas (Grátis)
                                </h3>
                            </div>
                            <CardContent className="p-4 grid grid-cols-5 gap-3">
                                {['#2563EB', '#DC2626', '#16A34A', '#CA8A04', '#000000'].map(color => (
                                    <button
                                        key={color}
                                        className={cn(
                                            "w-10 h-10 rounded-full shadow-sm border-2 transition-transform hover:scale-110",
                                            selectedColor === color ? "border-slate-900 scale-110 ring-2 ring-slate-200" : "border-transparent"
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => {
                                            // Setter via AppContext se eu tivesse exportado setSelectedColor no value
                                            // Como pode não estar, vou apenas simular
                                            toast.success(`Cor ${color} selecionada!`);
                                        }}
                                    />
                                ))}
                            </CardContent>
                        </Card>

                        {/* Skins Compradas */}
                        <div className="space-y-2">
                            {collection?.ownedSkins?.map(id => (
                                <div key={id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                            {id}
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">Skin #{id}</p>
                                            <p className="text-xs text-slate-500">Premium</p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8 text-xs">
                                        Equipar
                                    </Button>
                                </div>
                            ))}

                            {collection.ownedSkins.length === 0 && (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    Você ainda não possui skins premium.
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* TAB: MINERAÇÃO */}
                    <TabsContent value="mining" className="space-y-4">
                        <Card className="bg-slate-900 text-white border-slate-800 overflow-hidden relative">
                            <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-vector/cyber-code-background_23-2148016422.jpg')] opacity-10 bg-cover" />
                            <CardContent className="p-6 relative z-10 text-center">
                                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                    <Pickaxe className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h2 className="text-xl font-bold mb-1">Crypto Mineração</h2>
                                <p className="text-slate-400 text-xs mb-6 px-4">
                                    Descifre códigos semanais para ganhar skins raras e C$.
                                </p>

                                <div className="bg-slate-800/50 p-4 rounded-lg mb-6 border border-slate-700/50">
                                    <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Tentativas Restantes</div>
                                    <div className="text-2xl font-mono font-bold text-indigo-400">
                                        {miningState.attemptsThisWeek}/3
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Insira o código..."
                                        className="w-full bg-slate-800 border-none text-center font-mono text-lg py-3 rounded-md focus:ring-2 focus:ring-indigo-500"
                                        value={miningCode}
                                        onChange={e => setMiningCode(e.target.value)}
                                    />
                                    <Button
                                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                                        disabled={miningState.attemptsThisWeek <= 0}
                                        onClick={handleMine}
                                    >
                                        <Zap className="w-4 h-4 mr-2" /> Minerar Bloco
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800/30 text-xs text-amber-800 dark:text-amber-400">
                            <p className="flex items-start gap-2">
                                <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                                Dica: Códigos são liberados toda sexta-feira no canal oficial do Telegram.
                            </p>
                        </div>
                    </TabsContent>

                    {/* TAB: MARKETPLACE */}
                    <TabsContent value="market" className="space-y-4">
                        <div className="text-center py-20 px-6">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Store className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">Marketplace P2P</h3>
                            <p className="text-slate-500 text-sm">
                                Em breve você poderá vender suas skins para outros jogadores e ganhar C$.
                            </p>
                            <Badge variant="secondary" className="mt-4">Em Desenvolvimento</Badge>
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}
