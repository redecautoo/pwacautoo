import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Search,
  Building2,
  MapPin,
  Users,
  ParkingCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition, staggerContainer, staggerItemVariants } from "@/components/PageTransition";
import { VALOR_DIARIA } from "@/lib/vagasTypes";

const VagasBuscar = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const { buscarCondominios, vagasDisponiveis, usuariosCondominios, condominios } = useVagas();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  const results = hasSearched && searchTerm.length >= 2 
    ? buscarCondominios(searchTerm) 
    : [];

  const handleSearch = () => {
    if (searchTerm.length >= 2) {
      setHasSearched(true);
    }
  };

  const getMembrosCount = (condominioId: string) => {
    return usuariosCondominios.filter(uc => uc.condominioId === condominioId && !uc.excluido).length;
  };

  const getVagasCount = (condominioId: string) => {
    return vagasDisponiveis(condominioId).length;
  };

  // Get all available spots for quick access
  const allAvailableSpots = condominios.flatMap(c => 
    vagasDisponiveis(c.id).map(v => ({ ...v, condominio: c }))
  ).slice(0, 5);

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
                <h1 className="text-lg font-semibold text-foreground">Buscar</h1>
                <p className="text-sm text-muted-foreground">Encontre condomínios e vagas</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Search Box */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome do condomínio, bairro, cidade..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (e.target.value.length < 2) setHasSearched(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch} disabled={searchTerm.length < 2}>
                Buscar
              </Button>
            </div>

            {/* Search Results */}
            {hasSearched && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {results.length} condomínio(s) encontrado(s)
                </h3>
                
                {results.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-6 text-center">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Nenhum condomínio encontrado para "{searchTerm}"
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => navigate("/garagem/novo-condominio")}
                    >
                      Cadastrar Condomínio
                    </Button>
                  </div>
                ) : (
                  <motion.div 
                    className="space-y-3"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    {results.map((cond, index) => (
                      <motion.button
                        key={cond.id}
                        onClick={() => navigate(`/garagem/condominio/${cond.id}`)}
                        className="w-full bg-card border border-border rounded-xl p-4 text-left transition-colors hover:bg-secondary/50"
                        variants={staggerItemVariants}
                        custom={index}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <span className="font-medium text-foreground block">{cond.nome}</span>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span>{cond.bairro}, {cond.cidade}</span>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {getMembrosCount(cond.id)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ParkingCircle className="w-3 h-3" />
                                  {getVagasCount(cond.id)} disponível
                                </span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            {/* Quick Access: Available Spots */}
            {!hasSearched && allAvailableSpots.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Vagas Disponíveis Agora
                </h3>
                <motion.div 
                  className="space-y-3"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {allAvailableSpots.map((vaga, index) => (
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
                            <span className="font-medium text-foreground block">
                              Vaga {vaga.numero}
                              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded ${
                                vaga.tipo === 'coberta' ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                              }`}>
                                {vaga.tipo}
                              </span>
                            </span>
                            <p className="text-sm text-muted-foreground">{vaga.condominio.nome}</p>
                            <p className="text-xs text-muted-foreground">
                              {vaga.disponivelDe} → {vaga.disponivelAte}
                            </p>
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
              </div>
            )}

            {/* Tip */}
            {!hasSearched && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p className="text-sm text-blue-400">
                  <strong>💡 Dica:</strong> Busque pelo nome do condomínio, bairro ou cidade 
                  para encontrar vagas disponíveis perto de você.
                </p>
              </div>
            )}

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasBuscar;
