import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ScoreInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const scoreCategories = [
  { label: "Placa em Alerta", range: "< 0", badgeClass: "badge-vermelho" },
  { label: "Placa Neutra", range: "0 - 199", badgeClass: "badge-cinza" },
  { label: "Placa Conhecida", range: "200 - 399", badgeClass: "badge-azul" },
  { label: "Placa Confiável", range: "400 - 649", badgeClass: "badge-laranja" },
  { label: "Placa Distinta", range: "650 - 849", badgeClass: "badge-roxo" },
  { label: "Placa Exemplar", range: "850 - 1000", badgeClass: "badge-amarelo" },
  { label: "Placa Ícone Cautoo", range: "1001+", badgeClass: "badge-verde" },
];

const ScoreInfoModal = ({ isOpen, onClose }: ScoreInfoModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Score da Placa</h2>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Unlock className="w-3 h-3" />
                      <span>Índice público</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-secondary rounded-full transition-colors text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-5">
                O Score reflete o histórico de interações da placa na rede CAUTOO. Quanto melhor o comportamento do veículo, maior a pontuação.
              </p>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Categorias</p>
                {scoreCategories.map((cat, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`badge-capsula ${cat.badgeClass} scale-[0.8] origin-left`} />
                      <span className="text-sm text-foreground">{cat.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">
                      {cat.range}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-secondary/30 border-t border-border">
              <Button className="w-full h-12 font-bold" onClick={onClose}>
                Entendi
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScoreInfoModal;
