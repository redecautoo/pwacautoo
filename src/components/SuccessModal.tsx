import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SuccessModalVariant = "success" | "warning" | "error";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  highlightText?: string;
  variant?: SuccessModalVariant;
  buttonText?: string;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
}

const variantConfig = {
  success: {
    icon: Check,
    outerBg: "bg-green-500/20",
    innerBg: "bg-green-500",
    iconColor: "text-white",
    titleColor: "text-foreground",
    highlightColor: "text-green-500",
  },
  warning: {
    icon: AlertTriangle,
    outerBg: "bg-amber-500/20",
    innerBg: "bg-amber-500",
    iconColor: "text-white",
    titleColor: "text-foreground",
    highlightColor: "text-amber-500",
  },
  error: {
    icon: AlertTriangle,
    outerBg: "bg-destructive/20",
    innerBg: "bg-destructive",
    iconColor: "text-white",
    titleColor: "text-foreground",
    highlightColor: "text-destructive",
  },
};

const SuccessModal = ({
  isOpen,
  onClose,
  title,
  description,
  highlightText,
  variant = "success",
  buttonText = "OK",
  secondaryButtonText,
  onSecondaryClick,
}: SuccessModalProps) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop - Fundo escuro */}
          <motion.div
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content - Modal centralizado */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center shadow-2xl"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          >
            {/* Icon - Ícone grande no topo */}
            <motion.div
              className={`mx-auto mb-6 w-20 h-20 rounded-full ${config.outerBg} flex items-center justify-center`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}
            >
              <motion.div
                className={`w-14 h-14 rounded-full ${config.innerBg} flex items-center justify-center`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", bounce: 0.5 }}
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <IconComponent className={`w-7 h-7 ${config.iconColor} stroke-[3]`} />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title - Título grande em branco */}
            <motion.h2
              className={`text-xl font-bold ${config.titleColor} mb-2`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h2>

            {/* Description - Subtítulo em azul ou verde */}
            {(description || highlightText) && (
              <motion.p
                className="text-muted-foreground text-sm mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {description}{" "}
                {highlightText && (
                  <span className={`font-semibold ${config.highlightColor}`}>{highlightText}</span>
                )}
              </motion.p>
            )}

            {/* Buttons */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button 
                className="w-full" 
                onClick={onClose}
              >
                {buttonText}
              </Button>
              
              {secondaryButtonText && onSecondaryClick && (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={onSecondaryClick}
                >
                  {secondaryButtonText}
                </Button>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
