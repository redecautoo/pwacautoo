import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Phone, Mail, FileText, LogOut, Shield, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { getICCCategoryInfo } from "@/contexts/AppContext";

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile, logout, showAlert } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");

  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, 11);
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  };

  const handleSave = () => {
    updateUserProfile({ name, phone, email: email || undefined });
    showAlert("Dados Atualizados!", "Suas informações foram salvas com sucesso.", "success");
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Configurações</h1>
        </div>
      </header>

      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Meus Dados</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              >
                {isEditing ? "Salvar" : "Editar"}
              </Button>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Nome completo</label>
                {isEditing ? (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                  </div>
                ) : (
                  <p className="text-foreground">{currentUser?.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">CPF</label>
                <div className="flex items-center gap-2 text-foreground">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  {currentUser?.cpf}
                </div>
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Telefone/WhatsApp</label>
                {isEditing ? (
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="pl-10" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {currentUser?.phone}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-muted-foreground mb-1">Email</label>
                {isEditing ? (
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="pl-10" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {currentUser?.email || "Não informado"}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Seção ICC */}
          {currentUser && (() => {
            const iccInfo = getICCCategoryInfo(currentUser.icc);
            return (
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium text-muted-foreground">Seu ICC</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                    🔒 100% Privado
                  </span>
                </div>

                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className={`p-6 ${iccInfo.bg} border-b ${iccInfo.border}`}>
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{iccInfo.icon}</span>
                      <div className="flex-1">
                        <span className={`text-4xl font-bold ${iccInfo.color} block`}>
                          {currentUser.icc}
                        </span>
                        <span className={`text-sm ${iccInfo.color} block mt-1`}>
                          {iccInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/icc-gain-points')}
                    className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                      <span className="text-sm text-foreground">Como ganhar pontos no ICC</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </section>
            );
          })()}

          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Legal</h2>
            <div className="bg-card border border-border rounded-2xl divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Termos de Uso</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Política de Privacidade</span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          <Button variant="outline" className="w-full text-destructive border-destructive/50 hover:bg-destructive/10" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
