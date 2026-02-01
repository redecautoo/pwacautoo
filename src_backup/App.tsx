import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/contexts/AppContext";
import { VagasProvider } from "@/contexts/VagasContext";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Alerts from "./pages/Alerts";
import SendAlert from "./pages/SendAlert";
import RateDriver from "./pages/RateDriver";
import Stolen from "./pages/Stolen";
import Sighting from "./pages/Sighting";
import Friends from "./pages/Friends";
import ManagePlate from "./pages/ManagePlate";
import Seals from "./pages/Seals";
import AddPlate from "./pages/AddPlate";
import Ranking from "./pages/Ranking";
import Referrals from "./pages/Referrals";
import Settings from "./pages/Settings";
import VehicleDetails from "./pages/VehicleDetails";
import VehicleScore from "./pages/VehicleScore";
import ReportStolen from "./pages/ReportStolen";
import RequestHelp from "./pages/RequestHelp";
import SolidarySocorro from "./pages/SolidarySocorro";
import NotFound from "./pages/NotFound";
// Vagas Module
import VagasHome from "./pages/VagasHome";
import VagasCondominios from "./pages/VagasCondominios";
import VagasNovoCondominio from "./pages/VagasNovoCondominio";
import VagasCondominioDetalhe from "./pages/VagasCondominioDetalhe";
import VagasNovaVaga from "./pages/VagasNovaVaga";
import VagasVagaDetalhe from "./pages/VagasVagaDetalhe";
import VagasMinhasReservas from "./pages/VagasMinhasReservas";
import VagasReservasRecebidas from "./pages/VagasReservasRecebidas";
import VagasBuscar from "./pages/VagasBuscar";
import VagasMinhasVagas from "./pages/VagasMinhasVagas";
import VagasEditarVaga from "./pages/VagasEditarVaga";
import VagasLinkAcesso from "./pages/VagasLinkAcesso";
import VagasVisitanteAlerta from "./pages/VagasVisitanteAlerta";
import VagasCauCash from "./pages/VagasCauCash";
// Registro Cautelar
import CautelarRegistry from "./pages/CautelarRegistry";
import NewCautelarRegistry from "./pages/NewCautelarRegistry";
import CautelarRegistryDetails from "./pages/CautelarRegistryDetails";
import GlobalAlert from "@/components/GlobalAlert";
// Score and ICC Info Pages
import ScoreInfo from "./pages/ScoreInfo";
import ICCInfo from "./pages/ICCInfo";
import ScoreVsICC from "./pages/ScoreVsICC";
import ScoreCalculation from "./pages/ScoreCalculation";
import ICCGainPoints from "./pages/ICCGainPoints";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" forcedTheme="dark" enableSystem={false}>
      <AppProvider>
        <VagasProvider>
          <TooltipProvider>
            <GlobalAlert />
            <PWAInstallBanner />
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vehicle/:vehicleId" element={<VehicleDetails />} />
                <Route path="/vehicle-score/:vehicleId" element={<VehicleScore />} />
                <Route path="/report-stolen/:vehicleId" element={<ReportStolen />} />
                <Route path="/request-help/:vehicleId" element={<RequestHelp />} />
                <Route path="/solidary-socorro" element={<SolidarySocorro />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/send-alert" element={<SendAlert />} />
                <Route path="/rate-driver" element={<RateDriver />} />
                <Route path="/stolen" element={<Stolen />} />
                <Route path="/sighting" element={<Sighting />} />
                <Route path="/friends" element={<Friends />} />
                <Route path="/manage-plate" element={<ManagePlate />} />
                <Route path="/seals" element={<Seals />} />
                <Route path="/add-plate" element={<AddPlate />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/referrals" element={<Referrals />} />
                <Route path="/settings" element={<Settings />} />
                {/* Garagem Module */}
                <Route path="/garagem" element={<VagasHome />} />
                <Route path="/garagem/condominios" element={<VagasCondominios />} />
                <Route path="/garagem/novo-condominio" element={<VagasNovoCondominio />} />
                <Route path="/garagem/condominio/:condominioId" element={<VagasCondominioDetalhe />} />
                <Route path="/garagem/condominio/:condominioId/nova-vaga" element={<VagasNovaVaga />} />
                <Route path="/garagem/vaga/:vagaId" element={<VagasVagaDetalhe />} />
                <Route path="/garagem/minhas-reservas" element={<VagasMinhasReservas />} />
                <Route path="/garagem/reservas-recebidas" element={<VagasReservasRecebidas />} />
                <Route path="/garagem/buscar" element={<VagasBuscar />} />
                <Route path="/garagem/minhas-vagas" element={<VagasMinhasVagas />} />
                <Route path="/garagem/vaga/:vagaId/editar" element={<VagasEditarVaga />} />
                <Route path="/garagem/caucash" element={<VagasCauCash />} />
                <Route path="/v/:code" element={<VagasLinkAcesso />} />
                <Route path="/alerta-visitante" element={<VagasVisitanteAlerta />} />
                {/* Registro Cautelar */}
                <Route path="/cautelar-registry" element={<CautelarRegistry />} />
                <Route path="/cautelar-registry/new" element={<NewCautelarRegistry />} />
                <Route path="/cautelar-registry/:id" element={<CautelarRegistryDetails />} />
                {/* Score and ICC Info Pages */}
                <Route path="/score-info" element={<ScoreInfo />} />
                <Route path="/icc-info" element={<ICCInfo />} />
                <Route path="/score-vs-icc" element={<ScoreVsICC />} />
                <Route path="/score-calculation" element={<ScoreCalculation />} />
                <Route path="/icc-gain-points" element={<ICCGainPoints />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>
          </TooltipProvider>
        </VagasProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
