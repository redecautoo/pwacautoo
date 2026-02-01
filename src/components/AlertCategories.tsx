import React, { useState, useMemo } from "react";
import { alertCategories, AlertMessage } from "@/lib/alertCategories";
import { useApp } from "@/contexts/AppContext";
import { isValidPlate } from "@/components/LicensePlateInput";
import { useVagas } from "@/contexts/VagasContext";
import { Wallet, ChevronDown, Send, Lock, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AlertCategoriesProps {
  plateValue: string;
  onSendAlert: (categoryId: string, messageId: string) => void;
}

const AlertCategories = ({ plateValue, onSendAlert }: AlertCategoriesProps) => {
  const { isLoggedIn, currentUser, showAlert } = useApp();
  const { saldo, pagarComCauCash } = useVagas();

  const [selectedMessage, setSelectedMessage] = useState<{
    categoryId: string;
    messageId: string;
    text: string;
  } | null>(null);

  const [suggestionText, setSuggestionText] = useState("");
  const [showSuggestionSuccess, setShowSuggestionSuccess] = useState(false);
  const [isSuggestionExpanded, setIsSuggestionExpanded] = useState(false);

  const isVerified = currentUser?.isVerified || false;

  const handleSelectMessage = (categoryId: string, message: AlertMessage) => {
    setSelectedMessage({
      categoryId,
      messageId: message.id,
      text: message.text,
    });
  };

  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);

  const handleSendAlert = () => {
    if (selectedMessage && plateIsValid) {
      const isStolenReport = selectedMessage.categoryId === "roubo-furto";
      const valor = isStolenReport ? 10 : 0;

      if (valor > 0) {
        if (saldo < valor) {
          showAlert("Saldo Insuficiente", "Seu saldo CauCash é insuficiente para enviar este alerta.", "warning");
          return;
        }
        pagarComCauCash(valor, `Envio de Alerta de Roubo - Placa ${plateValue}`);
      }

      onSendAlert(selectedMessage.categoryId, selectedMessage.messageId);
      setSelectedMessage(null);
    }
  };

  const isValid = plateIsValid && selectedMessage;
  const categories = useMemo(() => {
    if (isLoggedIn) return alertCategories;
    return alertCategories.filter(cat => cat.id !== 'denuncia' && cat.id !== 'vagas');
  }, [isLoggedIn]);

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible className="w-full">
        {categories.map((category) => (
          <AccordionItem key={category.id} value={category.id} className="border-border/50">
            <AccordionTrigger className="hover:no-underline py-4 px-1">
              <div className="flex items-center gap-4">
                <div className={`category-icon-container ${category.color}-icon`}><category.icon className="w-5 h-5" /></div>
                <div className="text-left"><p className="font-bold text-sm leading-none">{category.name}</p></div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-1">
              <div className="grid gap-2">
                {category.messages.map((message) => (
                  <button key={message.id} onClick={() => handleSelectMessage(category.id, message)} className={`text-left p-4 rounded-xl border transition-all ${selectedMessage?.messageId === message.id ? "bg-primary/10 border-primary text-primary shadow-sm" : "bg-secondary/40 border-transparent hover:border-border/50 text-muted-foreground"}`}><p className="text-xs font-medium">{message.text}</p></button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {isLoggedIn && isVerified && (
        <div className="border border-border/50 rounded-2xl overflow-hidden bg-card/50 shadow-sm">
          <button onClick={() => setIsSuggestionExpanded(!isSuggestionExpanded)} className="w-full flex items-center justify-between py-4 px-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-4"><div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center"><Lightbulb className="w-5 h-5 text-amber-500" /></div><span className="font-bold text-sm">Sugerir Novo Alerta</span></div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isSuggestionExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isSuggestionExpanded && (
            <div className="px-4 pb-4 space-y-4">
              {showSuggestionSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center animate-in fade-in zoom-in-95"><div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-green-500" /></div><div><p className="font-bold text-sm">Sugestão Enviada!</p><p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Obrigado por contribuir</p></div></div>
              ) : (
                <>
                  <Textarea placeholder="Descreva o novo alerta..." value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} className="min-h-[100px] resize-none text-xs" maxLength={150} />
                  <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-muted-foreground">{suggestionText.length}/150</span><Button size="sm" disabled={suggestionText.trim().length < 10} onClick={() => { setShowSuggestionSuccess(true); setSuggestionText(""); showAlert("Sugestão Enviada", "Sua sugestão de alerta foi recebida e será analisada pela equipe.", "success"); setTimeout(() => { setShowSuggestionSuccess(false); setIsSuggestionExpanded(false); }, 3000); }}><Send className="w-3.5 h-3.5 mr-2" />Sugerir</Button></div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {selectedMessage && (
        <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 shadow-xl animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner"><Send className="w-6 h-6 text-primary" /></div>
            <div className="flex-1 pt-1">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5 opacity-70">Mensagem Selecionada</p>
              <p className="text-sm font-bold text-foreground leading-relaxed italic">"{selectedMessage.text}"</p>
            </div>
          </div>
          {selectedMessage.categoryId === "roubo-furto" && (
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between"><div className="flex items-center gap-2"><Wallet className="w-4 h-4 text-amber-500" /><span className="text-[11px] text-amber-500 font-bold uppercase tracking-wider">Taxa: R$ 10,00</span></div><div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo: R$ {saldo.toFixed(2)}</div></div>
          )}
          <Button className="w-full mt-6 h-12 font-bold shadow-lg" disabled={!isValid} onClick={handleSendAlert}>{selectedMessage.categoryId === "roubo-furto" ? "Pagar e Enviar" : "Enviar Agora"}</Button>
        </div>
      )}

      {isLoggedIn && !isVerified && <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0"><Lightbulb className="w-4 h-4 text-amber-500" /></div><p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider"><span className="text-amber-500">Sugestão de Alerta:</span> Selo Verificado necessário para enviar novas sugestões.</p></div>}
      {!isLoggedIn && <div className="p-4 bg-secondary/30 border border-border/50 rounded-2xl flex items-center gap-3"><Lock className="w-4 h-4 text-muted-foreground shrink-0" /><p className="text-[10px] font-bold text-muted-foreground uppercase leading-relaxed tracking-wider">Acesse sua conta para ver todas as categorias de alerta.</p></div>}
    </div>
  );
};

export default AlertCategories;