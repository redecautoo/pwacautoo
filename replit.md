# Cauto - Vehicle Management Application

## Overview
A React-based vehicle management application (PWA) for parking spot management in condominiums. Features include a CauCash digital wallet that processes all in-app payments (seal purchases R$50, plate info R$25, extra plates R$5, stolen alerts R$10), "Frota de Amigos" collaborative network for contact sharing and fleet management with assistance calculation.

## Funcionalidades (18 total)

### Funcionalidades que PRECISAM de Selo Verificado:
1. **Cadastro de Veículos** - A partir da 2ª placa
2. **Avaliar Motorista** - Elogios e críticas
3. **Reportar Roubo** - Alertar sobre veículo roubado
4. **Registro Cautelar** - Registrar ocorrências entre veículos
5. **Frota de Amigos** - Rede colaborativa e solicitar contato
6. **Gerenciar Placa** - Transferir e reivindicar placas

### Funcionalidades que NÃO precisam de Selo:
1. CauCash (Carteira Digital)
2. Selos e Verificação (compra do selo)
3. Enviar Alerta
4. Meus Alertas
5. Veículo Roubado (consulta)
6. Consultar Placa
7. Ranking ICC
8. Garagem
9. Detalhes do Veículo
10. Solicitar Socorro
11. Score do Veículo
12. Dados Cadastrais

## ICC - Índice de Contribuição Cautelar

### Valor inicial: 100 | Máximo: 1.000 | Vinculado ao: CPF

### Ações que aumentam o ICC:
- Enviar alerta: +2 pts
- Receber elogio: +1 pt
- Comprar selo verificado: +10 pts
- Acordo em Registro Cautelar: +1 pt
- Mediação paga: +2 pts

### Ações que diminuem o ICC:
- Registro Cautelar sem resolução: -2 pts

### Rankings por ICC:
- 0-199: Iniciante
- 200-399: Condutor Consciente
- 400-649: Apoiador Urbano
- 650-849: Guardião Viário
- 850-1000: Referência Cautoo

## Selos

### Selo Azul (Perfil Verificado) - R$50
- Compra via CauCash
- Validade: 1 ano

### Selo Amarelo (Guardião Viário) - Conquista
- Requisitos: Selo Azul ativo, ICC >= 650, 10+ alertas úteis, max 3 críticas, 0 abusos
- Perda: +10 críticas válidas

### Selo Verde (Referência Cautoo) - Conquista
- Requisitos: Selo Amarelo + ICC >= 850, 30+ alertas, 3+ ajudas reais, média score >= 80
- Benefícios: 1 chamado socorro gratuito/mês, alertas roubo gratuitos, mediação cautelar

## Planos CAUTOO

### Modo Cautela - R$31,50/mês ou R$189,00/6 meses
- 1 chamado completo (pode combinar serviços)
- Serviços: Guincho Km Livre, Veículo Reserva, Auxílio Mecânico, Pane Seca, Recarga de Bateria, Chaveiro, Troca de Pneu, Estadia Veicular, Transporte Alternativo
- Benefícios: Selo Azul, 1 placa adicional, 1 alerta roubo, Cashback R$30, +100 ICC
- Carência: 7 dias

### Modo Certo - R$43,50/mês ou R$391,50/9 meses
- 2 chamados de serviços + 1 proteção
- Serviços: Todos do Modo Cautela + Hospedagem/Pernoite
- Proteções: Vidro, Pneu, Pagamento de Multa
- Benefícios: Selo Azul, 2 placas adicionais, 3 alertas roubo, Cashback R$45, +200 ICC
- Carência: 7 dias

### Modo Ciente - R$65,50/mês ou R$786,00/12 meses
- 3 chamados de serviços + 2 proteções
- Serviços: Todos do Modo Certo + Assistência Pet
- Proteções: Roda, Pagamento de Franquia, Indenização por Acidente
- Benefícios: Selo Azul, 3 placas adicionais, 6 alertas roubo, Cashback R$60, +300 ICC
- Carência: 7 dias

## Project Structure
- `/src` - Main source code
  - `/components` - React components including UI primitives (shadcn/ui)
  - `/pages` - Page components for routing
  - `/contexts` - React context providers
  - `/hooks` - Custom React hooks
  - `/lib` - Utility functions and libraries
  - `/assets` - Static assets
- `/public` - Public assets

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

## Development
The application runs on port 5000 using the Vite development server.

To start development:
```bash
npm run dev
```

