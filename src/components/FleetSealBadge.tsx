import React from 'react';
import { motion } from "framer-motion";
import { Users } from "lucide-react";

interface FleetSealBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
}

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

export function FleetSealBadge({ size = "md", showLabel = false, animated = true }: FleetSealBadgeProps) {
  const sizeConfig = sizes[size];

  const badge = (
    <div className={`relative ${showLabel ? 'flex items-center gap-2' : ''}`}>
      <div
        className={`
          ${sizeConfig.container} 
          rounded-full 
          bg-gradient-to-br from-purple-400 via-purple-500 to-indigo-600
          ${sizeConfig.ring} ring-purple-400/30
          shadow-lg shadow-purple-500/50
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
        
        <Users className={`${sizeConfig.icon} text-white drop-shadow-sm relative z-10`} strokeWidth={3} />
      </div>
      
      {showLabel && (
        <span className="text-sm font-medium text-foreground">
          Frota Verificada
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

export default FleetSealBadge;

