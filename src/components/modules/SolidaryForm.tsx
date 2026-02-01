import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Phone, AlertTriangle, Info, ChevronDown, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import { isValidPlate } from "@/components/LicensePlateInput";
import { SolidaryEmergencyType, getEmergencyTypeLabel, isValidVerificationCode } from "@/lib/types";
import { canSendSolidaryAlert, recordSolidaryAlert } from "@/lib/plateInteractionControl";

const emergencyTypes: { value: SolidaryEmergencyType; label: string }[] = [
    { value: 'pane_mecanica', label: 'Pane mecânica' },
    { value: 'pneu_furado', label: 'Pneu furado' },
    { value: 'acidente_leve', label: 'Acidente leve' },
    { value: 'falta_combustivel', label: 'Falta de combustível' },
    { value: 'roubo_furto', label: 'Roubo/furto' },
    { value: 'situacao_risco', label: 'Situação de risco / motorista sem sinal' },
    { value: 'outro', label: 'Outro' },
];

interface SolidaryFormProps {
    plateValue: string;
    onSuccess?: () => void;
}

const SolidaryForm = ({ plateValue, onSuccess }: SolidaryFormProps) => {
    const { currentUser, sendSolidaryAlert, getSolidaryAlertsForUser, showAlert } = useApp();

    const [emergencyType, setEmergencyType] = useState<SolidaryEmergencyType | "">("");
    const [otherDescription, setOtherDescription] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [approximateTime, setApproximateTime] = useState("");
    const [driverWithoutPhone, setDriverWithoutPhone] = useState(false);
    const [driverWithoutSignal, setDriverWithoutSignal] = useState(false);
    const [additionalPhone, setAdditionalPhone] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showEmergencyDropdown, setShowEmergencyDropdown] = useState(false);
    const [verificationCodeInput, setVerificationCodeInput] = useState("");
    const [codeError, setCodeError] = useState("");

    const formatPhone = (value: string) => {
        const cleaned = value.replace(/\D/g, "");
        if (cleaned.length <= 2) return cleaned;
        if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
    };

    const plateIsValid = isValidPlate(plateValue);

    // O ajudante precisa informar o código da VÍTIMA (motorista que precisa de ajuda)
    const isVictimCodeValid = isValidVerificationCode(verificationCodeInput.trim());

    const canSubmit =
        plateIsValid &&
        emergencyType !== "" &&
        (emergencyType !== 'outro' || otherDescription.trim()) &&
        description.trim() &&
        location.trim() &&
        approximateTime.trim() &&
        isVictimCodeValid;

    const checkAlertLimit = () => {
        if (!currentUser) return false;
        const alerts = getSolidaryAlertsForUser?.(currentUser.id) || [];
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentAlerts = alerts.filter(a => new Date(a.createdAt) > oneHourAgo);
        return recentAlerts.length < 2;
    };

    const handleSubmit = async () => {
        if (!currentUser || !canSubmit) return;

        // Validação do formato do código da vítima
        if (!isVictimCodeValid) {
            setCodeError("Código inválido. Peça o código correto ao motorista.");
            showAlert("Código Inválido", "O código informado não está no formato correto. Confirme com o motorista.", "error");
            return;
        }
        setCodeError("");

        // Check if can send solidary alert to this plate (one-time per plate)
        const { canSend, reason } = canSendSolidaryAlert(plateValue, currentUser.id);
        if (!canSend) {
            showAlert("Ação Bloqueada", reason || 'Não é possível enviar alerta para esta placa', "warning");
            return;
        }

        if (!checkAlertLimit()) {
            showAlert("Limite Atingido", "Você pode enviar no máximo 2 alertas solidários por hora.", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const alertData = {
                targetPlate: plateValue.replace("-", ""),
                emergencyType: emergencyType as SolidaryEmergencyType,
                description: emergencyType === 'outro' ? otherDescription : description,
                location,
                approximateTime,
                driverWithoutSignal,
                additionalPhone: additionalPhone || undefined,
                victimVerificationCode: verificationCodeInput.trim(), // Código da vítima para validação
            };

            const result = sendSolidaryAlert?.(alertData);

            if (result?.success) {
                recordSolidaryAlert(plateValue, currentUser.id);

                let successMsg = "Alerta enviado com sucesso! A Cautoo irá verificar e atender a solicitação.";
                if (!result.hasCoverage) {
                    successMsg = "O motorista não possui cobertura Cautoo ativa. O alerta foi registrado mas não será encaminhado até que a cobertura esteja válida.";
                }

                showAlert("Alerta Registrado!", successMsg, "success");
                setVerificationCodeInput("");
                onSuccess?.();
            } else {
                showAlert("Erro ao enviar", result?.error || "Não foi possível enviar o alerta.", "error");
            }
        } catch (error) {
            showAlert("Erro de Sistema", "Ocorreu um erro ao tentar processar seu alerta.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!plateIsValid) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-secondary/20 rounded-xl border border-border/50">
                <p>Digite uma placa válida para enviar um alerta solidário</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                        <p className="text-sm text-foreground font-medium mb-1">
                            Ajude outro motorista
                        </p>
                        <p className="text-xs text-muted-foreground">
                            O alerta será entregue a quem tem cobertura Cautoo ativa.
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Tipo de emergência *
                    </label>
                    <div className="relative">
                        <button
                            onClick={() => setShowEmergencyDropdown(!showEmergencyDropdown)}
                            className="w-full flex items-center justify-between p-3 bg-background border border-border rounded-lg text-left"
                        >
                            <span className={emergencyType ? "text-foreground" : "text-muted-foreground"}>
                                {emergencyType ? getEmergencyTypeLabel(emergencyType) : "Selecione o tipo"}
                            </span>
                            <ChevronDown className={`w-4 h-4 transition-transform ${showEmergencyDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {showEmergencyDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden max-h-60 overflow-y-auto"
                                >
                                    {emergencyTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => {
                                                setEmergencyType(type.value);
                                                setShowEmergencyDropdown(false);
                                            }}
                                            className={`w-full p-3 text-left text-sm hover:bg-secondary/50 transition-colors ${emergencyType === type.value ? 'bg-blue-500/10 text-blue-500' : 'text-foreground'
                                                }`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {emergencyType === 'outro' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                    >
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Descreva a emergência *
                        </label>
                        <Input
                            value={otherDescription}
                            onChange={(e) => setOtherDescription(e.target.value)}
                            placeholder="Descreva brevemente"
                            maxLength={50}
                        />
                    </motion.div>
                )}

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Local do ocorrido *
                    </label>
                    <Textarea
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Rua, ponto de referência..."
                        className="resize-none"
                        rows={2}
                        maxLength={150}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Breve descrição *
                    </label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="O que aconteceu?"
                        className="resize-none"
                        rows={2}
                        maxLength={200}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Horário aproximado *
                    </label>
                    <Input
                        value={approximateTime}
                        onChange={(e) => setApproximateTime(e.target.value)}
                        placeholder="Ex: Há 10 minutos..."
                        maxLength={50}
                    />
                </div>

                <div className="space-y-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                    <p className="text-xs font-medium text-foreground">Situação (opcional)</p>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={driverWithoutPhone}
                                onChange={(e) => setDriverWithoutPhone(e.target.checked)}
                                className="w-4 h-4 rounded border-amber-500 text-amber-500"
                            />
                            <span className="text-xs text-foreground">Motorista sem celular</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={driverWithoutSignal}
                                onChange={(e) => setDriverWithoutSignal(e.target.checked)}
                                className="w-4 h-4 rounded border-amber-500 text-amber-500"
                            />
                            <span className="text-xs text-foreground">Local sem sinal</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />
                        Telefone contato (opcional)
                    </label>
                    <Input
                        value={additionalPhone}
                        onChange={(e) => setAdditionalPhone(formatPhone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                    />
                </div>
            </div>

            {/* Verification Code Section - Código da VÍTIMA */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-medium text-foreground">Código do Motorista</span>
                </div>
                
                <p className="text-xs text-muted-foreground">
                    Digite o código de verificação que o motorista compartilhou com você.
                </p>
                <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={verificationCodeInput}
                        onChange={(e) => {
                            setVerificationCodeInput(e.target.value.toUpperCase());
                            setCodeError("");
                        }}
                        placeholder="Ex: ABC123"
                        className={`pl-10 font-mono tracking-widest uppercase ${codeError ? 'border-red-500' : ''}`}
                        maxLength={8}
                        data-testid="input-victim-verification-code"
                    />
                </div>
                {codeError && (
                    <p className="text-xs text-red-500">{codeError}</p>
                )}
                <p className="text-[10px] text-muted-foreground">
                    Este código comprova que o motorista autorizou você a enviar este alerta.
                </p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex gap-2 items-start">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">
                    Uso indevido pode resultar em suspensão.
                </p>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-blue-500 hover:bg-blue-600"
                size="lg"
                data-testid="button-submit-solidary-alert"
            >
                {isSubmitting ? "Enviando..." : "Enviar Alerta Solidário"}
            </Button>
        </div>
    );
};

export default SolidaryForm;
