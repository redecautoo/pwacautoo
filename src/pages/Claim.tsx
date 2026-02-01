import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import SuccessModal from "@/components/SuccessModal";

const Claim = () => {
  const navigate = useNavigate();
  const { claims, submitClaim } = useApp();
  const [plateValue, setPlateValue] = useState("");
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successPlate, setSuccessPlate] = useState("");
  
  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);
  const myClaims = claims;
  const isValid = plateIsValid && reason.length >= 20;
  
  const handleSubmitClaim = () => {
    if (isValid) {
      submitClaim(plateValue, reason);
      setSuccessPlate(plateValue);
      setShowSuccess(true);
      setPlateValue("");
      setReason("");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded flex items-center gap-1">
            <Clock className="w-3 h-3" /> Em análise
          </span>
        );
      case 'approved':
        return (
          <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Aprovada
          </span>
        );
      case 'rejected':
        return (
          <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Recusada
          </span>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Reivindicar Placa</h1>
        </div>
      </header>
      
      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* My claims */}
          {myClaims.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Minhas Reivindicações</h2>
              <div className="space-y-3">
                {myClaims.map((claim) => (
                  <div key={claim.id} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-foreground tracking-wider">{claim.plate}</span>
                      {getStatusBadge(claim.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{claim.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {/* New claim form */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Nova Reivindicação</h2>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  Use esta opção se você é o verdadeiro dono de uma placa que já está cadastrada por outro usuário.
                </p>
              </div>
              
              <LicensePlateInput value={plateValue} onChange={setPlateValue} />
              
              <div>
                <label className="block text-sm text-muted-foreground mb-2">
                  Motivo da reivindicação
                </label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explique por que você é o verdadeiro dono deste veículo (mínimo 20 caracteres)"
                  rows={4}
                />
              </div>
              
              <Button
                onClick={handleSubmitClaim}
                disabled={!isValid}
                className="w-full h-12 font-bold"
              >
                <Flag className="w-4 h-4 mr-2" />
                Enviar Reivindicação
              </Button>
            </div>
          </section>
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Reivindicação Enviada!"
        description="Sua solicitação está em análise para a placa"
        highlightText={successPlate}
        variant="success"
      />
    </div>
  );
};

export default Claim;

