import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import { PageTransition, scaleIn } from "@/components/PageTransition";
import SuccessModal from "@/components/SuccessModal";
import SealRequiredNotice from "@/components/SealRequiredNotice";

const praiseOptions = [
  "Ajudou motorista com carro parado.",
  "Prestou ajuda em acidente leve.",
  "Rebocou veículo com pane.",
  "Avisou sobre problema no carro.",
  "Impediu tentativa de assalto.",
  "Removeu obstáculo da pista.",
  "Sinalizou perigo na via.",
  "Ofereceu carona em emergência.",
  "Socorreu vítima até local seguro.",
  "Alertou sobre risco imediato.",
];

const critiqueOptions = [
  { id: "1", text: "Avançou sinal vermelho." },
  { id: "2", text: "Ultrapassou em local proibido." },
  { id: "3", text: "Bloqueou garagem ou calçada." },
  { id: "4", text: "Usou celular ao dirigir." },
  { id: "5", text: "Andou na contramão." },
  { id: "6", text: "Ignorou pedestres ou ciclistas." },
  { id: "7", text: "Parou em vaga indevida." },
  { id: "8", text: "Mudou de faixa sem sinalizar." },
  { id: "9", text: "Gerou risco em cruzamento." },
  { id: "10", text: "Causou acidente por imprudência." },
];

type RatingType = "praise" | "critique";

