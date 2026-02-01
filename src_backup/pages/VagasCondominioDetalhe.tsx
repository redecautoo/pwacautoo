import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Users, 
  ParkingCircle,
  Plus,
  ChevronRight,
  AlertTriangle,
  Ban
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVagas } from "@/contexts/VagasContext";
import { useApp } from "@/contexts/AppContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { VALOR_DIARIA, getDiasSuspensao } from "@/lib/vagasTypes";

const VagasCondominioDetalhe = () => {
  const navigate = useNavigate();
  const { condominioId } = useParams<{ condominioId: string }>();
  const { currentUser } = useApp();
  const { 
    condominios, 
    vagasDisponiveis, 
    vagas,
    usuariosCondominios,
    isMembroCondominio,
    entrarCondominio,
    isUsuarioSuspensoEmCondominio,
    getUsuarioCondominio
  } = useVagas();

  const condominio = condominios.find(c => c.id === condominioId);
  const vagasDisp = condominioId ? vagasDisponiveis(condominioId) : [];
  const todasVagas = vagas.filter(v => v.condominioId === condominioId);
  const membros = usuariosCondominios.filter(uc => uc.condominioId === condominioId && !uc.excluido);
  const isMembro = condominioId ? isMembroCondominio(condominioId) : false;
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
            </motion.div>

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

            {/* Available Spots */}
            {isMembro && !isSuspenso && (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-foreground">Vagas Disponíveis</h3>
                  <Button 
                    size="sm"
                    onClick={() => navigate(`/garagem/condominio/${condominioId}/nova-vaga`)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Minha Vaga
                  </Button>
                </div>

                {vagasDisp.length === 0 ? (
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
                    {vagasDisp.map((vaga, index) => (
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
                            <div className="text-lg font-bold text-primary">R$ {VALOR_DIARIA}</div>
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
