import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SealRequiredNoticeProps {
  featureReason?: string;
}

const SealRequiredNotice = ({ featureReason }: SealRequiredNoticeProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <motion.div
        className="bg-card border border-border rounded-2xl p-8 text-center max-w-sm w-full shadow-lg"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-20 h-20 rounded-full bg-blue-500/15 flex items-center justify-center mx-auto mb-5 relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-pulse" />
          <ShieldCheck className="w-10 h-10 text-blue-500 relative z-10" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-3">
          Selo Verificado Necessário
        </h2>

        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
          Para acessar esta funcionalidade, é necessário ter o{" "}
          <span className="text-blue-400 font-medium">Selo Azul (Verificado)</span> ativo.
        </p>

        <p className="text-xs text-muted-foreground/80 mb-5">
          O selo garante autenticidade, confiança e segurança entre os usuários.
        </p>

        {featureReason && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-blue-300/90 italic">
              {featureReason}
            </p>
          </div>
        )}

        <Button
          onClick={() => navigate("/seals")}
          className="bg-blue-500 hover:bg-blue-600 w-full"
          data-testid="button-view-seals"
        >
          Ver Selos
        </Button>
      </motion.div>
    </div>
  );
};

export default SealRequiredNotice;