const RateDriver = () => {
  const navigate = useNavigate();
  const { currentUser, sendPraise, sendAlert, canSendCritique, vehicles } = useApp();
  const [plateValue, setPlateValue] = useState("");
  const [ratingType, setRatingType] = useState<RatingType>("praise");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlate, setSuccessPlate] = useState("");
  const [successType, setSuccessType] = useState<RatingType>("praise");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState({ title: "", description: "" });
  
  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);
  const isOwnPlate = vehicles.some(v => v.plate === plateValue);
  
  if (!currentUser?.isVerified) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Avaliar Motorista</h1>
            </div>
          </header>
          
          <SealRequiredNotice featureReason="A verificação garante que elogios e críticas sejam de usuários reais, evitando abusos." />
        </div>
      </PageTransition>
    );
  }

  const showErrorModal = (title: string, description: string) => {
    setErrorMessage({ title, description });
    setShowError(true);
  };

  const handleSendRating = () => {
    if (!plateValue || plateValue.length < 7) {
      showErrorModal("Placa Inválida", "Digite uma placa válida para continuar.");
      return;
    }
    
    if (ratingType === "praise" && isOwnPlate) {
      showErrorModal("Ação Não Permitida", "Você não pode elogiar seu próprio veículo.");
      return;
    }
    
    if (!selectedOption) {
      showErrorModal(
        ratingType === "praise" ? "Selecione um Elogio" : "Selecione uma Crítica",
        ratingType === "praise" ? "Escolha uma opção de elogio para enviar." : "Escolha uma opção de crítica para enviar."
      );
      return;
    }

    if (ratingType === "praise") {
      const success = sendPraise(plateValue, selectedOption);
      if (success) {
        setSuccessPlate(plateValue);
        setSuccessType("praise");
        setShowSuccess(true);
        setPlateValue("");
        setSelectedOption(null);
      } else {
        showErrorModal("Limite Atingido", "Você já elogiou essa placa nos últimos 30 dias.");
      }
    } else {
      const { canSend, reason } = canSendCritique(plateValue);
      if (!canSend) {
        showErrorModal("Limite Atingido", reason || "Você atingiu o limite de críticas permitido.");
        return;
      }
      
      const critique = critiqueOptions.find(c => c.id === selectedOption);
      if (critique) {
        sendAlert(plateValue, "conducao-perigosa", "Condução Perigosa", selectedOption, critique.text);
        setSuccessPlate(plateValue);
        setSuccessType("critique");
        setShowSuccess(true);
        setPlateValue("");
        setSelectedOption(null);
      }
    }
  };

  const handleTypeChange = (type: RatingType) => {
    setRatingType(type);
    setSelectedOption(null);
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Avaliar Motorista</h1>
          </div>
        </header>
        
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div 
              className="bg-card border border-border rounded-2xl p-6 space-y-6"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
            >
              <LicensePlateInput value={plateValue} onChange={setPlateValue} />
              
              {isOwnPlate && plateIsValid && ratingType === "praise" && (
                <p className="text-sm text-destructive text-center" data-testid="text-own-plate-error">
                  Você não pode elogiar seu próprio veículo
                </p>
              )}
              
              {plateIsValid && !(isOwnPlate && ratingType === "praise") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        ratingType === "praise"
                          ? "border-green-500 bg-green-500/15 text-green-400"
                          : "border-border hover:border-green-500/50 text-muted-foreground hover:text-green-400"
                      }`}
                      onClick={() => handleTypeChange("praise")}
                      data-testid="button-praise-tab"
                    >
                      <ThumbsUp className="w-5 h-5" />
                      <span className="font-medium">Elogio</span>
                    </button>
                    <button
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        ratingType === "critique"
                          ? "border-red-500 bg-red-500/15 text-red-400"
                          : "border-border hover:border-red-500/50 text-muted-foreground hover:text-red-400"
                      }`}
                      onClick={() => handleTypeChange("critique")}
                      data-testid="button-critique-tab"
                    >
                      <ThumbsDown className="w-5 h-5" />
                      <span className="font-medium">Crítica</span>
                    </button>
                  </div>

                  <motion.div 
                    className={`rounded-xl p-4 ${
                      ratingType === "praise" 
                        ? "bg-green-500/10 border border-green-500/20" 
                        : "bg-red-500/10 border border-red-500/20"
                    }`}
                    key={ratingType}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <Info className={`w-5 h-5 flex-shrink-0 mt-0.5 ${ratingType === "praise" ? "text-green-500" : "text-red-500"}`} />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">
                          {ratingType === "praise" ? "Sobre os elogios:" : "Sobre as críticas:"}
                        </p>
                        <ul className="space-y-1 text-xs">
                          {ratingType === "praise" ? (
                            <>
                              <li>Máx. 3 elogios por placa a cada 30 dias</li>
                              <li>Máx. 5 elogios enviados por dia</li>
                              <li>Melhora o Score do Veículo (+2 pts)</li>
                              <li>Aumenta o ICC (+1 pt)</li>
                              <li>Remetente anônimo</li>
                            </>
                          ) : (
                            <>
                              <li>Máx. 3 críticas por placa a cada 30 dias</li>
                              <li>Máx. 5 críticas enviadas por dia</li>
                              <li>Impacta o Score do Veículo (-1 pt)</li>
                              <li>Não altera o ICC</li>
                              <li>Remetente anônimo</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-2">
                    {ratingType === "praise" ? (
                      praiseOptions.map((option) => (
                        <button
                          key={option}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedOption === option 
                              ? "border-green-500 bg-green-500/10" 
                              : "border-border hover:border-green-500/50 hover:bg-secondary/50"
                          }`}
                          onClick={() => setSelectedOption(option)}
                          data-testid={`button-option-${option.substring(0, 20)}`}
                        >
                          <span className="text-sm text-foreground">{option}</span>
                        </button>
                      ))
                    ) : (
                      critiqueOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedOption === option.id 
                              ? "border-red-500 bg-red-500/10" 
                              : "border-border hover:border-red-500/50 hover:bg-secondary/50"
                          }`}
                          onClick={() => setSelectedOption(option.id)}
                          data-testid={`button-option-${option.id}`}
                        >
                          <span className="text-sm text-foreground">{option.text}</span>
                        </button>
                      ))
                    )}
                  </div>
                  
                  <Button 
                    className={`w-full ${
                      ratingType === "praise" 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                    onClick={handleSendRating}
                    disabled={!selectedOption}
                    data-testid="button-send-rating"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {ratingType === "praise" ? "Enviar Elogio" : "Enviar Crítica"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </main>

        <SuccessModal
          isOpen={showSuccess}
          onClose={() => setShowSuccess(false)}
          title={successType === "praise" ? "Elogio Enviado!" : "Crítica Enviada!"}
          description={successType === "praise" ? "O motorista do veículo" : "A crítica foi registrada para o veículo"}
          highlightText={successPlate}
          variant="success"
        />

        <SuccessModal
          isOpen={showError}
          onClose={() => setShowError(false)}
          title={errorMessage.title}
          description={errorMessage.description}
          variant="error"
        />
      </div>
    </PageTransition>
  );
};

export default RateDriver;

