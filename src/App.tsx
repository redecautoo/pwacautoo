import React, { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppProvider } from "@/contexts/AppContext";
import { VagasProvider } from "@/contexts/VagasContext";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import GlobalAlert from "@/components/GlobalAlert";
import { queryClient } from "@/lib/queryClient";

// Componente de Loading
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

// ===== LAZY LOADING DE PÁGINAS =====
// Páginas principais (carregamento imediato)
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Páginas secundárias (carregamento sob demanda)
const Alerts = lazy(() => import("./pages/Alerts"));
const SendAlert = lazy(() => import("./pages/SendAlert"));
const RateDriver = lazy(() => import("./pages/RateDriver"));
const Stolen = lazy(() => import("./pages/Stolen"));
const Sighting = lazy(() => import("./pages/Sighting"));
const Friends = lazy(() => import("./pages/Friends"));
const ManagePlate = lazy(() => import("./pages/ManagePlate"));
const Seals = lazy(() => import("./pages/Seals"));
const AddPlate = lazy(() => import("./pages/AddPlate"));
const Ranking = lazy(() => import("./pages/Ranking"));
const Referrals = lazy(() => import("./pages/Referrals"));
const Settings = lazy(() => import("./pages/Settings"));

// Páginas de veículos
const VehicleDetails = lazy(() => import("./pages/VehicleDetails"));
const VehicleScore = lazy(() => import("./pages/VehicleScore"));
const ReportStolen = lazy(() => import("./pages/ReportStolen"));
const RequestHelp = lazy(() => import("./pages/RequestHelp"));
const SolidarySocorro = lazy(() => import("./pages/SolidarySocorro"));

// Páginas de Vagas/Garagem
const VagasHome = lazy(() => import("./pages/VagasHome"));
const VagasCondominios = lazy(() => import("./pages/VagasCondominios"));
const VagasNovoCondominio = lazy(() => import("./pages/VagasNovoCondominio"));
const VagasCondominioDetalhe = lazy(() => import("./pages/VagasCondominioDetalhe"));
const VagasNovaVaga = lazy(() => import("./pages/VagasNovaVaga"));
const VagasVagaDetalhe = lazy(() => import("./pages/VagasVagaDetalhe"));
const VagasMinhasReservas = lazy(() => import("./pages/VagasMinhasReservas"));
const VagasReservasRecebidas = lazy(() => import("./pages/VagasReservasRecebidas"));
const VagasBuscar = lazy(() => import("./pages/VagasBuscar"));
const VagasMinhasVagas = lazy(() => import("./pages/VagasMinhasVagas"));
const VagasEditarVaga = lazy(() => import("./pages/VagasEditarVaga"));
const VagasLinkAcesso = lazy(() => import("./pages/VagasLinkAcesso"));
const VagasVisitanteAlerta = lazy(() => import("./pages/VagasVisitanteAlerta"));
const VagasCauCash = lazy(() => import("./pages/VagasCauCash"));

// Páginas de Registro Cautelar
const CautelarRegistry = lazy(() => import("./pages/CautelarRegistry"));
const NewCautelarRegistry = lazy(() => import("./pages/NewCautelarRegistry"));
const CautelarRegistryDetails = lazy(() => import("./pages/CautelarRegistryDetails"));

// Páginas de Score/ICC
const ScoreInfo = lazy(() => import("./pages/ScoreInfo"));
const ICCInfo = lazy(() => import("./pages/ICCInfo"));
const ScoreVsICC = lazy(() => import("./pages/ScoreVsICC"));
const ScoreCalculation = lazy(() => import("./pages/ScoreCalculation"));
const ICCGainPoints = lazy(() => import("./pages/ICCGainPoints"));

// Página de showcase de placas (demonstração)
// Página de showcase de placas (demonstração)
const PlateShowcase = lazy(() => import("./pages/PlateShowcase"));
// Página de Skins & Coleção
const SkinsCollection = lazy(() => import("./pages/SkinsCollection"));

