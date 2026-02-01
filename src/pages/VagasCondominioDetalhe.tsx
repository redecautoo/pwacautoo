import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  ParkingCircle,
  Plus,
  AlertTriangle,
  Ban,
  Edit3,
  Calendar,
  Filter,
  Flag,
  Copy,
  Check,
  X,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { VALOR_DIARIA_PADRAO, getDiasSuspensao, MotivoReportCondominio } from "@/lib/vagasTypes";

const VagasCondominioDetalhe = () => {
  const navigate = useNavigate();
  const { condominioId } = useParams<{ condominioId: string }>();
  const { currentUser, showAlert } = useApp();
  const { 
    condominios, 
    vagas,
    usuariosCondominios,
    isMembroCondominio,
    entrarCondominio,
    isUsuarioSuspensoEmCondominio,
    getUsuarioCondominio,
    reportarCondominio
  } = useVagas();

  // Filtro de datas
  const hoje = new Date().toISOString().split('T')[0];
  const [filtroDataInicio, setFiltroDataInicio] = useState(hoje);
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  // Report form state
  const [mostrarReport, setMostrarReport] = useState(false);
  const [motivoReport, setMotivoReport] = useState<MotivoReportCondominio | "">("");
  const [descricaoReport, setDescricaoReport] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const condominio = condominios.find(c => c.id === condominioId);
  const todasVagas = vagas.filter(v => v.condominioId === condominioId);
  const membros = usuariosCondominios.filter(uc => uc.condominioId === condominioId && !uc.excluido);
  const isMembro = condominioId ? isMembroCondominio(condominioId) : false;
  
  // Separar vagas do usuário das demais
  const minhasVagasNoCondominio = todasVagas.filter(v => v.userId === currentUser?.id);
  
  // Filtrar vagas disponíveis com base nas datas selecionadas
  const outrasVagasDisponiveis = todasVagas.filter(v => {
    if (v.userId === currentUser?.id) return false; // Não mostrar minhas vagas aqui
    if (v.status !== 'disponivel') return false;
    if (!v.disponivelDe || !v.disponivelAte) return false;
    
    // Se tem filtro de data, verificar se a vaga está disponível no período
    if (filtroDataInicio && filtroDataFim) {
      return v.disponivelDe <= filtroDataInicio && v.disponivelAte >= filtroDataFim;
    }
    // Caso contrário, mostrar vagas disponíveis hoje
    return v.disponivelDe <= hoje && v.disponivelAte >= hoje;
  });
  
  const isSuspenso = condominioId ? isUsuarioSuspensoEmCondominio(condominioId) : false;
  const usuarioCondominio = condominioId ? getUsuarioCondominio(condominioId) : undefined;
  const diasSuspensao = usuarioCondominio ? getDiasSuspensao(usuarioCondominio) : 0;

  if (!condominio) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Condomínio não encontrado</h2>
            <Button onClick={() => navigate("/garagem")}>Voltar</Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleEntrar = () => {
    if (condominioId) {
      entrarCondominio(condominioId);
    }
  };

  const handleCopyCode = async () => {
    if (condominio?.codigo) {
      await navigator.clipboard.writeText(condominio.codigo);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmitReport = async () => {
    if (!motivoReport || !descricaoReport.trim() || !condominioId) return;
    
    setIsSubmittingReport(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    reportarCondominio(condominioId, motivoReport, descricaoReport.trim());
    
    setIsSubmittingReport(false);
    setMostrarReport(false);
    setMotivoReport("");
    setDescricaoReport("");
    
    showAlert("Report enviado!", "Nossa equipe irá analisar o problema reportado.", "success");
  };

  const motivosReport: { value: MotivoReportCondominio; label: string }[] = [
    { value: 'duplicado', label: 'Condomínio duplicado' },
    { value: 'endereco_incorreto', label: 'Endereço incorreto' },
    { value: 'nome_incorreto', label: 'Nome incorreto' },
    { value: 'informacoes_fraudulentas', label: 'Informações fraudulentas' },
    { value: 'solicitar_atualizacao', label: 'Solicitar atualização de dados' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
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
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-semibold text-foreground truncate">{condominio.nome}</h1>
                <p className="text-sm text-muted-foreground">{condominio.bairro}, {condominio.cidade}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Suspension Warning */}
            {isSuspenso && (
              <motion.div 
                className="bg-destructive/10 border border-destructive/30 rounded-xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-start gap-3">
                  <Ban className="w-5 h-5 text-destructive mt-0.5" />
                  <div>
                    <p className="font-medium text-destructive">Conta Suspensa</p>
                    <p className="text-sm text-destructive/80">
                      Você foi denunciado por outros moradores. Suspensão de {diasSuspensao} dia(s) restante(s).
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Condominio Info Card */}
            <motion.div 
              className="bg-card border border-border rounded-xl p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  {/* Code with copy button */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded" data-testid="text-condominio-codigo">
                      {condominio.codigo}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      title="Copiar código"
                      data-testid="button-copy-codigo"
                    >
                      {copiedCode ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {condominio.status === 'em_revisao' && (
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                        Em revisão
                      </span>
                    )}
                  </div>
                  <h2 className="font-semibold text-foreground">{condominio.nome}</h2>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{condominio.endereco}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>{condominio.bairro}, {condominio.cidade} - {condominio.uf}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{membros.length} morador(es)</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <ParkingCircle className="w-4 h-4" />
                      <span>{todasVagas.length} vaga(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMostrarReport(true)}
                className="w-full mt-4 text-muted-foreground hover:text-destructive"
                data-testid="button-reportar-condominio"
              >
                <Flag className="w-4 h-4 mr-2" />
                Reportar à Cautoo
              </Button>
            </motion.div>

            {/* Report Modal */}
            <AnimatePresence>
              {mostrarReport && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                  onClick={() => setMostrarReport(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-card border border-border rounded-xl p-5 max-w-md w-full"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Reportar Condomínio</h3>
                      <Button variant="ghost" size="icon" onClick={() => setMostrarReport(false)}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                      Informe o problema com o cadastro deste condomínio. Nossa equipe irá analisar.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="motivo">Motivo *</Label>
                        <Select
                          value={motivoReport}
                          onValueChange={(v) => setMotivoReport(v as MotivoReportCondominio)}
                        >
                          <SelectTrigger className="mt-1.5" data-testid="select-motivo-report">
                            <SelectValue placeholder="Selecione o motivo" />
                          </SelectTrigger>
                          <SelectContent>
                            {motivosReport.map(m => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Textarea
                          id="descricao"
                          placeholder="Descreva o problema com mais detalhes..."
                          value={descricaoReport}
                          onChange={(e) => setDescricaoReport(e.target.value)}
                          className="mt-1.5 min-h-[100px]"
                          maxLength={500}
                          data-testid="textarea-descricao-report"
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                          {descricaoReport.length}/500
                        </p>
                      </div>

                      <Button
                        onClick={handleSubmitReport}
                        disabled={!motivoReport || !descricaoReport.trim() || isSubmittingReport}
                        className="w-full"
                        data-testid="button-enviar-report"
                      >
                        {isSubmittingReport ? (
                          <motion.div
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          />
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Enviar Report
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Join Button (if not member) */}
            {!isMembro && (
              <Button 
                onClick={handleEntrar}
                className="w-full"
                size="lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Entrar neste condomínio
              </Button>
            )}

            {/* Minhas Vagas neste Condomínio */}
            {isMembro && !isSuspenso && minhasVagasNoCondominio.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Minha(s) Vaga(s)</h3>
                </div>
                <motion.div 
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {minhasVagasNoCondominio.map((vaga, index) => (
                    <motion.button
                      key={vaga.id}
                      onClick={() => navigate(`/garagem/vaga/${vaga.id}`)}
                      className="w-full bg-primary/5 border border-primary/30 rounded-xl p-4 text-left transition-colors hover:bg-primary/10"
                      variants={staggerItemVariants}
                      custom={index}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <ParkingCircle className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">Vaga {vaga.numero}</span>
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                                Sua Vaga
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                vaga.tipo === 'coberta' 
                                  ? 'bg-green-500/20 text-green-400' 
                                  : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {vaga.tipo === 'coberta' ? 'Coberta' : 'Descoberta'}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {vaga.disponivelDe} até {vaga.disponivelAte}
                            </p>
                            <p className="text-xs text-primary mt-1 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" /> Toque para editar
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">R$ {vaga.precoDiario || VALOR_DIARIA_PADRAO}</div>
                          <div className="text-xs text-muted-foreground">/dia</div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              </>
            )}

            {/* Vagas Disponíveis de outros */}
            {isMembro && !isSuspenso && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Vagas Disponíveis</h3>
                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      variant={mostrarFiltro ? "default" : "outline"}
                      onClick={() => setMostrarFiltro(!mostrarFiltro)}
                    >
                      <Filter className="w-4 h-4 mr-1" />
                      Filtrar
                    </Button>
                    {minhasVagasNoCondominio.length === 0 && (
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/garagem/condominio/${condominioId}/nova-vaga`)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Minha Vaga
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filtro de Datas */}
                {mostrarFiltro && (
                  <motion.div 
                    className="bg-card border border-border rounded-xl p-4 space-y-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>Filtrar por período de reserva:</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="filtroDataInicio" className="text-xs">Data Início</Label>
                        <Input
                          id="filtroDataInicio"
                          type="date"
                          value={filtroDataInicio}
                          onChange={(e) => setFiltroDataInicio(e.target.value)}
                          min={hoje}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="filtroDataFim" className="text-xs">Data Fim</Label>
                        <Input
                          id="filtroDataFim"
                          type="date"
                          value={filtroDataFim}
                          onChange={(e) => setFiltroDataFim(e.target.value)}
                          min={filtroDataInicio || hoje}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    {filtroDataInicio && filtroDataFim && (
                      <p className="text-xs text-primary">
                        Mostrando vagas disponíveis de {filtroDataInicio} até {filtroDataFim}
                      </p>
                    )}
                  </motion.div>
                )}

                {outrasVagasDisponiveis.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <ParkingCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma vaga disponível no momento
                    </p>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {outrasVagasDisponiveis.map((vaga, index) => (
                      <motion.button
                        key={vaga.id}
                        onClick={() => navigate(`/garagem/vaga/${vaga.id}`)}
                        className="w-full bg-card border border-border rounded-xl p-4 text-left transition-colors hover:bg-secondary/50"
                        variants={staggerItemVariants}
                        custom={index}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              vaga.tipo === 'coberta' ? 'bg-green-500/20' : 'bg-amber-500/20'
                            }`}>
                              <ParkingCircle className={`w-6 h-6 ${
                                vaga.tipo === 'coberta' ? 'text-green-400' : 'text-amber-400'
                              }`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">Vaga {vaga.numero}</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  vaga.tipo === 'coberta' 
                                    ? 'bg-green-500/20 text-green-400' 
                                    : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {vaga.tipo === 'coberta' ? 'Coberta' : 'Descoberta'}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {vaga.disponivelDe} até {vaga.disponivelAte}
                              </p>
                              {vaga.observacao && (
                                <p className="text-xs text-muted-foreground mt-0.5">{vaga.observacao}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary">R$ {vaga.precoDiario || VALOR_DIARIA_PADRAO}</div>
                            <div className="text-xs text-muted-foreground">/dia</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </>
            )}

            {/* Report Warning */}
            {isMembro && currentUser?.isVerified && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-400">
                      <strong>Morador verificado:</strong> Você pode denunciar perfis falsos. 
                      2 denúncias = suspensão de 7 dias. Reincidência = exclusão.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasCondominioDetalhe;

