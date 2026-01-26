import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Building2, MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVagas } from "@/contexts/VagasContext";
import { PageTransition } from "@/components/PageTransition";
import { toast } from "sonner";

const VagasNovoCondominio = () => {
  const navigate = useNavigate();
  const { criarCondominio } = useVagas();
  
  const [formData, setFormData] = useState({
    nome: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "",
    cep: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValid = formData.nome.trim().length >= 3 && 
                  formData.endereco.trim().length >= 5 &&
                  formData.bairro.trim().length >= 2 &&
                  formData.cidade.trim().length >= 2 &&
                  formData.uf.trim().length === 2 &&
                  formData.cep.replace(/\D/g, '').length === 8;

  const handleSubmit = async () => {
    if (!isValid) return;
    
    setIsSubmitting(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    criarCondominio({
      nome: formData.nome.trim(),
      endereco: formData.endereco.trim(),
      bairro: formData.bairro.trim(),
      cidade: formData.cidade.trim(),
      uf: formData.uf.toUpperCase().trim(),
      cep: formData.cep.replace(/\D/g, ''),
    });
    
    setIsSubmitting(false);
    setSuccess(true);
    toast.success("Condomínio criado com sucesso!");
    
    setTimeout(() => {
      navigate("/garagem/condominios");
    }, 1500);
  };

  if (success) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div 
            className="bg-card border border-border rounded-xl p-8 text-center max-w-sm"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Check className="w-8 h-8 text-green-500" />
            </motion.div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Condomínio Criado!</h2>
            <p className="text-sm text-muted-foreground">
              Seu condomínio foi cadastrado. Ele ficará visível para outros moradores pesquisarem e se associarem.
            </p>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

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
              <div>
                <h1 className="text-lg font-semibold text-foreground">Novo Condomínio</h1>
                <p className="text-sm text-muted-foreground">Cadastre seu condomínio</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-6">
          <div className="max-w-lg mx-auto space-y-6">
            
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-blue-400" />
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Condomínio *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Edifício Solar das Palmeiras"
                  value={formData.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  maxLength={100}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço (Rua e Número) *</Label>
                <Input
                  id="endereco"
                  placeholder="Ex: Rua das Flores, 123"
                  value={formData.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                  maxLength={200}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bairro">Bairro *</Label>
                  <Input
                    id="bairro"
                    placeholder="Ex: Jardim América"
                    value={formData.bairro}
                    onChange={(e) => handleChange("bairro", e.target.value)}
                    maxLength={100}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="cep">CEP *</Label>
                  <Input
                    id="cep"
                    placeholder="00000-000"
                    value={formData.cep}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2');
                      handleChange("cep", formatted);
                    }}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="cidade">Cidade *</Label>
                  <Input
                    id="cidade"
                    placeholder="Ex: São Paulo"
                    value={formData.cidade}
                    onChange={(e) => handleChange("cidade", e.target.value)}
                    maxLength={100}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="uf">UF *</Label>
                  <Input
                    id="uf"
                    placeholder="SP"
                    value={formData.uf}
                    onChange={(e) => handleChange("uf", e.target.value.toUpperCase())}
                    maxLength={2}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <p className="text-sm text-amber-400">
                <strong>⚠️ Atenção:</strong> A associação é autodeclarada. Usuários são responsáveis 
                pela veracidade das informações. Falsos cadastros podem ser denunciados por moradores verificados.
              </p>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting}
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
                  <MapPin className="w-4 h-4 mr-2" />
                  Cadastrar Condomínio
                </>
              )}
            </Button>

          </div>
        </main>
      </div>
    </PageTransition>
  );
};

export default VagasNovoCondominio;
