import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Lightbulb,
    Check,
    X,
    Sparkles,
    Trophy,
    Lock,
    Info,
    Layers,
    Grab
} from 'lucide-react';
import { CollectionSlot } from '@/types/skins';

// Simulating StandardPlate for inside the puzzle to avoid dependency health issues or heavy imports if needed, 
// but we'll try to use a simplified version that looks even more like a puzzle piece.
const MiniPlateSlot = ({
    skin,
    position,
    isSelected,
    onClick,
    onRemove,
    onDrop
}: {
    skin: any,
    position: number,
    isSelected?: boolean,
    onClick?: () => void,
    onRemove?: () => void,
    onDrop?: () => void
}) => {
    return (
        <div
            onClick={onClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            className={cn(
                "relative w-full aspect-[3.2/1] rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden",
                isSelected ? "border-primary bg-primary/10 ring-2 ring-primary/20 scale-[1.02]" : "border-border hover:border-primary/50 bg-muted/5",
                skin && "border-solid shadow-sm"
            )}
        >
            {skin ? (
                <div className="w-full h-full flex flex-col bg-white">
                    <div className="h-[25%] bg-[#003399] flex items-center px-1">
                        <span className="text-[5px] font-black text-white tracking-widest uppercase truncate">BRASIL • SLOT {position}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center relative" style={{ backgroundColor: skin.colorPrimary || '#FFFFFF' }}>
                        <span className="text-[10px] font-black text-black tracking-tighter truncate px-1">{skin.name}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30">
                    <span className="text-xl font-black">{position}</span>
                </div>
            )}
        </div>
    );
};

interface CollectionPuzzleProps {
    slots: CollectionSlot[];
    ownedSkins: number[];
    availableHints: any[];
    onSlotChange: (position: number, skinId: number | null) => void;
    onUseHint: (hintId: string) => void;
    onComplete: () => void;
    getSkinById: (id: number) => any;
    correctCount: number;
    isCompleted: boolean;
}

export function CollectionPuzzle({
    slots,
    ownedSkins,
    availableHints,
    onSlotChange,
    onUseHint,
    onComplete,
    getSkinById,
    correctCount,
    isCompleted
}: CollectionPuzzleProps) {
    const [draggedSkin, setDraggedSkin] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [showHints, setShowHints] = useState(false);

    const handleDragStart = (skinId: number) => {
        setDraggedSkin(skinId);
    };

    const handleDrop = (position: number) => {
        if (draggedSkin !== null) {
            onSlotChange(position, draggedSkin);
            setDraggedSkin(null);
        }
    };

    const handleSlotClick = (position: number) => {
        if (selectedSlot === position) {
            setSelectedSlot(null);
        } else {
            setSelectedSlot(position);
        }
    };

    const handleSkinClick = (skinId: number) => {
        if (selectedSlot !== null) {
            // Se já estiver em algum slot, remover de lá primeiro? (Opcional, mas para puzzle é melhor permitir duplicatas visuais ou não?)
            // A lógica do AppContext já lida com isso se necessário.
            onSlotChange(selectedSlot, skinId);
            setSelectedSlot(null);
        }
    };

    const progress = (correctCount / 7) * 100;
    const skinsAvailableForPuzzle = ownedSkins.filter(id => !slots.some(s => s.skinId === id));

    return (
        <div className="space-y-6">
            {/* PROGRESS SECTION */}
            <Card className="border-border bg-card/50 overflow-hidden">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h3 className="text-sm font-black uppercase italic tracking-tight">Status do Desafio</h3>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="h-5 text-[9px] font-black uppercase px-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-500">
                                    {correctCount} / 7 Corretas
                                </Badge>
                                {isCompleted && (
                                    <Badge className="h-5 text-[9px] font-black uppercase px-2 bg-primary text-primary-foreground">
                                        RECOMPENSA LIBERADA
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-lg font-black italic text-primary">{Math.round(progress)}%</span>
                        </div>
                    </div>
                    <Progress value={progress} className="h-1.5 bg-muted" />
                </CardContent>
            </Card>

            {/* THE PLATE BOARD (7 SLOTS) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Tabuleiro de Posicionamento</h4>
                    <span className="text-[10px] text-muted-foreground font-bold">Arraste ou clique para preencher</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {slots.map((slot) => {
                        const skin = slot.skinId ? getSkinById(slot.skinId) : null;
                        return (
                            <MiniPlateSlot
                                key={slot.position}
                                position={slot.position}
                                skin={skin}
                                isSelected={selectedSlot === slot.position}
                                onClick={() => handleSlotClick(slot.position)}
                                onRemove={() => onSlotChange(slot.position, null)}
                                onDrop={() => handleDrop(slot.position)}
                            />
                        );
                    })}
                    {/* Empty placeholder for the 8th grid spot to keep alignment tidy */}
                    <div className="w-full aspect-[3.2/1] rounded-lg border-2 border-dashed border-border/20 flex flex-col items-center justify-center p-2 opacity-30">
                        <Sparkles className="w-4 h-4 mb-1" />
                        <span className="text-[8px] font-black uppercase">Final Reward</span>
                    </div>
                </div>
            </div>

            {/* HINTS SECTION */}
            {availableHints.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Dicas de Especialista</h4>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowHints(!showHints)}
                            className="h-6 text-[10px] font-black text-primary hover:bg-primary/5 uppercase"
                        >
                            {showHints ? 'Recolher' : `Ver ${availableHints.length} Dicas`}
                        </Button>
                    </div>

                    {showHints && (
                        <div className="grid gap-2">
                            {availableHints.map((hint) => (
                                <div key={hint.id} className="p-3 bg-card border border-border rounded-2xl flex gap-3 items-start group">
                                    <div className="w-8 h-8 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <Lightbulb className="w-4 h-4 fill-yellow-500" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-[11px] font-black uppercase tracking-tight italic leading-tight">{hint.message}</p>
                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Origem: {hint.condition}</p>
                                    </div>
                                    {!hint.usedAt && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => onUseHint(hint.id)}
                                            className="h-7 text-[9px] font-black uppercase rounded-lg shadow-sm"
                                        >
                                            USAR
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* THE SKIN DRAWER (GAVETA DE SKINS) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Suas Peças Disponíveis</h4>
                    <span className="text-[10px] text-muted-foreground font-bold">{skinsAvailableForPuzzle.length} skins</span>
                </div>

                <div className="bg-muted/30 p-4 rounded-3xl border border-border/50">
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        {skinsAvailableForPuzzle.length === 0 ? (
                            <div className="w-full py-8 text-center space-y-2 opacity-50">
                                <Layers className="w-8 h-8 mx-auto text-muted-foreground" />
                                <p className="text-[10px] font-black uppercase">Nenhuma skin disponível</p>
                            </div>
                        ) : (
                            skinsAvailableForPuzzle.map((skinId) => {
                                const skin = getSkinById(skinId);
                                return (
                                    <div
                                        key={skinId}
                                        draggable
                                        onDragStart={() => handleDragStart(skinId)}
                                        onClick={() => handleSkinClick(skinId)}
                                        className={cn(
                                            "min-w-[120px] max-w-[120px] aspect-[2.1/1] rounded-xl border-2 bg-card cursor-grab active:cursor-grabbing snap-center transition-all hover:-translate-y-1 shadow-sm flex flex-col overflow-hidden",
                                            draggedSkin === skinId ? "opacity-30 scale-95 border-primary" : "border-border hover:border-primary",
                                            selectedSlot !== null && "ring-2 ring-primary/40 animate-pulse"
                                        )}
                                    >
                                        <div className="h-1.5 w-full bg-[#003399]" />
                                        <div className="flex-1 flex flex-col items-center justify-center p-1" style={{ backgroundColor: skin.colorPrimary || '#FFFFFF' }}>
                                            <span className="text-[9px] font-black text-black leading-none text-center truncate w-full">{skin.name}</span>
                                            <div className="mt-1 flex items-center gap-0.5">
                                                <Grab className="w-2.5 h-2.5 text-black/30" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* COMPLETION AREA */}
            {isCompleted && (
                <Card className="border-primary bg-primary/5 overflow-hidden animate-in zoom-in duration-500">
                    <CardContent className="p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                            <Trophy className="w-8 h-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black uppercase italic tracking-tighter">Colecionador Master!</h4>
                            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-widest italic">Você provou seu valor na rede.</p>
                        </div>
                        <div className="p-3 bg-card border border-border rounded-2xl space-y-1">
                            <p className="text-[9px] font-black text-muted-foreground uppercase">Recompensas Concedidas</p>
                            <p className="text-xs font-black text-emerald-500 uppercase">+1.000 XP • Reordenamento Livre</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* QUICK INFO */}
            <div className="flex gap-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">7 Slots Mercosul</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Logic-Drag System</span>
                </div>
            </div>
        </div>
    );
}
