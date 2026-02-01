import React, { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition } from "@/components/PageTransition";
import { VALOR_DIARIA_PADRAO, calcularValorReserva, TipoUso } from "@/lib/vagasTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Wallet,
  Edit,
  Trash2
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const VagasVagaDetalhe = () => {
  const navigate = useNavigate();
  const { vagaId } = useParams<{ vagaId: string }>();
  const { currentUser, showAlert } = useApp();
  const { vagas, condominios, criarReserva, isMembroCondominio, saldo, pagarComCauCash, excluirVaga } = useVagas();

  const vaga = vagas.find(v => v.id === vagaId);
  const condominio = vaga ? condominios.find(c => c.id === vaga.condominioId) : null;
  const isMembro = vaga ? isMembroCondominio(vaga.condominioId) : false;
  const isMinhaVaga = vaga?.userId === currentUser?.id;

  const [showReservaModal, setShowReservaModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
            <h2 className="text-lg font-semibold mb-2">Garagem não encontrada</h2>
            <Button onClick={() => navigate("/garagem")}>Voltar</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const precoDiario = vaga?.precoDiario || VALOR_DIARIA_PADRAO;
  const valorTotal = reservaData.dataInicio && reservaData.dataFim
    ? calcularValorReserva(reservaData.dataInicio, reservaData.dataFim, precoDiario)
    : 0;

  const handleReservar = async () => {
    if (!reservaData.placa || !reservaData.motorista || !reservaData.dataInicio || !reservaData.dataFim) {
      showAlert("Campos Obrigatórios", "Por favor, preencha todos os dados da reserva.", "warning");
      return;
    }

    setIsSubmitting(true);
    if (saldo >= valorTotal) {
      const pago = pagarComCauCash(valorTotal, `Reserva Vaga ${vaga.numero} - ${condominio.nome}`);
      if (!pago) {
        setIsSubmitting(false);
        showAlert("Erro no Pagamento", "Não foi possível processar seu saldo CauCash.", "error");
        return;
      }
    } else {
      setIsSubmitting(false);
      showAlert("Saldo Insuficiente", "Você precisa de mais R$ " + (valorTotal - saldo).toFixed(2) + " em CauCash.", "warning");
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
    showAlert("Reserva Efetuada!", "Sua vaga foi reservada com sucesso. O link de acesso está disponível.", "success");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(linkAcesso);
    showAlert("Link Copiado", "O link de acesso à portaria foi copiado.", "success");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-lg font-semibold">Vaga {vaga.numero}</h1><p className="text-sm text-muted-foreground">{condominio.nome}</p></div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            <motion.div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className={`h-1.5 ${vaga.tipo === 'coberta' ? 'bg-green-500' : 'bg-amber-500'}`} />
              <div className="p-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${vaga.tipo === 'coberta' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}><ParkingCircle className="w-8 h-8" /></div>
                  <div><h2 className="text-xl font-bold">Vaga {vaga.numero}</h2><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded inline-block mt-1 ${vaga.tipo === 'coberta' ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>{vaga.tipo}</span></div>
                </div>
                <div className="text-right"><div className="text-2xl font-bold text-primary">R$ {precoDiario}</div><div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">/ diária</div></div>
              </div>
              {vaga.observacao && <p className="text-xs text-muted-foreground mx-4 mb-4 p-3 bg-secondary/30 rounded-lg border border-border/50">{vaga.observacao}</p>}
              <div className="grid grid-cols-2 gap-4 px-4 pb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /><span>De: {vaga.disponivelDe}</span></div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="w-3 h-3" /><span>Até: {vaga.disponivelAte}</span></div>
              </div>
            </motion.div>

            <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-primary" />
              <div><p className="font-bold text-sm">{condominio.nome}</p><p className="text-xs text-muted-foreground">{condominio.endereco}, {condominio.bairro}</p></div>
            </div>

            {!isMinhaVaga && isMembro && vaga.status === 'disponivel' && (
              <Button onClick={() => setShowReservaModal(true)} className="w-full h-12 font-bold shadow-lg"><CreditCard className="w-5 h-5 mr-3" />Reservar Agora</Button>
            )}

            {isMinhaVaga && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 text-center bg-blue-500/10 border-b border-blue-500/30">
                  <p className="text-sm font-bold text-blue-400">Esta é a sua vaga</p>
                </div>
                <div className="p-3 flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => navigate(`/garagem/vaga/${vaga.id}/editar`)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </div>
            )}
            {!isMembro && <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center"><p className="text-sm font-bold text-amber-500">Acesso Restrito</p><p className="text-xs text-amber-500/70 mt-1">Apenas membros podem reservar vagas.</p><Button variant="outline" className="mt-4 border-amber-500/50 text-amber-500 hover:bg-amber-500/10" onClick={() => navigate(`/garagem/condominio/${vaga.condominioId}`)}>Ver Condomínio</Button></div>}
          </div>
        </main>

        <Dialog open={showReservaModal} onOpenChange={setShowReservaModal}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-3xl">
            <div className="max-h-[85vh] overflow-y-auto p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2 pt-2"><Calendar className="w-5 h-5 text-primary" />Reservar Vaga {vaga.numero}</h2>
              <div className="space-y-4 pt-2">
                <div><Label>Tipo de Uso</Label><RadioGroup value={reservaData.tipoUso} onValueChange={(v) => setReservaData(prev => ({ ...prev, tipoUso: v as TipoUso }))} className="mt-2 flex gap-4"><div className="flex items-center space-x-2"><RadioGroupItem value="morador" id="morador" /><Label htmlFor="morador" className="cursor-pointer">Morador</Label></div><div className="flex items-center space-x-2"><RadioGroupItem value="visitante" id="visitante" /><Label htmlFor="visitante" className="cursor-pointer">Visitante</Label></div></RadioGroup></div>
                <div><Label htmlFor="placa">Placa do Veículo *</Label><div className="relative mt-1.5"><Car className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input id="placa" placeholder="ABC1D23" value={reservaData.placa} onChange={(e) => setReservaData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))} maxLength={7} className="pl-9" /></div></div>
                <div><Label htmlFor="motorista">Motorista *</Label><div className="relative mt-1.5"><User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input id="motorista" placeholder="Nome Completo" value={reservaData.motorista} onChange={(e) => setReservaData(prev => ({ ...prev, motorista: e.target.value }))} className="pl-9" /></div></div>
                <div><Label htmlFor="apartment">Apartamento/Bloco *</Label><div className="relative mt-1.5"><Home className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input id="apartment" placeholder="Ex: 101-B" value={reservaData.userApartment} onChange={(e) => setReservaData(prev => ({ ...prev, userApartment: e.target.value }))} className="pl-9" /></div></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label htmlFor="dataInicio">Início *</Label><Input id="dataInicio" type="date" value={reservaData.dataInicio} onChange={(e) => setReservaData(prev => ({ ...prev, dataInicio: e.target.value }))} min={vaga.disponivelDe} className="mt-1.5" /></div>
                  <div><Label htmlFor="dataFim">Fim *</Label><Input id="dataFim" type="date" value={reservaData.dataFim} onChange={(e) => setReservaData(prev => ({ ...prev, dataFim: e.target.value }))} min={reservaData.dataInicio || vaga.disponivelDe} className="mt-1.5" /></div>
                </div>
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs text-muted-foreground uppercase font-bold">Total da Reserva</span><span className="text-2xl font-bold text-primary">R$ {valorTotal}</span></div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold"><div className="flex items-center gap-1"><Wallet className="w-3 h-3" />Saldo: R$ {saldo.toFixed(2)}</div>{saldo < valorTotal && <span className="text-red-400">Inserir créditos</span>}</div>
                </div>
                <Button onClick={handleReservar} disabled={isSubmitting} className="w-full h-12 font-bold rounded-xl">{isSubmitting ? <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} /> : <><CreditCard className="w-4 h-4 mr-2" />Pagar e Reservar</>}</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent className="max-w-md text-center p-8 rounded-3xl">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto"><Check className="w-10 h-10 text-green-500" /></motion.div>
            <h2 className="text-2xl font-bold mt-6">Reserva Confirmada!</h2>
            <p className="text-sm text-muted-foreground mt-2">Apresente este link na portaria para acesso:</p>
            <div className="bg-secondary/30 rounded-2xl p-4 mt-6 border border-border/50">
              <div className="flex items-center gap-2"><Input value={linkAcesso} readOnly className="text-xs font-mono h-10" /><Button size="icon" variant="ghost" onClick={copyLink}><Copy className="w-4 h-4" /></Button></div>
              <Button onClick={() => navigate(`/v/${linkAcesso.split('/').pop()}`)} variant="ghost" className="text-xs mt-2 text-primary gap-1 font-bold"><ExternalLink className="w-3 h-3" />Abrir Comprovante</Button>
            </div>
            <Button onClick={() => { setShowSuccessModal(false); navigate("/garagem/minhas-reservas"); }} className="w-full mt-8 h-12 rounded-xl font-bold">Ir para Minhas Reservas</Button>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Garagem?</AlertDialogTitle>
              <AlertDialogDescription>
                Deseja remover permanentemente esta garagem? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => {
                  excluirVaga(vaga.id);
                  showAlert("Vaga Excluída", "A garagem foi removida permanentemente.", "success");
                  navigate("/garagem/minhas-vagas");
                }} 
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default VagasVagaDetalhe;

