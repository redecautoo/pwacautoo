import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Download, 
  Eye, 
  X, 
  Shield, 
  CheckCircle,
  FileText,
  QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CautelarRegistry, getOccurrenceTypeName } from "@/lib/types";

interface CautelarCertificateViewProps {
  registry: CautelarRegistry;
}

const CautelarCertificateView = ({ registry }: CautelarCertificateViewProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!registry.certificate) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateLong = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric'
    });
  };

  const getCertificateTypeName = () => {
    switch (registry.certificate?.type) {
      case 'resolucao': return 'CERTIDÃO DE RESOLUÇÃO';
      case 'mediacao': return 'CERTIDÃO DE MEDIAÇÃO';
      default: return 'CERTIDÃO CAUTELAR';
    }
  };

  const getResolutionDescription = () => {
    switch (registry.resolutionType) {
      case 'acordo': return 'As partes envolvidas chegaram a um acordo amigável para resolução do incidente.';
      case 'mediacao': return 'O incidente foi resolvido através de mediação cautelar com parcelamento via CauCash.';
      case 'sem_resolucao': return 'As partes não chegaram a um acordo. Este registro permanece como histórico oficial.';
      default: return 'Certidão emitida para registro oficial do incidente.';
    }
  };

  const handleDownload = async () => {
    const element = certificateRef.current;
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a1628',
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `Certidao_${registry.registryNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating certificate image:', error);
    }
  };

  const CertificateContent = ({ forDownload = false }: { forDownload?: boolean }) => (
    <div 
      ref={forDownload ? certificateRef : undefined}
      className={`relative overflow-hidden ${forDownload ? 'w-[800px]' : 'w-full'}`}
      style={{ 
        background: 'linear-gradient(135deg, #0a1628 0%, #0d2847 50%, #0a1628 100%)',
        fontFamily: 'Georgia, serif'
      }}
    >
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.03]" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="guilloche1" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#10b981" strokeWidth="0.3"/>
            <circle cx="10" cy="10" r="5" fill="none" stroke="#10b981" strokeWidth="0.2"/>
            <circle cx="10" cy="10" r="2" fill="none" stroke="#10b981" strokeWidth="0.1"/>
          </pattern>
          <pattern id="guilloche2" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
            <path d="M0 20 Q10 0 20 20 T40 20" fill="none" stroke="#10b981" strokeWidth="0.2"/>
            <path d="M0 30 Q10 10 20 30 T40 30" fill="none" stroke="#10b981" strokeWidth="0.2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#guilloche1)"/>
        <rect width="100" height="100" fill="url(#guilloche2)"/>
      </svg>

      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16,185,129,0.02) 2px, rgba(16,185,129,0.02) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(16,185,129,0.02) 2px, rgba(16,185,129,0.02) 4px)
          `
        }}
      />

      <div className="relative z-10 p-6 md:p-8">
        <div 
          className="border-4 rounded-lg p-6 md:p-8"
          style={{
            borderColor: 'rgba(16,185,129,0.4)',
            borderImage: 'linear-gradient(45deg, #10b981 0%, #047857 25%, #10b981 50%, #047857 75%, #10b981 100%) 1',
            boxShadow: 'inset 0 0 30px rgba(16,185,129,0.1), 0 0 20px rgba(16,185,129,0.1)'
          }}
        >
          <div 
            className="border-2 rounded-lg p-4 md:p-6"
            style={{ borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-2">
                <img 
                  src="/cautoo-logo.png" 
                  alt="CAUTOO" 
                  className="h-10 md:h-14"
                  crossOrigin="anonymous"
                />
              </div>
              
              <div className="my-4 md:my-6">
                <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              </div>
              
              <h2 className="text-lg md:text-xl font-bold text-white tracking-widest mb-1">
                {getCertificateTypeName()}
              </h2>
              <p className="text-xs text-emerald-500/70">
                Registro Oficial de Ocorrência Veicular
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
              <div className="space-y-3">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                    Número do Registro
                  </p>
                  <p className="text-sm md:text-base font-mono font-bold text-emerald-400">
                    {registry.registryNumber}
                  </p>
                </div>
                
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                    Tipo de Ocorrência
                  </p>
                  <p className="text-sm font-medium text-white">
                    {getOccurrenceTypeName(registry.occurrenceType)}
                  </p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                    Data da Ocorrência
                  </p>
                  <p className="text-sm text-white">
                    {formatDateLong(registry.occurrenceDate)} às {registry.occurrenceTime}
                  </p>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                    Local
                  </p>
                  <p className="text-sm text-white">
                    {registry.location}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-2">
                    Veículos Envolvidos
                  </p>
                  <div className="space-y-2">
                    {registry.participants.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-mono text-sm text-white">{p.plate}</span>
                        {p.confirmed && (
                          <CheckCircle className="w-3 h-3 text-emerald-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                    Resolução
                  </p>
                  <p className="text-xs text-white/80">
                    {getResolutionDescription()}
                  </p>
                </div>

                {registry.damage && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-3">
                    <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                      Valor do Dano
                    </p>
                    <p className="text-sm font-bold text-emerald-400">
                      R$ {registry.damage.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {registry.damage.installments}x via CauCash
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="my-4 md:my-6">
              <div className="h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
            </div>

            <div className="grid md:grid-cols-3 gap-4 items-center">
              <div className="text-center md:text-left">
                <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                  Emitida em
                </p>
                <p className="text-xs text-white">
                  {formatDate(registry.certificate.generatedAt)}
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-white rounded-lg p-2 mb-1">
                  <QrCode className="w-14 h-14 md:w-16 md:h-16 text-gray-900" />
                </div>
                <p className="text-[8px] text-emerald-500/60 text-center">
                  {registry.certificate.validationUrl}
                </p>
              </div>

              <div className="text-center md:text-right">
                <p className="text-[10px] text-emerald-500/60 uppercase tracking-wider mb-1">
                  Hash de Validação
                </p>
                <p className="text-[10px] font-mono text-emerald-400 break-all">
                  {registry.certificate.hash}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/20">
              <p className="text-[9px] text-center text-emerald-500/50 leading-relaxed">
                Este documento é uma certidão digital emitida pela Rede Cautelar de Veículos CAUTOO. 
                Sua autenticidade pode ser verificada através do QR Code ou acessando o link de validação. 
                A adulteração deste documento é crime previsto no art. 297 do Código Penal Brasileiro.
              </p>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-emerald-500/30 rounded-tl-lg" />
        <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-emerald-500/30 rounded-tr-lg" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-emerald-500/30 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-emerald-500/30 rounded-br-lg" />
      </div>
    </div>
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30 rounded-xl p-4"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <FileText className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Certidão Cautelar</h3>
            <p className="text-sm text-muted-foreground">
              {registry.certificate.type === 'resolucao' ? 'Certidão de Resolução' :
               registry.certificate.type === 'mediacao' ? 'Certidão de Mediação' :
               'Certidão Pendente'}
            </p>
          </div>
        </div>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Emitida em:</span>
            <span>{formatDate(registry.certificate.generatedAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Hash:</span>
            <span className="font-mono text-xs truncate max-w-[60%]">{registry.certificate.hash}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            onClick={() => setShowPreview(true)}
            data-testid="button-view-certificate"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
          <Button
            variant="outline"
            className="flex-1 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10"
            onClick={handleDownload}
            data-testid="button-download-certificate"
          >
            <Download className="w-4 h-4 mr-2" />
            Baixar
          </Button>
        </div>
      </motion.div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 z-20 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setShowPreview(false)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="max-h-[90vh] overflow-y-auto">
              <CertificateContent />
            </div>
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Certidão (PNG)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed -left-[9999px]">
        <CertificateContent forDownload />
      </div>
    </>
  );
};

export default CautelarCertificateView;
