# 🎨 PLANO DE IMPLEMENTAÇÃO - SKINS & COLEÇÃO

## 📋 DECISÕES FINAIS (Aprovadas)

### 1. Mineração
- ✅ Mostrar progresso de TODOS os prêmios simultaneamente
- ✅ Destaque visual no mais próximo (≥5/7)
- ✅ Tooltip explicativo

### 2. DNA Único
- ✅ DNA completo APENAS em skins mineradas
- ✅ Badges alternativos para compradas/conquistas
- ✅ Serial único para todas

### 3. Evolução XP
- ✅ XP APENAS skin vinculada (100%)
- ✅ Cooldown troca: 12h
- ✅ Múltiplas placas = múltiplas skins ativas
- ❌ SEM XP passivo

### 4. Marketplace Taxas
- ✅ Taxas INVERSAS (GPT venceu)
  - Comum: 15%
  - Rara: 10%
  - Lendária: 5%
  - Única: 3%

### 5. Puzzle Coleção
- ✅ Sistema de dicas progressivas
- ✅ Contador geral (X/7)
- ❌ SEM feedback verde/vermelho direto

---

## 🏗️ ESTRUTURA ATUAL (O que já existe)

```
✅ src/pages/SkinsCollection.tsx (base criada)
✅ src/data/mockSkins.ts (dados mock)
✅ src/types/skins.ts (tipos definidos)
✅ src/contexts/AppContext.tsx (lógica global)
```

---

## 🎯 FASES DE IMPLEMENTAÇÃO

### FASE 1: REFATORAÇÃO & ALINHAMENTO (2-3h)
**Objetivo:** Alinhar código existente com decisões finais

#### 1.1 Atualizar Types
- [ ] Adicionar `DNA` interface completa
- [ ] Adicionar `EvolutionSystem` (5 níveis)
- [ ] Atualizar `MarketplaceFees` (taxas inversas)
- [ ] Adicionar `PuzzleHint` types

#### 1.2 Atualizar mockSkins.ts
- [ ] Expandir categorias (9 completas)
- [ ] Adicionar skins de mineração (10k-100k)
- [ ] Adicionar skins de eventos
- [ ] Adicionar skins de conquistas

#### 1.3 Atualizar AppContext
- [ ] Implementar `addXP` (só vinculada)
- [ ] Implementar `switchLinkedSkin` (cooldown 12h)
- [ ] Atualizar `buySkinLayout`
- [ ] Atualizar `sellSkin` (taxas inversas)

---

### FASE 2: MINERAÇÃO COMPLETA (3-4h)
**Objetivo:** Sistema de mineração com progresso simultâneo

#### 2.1 Componente MiningTab
- [ ] Campo único 7 caracteres
- [ ] Barras de progresso (TODOS os prêmios)
- [ ] Destaque visual (≥5/7)
- [ ] Cooldown 30s
- [ ] Quota semanal (200)

#### 2.2 DNA Generation
- [ ] Gerar DNA ao minerar
- [ ] Genes (fire, water, earth, air)
- [ ] Metadata (lua, temperatura, serial)
- [ ] Exibir DNA no modal da skin

#### 2.3 Anti-Bot
- [ ] Rate limiting (30s)
- [ ] Device tracking (localStorage)
- [ ] Logs de tentativas
- [ ] Quota semanal

---

### FASE 3: EVOLUÇÃO & XP (2-3h)
**Objetivo:** Sistema de 5 níveis

#### 3.1 XP System
- [ ] Ganhar XP (apenas vinculada)
- [ ] Calcular level (1-5)
- [ ] Level up notification
- [ ] Persistência (localStorage)

#### 3.2 Visual Evolution
- [ ] Badge de level na skin
- [ ] Barra de progresso XP
- [ ] Efeitos visuais por level
- [ ] GENESIS (level 5) permanente

#### 3.3 Skin Switching
- [ ] Vincular/desvincular
- [ ] Cooldown 12h
- [ ] Múltiplas placas suporte

---

### FASE 4: COLEÇÃO & PUZZLE (2-3h)
**Objetivo:** Puzzle 7 slots com dicas

#### 4.1 Puzzle Grid
- [ ] 7 slots drag & drop
- [ ] Contador "X/7 corretas"
- [ ] Validação de ordem

#### 4.2 Sistema de Dicas
- [ ] 5 tipos de dicas
- [ ] Condições para ganhar
- [ ] Exibição de dicas
- [ ] Persistência

---

### FASE 5: MARKETPLACE (3-4h)
**Objetivo:** Compra/venda com taxas inversas

#### 5.1 Listagem
- [ ] Criar anúncio
- [ ] Definir preço
- [ ] Calcular taxa (inversa)
- [ ] Escrow 24h

#### 5.2 Compra
- [ ] Buscar skins à venda
- [ ] Filtros (categoria, raridade)
- [ ] Comprar skin
- [ ] Transferência

#### 5.3 Histórico
- [ ] Minhas vendas
- [ ] Minhas compras
- [ ] Transações

---

### FASE 6: SINERGIAS (2h)
**Objetivo:** 5 combos básicos

#### 6.1 Detecção
- [ ] Verificar skins vinculadas
- [ ] Detectar combos ativos
- [ ] Aplicar bônus

#### 6.2 UI
- [ ] Exibir sinergias ativas
- [ ] Mostrar possíveis combos
- [ ] Efeitos visuais

---

### FASE 7: POLISH & UX (2-3h)
**Objetivo:** Animações, feedback, onboarding

#### 7.1 Animações
- [ ] Transições suaves
- [ ] Efeitos de hover
- [ ] Level up animation

#### 7.2 Feedback
- [ ] Notificações (compra, venda, level up)
- [ ] Tooltips explicativos
- [ ] Mensagens de erro claras

#### 7.3 Onboarding
- [ ] Tutorial 3 passos
- [ ] Primeira skin grátis
- [ ] Dicas contextuais

---

## 📊 ESTIMATIVA TOTAL

| Fase | Horas | Prioridade |
|------|-------|------------|
| 1 - Refatoração | 2-3h | 🔴 CRÍTICA |
| 2 - Mineração | 3-4h | 🔴 CRÍTICA |
| 3 - Evolução | 2-3h | 🟡 ALTA |
| 4 - Coleção | 2-3h | 🟡 ALTA |
| 5 - Marketplace | 3-4h | 🟢 MÉDIA |
| 6 - Sinergias | 2h | 🟢 MÉDIA |
| 7 - Polish | 2-3h | 🔵 BAIXA |
| **TOTAL** | **16-22h** | - |

---

## 🎨 PADRÃO VISUAL (Manter)

### Títulos
```tsx
<h1 className="text-2xl font-black uppercase italic">
  Skins & Coleção
</h1>
```

### Subtítulos
```tsx
<p className="text-xs text-muted-foreground mt-1">
  Personalize, colecione e evolua
</p>
```

### Cards
```tsx
<Card className="bg-card border-border">
  <CardContent className="p-6">
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Badges
```tsx
<Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-black">
  NOVO
</Badge>
```

### Botões
```tsx
<Button className="w-full bg-primary h-14 rounded-2xl font-black gap-2 tracking-tighter uppercase">
  <Icon className="w-5 h-5" /> TEXTO
</Button>
```

---

## ✅ PRÓXIMOS PASSOS

1. **AGORA:** Começar Fase 1 (Refatoração)
2. **Depois:** Fase 2 (Mineração)
3. **Seguir:** Fases 3-7 conforme prioridade

**Pronto para começar?** 🚀