// Wrapper para rotas com lazy loading
const LazyRoute = ({ component: Component }: { component: React.LazyExoticComponent<() => JSX.Element> }) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

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
                {/* Rotas principais - carregamento imediato */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />

                {/* Rotas de veículos - lazy loading */}
                <Route path="/vehicle/:vehicleId" element={<LazyRoute component={VehicleDetails} />} />
                <Route path="/vehicle-score/:vehicleId" element={<LazyRoute component={VehicleScore} />} />
                <Route path="/report-stolen/:vehicleId" element={<LazyRoute component={ReportStolen} />} />
                <Route path="/request-help/:vehicleId" element={<LazyRoute component={RequestHelp} />} />
                <Route path="/solidary-socorro" element={<LazyRoute component={SolidarySocorro} />} />

                {/* Rotas de alertas - lazy loading */}
                <Route path="/alerts" element={<LazyRoute component={Alerts} />} />
                <Route path="/send-alert" element={<LazyRoute component={SendAlert} />} />
                <Route path="/rate-driver" element={<LazyRoute component={RateDriver} />} />
                <Route path="/stolen" element={<LazyRoute component={Stolen} />} />
                <Route path="/sighting" element={<LazyRoute component={Sighting} />} />

                {/* Rotas de social - lazy loading */}
                <Route path="/friends" element={<LazyRoute component={Friends} />} />
                <Route path="/manage-plate" element={<LazyRoute component={ManagePlate} />} />
                <Route path="/seals" element={<LazyRoute component={Seals} />} />
                <Route path="/add-plate" element={<LazyRoute component={AddPlate} />} />
                <Route path="/ranking" element={<LazyRoute component={Ranking} />} />
                <Route path="/referrals" element={<LazyRoute component={Referrals} />} />
                <Route path="/settings" element={<LazyRoute component={Settings} />} />

                {/* Rotas de garagem/vagas - lazy loading */}
                <Route path="/garagem" element={<LazyRoute component={VagasHome} />} />
                <Route path="/garagem/condominios" element={<LazyRoute component={VagasCondominios} />} />
                <Route path="/garagem/novo-condominio" element={<LazyRoute component={VagasNovoCondominio} />} />
                <Route path="/garagem/condominio/:condominioId" element={<LazyRoute component={VagasCondominioDetalhe} />} />
                <Route path="/garagem/condominio/:condominioId/nova-vaga" element={<LazyRoute component={VagasNovaVaga} />} />
                <Route path="/garagem/vaga/:vagaId" element={<LazyRoute component={VagasVagaDetalhe} />} />
                <Route path="/garagem/minhas-reservas" element={<LazyRoute component={VagasMinhasReservas} />} />
                <Route path="/garagem/reservas-recebidas" element={<LazyRoute component={VagasReservasRecebidas} />} />
                <Route path="/garagem/buscar" element={<LazyRoute component={VagasBuscar} />} />
                <Route path="/garagem/minhas-vagas" element={<LazyRoute component={VagasMinhasVagas} />} />
                <Route path="/garagem/vaga/:vagaId/editar" element={<LazyRoute component={VagasEditarVaga} />} />
                <Route path="/garagem/caucash" element={<LazyRoute component={VagasCauCash} />} />
                <Route path="/v/:code" element={<LazyRoute component={VagasLinkAcesso} />} />
                <Route path="/alerta-visitante" element={<LazyRoute component={VagasVisitanteAlerta} />} />

                {/* Rotas de registro cautelar - lazy loading */}
                <Route path="/cautelar-registry" element={<LazyRoute component={CautelarRegistry} />} />

                {/* Skins & Coleção */}
                <Route path="/skins-collection" element={<LazyRoute component={SkinsCollection} />} />
                <Route path="/cautelar-registry/new" element={<LazyRoute component={NewCautelarRegistry} />} />
                <Route path="/cautelar-registry/:id" element={<LazyRoute component={CautelarRegistryDetails} />} />

                {/* Rotas de score/ICC - lazy loading */}
                <Route path="/score-info" element={<LazyRoute component={ScoreInfo} />} />
                <Route path="/icc-info" element={<LazyRoute component={ICCInfo} />} />
                <Route path="/score-vs-icc" element={<LazyRoute component={ScoreVsICC} />} />
                <Route path="/score-calculation" element={<LazyRoute component={ScoreCalculation} />} />
                <Route path="/icc-gain-points" element={<LazyRoute component={ICCGainPoints} />} />

                {/* Showcase de placas (demonstração) */}
                <Route path="/plate-showcase" element={<LazyRoute component={PlateShowcase} />} />

                {/* 404 */}
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
