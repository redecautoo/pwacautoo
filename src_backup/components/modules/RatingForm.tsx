import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Send, Info, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { isValidPlate } from "@/components/LicensePlateInput";
import { canEvaluatePlate, recordEvaluation } from "@/lib/plateInteractionControl";

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

interface RatingFormProps {
    plateValue: string;
    onSuccess?: () => void;
}

const RatingForm = ({ plateValue, onSuccess }: RatingFormProps) => {
    const { currentUser, sendPraise, sendAlert, canSendCritique, vehicles, showAlert } = useApp();
    const [ratingType, setRatingType] = useState<RatingType>("praise");
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);
    const isOwnPlate = vehicles.some(v => v.plate === plateValue);

    const handleSendRating = () => {
        if (!plateValue || plateValue.length < 7) {
            showAlert("Placa Inválida", "Digite uma placa válida para continuar.", "error");
            return;
        }

        // Check 24h evaluation limit
        const { canEvaluate, reason: evalReason } = canEvaluatePlate(plateValue, currentUser?.id || '');
        if (!canEvaluate) {
            showAlert("Limite Atingido", evalReason || "Você não pode avaliar esta placa no momento.", "warning");
            return;
        }

        if (ratingType === "praise" && isOwnPlate) {
            showAlert("Ação Não Permitida", "Você não pode elogiar seu próprio veículo.", "error");
            return;
        }

        if (!selectedOption) {
            showAlert(
                ratingType === "praise" ? "Selecione um Elogio" : "Selecione uma Crítica",
                ratingType === "praise" ? "Escolha uma opção de elogio para enviar." : "Escolha uma opção de crítica para enviar.",
                "warning"
            );
            return;
        }

        if (ratingType === "praise") {
            const success = sendPraise(plateValue, selectedOption);
            if (success) {
                recordEvaluation(plateValue, currentUser?.id || '');
                showAlert(
                    "Elogio Enviado!",
                    "Sua avaliação positiva foi registrada para o veículo",
                    "success",
                    plateValue
                );
                setSelectedOption(null);
                onSuccess?.();
            } else {
                showAlert("Limite Atingido", "Você já elogiou essa placa nos últimos 30 dias.", "warning");
            }
        } else {
            const { canSend, reason } = canSendCritique(plateValue);
            if (!canSend) {
                showAlert("Limite Atingido", reason || "Você atingiu o limite de críticas permitido.", "warning");
                return;
            }

            const critique = critiqueOptions.find(c => c.id === selectedOption);
            if (critique) {
                sendAlert(plateValue, "conducao-perigosa", "Condução Perigosa", selectedOption, critique.text);
                recordEvaluation(plateValue, currentUser?.id || '');
                showAlert(
                    "Crítica Enviada!",
                    "Seu alerta de condução foi registrado para o veículo",
                    "success",
                    plateValue
                );
                setSelectedOption(null);
                onSuccess?.();
            }
        }
    };

    const handleTypeChange = (type: RatingType) => {
        setRatingType(type);
        setSelectedOption(null);
    };

    if (!plateIsValid) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
                <p>Digite uma placa válida para avaliar</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
            >
                <div className="grid grid-cols-2 gap-3">
                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${ratingType === "praise"
                            ? "border-green-500 bg-green-500/15 text-green-400"
                            : "border-border hover:border-green-500/50 text-muted-foreground hover:text-green-400"
                            }`}
                        onClick={() => handleTypeChange("praise")}
                    >
                        <ThumbsUp className="w-5 h-5" />
                        <span className="font-medium">Elogio</span>
                    </button>
                    <button
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${ratingType === "critique"
                            ? "border-red-500 bg-red-500/15 text-red-400"
                            : "border-border hover:border-red-500/50 text-muted-foreground hover:text-red-400"
                            }`}
                        onClick={() => handleTypeChange("critique")}
                    >
                        <ThumbsDown className="w-5 h-5" />
                        <span className="font-medium">Crítica</span>
                    </button>
                </div>

                <motion.div
                    className={`rounded-xl p-4 ${ratingType === "praise"
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
                                        <li>Melhora o Score do Veículo (+2 pts)</li>
                                        <li>Remetente anônimo</li>
                                    </>
                                ) : (
                                    <>
                                        <li>Máx. 3 críticas por placa a cada 30 dias</li>
                                        <li>Impacta o Score do Veículo (-1 pt)</li>
                                        <li>Remetente anônimo</li>
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                </motion.div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {ratingType === "praise" ? (
                        praiseOptions.map((option) => (
                            <button
                                key={option}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedOption === option
                                    ? "border-green-500 bg-green-500/10"
                                    : "border-border hover:border-green-500/50 hover:bg-secondary/50"
                                    }`}
                                onClick={() => setSelectedOption(option)}
                                disabled={isOwnPlate}
                            >
                                <span className="text-sm text-foreground">{option}</span>
                            </button>
                        ))
                    ) : (
                        critiqueOptions.map((option) => (
                            <button
                                key={option.id}
                                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedOption === option.id
                                    ? "border-red-500 bg-red-500/10"
                                    : "border-border hover:border-red-500/50 hover:bg-secondary/50"
                                    }`}
                                onClick={() => setSelectedOption(option.id)}
                            >
                                <span className="text-sm text-foreground">{option.text}</span>
                            </button>
                        ))
                    )}
                </div>

                <Button
                    className={`w-full ${ratingType === "praise"
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                        }`}
                    onClick={handleSendRating}
                    disabled={!selectedOption || (ratingType === "praise" && isOwnPlate)}
                >
                    <Send className="w-4 h-4 mr-2" />
                    {ratingType === "praise" ? "Enviar Elogio" : "Enviar Crítica"}
                </Button>
            </motion.div>
        </div>
    );
};

export default RatingForm;
