import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Check, X, Car, Plus, Shield, Info, AlertOctagon, Phone, Mail, Trash2, Calendar, CreditCard, MessageSquare, PlusCircle, Instagram } from "lucide-react";
import SealRequiredNotice from "@/components/SealRequiredNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import LicensePlateInput, { isValidPlate } from "@/components/LicensePlateInput";
import { PageTransition } from "@/components/PageTransition";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { differenceInDays, parseISO } from "date-fns";

const Friends = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    addTransaction,
    getContactRequestsReceived,
    respondToContactRequest,
    blockContactRequest,
    showAlert
  } = useApp();

  const [plateValue, setPlateValue] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("contacts");

  // Solicitações de contato recebidas do AppContext
  const appContactRequests = getContactRequestsReceived().filter(r => r.status === 'pending');

  // States for dynamic data (mock local para compatibilidade)
  const [localContactRequests, setLocalContactRequests] = useState([
    { id: "1", fromName: "Ricardo Silva", fromPlate: "ABC-1234", status: "pending", model: "Toyota Corolla", color: "Prata" }
  ]);

  // Combinar solicitações locais com as do AppContext
  const contactRequests = [
    ...localContactRequests,
    ...appContactRequests.map(r => ({
      id: r.id,
      fromName: r.fromUserName,
      fromPlate: r.fromPlate,
      status: r.status,
      model: r.reason,
      color: "",
      isFromApp: true
    }))
  ];
  const [myContacts, setMyContacts] = useState<any[]>([]);
  const [myFleets, setMyFleets] = useState([
    {
      id: "1", name: "Condomínio Solar", type: "Frota de Condomínio", members: [
        { plate: "KLS-4589", model: "Civic" },
        { plate: "JHG-1245", model: "Onix" }
      ], status: "Ativa", purpose: "Segurança e Organização"
    },
    {
      id: "2", name: "Viagem Rio 2026", type: "Evento ou Viagem", members: [
        { plate: "ABC-1234", model: "Corolla" }
      ], status: "Em planejamento", purpose: "Assistência Veicular Temporária"
    }
  ]);

  // Modal states
  const [selectedFleet, setSelectedFleet] = useState<any>(null);
  const [showCreateFleet, setShowCreateFleet] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showAcceptContactDialog, setShowAcceptContactDialog] = useState<any>(null);
  const [contactSharingOptions, setContactSharingOptions] = useState({
    phone: true,
    email: false,
    social: false
  });
  const [contactInfoValues, setContactInfoValues] = useState({
    phone: "",
    email: "",
    social: ""
  });
  const [showAddPlateDialog, setShowAddPlateDialog] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [selectedContactReason, setSelectedContactReason] = useState("");
  const [showInsuranceQuoteDialog, setShowInsuranceQuoteDialog] = useState(false);
  const [selectedFleetPurpose, setSelectedFleetPurpose] = useState("");
  const [customFleetPurpose, setCustomFleetPurpose] = useState("");
  const [newFleetName, setNewFleetName] = useState("");

  // Assistance dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const userIsVerified = currentUser?.isVerified || false;
  const plateIsValid = useMemo(() => isValidPlate(plateValue), [plateValue]);

  const daysCount = useMemo(() => {
    if (!startDate || !endDate) return 1;
    try {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      const diff = differenceInDays(end, start);
      return diff >= 0 ? diff + 1 : 1;
    } catch (e) {
      return 1;
    }
  }, [startDate, endDate]);

  const totalAssistancePrice = useMemo(() => {
    const platesCount = selectedFleet?.members.length || 0;
    return 25 * platesCount * daysCount;
  }, [selectedFleet, daysCount]);

  const handleSendRequest = () => {
    if (plateIsValid && selectedContactReason) {
      showAlert(
        "Solicitação Enviada",
        `Enviamos seu pedido de contato para a placa com sucesso. Você será notificado quando o proprietário responder.`,
        "success",
        plateValue
      );
      setPlateValue("");
      setSelectedContactReason("");
      setShowInvite(false);
    }
  };

  const handleAcceptRequest = () => {
    if (!showAcceptContactDialog) return;

    const shared: any = {};
    if (contactSharingOptions.phone) shared.phone = contactInfoValues.phone;
    if (contactSharingOptions.email) shared.email = contactInfoValues.email;
    if (contactSharingOptions.social) shared.social = contactInfoValues.social;

    if ((showAcceptContactDialog as any).isFromApp) {
      respondToContactRequest(showAcceptContactDialog.id, true, {
        phone: contactSharingOptions.phone,
        email: contactSharingOptions.email,
        socialMedia: contactSharingOptions.social
      });
    } else {
      setLocalContactRequests(localContactRequests.filter(r => r.id !== showAcceptContactDialog.id));
    }

    setMyContacts([...myContacts, { ...showAcceptContactDialog, status: "accepted", sharedData: shared }]);
    setShowAcceptContactDialog(null);

    showAlert(
      "Contato Aceito",
      "Informações compartilhadas com sucesso. O usuário agora pode ver os dados que você selecionou.",
      "success"
    );
  };

  const handleDeleteContact = (id: string) => {
    setMyContacts(myContacts.filter(c => c.id !== id));
    showAlert("Contato Removido", "O contato foi removido da sua lista.", "warning");
  };

  const handleDeleteFleet = (id: string) => {
    setMyFleets(myFleets.filter(f => f.id !== id));
    setSelectedFleet(null);
    showAlert("Frota Excluída", "A frota foi excluída com sucesso.", "warning");
  };

  const handleDeletePlateFromFleet = (fleetId: string, plate: string) => {
    setMyFleets(myFleets.map(f => {
      if (f.id === fleetId) {
        return { ...f, members: f.members.filter((m: any) => m.plate !== plate) };
      }
      return f;
    }));
    if (selectedFleet && selectedFleet.id === fleetId) {
      setSelectedFleet({ ...selectedFleet, members: selectedFleet.members.filter((m: any) => m.plate !== plate) });
    }
    showAlert("Placa Removida", `A placa ${plate} foi removida da frota.`, "success");
  };

  const handleAddPlateToFleet = () => {
    if (!isValidPlate(newPlate) || !selectedFleet) return;

    setMyFleets(myFleets.map(f => {
      if (f.id === selectedFleet.id) {
        return { ...f, members: [...f.members, { plate: newPlate, model: "Veículo Adicionado" }] };
      }
      return f;
    }));

    if (selectedFleet) {
      setSelectedFleet({ ...selectedFleet, members: [...selectedFleet.members, { plate: newPlate, model: "Veículo Adicionado" }] });
    }

    setShowAddPlateDialog(false);
    showAlert("Placa Adicionada!", "O veículo foi incluído na frota com sucesso.", "success", newPlate);
    setNewPlate("");
  };

  const handlePurchaseAssistance = () => {
    if (totalAssistancePrice > (currentUser?.cauCashBalance || 0)) {
      showAlert("Saldo Insuficiente", "Você não tem saldo CauCash suficiente para esta compra.", "error");
      return;
    }

    addTransaction({
      type: 'debit',
      amount: totalAssistancePrice,
      description: `Assistência Pontual - Frota ${selectedFleet?.name}`,
      category: 'Serviços'
    });

    setShowServiceDialog(false);
    showAlert(
      "Assistência Contratada!",
      "A cobertura será ativada no período selecionado e o valor foi debitado do seu CauCash.",
      "success"
    );
  };

  if (!userIsVerified) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
              <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground">Frota de Amigos</h1>
            </div>
          </header>

          <SealRequiredNotice featureReason="Frotas e contatos exigem verificação para garantir a segurança nas interações entre usuários." />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Rede Cautoo</h1>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="contacts" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Troca de Contato
                </TabsTrigger>
                <TabsTrigger value="fleet" className="flex items-center gap-2">
                  <Car className="w-4 h-4" />
                  Frota Cautoo
                </TabsTrigger>
              </TabsList>

              {/* ABA TROCA DE CONTATO */}
              <TabsContent value="contacts" className="space-y-6 animate-in fade-in-50 duration-300">
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Solicitar Contato</h2>
                    <Button variant="ghost" size="sm" onClick={() => setShowInvite(!showInvite)} className="text-emerald-500 h-8 px-3 hover:bg-emerald-500/10">
                      <Plus className="w-4 h-4 mr-1" /> {showInvite ? "Cancelar" : "Nova Solicitação"}
                    </Button>
                  </div>

                  {showInvite && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card border border-emerald-500/20 rounded-2xl p-6 space-y-4 shadow-xl"
                    >
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground uppercase font-bold">Placa do Veículo</Label>
                        <LicensePlateInput value={plateValue} onChange={setPlateValue} />
                      </div>

                      {plateIsValid && (
                        <div className="space-y-3">
                          <Label className="text-xs text-muted-foreground uppercase font-bold">Motivo do Contato</Label>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                            {[
                              "Aviso sobre seu veículo.",
                              "Possível dano no seu carro.",
                              "Informação sobre um incidente.",
                              "Esqueceram algo no veículo.",
                              "Problema na vaga ou estacionamento.",
                              "Sobre uma ocorrência recente.",
                              "Quero confirmar um registro.",
                              "Para devolver um item encontrado.",
                              "Sobre alerta que deixei no app.",
                              "Preciso tratar de um pequeno acidente.",
                              "Carro em local de risco.",
                              "Assunto de condomínio.",
                              "Quero agradecer uma boa atitude.",
                              "Informação importante sobre sua placa.",
                              "Desejo propor ajuda ou parceria."
                            ].map((reason) => (
                              <button
                                key={reason}
                                type="button"
                                onClick={() => setSelectedContactReason(reason)}
                                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedContactReason === reason
                                    ? "bg-emerald-600 text-white"
                                    : "bg-card border border-border text-foreground hover:bg-secondary/50"
                                  }`}
                              >
                                {reason}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button
                        onClick={handleSendRequest}
                        disabled={!plateIsValid || !selectedContactReason}
                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700"
                      >
                        Enviar Solicitação de Contato
                      </Button>
                    </motion.div>
                  )}
                </section>

                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Solicitações Recebidas</h2>
                  {contactRequests.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic text-center py-4">Nenhuma solicitação pendente.</p>
                  ) : (
                    contactRequests.map(req => (
                      <div key={req.id} className="bg-card border border-emerald-500/10 rounded-2xl p-4 space-y-4 hover:shadow-lg transition-all border-l-4 border-l-emerald-500">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                              <Users className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground">{req.fromName}</p>
                              <p className="text-xs text-muted-foreground">{req.fromPlate} • {req.model}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 border-destructive/20 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              if ((req as any).isFromApp) {
                                respondToContactRequest(req.id, false);
                              } else {
                                setLocalContactRequests(localContactRequests.filter(r => r.id !== req.id));
                              }
                            }}
                          >
                            <X className="w-4 h-4 mr-2" /> Recusar
                          </Button>
                          <Button
                            size="sm"
                            className="h-9 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => setShowAcceptContactDialog(req)}
                          >
                            <Check className="w-4 h-4 mr-2" /> Aceitar
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-8 text-destructive hover:bg-destructive/10 gap-2 text-[10px] font-bold"
                          onClick={() => {
                            if ((req as any).isFromApp) {
                              blockContactRequest(req.id);
                            } else {
                              setLocalContactRequests(localContactRequests.filter(r => r.id !== req.id));
                            }
                            showAlert(
                              "Usuário Bloqueado",
                              `${req.fromName} foi bloqueado e denunciado. Você não receberá mais solicitações deste condutor.`,
                              "error"
                            );
                          }}
                        >
                          <AlertOctagon className="w-3.5 h-3.5" /> Bloquear e Denunciar
                        </Button>
                      </div>
                    ))
                  )}
                </section>

                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Meus Contatos</h2>
                  {myContacts.length === 0 ? (
                    <div className="bg-card/30 border border-dashed border-emerald-500/20 rounded-2xl p-8 text-center">
                      <p className="text-sm text-muted-foreground italic">Nenhum contato compartilhado ainda.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myContacts.map(contact => (
                        <div key={contact.id} className="bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:bg-emerald-500/5 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                              <Users className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{contact.fromName}</p>
                              <p className="text-[10px] text-muted-foreground">{contact.fromPlate}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {Object.entries(contact.sharedData).map(([key, value]) => (
                                  <span key={key} className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                    {key === 'phone' && <Phone className="w-2 h-2" />}
                                    {key === 'email' && <Mail className="w-2 h-2" />}
                                    {key === 'social' && <Instagram className="w-2 h-2" />}
                                    {String(value)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {contact.sharedData.phone && (
                              <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors">
                                <Phone className="w-4 h-4" />
                              </button>
                            )}
                            <button className="p-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 rounded-full" onClick={() => handleDeleteContact(contact.id)}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </TabsContent>

              {/* ABA FROTA CAUTOO */}
              <TabsContent value="fleet" className="space-y-6 animate-in fade-in-50 duration-300">
                <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/5 border border-emerald-500/30 rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                      <Car className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Frotas Cautoo</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">Gerencie sua rede de veículos e contrate serviços exclusivos.</p>
                    </div>
                  </div>
                  <Button onClick={() => setShowCreateFleet(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 shadow-lg shadow-emerald-600/20 relative z-10 font-bold text-white">
                    <Plus className="w-4 h-4 mr-2" /> Criar Nova Frota
                  </Button>
                </div>

                <section className="space-y-4">
                  <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wider">Minhas Frotas Ativas</h2>
                  <div className="grid gap-4">
                    {myFleets.map(fleet => (
                      <div
                        key={fleet.id}
                        className="bg-card border border-emerald-500/10 rounded-2xl p-5 hover:shadow-xl hover:border-emerald-500/30 transition-all cursor-pointer group relative"
                        onClick={() => setSelectedFleet(fleet)}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600/15 flex items-center justify-center group-hover:bg-emerald-600/20 transition-colors">
                              <Shield className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-lg">{fleet.name}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-1">{fleet.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Users className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-sm font-bold text-foreground">{fleet.members.length}</p>
                            </div>
                            <p className="text-[10px] text-emerald-500 font-bold mt-1">{fleet.status}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border/40">
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground italic">
                            <Info className="w-3.5 h-3.5 text-emerald-500" /> {fleet.purpose}
                          </div>
                          <div className="flex gap-2">
                            <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-full transition-colors" onClick={(e) => { e.stopPropagation(); setSelectedFleet(fleet); setShowAddPlateDialog(true); }}>
                              <PlusCircle className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors" onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFleet(fleet.id);
                            }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        {/* DIALOG ACEITAR CONTATO */}
        <Dialog open={!!showAcceptContactDialog} onOpenChange={(open) => !open && setShowAcceptContactDialog(null)}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Compartilhar Informações</DialogTitle>
              <DialogDescription>
                Escolha o que compartilhar com {showAcceptContactDialog?.fromName} e preencha os dados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      id="phone"
                      checked={contactSharingOptions.phone}
                      onCheckedChange={(checked) => setContactSharingOptions({ ...contactSharingOptions, phone: !!checked })}
                    />
                    <Label htmlFor="phone" className="flex-1 cursor-pointer font-bold text-sm">Telefone / WhatsApp</Label>
                  </div>
                  {contactSharingOptions.phone && (
                    <Input
                      placeholder="(00) 00000-0000"
                      value={contactInfoValues.phone}
                      onChange={(e) => setContactInfoValues({ ...contactInfoValues, phone: e.target.value })}
                      className="rounded-xl ml-8 w-[calc(100%-2rem)]"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      id="email"
                      checked={contactSharingOptions.email}
                      onCheckedChange={(checked) => setContactSharingOptions({ ...contactSharingOptions, email: !!checked })}
                    />
                    <Label htmlFor="email" className="flex-1 cursor-pointer font-bold text-sm">E-mail</Label>
                  </div>
                  {contactSharingOptions.email && (
                    <Input
                      placeholder="seu@email.com"
                      value={contactInfoValues.email}
                      onChange={(e) => setContactInfoValues({ ...contactInfoValues, email: e.target.value })}
                      className="rounded-xl ml-8 w-[calc(100%-2rem)]"
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-secondary/30 transition-colors">
                    <Checkbox
                      id="social"
                      checked={contactSharingOptions.social}
                      onCheckedChange={(checked) => setContactSharingOptions({ ...contactSharingOptions, social: !!checked })}
                    />
                    <Label htmlFor="social" className="flex-1 cursor-pointer font-bold text-sm">Redes Sociais (Instagram/etc)</Label>
                  </div>
                  {contactSharingOptions.social && (
                    <Input
                      placeholder="@seuusuario"
                      value={contactInfoValues.social}
                      onChange={(e) => setContactInfoValues({ ...contactInfoValues, social: e.target.value })}
                      className="rounded-xl ml-8 w-[calc(100%-2rem)]"
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAcceptRequest} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white">
                Confirmar e Compartilhar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DETALHES DA FROTA E SERVIÇOS */}
        <Dialog open={!!selectedFleet} onOpenChange={(open) => !open && setSelectedFleet(null)}>
          <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-emerald-500/20">
            {selectedFleet && (
              <>
                <div className="bg-emerald-600 p-6 text-white relative">
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedFleet.name}</h2>
                        <p className="text-white/80 text-sm">{selectedFleet.type}</p>
                      </div>
                    </div>
                    <button className="p-2 text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => setShowAddPlateDialog(true)}>
                      <PlusCircle className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
                </div>

                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                      Veículos no Grupo ({selectedFleet.members.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedFleet.members.map((m: any) => (
                        <div key={m.plate} className="flex items-center justify-between p-3 rounded-xl bg-secondary/20 border border-border/40">
                          <div className="flex items-center gap-3">
                            <Car className="w-4 h-4 text-emerald-500" />
                            <div>
                              <p className="text-sm font-bold text-foreground">{m.plate}</p>
                              <p className="text-[10px] text-muted-foreground">{m.model}</p>
                            </div>
                          </div>
                          <button className="p-2 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors" onClick={() => handleDeletePlateFromFleet(selectedFleet.id, m.plate)}>
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-500" /> Serviços Cautoo
                    </h3>

                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group" onClick={() => setShowServiceDialog(true)}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-emerald-500" />
                            <p className="font-bold text-sm">Assistência Pontual</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-black text-emerald-500">R$ {totalAssistancePrice},00</p>
                            <p className="text-[8px] text-muted-foreground">(R$ 25 x {selectedFleet.members.length} x {daysCount} dias)</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Cobertura completa para todos os veículos da frota em período específico.</p>
                      </div>

                      <div className="p-4 rounded-2xl border border-border bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer group" onClick={() => {
                        setShowInsuranceQuoteDialog(true);
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-emerald-400" />
                            <p className="font-bold text-sm">Seguro Compartilhado</p>
                          </div>
                          <Button variant="secondary" size="sm" className="h-7 text-[10px] font-bold">Solicitar Cotação</Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Rateio proporcional entre membros. Fale com um especialista para cotação personalizada.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-secondary/30 border-t border-border flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => handleDeleteFleet(selectedFleet.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Grupo
                  </Button>
                  <Button className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setSelectedFleet(null)}>
                    Voltar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* DIALOG ADICIONAR PLACA */}
        <Dialog open={showAddPlateDialog} onOpenChange={setShowAddPlateDialog}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Adicionar Placa ao Grupo</DialogTitle>
              <DialogDescription>
                Informe a placa do veículo que deseja incluir na frota.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Placa do Veículo</Label>
                <LicensePlateInput value={newPlate} onChange={setNewPlate} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddPlateToFleet} disabled={!isValidPlate(newPlate)} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white">
                Adicionar Veículo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG DE CONTRATAÇÃO DE SERVIÇO */}
        <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Contratar Assistência Pontual</DialogTitle>
              <DialogDescription>
                Ative a cobertura para todos os {selectedFleet?.members.length} veículos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <p className="text-xs text-emerald-500 font-bold mb-1 uppercase">Total a Pagar ({daysCount} {daysCount > 1 ? 'dias' : 'dia'})</p>
                  <p className="text-xl font-black text-foreground">R$ {totalAssistancePrice},00</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground">Saldo CauCash</p>
                  <p className="text-sm font-bold">R$ {currentUser?.cauCashBalance || 0}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Início</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Término</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="rounded-xl" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground bg-secondary/20 p-2 rounded-lg italic">
                * O valor de R$ 25,00 é cobrado por placa por cada dia de cobertura selecionado.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={handlePurchaseAssistance} className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white" disabled={!startDate || !endDate}>
                Pagar com CauCash
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* DIALOG CRIAR FROTA */}
        <Dialog open={showCreateFleet} onOpenChange={setShowCreateFleet}>
          <DialogContent className="max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle>Nova Frota Colaborativa</DialogTitle>
              <DialogDescription>
                Defina a finalidade da sua comunidade para acesso a benefícios exclusivos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome da Frota</Label>
                <Input
                  placeholder="Ex: Evento São Paulo"
                  value={newFleetName}
                  onChange={(e) => setNewFleetName(e.target.value)}
                  className="rounded-xl focus-visible:ring-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <Label>Finalidade</Label>
                <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto pr-2">
                  {["Seguro Compartilhado", "Evento ou Viagem", "Frota de Condomínio", "Clube Automotivo", "Outros"].map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedFleetPurpose(type)}
                      className={`text-left p-3 rounded-xl border transition-all text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${selectedFleetPurpose === type
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                          : "bg-card border-border text-foreground hover:bg-secondary/50"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              {selectedFleetPurpose === "Outros" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Label>Qual a finalidade?</Label>
                  <Input
                    placeholder="Especifique o uso da frota"
                    value={customFleetPurpose}
                    onChange={(e) => setCustomFleetPurpose(e.target.value)}
                    className="rounded-xl focus-visible:ring-emerald-500"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                onClick={() => {
                  const purpose = selectedFleetPurpose === "Outros" ? customFleetPurpose : selectedFleetPurpose;
                  const newFleet = {
                    id: String(Date.now()),
                    name: newFleetName || "Nova Frota",
                    type: purpose,
                    members: [],
                    status: "Ativa",
                    purpose: purpose
                  };
                  setMyFleets([newFleet, ...myFleets]);
                  setShowCreateFleet(false);
                  setNewFleetName("");
                  setSelectedFleetPurpose("");
                  setCustomFleetPurpose("");
                  showAlert("Frota Criada!", "Sua nova comunidade foi criada com sucesso. Adicione placas para começar.", "success");
                }}
                disabled={!selectedFleetPurpose || !newFleetName || (selectedFleetPurpose === "Outros" && !customFleetPurpose)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-white"
              >
                Criar Comunidade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default Friends;
