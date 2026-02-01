import React, { useState } from "react";
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
import { useApp } from "@/contexts/AppContext";
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

const VagasCondominios = () => {
  const navigate = useNavigate();
  const { meusCondominios, sairCondominio, usuariosCondominios } = useVagas();
  const { showAlert } = useApp();
  const [condominioToLeave, setCondominioToLeave] = useState<string | null>(null);

  const getMembrosCount = (condominioId: string) => {
    return usuariosCondominios.filter(uc => uc.condominioId === condominioId && !uc.excluido).length;
  };

  const handleLeaveCondominio = () => {
    if (condominioToLeave) {
      sairCondominio(condominioToLeave);
      showAlert("Saída Confirmada", "Você não faz mais parte deste condomínio.", "success");
      setCondominioToLeave(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/garagem")}><ArrowLeft className="w-5 h-5" /></Button>
            <div className="flex-1"><h1 className="text-lg font-semibold">Meus Condomínios</h1><p className="text-sm text-muted-foreground">{meusCondominios.length} associado(s)</p></div>
            <Button size="sm" onClick={() => navigate("/garagem/novo-condominio")}><Plus className="w-4 h-4 mr-1" />Novo</Button>
          </div>
        </header>
        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            {meusCondominios.length === 0 ? (
              <motion.div className="bg-card border border-border rounded-xl p-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Sem condomínios</h3>
                <p className="text-sm text-muted-foreground mb-6">Você ainda não se associou a nenhum condomínio.</p>
                <div className="flex flex-col gap-2"><Button onClick={() => navigate("/garagem/novo-condominio")}><Plus className="w-4 h-4 mr-2" />Cadastrar Novo</Button><Button variant="outline" onClick={() => navigate("/garagem/buscar")}>Buscar Existente</Button></div>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                {meusCondominios.map((cond, index) => (
                  <motion.div key={cond.id} className="bg-card border border-border rounded-xl overflow-hidden" variants={staggerItemVariants} custom={index}>
                    <button onClick={() => navigate(`/garagem/condominio/${cond.id}`)} className="w-full p-4 text-left hover:bg-secondary/20 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Building2 className="w-6 h-6" /></div>
                          <div><span className="font-bold text-sm block">{cond.nome}</span><div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase font-bold"><MapPin className="w-3 h-3" />{cond.bairro} • {cond.cidade}</div><div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 uppercase font-bold"><Users className="w-3 h-3" />{getMembrosCount(cond.id)} membros</div></div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                    <div className="border-t border-border px-4 py-1.5 bg-secondary/10"><Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 w-full text-[10px] font-bold uppercase tracking-wider h-8" onClick={() => setCondominioToLeave(cond.id)}><LogOut className="w-3.5 h-3.5 mr-2" />Desvincular-se</Button></div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </main>
        <AlertDialog open={!!condominioToLeave} onOpenChange={() => setCondominioToLeave(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Sair do Condomínio?</AlertDialogTitle><AlertDialogDescription>Você perderá acesso às vagas e reservas deste condomínio. Deseja continuar?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleLeaveCondominio} className="bg-destructive text-white hover:bg-destructive/90">Sair</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default VagasCondominios;

