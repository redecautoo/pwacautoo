import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";
import { VALOR_DIARIA, calcularValorReserva, TipoUso } from "@/lib/vagasTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  ParkingCircle, 
  MapPin, 
  Calendar,
  User,
  Car,
  QrCode,
  CreditCard,
  Check,
  Copy,
  ExternalLink,
  Home,
  AlertCircle,
  Wallet
} from "lucide-react";

const VagasVagaDetalhe = () => {
  const navigate = useNavigate();
  const { vagaId } = useParams<{ vagaId: string }>();
  const { currentUser } = useApp();
  const { vagas, condominios, criarReserva, isMembroCondominio, saldo, pagarComCauCash } = useVagas();

  const vaga = vagas.find(v => v.id === vagaId);
  const condominio = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;
  const isMembro = vaga ? isMembroCondominio(vaga.condominioId) : false;
  const isMinhaVaga = vaga?.userId === currentUser?.id;

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [reservaData, setReservaData] = useState({
    tipoUso: "morador" as TipoUso,
    placa: "",
    motorista: "",
    userApartment: "",
    dataInicio: vaga?.disponivelDe || "",
    dataFim: vaga?.disponivelAte || "",
  });
  const [linkAcesso, setLinkAcesso] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!vaga || !condominio) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <ParkingCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Garagem não encontrada</h2>
            <Button onClick={() => navigate("/garagem")}>Voltar</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const valorTotal = reservaData.dataInicio && reservaData.dataFim 
    ? calcularValorReserva(reservaData.dataInicio, reservaData.dataFim)
    : 0;

  const handleReservar = async () => {
    if (!reservaData.placa || !reservaData.motorista || !reservaData.dataInicio || !reservaData.dataFim) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setIsSubmitting(true);

    if (saldo >= valorTotal) {
      const pago = pagarComCauCash(valorTotal, `Reserva Vaga ${vaga.numero} - ${condominio.nome}`);
      if (pago) {
        toast.success("Pagamento realizado com sucesso usando CauCash!");
      } else {
        setIsSubmitting(false);
        toast.error("Erro ao processar pagamento CauCash.");
        return;
      }
    } else {
      toast.error("Seu saldo CauCash é insuficiente. Adicione créditos para continuar.");
      setIsSubmitting(false);
      return;
    }

    const reserva = criarReserva({
      vagaId: vaga.id,
      tipoUso: reservaData.tipoUso,
      placa: reservaData.placa.toUpperCase().replace(/[^A-Z0-9]/gi, ''),
      motorista: reservaData.motorista.trim(),
      userApartment: reservaData.userApartment.trim(),
      dataInicio: reservaData.dataInicio,
      dataFim: reservaData.dataFim,
    });

    setLinkAcesso(reserva.linkAcesso);
    setIsSubmitting(false);
    setShowReservaModal(false);
    setShowSuccessModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(linkAcesso);
    toast.success("Link copiado!");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Vaga {vaga.numero}</h1>
                <p className="text-sm text-muted-foreground">{condominio.nome}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div 
              className="bg-card border border-border rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`h-2 ${vaga.tipo === 'coberta' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                      vaga.tipo === 'coberta' ? 'bg-green-500/20' : 'bg-amber-500/20'
                    }`}>
                      <ParkingCircle className={`w-8 h-8 ${
                        vaga.tipo === 'coberta' ? 'text-green-400' : 'text-amber-400'
                      }`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Vaga {vaga.numero}</h2>
                      <span className={`text-sm px-2 py-0.5 rounded inline-block mt-1 ${
                        vaga.tipo === 'coberta' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {vaga.tipo === 'coberta' ? 'Coberta' : 'Descoberta'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">R$ {VALOR_DIARIA}</div>
                    <div className="text-sm text-muted-foreground">/dia</div>
                  </div>
                </div>

                {vaga.observacao && (
                  <p className="text-sm text-muted-foreground mt-4 bg-secondary/50 rounded-lg p-3">
                    {vaga.observacao}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>De: {vaga.disponivelDe}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Até: {vaga.disponivelAte}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{condominio.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {condominio.endereco}, {condominio.bairro}
                  </p>
                </div>
              </div>
            </div>

            {!isMinhaVaga && isMembro && vaga.status === 'disponivel' && (
              <Button 
                onClick={() => setShowReservaModal(true)}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Reservar Vaga
              </Button>
            )}

            {isMinhaVaga && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-400">Esta é a sua vaga</p>
              </div>
            )}

            {!isMembro && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                <p className="text-sm text-amber-400">
                  Entre no condomínio para poder reservar vagas
                </p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => navigate(`/garagem/condominio/${vaga.condominioId}`)}
                >
                  Ver Condomínio
                </Button>
              </div>
            )}
          </div>
        </main>

        <Dialog open={showReservaModal} onOpenChange={setShowReservaModal}>
          <DialogContent className="max-w-md p-0 overflow-hidden">
            <div className="max-h-[85vh] overflow-y-auto pb-safe">
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Reservar Vaga {vaga.numero}</DialogTitle>
              </DialogHeader>
              
              <div className="px-6 pb-8">
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Uso</Label>
                    <RadioGroup 
                      value={reservaData.tipoUso} 
                      onValueChange={(v) => setReservaData(prev => ({ ...prev, tipoUso: v as TipoUso }))}
                      className="mt-2 flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="morador" id="morador" />
                        <Label htmlFor="morador" className="font-normal cursor-pointer">Morador</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="visitante" id="visitante" />
                        <Label htmlFor="visitante" className="font-normal cursor-pointer">Visitante</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="placa">Placa do Veículo *</Label>
                    <div className="relative mt-1.5">
                      <Car className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="placa"
                        placeholder="ABC1D23"
                        value={reservaData.placa}
                        onChange={(e) => setReservaData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                        maxLength={7}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="motorista">Nome do Motorista *</Label>
                    <div className="relative mt-1.5">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="motorista"
                        placeholder="Nome completo"
                        value={reservaData.motorista}
                        onChange={(e) => setReservaData(prev => ({ ...prev, motorista: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="apartment">Seu Apartamento *</Label>
                    <div className="relative mt-1.5">
                      <Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="apartment"
                        placeholder="Ex: 123-A"
                        value={reservaData.userApartment}
                        onChange={(e) => setReservaData(prev => ({ ...prev, userApartment: e.target.value }))}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dataInicio">Data Início *</Label>
                      <Input
                        id="dataInicio"
                        type="date"
                        value={reservaData.dataInicio}
                        onChange={(e) => setReservaData(prev => ({ ...prev, dataInicio: e.target.value }))}
                        min={vaga.disponivelDe}
                        max={vaga.disponivelAte}
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dataFim">Data Fim *</Label>
                      <Input
                        id="dataFim"
                        type="date"
                        value={reservaData.dataFim}
                        onChange={(e) => setReservaData(prev => ({ ...prev, dataFim: e.target.value }))}
                        min={reservaData.dataInicio || vaga.disponivelDe}
                        max={vaga.disponivelAte}
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary">R$ {valorTotal}</span>
                        <div className="flex items-center gap-1 justify-end text-[10px] text-muted-foreground mt-0.5">
                          <Wallet className="w-2.5 h-2.5" />
                          <span>Saldo: R$ {saldo.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {saldo < valorTotal && (
                      <p className="text-[10px] text-amber-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Saldo CauCash insuficiente. Adicione créditos para continuar.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Pagamento retido até confirmação do proprietário
                    </p>
                  </div>

                  <Button 
                    onClick={handleReservar}
                    disabled={isSubmitting || !reservaData.placa || !reservaData.motorista}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <motion.div
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pagar e Reservar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"
            >
              <Check className="w-10 h-10 text-green-500" />
            </motion.div>
            
            <h2 className="text-xl font-semibold text-foreground mt-4">Reserva Confirmada!</h2>
            <p className="text-sm text-muted-foreground">
              🚗 O pagamento será liberado ao proprietário após o término do período.
            </p>

            <div className="bg-secondary/50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <QrCode className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Link de Acesso (Portaria)</span>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  value={linkAcesso} 
                  readOnly 
                  className="text-center text-sm"
                />
                <Button size="icon" variant="outline" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="outline" asChild>
                  <Link to={`/v/${linkAcesso.split('/').pop()}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Este link pode ser apresentado na portaria como passe digital
              </p>
            </div>

            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                navigate("/garagem/minhas-reservas");
              }}
              className="w-full mt-4"
            >
              Ver Minhas Reservas
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default VagasVagaDetalhe;
