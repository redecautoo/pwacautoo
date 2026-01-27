import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { alertCategories } from "@/lib/alertCategories";
import LicensePlateInput from "@/components/LicensePlateInput";
import AlertCategories from "@/components/AlertCategories";
import { PageTransition, scaleIn } from "@/components/PageTransition";

const SendAlert = () => {
  const navigate = useNavigate();
  const { sendAlert, showAlert } = useApp();
  const [plateValue, setPlateValue] = useState("");

  const handleSendAlert = (categoryId: string, messageId: string) => {
    const category = alertCategories.find((c) => c.id === categoryId);
    const message = category?.messages.find((m) => m.id === messageId);

    if (category && message) {
      sendAlert(plateValue, categoryId, category.name, messageId, message.text);
      showAlert(
        "Alerta Enviado!",
        "O proprietário do veículo receberá sua notificação em breve.",
        "success",
        plateValue
      );
      setPlateValue("");
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
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
      </div>
    </PageTransition>
  );
};

export default SendAlert;
