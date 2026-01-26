import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { alertCategories } from "@/lib/alertCategories";
import LicensePlateInput from "@/components/LicensePlateInput";
import AlertCategories from "@/components/AlertCategories";
import SuccessModal from "@/components/SuccessModal";
import { PageTransition, scaleIn } from "@/components/PageTransition";

const SendAlert = () => {
  const navigate = useNavigate();
  const { sendAlert } = useApp();
  const [plateValue, setPlateValue] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlate, setSuccessPlate] = useState("");

  const handleSendAlert = (categoryId: string, messageId: string) => {
    const category = alertCategories.find((c) => c.id === categoryId);
    const message = category?.messages.find((m) => m.id === messageId);

    if (category && message) {
      sendAlert(plateValue, categoryId, category.name, messageId, message.text);
      setSuccessPlate(plateValue);
      setShowSuccess(true);
      setPlateValue("");
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Enviar Alerta</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            <motion.div 
              className="bg-card border border-border rounded-2xl p-6 space-y-6"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
            >
              <LicensePlateInput value={plateValue} onChange={setPlateValue} />
              <AlertCategories plateValue={plateValue} onSendAlert={handleSendAlert} />
            </motion.div>
          </div>
        </main>

        {/* Success Modal */}
        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title="Alerta Enviado!"
          description="O proprietário do veículo"
          highlightText={successPlate}
          variant="success"
        />
      </div>
    </PageTransition>
  );
};

export default SendAlert;
