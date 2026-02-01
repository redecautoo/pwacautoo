import { 
  Shield, 
  AlertTriangle, 
  Car, 
  ParkingCircle, 
  Wrench, 
  Leaf, 
  FileWarning,
  Zap
} from "lucide-react";

export interface AlertMessage {
  id: string;
  text: string;
}

export interface AlertCategory {
  id: string;
  name: string;
  icon: typeof Shield;
  color: string;
  description?: string;
  messages: AlertMessage[];
  requiresLogin?: boolean; // Categoria só disponível para usuários logados
}

export const alertCategories: AlertCategory[] = [
  {
    id: "seguranca-imediata",
    name: "Segurança Imediata",
    icon: Shield,
    color: "category-security",
    messages: [
      { id: "1", text: "Seu veículo pode estar sendo alvo de tentativa de roubo neste momento." },
      { id: "2", text: "Pessoas estão mexendo no seu veículo agora." },
      { id: "3", text: "Seu vidro foi quebrado." },
      { id: "4", text: "Porta do veículo foi forçada ou arrombada." },
      { id: "5", text: "Alarme do veículo está disparando continuamente." },
    ],
  },
  {
    id: "ocorrencia-externa",
    name: "Ocorrência Externa no Veículo",
    icon: AlertTriangle,
    color: "category-external",
    messages: [
      { id: "1", text: "Uma árvore ou galho caiu sobre o seu veículo." },
      { id: "2", text: "Um objeto caiu sobre o seu veículo." },
      { id: "3", text: "Outro veículo atingiu o seu veículo e saiu do local." },
      { id: "4", text: "Seu veículo foi atingido por objeto ou estrutura." },
    ],
  },
  {
    id: "transito-obstrucao",
    name: "Trânsito / Obstrução",
    icon: Car,
    color: "category-traffic",
    messages: [
      { id: "1", text: "Seu veículo está bloqueando a passagem de outros veículos." },
      { id: "2", text: "Seu veículo está bloqueando uma saída." },
      { id: "3", text: "Seu veículo está bloqueando uma entrada." },
      { id: "4", text: "Seu veículo está causando retenção no tráfego local." },
    ],
  },
  {
    id: "estacionamento-irregular",
    name: "Estacionamento Irregular",
    icon: ParkingCircle,
    color: "category-parking",
    messages: [
      { id: "1", text: "Seu veículo está parado em frente a uma garagem." },
      { id: "2", text: "Seu veículo está estacionado em local proibido." },
      { id: "3", text: "Seu veículo está em local sujeito a remoção imediata." },
      { id: "4", text: "Seu veículo está ocupando vaga privada sem autorização." },
    ],
  },
  {
    id: "risco-mecanico",
    name: "Risco Mecânico ou Operacional",
    icon: Wrench,
    color: "category-mechanical",
    messages: [
      { id: "1", text: "Um pneu do seu veículo está murcho ou furado agora." },
      { id: "2", text: "Há vazamento de líquido embaixo do seu veículo neste momento." },
      { id: "3", text: "Capô do veículo está aberto." },
      { id: "4", text: "Porta-malas do veículo está aberto." },
      { id: "5", text: "Farol ou lanterna do veículo estão ligados." },
    ],
  },
  {
    id: "risco-ambiental",
    name: "Risco Ambiental Imediato",
    icon: Leaf,
    color: "category-environmental",
    messages: [
      { id: "1", text: "Seu veículo está em local com risco de alagamento iminente." },
      { id: "2", text: "Galhos ou objetos podem cair sobre o seu veículo a qualquer momento." },
      { id: "3", text: "Obra ou interdição coloca o seu veículo em risco imediato." },
    ],
  },
  {
    id: "aviso-transito",
    name: "Aviso de Trânsito / Fiscalização",
    icon: FileWarning,
    color: "category-inspection",
    messages: [
      { id: "1", text: "Seu veículo foi autuado neste local." },
      { id: "2", text: "Seu veículo corre risco de remoção (guincho)." },
      { id: "3", text: "Área com restrição temporária de estacionamento em vigor." },
      { id: "4", text: "Seu veículo está em desacordo com a sinalização vigente." },
    ],
  },
];
