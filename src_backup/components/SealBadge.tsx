import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { SealType } from "@/lib/types";

interface SealBadgeProps {
  seal: SealType;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

// PADRONIZAÇÃO: Usar SEMPRE o mesmo ícone de escudo (Shield)
// A diferença entre os selos é SOMENTE a cor do escudo
const sealConfig = {
  blue: {
    name: "Perfil Verificado",
    icon: Shield,
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    glow: "shadow-blue-500/50",
    ring: "ring-blue-400/30",
    bg: "bg-blue-500",
  },
  yellow: {
    name: "Guardião Viário",
    icon: Shield,
    gradient: "from-yellow-400 via-amber-500 to-orange-500",
    glow: "shadow-amber-500/50",
    ring: "ring-yellow-400/30",
    bg: "bg-yellow-500",
  },
  green: {
    name: "Referência Cautoo",
    icon: Shield,
    gradient: "from-emerald-400 via-green-500 to-teal-500",
    glow: "shadow-green-500/50",
    ring: "ring-green-400/30",
    bg: "bg-green-500",
  },
  none: {
    name: "",
    icon: Shield,
    gradient: "",
    glow: "",
    ring: "",
    bg: "bg-muted",
  },
};

const sizes = {
  sm: {
    container: "w-5 h-5",
    icon: "w-2.5 h-2.5",
    ring: "ring-2",
  },
  md: {
    container: "w-7 h-7",
    icon: "w-3.5 h-3.5",
    ring: "ring-2",
  },
  lg: {
    container: "w-10 h-10",
    icon: "w-5 h-5",
    ring: "ring-[3px]",
  },
};

export function SealBadge({ seal, size = "md", showLabel = false, animated = true }: SealBadgeProps) {
  if (seal === "none") return null;

  const config = sealConfig[seal];
  const sizeConfig = sizes[size];
  const Icon = config.icon;

  const badge = (
    <div className={`relative ${showLabel ? 'flex items-center gap-2' : ''}`}>
      <div
        className={`
          ${sizeConfig.container} 
          rounded-full 
          bg-gradient-to-br ${config.gradient}
          ${sizeConfig.ring} ${config.ring}
          shadow-lg ${config.glow}
          flex items-center justify-center
          relative overflow-hidden
        `}
      >
        {/* Shimmer effect */}
        {animated && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        )}
        
        <Icon className={`${sizeConfig.icon} text-white drop-shadow-sm relative z-10`} strokeWidth={3} />
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          Selo {seal === "blue" ? "Azul" : seal === "yellow" ? "Amarelo" : "Verde"}
        </span>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

export default SealBadge;
