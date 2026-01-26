import { Bell, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModeToggleProps {
  isMyPlate: boolean;
  onToggle: (isMyPlate: boolean) => void;
}

const ModeToggle = ({ isMyPlate, onToggle }: ModeToggleProps) => {
  return (
    <div className="w-full">
      <div className="flex rounded-lg overflow-hidden border border-border">
        <Button
          variant="ghost"
          className={`flex-1 rounded-none py-3 ${
            !isMyPlate
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-transparent text-muted-foreground hover:bg-secondary"
          }`}
          onClick={() => onToggle(false)}
        >
          <Bell className="w-4 h-4 mr-2" />
          Enviar alerta
        </Button>
        <Button
          variant="ghost"
          className={`flex-1 rounded-none py-3 ${
            isMyPlate
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-transparent text-muted-foreground hover:bg-secondary"
          }`}
          onClick={() => onToggle(true)}
        >
          <Car className="w-4 h-4 mr-2" />
          É minha placa
        </Button>
      </div>
      
      <p className="text-xs text-muted-foreground text-center mt-2">
        {isMyPlate
          ? "Cadastre sua placa para receber alertas"
          : "Envie um alerta para o dono do veículo"}
      </p>
    </div>
  );
};

export default ModeToggle;