## Authentication System
**Password-based authentication** (for testing phase - avoids SMS/email costs):
- **Login**: CPF + 6-digit numeric password
- **Registration**: Includes password creation with confirmation
- **Test Accounts**: All test CPFs use password `123456`
  - 000.000.000-00 (Carlos Silva - Selo Azul)
  - 111.111.111-11 (Maria Santos - Sem selo)
  - 222.222.222-22 (Joao Pereira - Sem selo)
  - 333.333.333-33 (Ana Oliveira - Selo Amarelo)
  - 444.444.444-44, 555.555.555-55, 666.666.666-66, 777.777.777-77

## Recent Changes (January 2026)
- **"Selos e Planos" Section**: Complete redesign with tabbed interface
  - Route: /seals
  - **Two tabs**: "Selos" (seals section) and "Planos" (subscription plans)
  - **Selos tab**: Selo Azul, Amarelo, Verde with requirements and benefits
  - **Planos tab**: Three plans with active plan banner for CAUTOO clients
    - Modo Cautela (R$189/6mo), Modo Certo (R$391.50/9mo), Modo Ciente (R$786/12mo)
  - Full CauCash integration for plan purchases with combined balance debit
  - Each plan includes Selo Azul, extra plates, stolen alerts, cashback, and ICC bonus
  - 7-day waiting period after purchase
  - Active plan display: Shows current plan name and expiration date for CAUTOO clients
  - User field: activePlanType ('cautela' | 'certo' | 'ciente') added to User type
  - Added R$400 and R$800 recharge options in VagasCauCash.tsx
- **Password Authentication**: Migrated from code-based (SMS/email) to password-based system
  - Login requires CPF + 6-digit numeric password
  - Registration includes password creation and confirmation fields
  - Test CPFs show hint message "Senha: 123456"
  - AppContext uses loginWithPassword function
- **"Registro Cautelar" Feature**: Complete vehicle occurrence registration and resolution system
  - Routes: /cautelar-registry, /cautelar-registry/new, /cautelar-registry/:id
  - **Acesso restrito**: Apenas usuários com Selo Azul, Amarelo ou Verde podem criar registros
  - **Placa automática**: A placa do usuário logado é incluída automaticamente no registro
  - O usuário adiciona apenas placas de OUTROS veículos envolvidos (mínimo 1, sem limite máximo)
  - 3-step wizard: Veículos Envolvidos → Dados da Ocorrência → Confirmação
  - Faixa informativa para usuários com Selo Verde (benefícios de mediação)
  - Resolution options: Acordo, Sem Resolução, Mediação Cautelar
  - Mediação Cautelar: Available only for Selo Verde users, parcelamento via CauCash (2x, 3x, 6x based on ICC)
  - Automatic certificate generation (Certidão Cautelar) with hash and QR code validation
  - Score/ICC impacts: Acordo (+2 score, +1 ICC), Sem Resolução (-3 score, -2 ICC), Mediação paga (+3 score, +2 ICC)
  - Types: CautelarRegistry, CautelarParticipant, CautelarDamage, CautelarCertificate
- **"Gerenciar Placa" Unified Feature**: Merged "Transferir Placa" and "Reivindicar Placa" into single interface
  - Route: /manage-plate (replaced /transfer and /claim)
  - Tab-based UI to switch between Transferir (cyan) and Reivindicar (pink)
  - Aba "Status" mostra transferências enviadas/recebidas, reivindicações pendentes e histórico completo
  - Fluxo completo de aceitar/recusar transferências
- **"Avaliar Motorista" Unified Feature**: Merged "Elogiar Motorista" and "Criticar Motorista" into single interface
  - Route: /rate-driver (replaced /praise and /critique)
  - Tab-based UI to switch between Elogio (green) and Crítica (red)
  - 10 preset praise phrases and 10 preset critique phrases
  - Verified seal required for both praise and critique
  - **Elogios**: Máx 3/placa/30dias, Máx 5/dia, Score +2pts, ICC +1pt, Selo "Condutor Colaborativo" após 3 elogios
  - **Críticas**: Máx 3/placa/30dias, Máx 5/dia, Score -1pt, Remove selo de confiança após 3 críticas
- **HashRouter Implementation**: Fixed PWA page refresh issues
  - URLs now use # format (e.g., /#/dashboard) for better SPA routing
