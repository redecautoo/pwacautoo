import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ParkingCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";
import { TipoVaga, StatusVaga, VALOR_DIARIA_PADRAO } from "@/lib/vagasTypes";

const VagasNovaVaga = () => {
  const navigate = useNavigate();
  const { condominioId } = useParams<{ condominioId: string }>();
  const { criarVaga, condominios } = useVagas();
  const { showAlert } = useApp();

  const condominio = condominios.find(c => c.id === condominioId);

  const [formData, setFormData] = useState({
    numero: "",
    tipo: "coberta" as TipoVaga,
    placa: "",
    observacao: "",
    status: "ocupada" as StatusVaga,
    precoDiario: VALOR_DIARIA_PADRAO.toString(),
    precoMensal: "",
    disponivelDe: "",
    disponivelAte: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = formData.numero.trim().length >= 1 &&
    formData.placa.replace(/[^A-Z0-9]/gi, '').length === 7;

  const isDisponivel = formData.status === 'disponivel';
  const datasValidas = !isDisponivel || (formData.disponivelDe && formData.disponivelAte);

  const handleSubmit = async () => {
    if (!isValid || !datasValidas || !condominioId) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    criarVaga({
      condominioId,
      numero: formData.numero.trim(),
      tipo: formData.tipo,
      placa: formData.placa.toUpperCase().replace(/[^A-Z0-9]/gi, ''),
      observacao: formData.observacao.trim() || undefined,
      status: formData.status,
      precoDiario: parseFloat(formData.precoDiario) || VALOR_DIARIA_PADRAO,
      precoMensal: formData.precoMensal ? parseFloat(formData.precoMensal) : undefined,
      disponivelDe: isDisponivel ? formData.disponivelDe : undefined,
      disponivelAte: isDisponivel ? formData.disponivelAte : undefined,
    });

    setIsSubmitting(false);
    setSuccess(true);
    showAlert("Vaga Cadastrada!", "Sua vaga foi vinculada ao condomínio com sucesso.", "success");

    setTimeout(() => {
      navigate(`/garagem/condominio/${condominioId}`);
    }, 1500);
  };

  if (!condominio) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Condomínio não encontrado</p>
        </div>
      </PageTransition>
    );
  }

  if (success) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div className="bg-card border border-border rounded-xl p-8 text-center max-w-sm" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <motion.div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}><Check className="w-8 h-8 text-green-500" /></motion.div>
            <h2 className="text-xl font-semibold mb-2">Vaga Cadastrada!</h2>
            <p className="text-sm text-muted-foreground">Sua vaga está ativa e pronta para uso ou aluguel.</p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-lg font-semibold">Nova Vaga</h1><p className="text-sm text-muted-foreground">{condominio.nome}</p></div>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center"><ParkingCircle className="w-10 h-10 text-green-400" /></div></div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="numero">Número da Vaga *</Label><Input id="numero" placeholder="Ex: 15A" value={formData.numero} onChange={(e) => handleChange("numero", e.target.value)} maxLength={10} className="mt-1.5" /></div>
                <div><Label htmlFor="placa">Placa Associada *</Label><Input id="placa" placeholder="ABC1D23" value={formData.placa} onChange={(e) => handleChange("placa", e.target.value.toUpperCase())} maxLength={7} className="mt-1.5" /></div>
              </div>
              <div><Label>Tipo de Vaga</Label><RadioGroup value={formData.tipo} onValueChange={(v) => handleChange("tipo", v)} className="mt-2 flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="coberta" id="coberta" /><Label htmlFor="coberta" className="font-normal cursor-pointer">Coberta</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="descoberta" id="descoberta" /><Label htmlFor="descoberta" className="font-normal cursor-pointer">Descoberta</Label></div></RadioGroup></div>
              <div><Label>Status Atual</Label><RadioGroup value={formData.status} onValueChange={(v) => handleChange("status", v)} className="mt-2 flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="ocupada" id="ocupada" /><Label htmlFor="ocupada" className="font-normal cursor-pointer">Ocupada</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="disponivel" id="disponivel" /><Label htmlFor="disponivel" className="font-normal cursor-pointer">Disponível</Label></div></RadioGroup></div>
              {isDisponivel && (<motion.div className="grid grid-cols-2 gap-4" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                <div><Label htmlFor="disponivelDe">Disponível de *</Label><Input id="disponivelDe" type="date" value={formData.disponivelDe} onChange={(e) => handleChange("disponivelDe", e.target.value)} className="mt-1.5" /></div>
                <div><Label htmlFor="disponivelAte">Disponível até *</Label><Input id="disponivelAte" type="date" value={formData.disponivelAte} onChange={(e) => handleChange("disponivelAte", e.target.value)} className="mt-1.5" /></div>
              </motion.div>)}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="precoDiario">Preço Diário (R$) *</Label>
                  <Input 
                    id="precoDiario" 
                    type="number" 
                    placeholder="25" 
                    value={formData.precoDiario} 
                    onChange={(e) => handleChange("precoDiario", e.target.value)} 
                    min="1"
                    className="mt-1.5" 
                    data-testid="input-preco-diario"
                  />
                </div>
                <div>
                  <Label htmlFor="precoMensal">Preço Mensal (R$)</Label>
                  <Input 
                    id="precoMensal" 
                    type="number" 
                    placeholder="500" 
                    value={formData.precoMensal} 
                    onChange={(e) => handleChange("precoMensal", e.target.value)} 
                    min="1"
                    className="mt-1.5" 
                    data-testid="input-preco-mensal"
                  />
                </div>
              </div>
              <div><Label htmlFor="observacao">Observação (opcional)</Label><Textarea id="observacao" placeholder="Informações extras..." value={formData.observacao} onChange={(e) => handleChange("observacao", e.target.value)} maxLength={120} className="mt-1.5 resize-none" rows={3} /></div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-xs text-blue-400"><strong>Dica:</strong> Vagas marcadas como "Disponível" podem ser alugadas por outros moradores. Você define o preço!</div>
            <Button onClick={handleSubmit} disabled={!isValid || !datasValidas || isSubmitting} className="w-full h-12 font-bold" size="lg">
              {isSubmitting ? <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} /> : <><ParkingCircle className="w-4 h-4 mr-2" />Cadastrar Vaga</>}
            </Button>
          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasNovaVaga;

