import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  highlightText?: string;
  duration?: number;
}

const SuccessConfirmation = ({
  isOpen,
  onClose,
  title,
  description,
  highlightText,
  duration = 2500,
}: SuccessConfirmationProps) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, duration]);

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
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-background/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center shadow-2xl !opacity-100"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          >
            {/* Success Icon */}
            <motion.div
              className="mx-auto mb-6 w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}
            >
              <motion.div
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.25, type: "spring", bounce: 0.5 }}
              >
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.3 }}
                >
                  <Check className="w-7 h-7 text-primary-foreground stroke-[3]" />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-xl font-bold text-foreground mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h2>

            {/* Description */}
            {(description || highlightText) && (
              <motion.p
                className="text-muted-foreground text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {description}{" "}
                {highlightText && (
                  <span className="font-semibold text-primary">{highlightText}</span>
                )}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessConfirmation;
