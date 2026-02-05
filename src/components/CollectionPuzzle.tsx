import React, { useState, useCallback } from 'react';
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
    Info
} from 'lucide-react';
import { CollectionSlot } from '@/types/skins';

interface CollectionPuzzleProps {
    slots: CollectionSlot[];
    ownedSkins: number[];
    availableHints: any[];
    onSlotChange: (position: number, skinId: number | null) => void;
    onUseHint: (hintId: string) => void;
    onComplete: () => void;
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
    correctCount,
    isCompleted
}: CollectionPuzzleProps) {
    const [draggedSkin, setDraggedSkin] = useState<number | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [showHints, setShowHints] = useState(false);

    const handleDragStart = (skinId: number) => {
        setDraggedSkin(skinId);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (position: number) => {
        if (draggedSkin !== null) {
            onSlotChange(position, draggedSkin);
            setDraggedSkin(null);
        }
    };

    const handleSlotClick = (position: number) => {
        if (selectedSlot === position) {
            // Deselecionar
            setSelectedSlot(null);
        } else {
            setSelectedSlot(position);
        }
    };

    const handleSkinClick = (skinId: number) => {
        if (selectedSlot !== null) {
            onSlotChange(selectedSlot, skinId);
            setSelectedSlot(null);
        }
    };

    const handleRemoveSkin = (position: number) => {
        onSlotChange(position, null);
    };

    const progress = (correctCount / 7) * 100;
    const canReorder = ownedSkins.length >= 15;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">
                            Puzzle da Coleção
                        </h3>
                        <p className="text-[10px] text-muted-foreground">
                            Organize 7 skins na ordem correta
                        </p>
                    </div>
                    {isCompleted && (
                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                            <Trophy className="w-3 h-3 mr-1" />
                            COMPLETO
                        </Badge>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-muted-foreground">
                            Progresso: {correctCount}/7 corretas
                        </span>
                        {!canReorder && (
                            <span className="text-[10px] text-muted-foreground">
                                <Lock className="w-3 h-3 inline mr-1" />
                                Precisa 15+ skins para reordenar
                            </span>
                        )}
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>
            </div>

            {/* Puzzle Slots (7 slots) */}
            <div className="grid grid-cols-7 gap-2">
                {slots.map((slot) => (
                    <div
                        key={slot.position}
                        className={cn(
                            "aspect-square rounded-xl border-2 border-dashed transition-all cursor-pointer",
                            selectedSlot === slot.position
                                ? "border-primary bg-primary/10 scale-105"
                                : "border-border hover:border-primary/50",
                            slot.skinId && "border-solid bg-card"
                        )}
                        onClick={() => handleSlotClick(slot.position)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(slot.position)}
                    >
                        <div className="w-full h-full flex flex-col items-center justify-center p-1">
                            {slot.skinId ? (
                                <>
                                    <div className="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center">
                                        <span className="text-xs font-black">#{slot.skinId}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveSkin(slot.position);
                                        }}
                                        className="mt-1 text-[8px] text-destructive hover:underline"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <span className="text-[10px] font-black text-muted-foreground">
                                        {slot.position}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Available Skins */}
            <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-muted-foreground">
                    Suas Skins Disponíveis
                </h4>
                <div className="grid grid-cols-5 gap-2">
                    {ownedSkins.map((skinId) => (
                        <div
                            key={skinId}
                            draggable
                            onDragStart={() => handleDragStart(skinId)}
                            onClick={() => handleSkinClick(skinId)}
                            className={cn(
                                "aspect-square rounded-lg border-2 bg-card cursor-move transition-all hover:scale-105",
                                draggedSkin === skinId && "opacity-50",
                                "border-border hover:border-primary"
                            )}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-xs font-black">#{skinId}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hints Section */}
            {availableHints.length > 0 && (
                <Card className="border-yellow-500/20 bg-yellow-500/5">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm font-black uppercase">
                                    Dicas Disponíveis ({availableHints.length})
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowHints(!showHints)}
                                className="h-7 text-[10px]"
                            >
                                {showHints ? 'Ocultar' : 'Ver Dicas'}
                            </Button>
                        </div>

                        {showHints && (
                            <div className="space-y-2">
                                {availableHints.map((hint) => (
                                    <div
                                        key={hint.id}
                                        className="flex items-start gap-2 p-2 bg-background rounded-lg"
                                    >
                                        <Info className="w-4 h-4 text-yellow-500 mt-0.5" />
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[11px] font-medium">{hint.message}</p>
                                            <p className="text-[9px] text-muted-foreground">
                                                Conquistada: {hint.condition}
                                            </p>
                                        </div>
                                        {!hint.usedAt && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onUseHint(hint.id)}
                                                className="h-6 text-[9px]"
                                            >
                                                Usar
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Completion Reward */}
            {isCompleted && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                    <CardContent className="p-4 text-center space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto text-emerald-500" />
                        <h4 className="text-sm font-black uppercase">
                            🎉 Puzzle Completo!
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                            Você ganhou +1000 XP e desbloqueou benefícios especiais!
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <div className="p-4 bg-muted/30 rounded-xl space-y-2">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Como Funciona
                </h4>
                <ul className="text-[10px] text-muted-foreground space-y-1">
                    <li>• Arraste skins para os 7 slots</li>
                    <li>• Feedback mostra quantas estão corretas (sem posição)</li>
                    <li>• Ganhe dicas completando desafios</li>
                    <li>• Recompensa: +1000 XP ao completar</li>
                </ul>
            </div>
        </div>
    );
}
