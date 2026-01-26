import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gift, Copy, Check, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import SuccessModal from "@/components/SuccessModal";

const Referrals = () => {
  const navigate = useNavigate();
  const { currentUser, referrals } = useApp();
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const referralLink = `https://redecautoo.app/r/${currentUser?.referralCode}`;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setShowSuccess(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const rewards = [
    { points: 50, reward: '10% de desconto na assistência CAUTOO' },
    { points: 100, reward: '20% de desconto na assistência CAUTOO' },
    { points: 200, reward: '1 mês grátis de assistência CAUTOO' },
    { points: 500, reward: '3 meses grátis de assistência CAUTOO' },
  ];
  
  const nextReward = rewards.find(r => r.points > (currentUser?.referralPoints || 0)) || rewards[rewards.length - 1];
  const pointsToNextReward = nextReward.points - (currentUser?.referralPoints || 0);
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Indicações e Recompensas</h1>
        </div>
      </header>
      
      <main className="px-4 py-6">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Stats */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{currentUser?.referralCount || 0}</p>
              <p className="text-xs text-muted-foreground">Indicados</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-4 text-center">
              <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-3xl font-bold text-foreground">{currentUser?.referralPoints || 0}</p>
              <p className="text-xs text-muted-foreground">Pontos ganhos</p>
            </div>
          </section>
          
          {/* Referral link */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-medium text-foreground mb-3">Seu link de indicação</h2>
            <div className="flex gap-2">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground truncate">
                {referralLink}
              </div>
              <Button onClick={handleCopy} variant="outline">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Código: <span className="font-mono text-foreground">{currentUser?.referralCode}</span>
            </p>
          </section>
          
          {/* How it works */}
          <section className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-sm font-medium text-foreground mb-4">Como funciona</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm text-foreground">Compartilhe seu link</p>
                  <p className="text-xs text-muted-foreground">Envie para amigos e família</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-sm text-foreground">Eles se cadastram</p>
                  <p className="text-xs text-muted-foreground">Você ganha +5 pontos por cadastro</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-sm text-foreground">Eles compram Selo Azul</p>
                  <p className="text-xs text-muted-foreground">Você ganha +10 pontos extras</p>
                </div>
              </div>
            </div>
          </section>
          
          {/* Rewards */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Recompensas</h2>
            <div className="space-y-2">
              {rewards.map((reward, i) => {
                const unlocked = (currentUser?.referralPoints || 0) >= reward.points;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-xl ${
                      unlocked
                        ? 'bg-primary/10 border border-primary'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Award className={`w-5 h-5 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div>
                        <p className={`text-sm ${unlocked ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                          {reward.reward}
                        </p>
                        <p className="text-xs text-muted-foreground">{reward.points} pontos</p>
                      </div>
                    </div>
                    {unlocked && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                        Desbloqueado
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {pointsToNextReward > 0 && (
              <p className="text-xs text-muted-foreground text-center mt-4">
                Faltam {pointsToNextReward} pontos para a próxima recompensa
              </p>
            )}
          </section>
          
          {/* Referral history */}
          {referrals.length > 0 && (
            <section>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Seus indicados</h2>
              <div className="bg-card border border-border rounded-2xl divide-y divide-border">
                {referrals.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm text-foreground">{referral.referredUserName}</p>
                      <p className="text-xs text-muted-foreground">
                        {referral.boughtBlueSeal ? 'Com Selo Azul' : 'Cadastrado'}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-green-500">
                      +{referral.pointsEarned}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Link Copiado!"
        description="Compartilhe seu link de indicação com amigos e ganhe pontos."
        variant="success"
      />
    </div>
  );
};

export default Referrals;