- CauCash wallet integration: All purchases now debit from user's CauCash balance with transaction history
- Purchase functions (Seal R$50, Plate Info R$25, Extra Plates R$5, Stolen Alerts R$10) require sufficient balance
- Transaction history persisted in localStorage with categories (Selo, Veículos, Segurança, Recarga)
- All mock users initialized with R$150 cauCashBalance
- Friends page "Frota de Amigos" with contact sharing and fleet assistance features
- **Visual Rebrand to Emerald**: Complete color migration from purple to emerald-500 (#10B981)
  - All primary action buttons, borders, and highlights now use emerald-500
  - Dashboard icon: Frota de Amigos changed to emerald-400
  - Friends.tsx: All fleet cards, dialogs, tabs, and buttons updated
  - Alerts.tsx: Fleet invites updated to emerald
  - CautelarRegistryDetails.tsx: Mediação forms and progress bars updated
  - FleetManagement.tsx: Admin badges, info cards, fleet list items updated
  - VagasHome.tsx: Minhas Reservas card updated
  - Color hierarchy maintained: emerald for primary, red for critical/destructive
  - Seals (Azul, Amarelo, Verde) and Ranking levels (ICC tiers) NOT changed - preserved as-is
- **"Modo Alerta Máximo" UI Theme**: Visual overhaul for stolen vehicle pages with emergency-style design:
  - Vermelho principal: #D32F2F / #E53935, hover: #B71C1C
  - Fundos translúcidos: rgba(211,47,47,0.10) e 0.16 com gradientes
  - Bordas: rgba(211,47,47,0.55) com glow sutil
  - Texto: branco com opacidades hierárquicas (100%, 78%, 62%)
  - Aplicado em: ReportStolen.tsx, Stolen.tsx (cards, badges, botões, modais)
- **"Solicitar Contato" Feature**: Contact request system between drivers
  - Route: /contact-request
  - 15 preset reason phrases for contact requests
  - Verified seal (Selo Azul) required
  - Integrated with Friends page for receiving/responding to requests
  - Accept flow allows sharing phone, email, or social media
  - Block/reject options with feedback to requester
  - Types: ContactRequest (AppContext)
- **Standardized SealRequiredNotice Component**: Unified verification notice across all features
  - Used in: RateDriver, ContactRequest, AddPlate, CautelarRegistry, Friends, ReportStolen
  - Consistent design with blue shield icon and feature-specific reason text
- **Vehicle Registration Flow Update**: Enhanced AddPlate.tsx with subscription and insurance options
  - Multi-step wizard: Placa → Propriedade → Assinatura/Seguro → Dados do Veículo
  - **Veículo por assinatura**: Campos de empresa, CNPJ (opcional), data término do contrato
  - **Veículo próprio com seguro**: Campos de seguradora e data término do seguro
  - Badges visuais: "Por Assinatura" (azul) e "Com Seguro" (verde) exibidos na lista de veículos
  - Tooltips com informações de vencimento
  - Tipos: VehicleOwnershipType, VehicleSubscriptionInfo, VehicleInsuranceInfo
- **"Alerta Solidário" Feature**: Emergency assistance system between drivers
  - Route: /solidary-socorro
  - Tab-based UI: Enviar (send) and Receber (receive) with Send/Inbox icons
  - Emergency types: Pneu furado, Bateria descarregada, Sem combustível, Pane mecânica, Acidente leve, Perda de chave, Outro
  - **Cobertura automática**: Alertas para veículos com hasActivePlan, assistência de frota, ou dono com selo verde
  - **ICC rewards**: +2 ICC quando alerta marcado como útil (com proteção contra duplicatas)
  - **Limite de uso**: Máximo 2 alertas por hora por usuário
  - **Sincronização de estado**: Custom event system (REWARDS_APPLIED_EVENT) para sync ICC em tempo real
  - Tipos: SolidaryAlert, SolidaryEmergencyType
  - mockUsersById map para lookup correto de owners e verificação de selo verde
- **UX Consistency Standardization**: All 36+ pages now follow consistent design patterns
  - Headers: `border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50`
  - Back buttons: Native `<button>` with `text-muted-foreground hover:text-foreground`
  - Main content: `px-4 py-6` padding
  - Border radius: `rounded-2xl` for main containers, `rounded-xl` for secondary elements
  - Tabs: All tab-based pages use shadcn Tabs component (Friends, Alerts, CautelarRegistry, RateDriver, ManagePlate, SolidarySocorro)

## Deployment
Configured for static deployment. Build output goes to the `dist` directory.

```bash
npm run build
```
