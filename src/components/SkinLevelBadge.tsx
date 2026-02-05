import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Zap, Crown, Gem } from 'lucide-react';

interface SkinLevelBadgeProps {
    level: number;
    xp: number;
    className?: string;
    showProgress?: boolean;
}

// XP necessário por level
const XP_THRESHOLDS = {
    1: 0,
    2: 5000,
    3: 20000,
    4: 70000,
    5: 200000
};

// Visual por level
const LEVEL_CONFIG = {
    1: {
        name: 'Base',
        icon: null,
        color: 'text-muted-foreground',
        bg: 'bg-secondary/50',
        border: 'border-border'
    },
    2: {
        name: 'Plus',
        icon: Zap,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30'
    },
    3: {
        name: 'Ultra',
        icon: Sparkles,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30'
    },
    4: {
        name: 'Master',
        icon: Crown,
        color: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30'
    },
    5: {
        name: 'GENESIS',
        icon: Gem,
        color: 'text-emerald-500',
        bg: 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20',
        border: 'border-emerald-500/50'
    }
};

export function SkinLevelBadge({ level, xp, className, showProgress = false }: SkinLevelBadgeProps) {
    const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
    const Icon = config.icon;

    // Calcular progresso para próximo level
    const currentThreshold = XP_THRESHOLDS[level as keyof typeof XP_THRESHOLDS] || 0;
    const nextThreshold = XP_THRESHOLDS[(level + 1) as keyof typeof XP_THRESHOLDS] || XP_THRESHOLDS[5];
    const progress = level === 5 ? 100 : ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
    const xpNeeded = level === 5 ? 0 : nextThreshold - xp;

    return (
        <div className={cn("space-y-1", className)}>
            <Badge
                variant="outline"
                className={cn(
                    "h-5 text-[9px] font-black px-2 gap-1 uppercase",
                    config.bg,
                    config.border,
                    config.color,
                    level === 5 && "animate-pulse"
                )}
            >
                {Icon && <Icon className="w-3 h-3" />}
                {level === 5 ? '💎 GENESIS' : `LV ${level} ${config.name}`}
            </Badge>

            {showProgress && level < 5 && (
                <div className="space-y-0.5">
                    <Progress
                        value={progress}
                        className={cn(
                            "h-1",
                            level === 4 ? "bg-yellow-500/20" : "bg-secondary"
                        )}
                    />
                    <p className="text-[8px] text-muted-foreground font-bold">
                        {xpNeeded.toLocaleString()} XP para Level {level + 1}
                    </p>
                </div>
            )}

            {level === 5 && showProgress && (
                <p className="text-[8px] text-emerald-500 font-black uppercase">
                    ✨ Evolução Máxima Alcançada!
                </p>
            )}
        </div>
    );
}

// Componente compacto para usar em cards
export function SkinLevelIcon({ level, className }: { level: number; className?: string }) {
    const config = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1];
    const Icon = config.icon;

    if (level === 1 || !Icon) return null;

    return (
        <div
            className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center",
                config.bg,
                config.border,
                "border",
                level === 5 && "animate-pulse",
                className
            )}
        >
            <Icon className={cn("w-3 h-3", config.color)} />
        </div>
    );
}
