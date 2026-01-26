import { useState, useMemo } from "react";
import { alertCategories, AlertMessage } from "@/lib/alertCategories";
import { useApp } from "@/contexts/AppContext";
import { isValidPlate } from "@/components/LicensePlateInput";
import { useVagas } from "@/contexts/VagasContext";
import { toast } from "sonner";
import { Wallet, AlertCircle, ChevronDown, Send, Lock, Lightbulb, CheckCircle2 } from "lucide-react";
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
  const { isLoggedIn, currentUser, canSendCritique, sentCritiques } = useApp();
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
          toast.error("Seu saldo CauCash é insuficiente para enviar este alerta.");
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
                <div className={`category-icon-container ${category.color}-icon`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm leading-none">{category.name}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4 px-1">
              <div className="grid gap-2">
                {category.messages.map((message) => (
                  <button
                    key={message.id}
                    onClick={() => handleSelectMessage(category.id, message)}
                    className={`text-left p-3 rounded-lg border transition-all ${
                      selectedMessage?.messageId === message.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-secondary/30 border-transparent hover:border-border text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                  </button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Sugestão de Alerta - Apenas para usuários verificados */}
      {isLoggedIn && isVerified && (
        <div className="border border-border/50 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsSuggestionExpanded(!isSuggestionExpanded)}
            className="w-full flex items-center justify-between py-4 px-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="category-icon-container bg-amber-500/20">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm leading-none">Sugerir Novo Alerta</p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isSuggestionExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          {isSuggestionExpanded && (
            <div className="px-4 pb-4 space-y-3">
              {showSuggestionSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Sugestão Enviada!</p>
                    <p className="text-sm text-muted-foreground">Obrigado por contribuir com a comunidade.</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground">
                    Sugira uma nova frase de alerta para ajudar outros motoristas. Sua sugestão será analisada pela equipe Cautoo.
                  </p>
                  <Textarea
                    placeholder="Ex: Seu veículo está com a porta do tanque aberta..."
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    className="min-h-[80px] resize-none"
                    maxLength={150}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{suggestionText.length}/150</span>
                    <Button
                      size="sm"
                      disabled={suggestionText.trim().length < 10}
                      onClick={() => {
                        setShowSuggestionSuccess(true);
                        setSuggestionText("");
                        toast.success("Sugestão enviada com sucesso!");
                        setTimeout(() => {
                          setShowSuggestionSuccess(false);
                          setIsSuggestionExpanded(false);
                        }, 3000);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Sugestão
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {isLoggedIn && !isVerified && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
          <p className="text-xs text-muted-foreground">
            <span className="text-amber-500 font-medium">Sugerir Alertas:</span> Adquira o Selo Verificado para enviar sugestões de novos alertas.
          </p>
        </div>
      )}

      {selectedMessage && (
        <div className="p-4 rounded-xl bg-card border border-border animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Send className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Mensagem Selecionada</p>
              <p className="text-sm text-foreground leading-relaxed italic">"{selectedMessage.text}"</p>
            </div>
          </div>
          
          {selectedMessage.categoryId === "roubo-furto" && (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-amber-500 font-medium italic">Taxa de serviço: R$ 10,00</span>
              </div>
              <div className="text-[10px] text-muted-foreground italic">Saldo: R$ {saldo.toFixed(2)}</div>
            </div>
          )}

          <Button 
            className="w-full mt-4" 
            disabled={!isValid}
            onClick={handleSendAlert}
          >
            {selectedMessage.categoryId === "roubo-furto" ? (
              <>Pagar e Enviar Alerta</>
            ) : (
              <>Enviar Alerta Agora</>
            )}
          </Button>
        </div>
      )}

      {!isLoggedIn && (
        <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Acesse sua conta para ver todas as categorias de alerta.
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertCategories;