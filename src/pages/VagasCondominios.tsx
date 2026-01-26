import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Building2, 
  Plus,
  ChevronRight,
  MapPin,
  Users,
  ArrowLeft,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
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
import { toast } from "sonner";

const VagasCondominios = () => {
  const navigate = useNavigate();
  const { meusCondominios, sairCondominio, usuariosCondominios } = useVagas();
  const [condominioToLeave, setCondominioToLeave] = useState<string | null>(null);

  const getMembrosCount = (condominioId: string) => {
    return usuariosCondominios.filter(uc => uc.condominioId === condominioId && !uc.excluido).length;
  };

  const handleLeaveCondominio = () => {
    if (condominioToLeave) {
      sairCondominio(condominioToLeave);
      toast.success("Você saiu do condomínio");
      setCondominioToLeave(null);
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
                onClick={() => navigate("/garagem")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">Meus Condomínios</h1>
                <p className="text-sm text-muted-foreground">{meusCondominios.length} condomínio(s)</p>
              </div>
              <Button 
                size="sm"
                onClick={() => navigate("/garagem/novo-condominio")}
              >
                <Plus className="w-4 h-4 mr-1" />
                Novo
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            
            {meusCondominios.length === 0 ? (
              <motion.div 
                className="bg-card border border-border rounded-xl p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Nenhum condomínio</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Você ainda não está em nenhum condomínio. Crie um novo ou busque um existente.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={() => navigate("/garagem/novo-condominio")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Condomínio
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/garagem/buscar")}>
                    Buscar
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {meusCondominios.map((cond, index) => (
                  <motion.div
                    key={cond.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                    variants={staggerItemVariants}
                    custom={index}
                  >
                    <button
                      onClick={() => navigate(`/garagem/condominio/${cond.id}`)}
                      className="w-full p-4 text-left transition-colors hover:bg-secondary/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <span className="font-medium text-foreground block">{cond.nome}</span>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{cond.bairro}, {cond.cidade}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              <Users className="w-3 h-3" />
                              <span>{getMembrosCount(cond.id)} morador(es)</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                    <div className="border-t border-border px-4 py-2 bg-secondary/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full"
                        onClick={() => setCondominioToLeave(cond.id)}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair do condomínio
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

          </div>
        </main>

        {/* Confirm Leave Dialog */}
        <AlertDialog open={!!condominioToLeave} onOpenChange={() => setCondominioToLeave(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sair do condomínio?</AlertDialogTitle>
              <AlertDialogDescription>
                Você perderá acesso às vagas e reservas deste condomínio. 
                Esta ação pode ser desfeita entrando novamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeaveCondominio} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Sair
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default VagasCondominios;
