import { useState, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { isValidPlate } from "@/components/LicensePlateInput";
import { recordPlateReport, isPlateReported } from "@/lib/plateInteractionControl";
import { useApp } from "@/contexts/AppContext";

interface ReportFormProps {
    plateValue: string;
    onSuccess?: () => void;
}

type ReportReason =
    | "roubado"
    | "clonado"
    | "crime"
    | "golpe"
    | "criminoso"
    | "suspeito"
    | "outro"
    | null;

const ReportForm = ({ plateValue, onSuccess }: ReportFormProps) => {
    const { currentUser, showAlert } = useApp();
    const [selectedReason, setSelectedReason] = useState<ReportReason>(null);
    const [otherReasonText, setOtherReasonText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);

    const reportReasons = [
        { id: "roubado" as const, label: "Veículo roubado" },
        { id: "clonado" as const, label: "Veículo clonado" },
        { id: "crime" as const, label: "Suspeita de crime" },
        { id: "golpe" as const, label: "Tentativa de golpe" },
        { id: "criminoso" as const, label: "Comportamento criminoso" },
        { id: "suspeito" as const, label: "Veículo suspeito em atividade ilegal" },
        { id: "outro" as const, label: "Outro motivo grave" },
    ];

    const handleSubmit = async () => {
        // Validar placa primeiro
        if (!plateValue || plateValue.length < 7) {
            showAlert("Placa Inválida", "Digite uma placa válida para realizar a denúncia", "error");
            return;
        }

        // Check if already reported
        if (isPlateReported(plateValue, currentUser?.id || '')) {
            showAlert("Denúncia já Realizada", "Você já denunciou esta placa anteriormente. Aguarde a análise do suporte.", "warning");
            return;
        }

        if (!selectedReason) {
            showAlert("Motivo obrigatório", "Selecione um motivo para a denúncia", "warning");
            return;
        }

        if (selectedReason === "outro" && otherReasonText.trim().length === 0) {
            showAlert("Campo obrigatório", "Descreva o motivo da denúncia para continuar", "warning");
            return;
        }

        setIsSubmitting(true);

        try {
            // Simular envio da denúncia
            await new Promise((resolve) => setTimeout(resolve, 1000));

            const reasonLabel =
                selectedReason === "outro"
                    ? otherReasonText
                    : reportReasons.find((r) => r.id === selectedReason)?.label;

            showAlert("Denúncia Registrada", "A placa foi denunciada e está sob análise. Novas interações estão bloqueadas.", "success", plateValue);

            recordPlateReport(plateValue, currentUser?.id || '');

            // Reset form
            setSelectedReason(null);
            setOtherReasonText("");
            onSuccess?.();
        } catch (error) {
            showAlert("Erro ao processar", "Não foi possível registrar sua denúncia no momento.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid =
        plateValue &&
        plateValue.length >= 7 &&
        selectedReason !== null &&
        (selectedReason !== "outro" || otherReasonText.trim().length > 0);

    if (!plateIsValid) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
                <p>Digite uma placa válida para realizar a denúncia</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Report Reasons */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                    Selecione o motivo da denúncia
                </label>
                <div className="grid gap-2">
                    {reportReasons.map((reason) => (
                        <button
                            key={reason.id}
                            onClick={() => {
                                setSelectedReason(reason.id);
                                if (reason.id !== "outro") {
                                    setOtherReasonText("");
                                }
                            }}
                            className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${selectedReason === reason.id
                                ? "border-primary bg-primary/10 text-foreground font-medium"
                                : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {reason.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Other Reason Text Field */}
            {selectedReason === "outro" && (
                <div className="space-y-2 pt-2">
                    <label className="text-sm font-medium text-foreground block">
                        Descreva o motivo da denúncia
                    </label>
                    <Textarea
                        placeholder="Descreva detalhadamente o motivo da denúncia..."
                        className="resize-none min-h-[100px] text-base"
                        value={otherReasonText}
                        onChange={(e) => setOtherReasonText(e.target.value)}
                        maxLength={140}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                            {otherReasonText.length}/140
                        </span>
                        {otherReasonText.trim().length === 0 && (
                            <span className="text-xs text-destructive">
                                Campo obrigatório
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Submit Button */}
            <Button
                className="w-full"
                variant="destructive"
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
            >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {isSubmitting ? "Enviando..." : "Denunciar placa"}
            </Button>
        </div>
    );
};

export default ReportForm;
