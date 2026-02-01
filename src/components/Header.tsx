import React from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import cautooLogo from "@/assets/cautoo-logo.png";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full pt-4 pb-6 px-4 safe-area-top">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <img
            src={cautooLogo}
            alt="Cautoo"
            className="h-9 w-auto"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="flex-shrink-0 h-9 px-4 text-sm border-border"
          onClick={() => navigate('/login')}
        >
          <LogIn className="w-4 h-4 mr-1.5" />
          Entrar
        </Button>
      </div>
    </header>
  );
};

export default Header;
