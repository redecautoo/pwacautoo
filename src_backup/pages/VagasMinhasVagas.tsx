import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ParkingCircle,
  ChevronRight,
  Trash2,
  Edit
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

const VagasMinhasVagas = () => {
  const navigate = useNavigate();
  const { minhasVagas, condominios, excluirVaga } = useVagas();
  const { showAlert } = useApp();
  const [vagaToDelete, setVagaToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (vagaToDelete) {
      excluirVaga(vagaToDelete);
      showAlert("Vaga Excluída", "A garagem foi removida permanentemente da sua lista.", "success");
      setVagaToDelete(null);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/garagem")}><ArrowLeft className="w-5 h-5" /></Button>
            <div><h1 className="text-lg font-semibold">Minha Garagem</h1><p className="text-sm text-muted-foreground">{minhasVagas.length} garagem(ns) cadastrada(s)</p></div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-4">
            {minhasVagas.length === 0 ? (
              <motion.div className="bg-card border border-border rounded-xl p-8 text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <ParkingCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhuma garagem</h3>
                <p className="text-sm text-muted-foreground mb-4">Você ainda não possui garagens cadastradas.</p>
                <Button onClick={() => navigate("/garagem/condominios")}>Ver Meus Condomínios</Button>
              </motion.div>
            ) : (
              <motion.div className="space-y-3" variants={staggerContainer} initial="hidden" animate="visible">
                {minhasVagas.map((vaga, index) => {
                  const cond = condominios.find(c => c.id === vaga.condominioId);
                  return (
                    <motion.div key={vaga.id} className="bg-card border border-border rounded-xl overflow-hidden" variants={staggerItemVariants} custom={index}>
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${vaga.tipo === 'coberta' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}><ParkingCircle className="w-6 h-6" /></div>
                          <div>
                            <div className="flex items-center gap-2"><span className="font-bold">Garagem {vaga.numero}</span><span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${vaga.status === 'disponivel' ? 'bg-green-500/20 text-green-500' : 'bg-secondary text-muted-foreground'}`}>{vaga.status === 'disponivel' ? 'Disponível' : 'Ocupada'}</span></div>
                            <p className="text-xs text-muted-foreground">{cond?.nome || 'Condomínio'}</p>
                            <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">Placa: {vaga.placa} • {vaga.tipo}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="border-t border-border px-4 py-2 bg-secondary/20 flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate(`/garagem/vaga/${vaga.id}/editar`)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
                        <Button variant="ghost" size="sm" className="flex-1 text-destructive hover:bg-destructive/10" onClick={() => setVagaToDelete(vaga.id)}><Trash2 className="w-4 h-4 mr-2" />Excluir</Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </main>
        <AlertDialog open={!!vagaToDelete} onOpenChange={() => setVagaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>Excluir Garagem?</AlertDialogTitle><AlertDialogDescription>Deseja remover permanentemente esta garagem?</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Excluir</AlertDialogAction></AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
};

export default VagasMinhasVagas;
