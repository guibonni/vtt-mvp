# 📜 Documento de Arquitetura — VTT (Virtual Tabletop)

## 1. Visão Geral do Sistema

O sistema consiste em uma aplicação web para execução de sessões de RPG online (Virtual Tabletop – VTT), permitindo:

- Autenticação de usuários
- Criação e listagem de sessões
- Participação em sessões protegidas por senha
- Chat persistente com suporte a rolagem de dados
- Sistema de fichas de personagem dinâmicas (schema-driven)
- Gerenciamento de múltiplas janelas internas (windowing system)

O projeto foi desenvolvido com foco acadêmico (TCC), priorizando clareza arquitetural, modularização e escalabilidade futura.

---

# 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 (com CSS Variables) |
| Estado global | React Context |
| Arquitetura de janelas | WindowManager custom |
| UI/UX | Design system baseado em tokens CSS |
| Estrutura de domínio | Modelos tipados (Character, Message, Template) |

---

# 3. Arquitetura de Camadas

O sistema foi dividido em três grandes responsabilidades:

## 3.1 Camada de Domínio (Domain Layer)

Responsável por representar o modelo de dados e regras principais.

### Principais modelos:

- `Character`
- `CharacterTemplate`
- `Message`
- `DiceResult`

Essa camada não depende de UI.

---

## 3.2 Camada de Infraestrutura (Infra Layer)

Responsável por comportamentos estruturais da aplicação.

### Principais módulos:

### WindowManager

Sistema responsável por:

- Abrir múltiplas janelas simultaneamente
- Controle de z-index
- Foco de janela
- Fechamento de janela
- Renderização dinâmica via `WindowRegistry`

Arquitetura baseada em:
# 📜 Documento de Arquitetura — VTT (Virtual Tabletop)

## 1. Visão Geral do Sistema

O sistema consiste em uma aplicação web para execução de sessões de RPG online (Virtual Tabletop – VTT), permitindo:

- Autenticação de usuários
- Criação e listagem de sessões
- Participação em sessões protegidas por senha
- Chat persistente com suporte a rolagem de dados
- Sistema de fichas de personagem dinâmicas (schema-driven)
- Gerenciamento de múltiplas janelas internas (windowing system)

O projeto foi desenvolvido com foco acadêmico (TCC), priorizando clareza arquitetural, modularização e escalabilidade futura.

---

# 2. Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 (com CSS Variables) |
| Estado global | React Context |
| Arquitetura de janelas | WindowManager custom |
| UI/UX | Design system baseado em tokens CSS |
| Estrutura de domínio | Modelos tipados (Character, Message, Template) |

---

# 3. Arquitetura de Camadas

O sistema foi dividido em três grandes responsabilidades:

## 3.1 Camada de Domínio (Domain Layer)

Responsável por representar o modelo de dados e regras principais.

### Principais modelos:

- `Character`
- `CharacterTemplate`
- `Message`
- `DiceResult`

Essa camada não depende de UI.

---

## 3.2 Camada de Infraestrutura (Infra Layer)

Responsável por comportamentos estruturais da aplicação.

### Principais módulos:

### WindowManager

Sistema responsável por:

- Abrir múltiplas janelas simultaneamente
- Controle de z-index
- Foco de janela
- Fechamento de janela
- Renderização dinâmica via `WindowRegistry`

Arquitetura baseada em:
```
WindowComponentPropsMap
↓
WindowManagerContext
↓
WindowRenderer
↓
windowRegistry
```

Cada tipo de janela possui contrato tipado próprio.

---

### SessionContext

Responsável por centralizar:

- Estado de personagens
- Estado de mensagens
- Funções de envio de mensagem
- Funções de rolagem
- CRUD de personagens

Evita prop drilling e separa domínio de interface.

---

## 3.3 Camada de Interface (UI Layer)

Componentes organizados em módulos:
```
/characters
    CharacterModal
    CharacterWindow
    CharacterForm
    CharacterFooter
/chat
    ChatTab
/sessions
    SessionsPage
```

Componentes seguem:

- Separação de responsabilidade
- Extração de hooks (ex: useCharacterForm)
- Reutilização de componentes
- Layout desacoplado de estado

---

# 4. Sistema de Fichas Schema-Driven

Um dos diferenciais arquiteturais do projeto.

## Estrutura

Cada ficha é baseada em um `CharacterTemplate`, que define:

sections[]
fields[]
id
label
type (text | number | textarea)
columnSpan
dice (opcional)

### Benefícios

- Suporte a qualquer sistema de RPG
- Layout dinâmico baseado em grid de 12 colunas
- Sistema extensível
- Base futura para marketplace de templates

---

# 5. Sistema de Rolagem de Dados

Implementado via utilitário:
```
/utils/dice.ts
```

Função principal:
```
rollExpression("1d20", modifier)
```


Integração:

- Botões em campos numéricos
- Envio automático para chat
- Estrutura tipada (`DiceResult`)

---

# 6. Sistema de Chat

Funcionalidades:

- Mensagens persistentes
- Rolagens destacadas
- Timestamp dinâmico
- Separador por dia
- Atualização automática de “agora”
- Scroll inteligente

Arquitetura baseada em estado centralizado no `SessionContext`.

---

# 7. Sistema de Windowing Interno

Um dos pontos arquiteturais mais relevantes.

Permite:

- Múltiplas fichas abertas simultaneamente
- Minimização
- Arraste (drag)
- Foco por clique
- Controle de z-index
- Janela ativa destacada

Arquitetura genérica preparada para múltiplos tipos de janela futuros (ex: imagem, documento, mapa ampliado).

---

# 8. Design System

Baseado em CSS Variables:

```
--bg-primary
--bg-secondary
--bg-card
--bg-surface
--border-primary
--border-subtle
--accent
--accent-soft
--accent-hover
--text-primary
--text-secondary
--text-muted
```

Características:

- Tema escuro místico
- Tons roxos estratégicos
- Glow sutil
- Noise procedural SVG inline
- Desktop-first
- Responsivo

---

# 9. Estrutura de Pastas (Simplificada)

```
src/
app/
components/
characters/
chat/
sessions/
ui/
hooks/
models/
utils/
windowing/
data/
```

Separação clara entre:

- UI
- Domínio
- Infraestrutura
- Hooks
- Utilitários

---

# 10. Escalabilidade Futura

Arquitetura já preparada para:

- Backend real
- Persistência em banco
- Autenticação JWT
- Templates públicos
- Marketplace de fichas
- Multiplayer em tempo real (WebSocket)
- Sistema de permissões
- Plugin system

---

# 11. Decisões Arquiteturais Relevantes

- Uso de Context para evitar prop drilling
- Tipagem genérica para WindowManager
- Separação de domínio e UI
- Modularização progressiva
- Layout desacoplado de estado
- Grid dinâmico via inline style para columnSpan
- Sistema schema-driven para flexibilidade máxima

---

# 12. Diferencial do Projeto

O diferencial técnico principal é:

> Sistema de fichas completamente configurável via template, com renderização dinâmica e integração com chat e rolagem, utilizando arquitetura desacoplada e extensível.